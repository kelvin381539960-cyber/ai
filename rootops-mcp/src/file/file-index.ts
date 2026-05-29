import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

interface DatabaseLike {
  exec(sql: string): void;
  prepare(sql: string): StatementLike;
  transaction<T extends (...args: any[]) => any>(fn: T): T;
}

interface StatementLike {
  run(...args: unknown[]): unknown;
  get(...args: unknown[]): any;
  all(...args: unknown[]): any[];
}

export interface FileIndexBuildOptions {
  root?: string;
  fileGlob?: string;
  maxFileBytes: number;
  force: boolean;
}

export interface FileIndexSearchOptions {
  root?: string;
  query: string;
  limit: number;
  offset: number;
  snippetChars: number;
}

export class FileIndex {
  constructor(
    private readonly allowedRoots: string[] = [],
    private readonly indexDir = process.env.ROOTOPS_INDEX_DIR ?? '.var/index'
  ) {}

  async build(options: FileIndexBuildOptions): Promise<{ root: string; scanned: number; indexed: number; skipped: number; deleted: number; dbPath: string }> {
    const db = await this.openDb();
    const root = this.resolveAllowedPath(options.root ?? this.allowedRoots[0] ?? process.cwd());
    const dbPath = await this.dbPath();
    const entries = await fg(options.fileGlob ?? '**/*', {
      cwd: root,
      onlyFiles: true,
      absolute: true,
      dot: false,
      unique: true,
      followSymbolicLinks: false,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**', '**/.var/**']
    });

    const seen = new Set<string>();
    let scanned = 0;
    let indexed = 0;
    let skipped = 0;

    const selectMeta = db.prepare('SELECT mtime_ms, size FROM file_meta WHERE root = ? AND path = ?');
    const upsertMeta = db.prepare('INSERT INTO file_meta(root, path, mtime_ms, size, sha256, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(root, path) DO UPDATE SET mtime_ms = excluded.mtime_ms, size = excluded.size, sha256 = excluded.sha256, updated_at = excluded.updated_at');
    const deleteFts = db.prepare('DELETE FROM files_fts WHERE root = ? AND path = ?');
    const insertFts = db.prepare('INSERT INTO files_fts(root, path, content) VALUES (?, ?, ?)');

    const tx = db.transaction((rows: Array<{ absolute: string; relative: string; mtimeMs: number; size: number; sha256: string; content: string }>) => {
      for (const row of rows) {
        deleteFts.run(root, row.relative);
        insertFts.run(root, row.relative, row.content);
        upsertMeta.run(root, row.relative, row.mtimeMs, row.size, row.sha256, new Date().toISOString());
      }
    });

    const batch: Array<{ absolute: string; relative: string; mtimeMs: number; size: number; sha256: string; content: string }> = [];
    for (const absolute of entries) {
      scanned += 1;
      const relative = path.relative(root, absolute);
      seen.add(relative);
      const st = await stat(absolute).catch(() => null);
      if (!st || !st.isFile() || st.size > options.maxFileBytes) {
        skipped += 1;
        continue;
      }
      const old = selectMeta.get(root, relative);
      if (!options.force && old && Number(old.mtime_ms) === st.mtimeMs && Number(old.size) === st.size) {
        skipped += 1;
        continue;
      }
      const content = await readFile(absolute, 'utf8').catch(() => '');
      if (!content) {
        skipped += 1;
        continue;
      }
      batch.push({
        absolute,
        relative,
        mtimeMs: st.mtimeMs,
        size: st.size,
        sha256: createHash('sha256').update(content).digest('hex'),
        content
      });
      indexed += 1;
      if (batch.length >= 200) {
        tx(batch.splice(0, batch.length));
      }
    }
    if (batch.length) tx(batch);

    const existing = db.prepare('SELECT path FROM file_meta WHERE root = ?').all(root) as Array<{ path: string }>;
    const removeMeta = db.prepare('DELETE FROM file_meta WHERE root = ? AND path = ?');
    let deleted = 0;
    const cleanup = db.transaction((paths: string[]) => {
      for (const rel of paths) {
        deleteFts.run(root, rel);
        removeMeta.run(root, rel);
        deleted += 1;
      }
    });
    cleanup(existing.filter((row) => !seen.has(row.path)).map((row) => row.path));

    return { root, scanned, indexed, skipped, deleted, dbPath };
  }

  async search(options: FileIndexSearchOptions): Promise<{ root?: string; hits: Array<{ path: string; score: number; snippet: string }>; total: number }> {
    const db = await this.openDb();
    const root = options.root ? this.resolveAllowedPath(options.root) : undefined;
    const q = toFtsQuery(options.query);
    const snippetSize = Math.max(80, Math.min(options.snippetChars, 2000));
    const where = root ? 'files_fts MATCH ? AND root = ?' : 'files_fts MATCH ?';
    const params = root ? [q, root] : [q];
    const count = db.prepare(`SELECT count(*) AS count FROM files_fts WHERE ${where}`).get(...params)?.count ?? 0;
    const rows = db.prepare(`SELECT path, bm25(files_fts) AS score, snippet(files_fts, 2, '[', ']', ' … ', ${snippetSize}) AS snippet FROM files_fts WHERE ${where} ORDER BY score LIMIT ? OFFSET ?`).all(...params, options.limit, options.offset);
    return {
      root,
      total: Number(count),
      hits: rows.map((row) => ({ path: row.path, score: Number(row.score), snippet: row.snippet }))
    };
  }

  async stats(rootInput?: string): Promise<{ dbPath: string; roots: Array<{ root: string; files: number; bytes: number; updatedAt?: string }> }> {
    const db = await this.openDb();
    const dbPath = await this.dbPath();
    const root = rootInput ? this.resolveAllowedPath(rootInput) : undefined;
    const rows = root
      ? db.prepare('SELECT root, count(*) AS files, sum(size) AS bytes, max(updated_at) AS updatedAt FROM file_meta WHERE root = ? GROUP BY root').all(root)
      : db.prepare('SELECT root, count(*) AS files, sum(size) AS bytes, max(updated_at) AS updatedAt FROM file_meta GROUP BY root').all();
    return { dbPath, roots: rows.map((row) => ({ root: row.root, files: Number(row.files), bytes: Number(row.bytes ?? 0), updatedAt: row.updatedAt })) };
  }

  private async openDb(): Promise<DatabaseLike> {
    const require = createRequire(import.meta.url);
    let Database: new (filename: string) => DatabaseLike;
    try {
      Database = require('better-sqlite3') as new (filename: string) => DatabaseLike;
    } catch (error) {
      throw new Error(`better-sqlite3 is not installed or failed to load. Install optional dependency to use file index. ${error instanceof Error ? error.message : String(error)}`);
    }
    const dbPath = await this.dbPath();
    const db = new Database(dbPath);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;');
    db.exec(`CREATE TABLE IF NOT EXISTS file_meta (
      root TEXT NOT NULL,
      path TEXT NOT NULL,
      mtime_ms REAL NOT NULL,
      size INTEGER NOT NULL,
      sha256 TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(root, path)
    );`);
    db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(root UNINDEXED, path UNINDEXED, content, tokenize = 'unicode61');");
    return db;
  }

  private async dbPath(): Promise<string> {
    await mkdir(this.indexDir, { recursive: true });
    return path.join(this.indexDir, 'files-fts.db');
  }

  private resolveAllowedPath(inputPath: string): string {
    const resolved = path.resolve(inputPath);
    if (this.allowedRoots.length === 0) return resolved;
    const normalizedRoots = this.allowedRoots.map((root) => path.resolve(root));
    if (normalizedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`))) return resolved;
    throw new Error(`path outside allowed roots: ${inputPath}`);
  }
}

function toFtsQuery(query: string): string {
  const terms = query.match(/[\p{L}\p{N}_./:-]+/gu) ?? [];
  if (terms.length === 0) return '""';
  return terms.map((term) => `"${term.replace(/"/g, '""')}"`).join(' AND ');
}
