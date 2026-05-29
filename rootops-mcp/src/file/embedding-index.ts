import { createHash } from 'node:crypto';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { OllamaClient } from '../local/ollama-client.js';

export interface EmbeddingIndexBuildOptions {
  root?: string;
  fileGlob?: string;
  maxFileBytes: number;
  chunkChars: number;
  force: boolean;
}

export interface EmbeddingIndexSearchOptions {
  root?: string;
  query: string;
  limit: number;
}

interface EmbeddingChunk {
  id: string;
  root: string;
  path: string;
  chunkIndex: number;
  startChar: number;
  endChar: number;
  text: string;
  vector: number[];
}

interface EmbeddingFileMeta {
  root: string;
  path: string;
  mtimeMs: number;
  size: number;
  sha256: string;
  chunks: number;
  updatedAt: string;
}

interface EmbeddingIndexState {
  version: 1;
  files: EmbeddingFileMeta[];
  chunks: EmbeddingChunk[];
}

export class EmbeddingIndex {
  constructor(
    private readonly allowedRoots: string[] = [],
    private readonly ollama = new OllamaClient({
      baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
      embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text',
      instructModel: process.env.OLLAMA_INSTRUCT_MODEL ?? 'qwen2.5-coder:7b'
    }),
    private readonly indexDir = process.env.ROOTOPS_INDEX_DIR ?? '.var/index'
  ) {}

  async build(options: EmbeddingIndexBuildOptions): Promise<{ root: string; scanned: number; indexedFiles: number; indexedChunks: number; skipped: number; deleted: number; indexPath: string }> {
    const root = this.resolveAllowedPath(options.root ?? this.allowedRoots[0] ?? process.cwd());
    const state = await this.readState();
    const entries = await fg(options.fileGlob ?? '**/*', {
      cwd: root,
      onlyFiles: true,
      absolute: true,
      dot: false,
      unique: true,
      followSymbolicLinks: false,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**', '**/.var/**']
    });

    const oldFiles = new Map(state.files.filter((file) => file.root === root).map((file) => [file.path, file]));
    const seen = new Set<string>();
    let scanned = 0;
    let indexedFiles = 0;
    let indexedChunks = 0;
    let skipped = 0;

    for (const absolute of entries) {
      scanned += 1;
      const relative = path.relative(root, absolute);
      seen.add(relative);
      const st = await stat(absolute).catch(() => null);
      if (!st || !st.isFile() || st.size > options.maxFileBytes) {
        skipped += 1;
        continue;
      }
      const old = oldFiles.get(relative);
      if (!options.force && old && old.mtimeMs === st.mtimeMs && old.size === st.size) {
        skipped += 1;
        continue;
      }
      const text = await readFile(absolute, 'utf8').catch(() => '');
      if (!text.trim()) {
        skipped += 1;
        continue;
      }
      const chunks = splitChunks(text, options.chunkChars);
      const vectors = await this.ollama.embed(chunks.map((chunk) => chunk.text));
      state.chunks = state.chunks.filter((chunk) => !(chunk.root === root && chunk.path === relative));
      const createdChunks = chunks.map((chunk, index) => ({
        id: createHash('sha256').update(`${root}\n${relative}\n${index}\n${chunk.text}`).digest('hex'),
        root,
        path: relative,
        chunkIndex: index,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
        text: chunk.text,
        vector: vectors[index] ?? []
      }));
      state.chunks.push(...createdChunks);
      state.files = state.files.filter((file) => !(file.root === root && file.path === relative));
      state.files.push({
        root,
        path: relative,
        mtimeMs: st.mtimeMs,
        size: st.size,
        sha256: createHash('sha256').update(text).digest('hex'),
        chunks: createdChunks.length,
        updatedAt: new Date().toISOString()
      });
      indexedFiles += 1;
      indexedChunks += createdChunks.length;
    }

    const beforeFiles = state.files.length;
    state.files = state.files.filter((file) => file.root !== root || seen.has(file.path));
    state.chunks = state.chunks.filter((chunk) => chunk.root !== root || seen.has(chunk.path));
    const deleted = beforeFiles - state.files.length;
    await this.writeState(state);
    return { root, scanned, indexedFiles, indexedChunks, skipped, deleted, indexPath: await this.indexPath() };
  }

  async search(options: EmbeddingIndexSearchOptions): Promise<{ root?: string; hits: Array<{ path: string; chunkIndex: number; score: number; text: string }> }> {
    const root = options.root ? this.resolveAllowedPath(options.root) : undefined;
    const state = await this.readState();
    const candidates = root ? state.chunks.filter((chunk) => chunk.root === root) : state.chunks;
    const [queryVector] = await this.ollama.embed([options.query]);
    const hits = candidates
      .map((chunk) => ({
        path: chunk.path,
        chunkIndex: chunk.chunkIndex,
        score: cosine(queryVector, chunk.vector),
        text: chunk.text.slice(0, 2000)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit);
    return { root, hits };
  }

  async stats(rootInput?: string): Promise<{ indexPath: string; roots: Array<{ root: string; files: number; chunks: number; bytes: number; updatedAt?: string }> }> {
    const root = rootInput ? this.resolveAllowedPath(rootInput) : undefined;
    const state = await this.readState();
    const roots = [...new Set(state.files.filter((file) => !root || file.root === root).map((file) => file.root))];
    return {
      indexPath: await this.indexPath(),
      roots: roots.map((itemRoot) => {
        const files = state.files.filter((file) => file.root === itemRoot);
        const chunks = state.chunks.filter((chunk) => chunk.root === itemRoot);
        return {
          root: itemRoot,
          files: files.length,
          chunks: chunks.length,
          bytes: files.reduce((sum, file) => sum + file.size, 0),
          updatedAt: files.map((file) => file.updatedAt).sort().at(-1)
        };
      })
    };
  }

  private async readState(): Promise<EmbeddingIndexState> {
    const indexPath = await this.indexPath();
    const text = await readFile(indexPath, 'utf8').catch(() => '');
    if (!text) return { version: 1, files: [], chunks: [] };
    return JSON.parse(text) as EmbeddingIndexState;
  }

  private async writeState(state: EmbeddingIndexState): Promise<void> {
    const indexPath = await this.indexPath();
    await mkdir(path.dirname(indexPath), { recursive: true });
    await import('node:fs/promises').then((fs) => fs.writeFile(indexPath, JSON.stringify(state, null, 2), 'utf8'));
  }

  private async indexPath(): Promise<string> {
    await mkdir(this.indexDir, { recursive: true });
    return path.join(this.indexDir, 'embedding-index.json');
  }

  private resolveAllowedPath(inputPath: string): string {
    const resolved = path.resolve(inputPath);
    if (this.allowedRoots.length === 0) return resolved;
    const normalizedRoots = this.allowedRoots.map((root) => path.resolve(root));
    if (normalizedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`))) return resolved;
    throw new Error(`path outside allowed roots: ${inputPath}`);
  }
}

function splitChunks(text: string, chunkChars: number): Array<{ startChar: number; endChar: number; text: string }> {
  const size = Math.max(500, chunkChars);
  const overlap = Math.min(300, Math.floor(size * 0.15));
  const chunks: Array<{ startChar: number; endChar: number; text: string }> = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + size);
    const chunkText = text.slice(start, end).trim();
    if (chunkText) chunks.push({ startChar: start, endChar: end, text: chunkText });
    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

function cosine(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
