import { createHash } from 'node:crypto';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

export interface ReadLineOptions {
  maxBytes: number;
  withLineNumbers: boolean;
}

export interface SearchOptions {
  path?: string;
  query: string;
  max_results: number;
  file_glob?: string;
  regex: boolean;
  case_sensitive: boolean;
  include_filenames: boolean;
  include_contents: boolean;
  max_file_bytes: number;
  context_before: number;
  context_after: number;
}

export interface SearchHit {
  path: string;
  matchType: 'filename' | 'content';
  line?: number;
  snippet: string;
  context?: string[];
}

export class FileEngine {
  constructor(private readonly allowedRoots: string[] = []) {}

  async readLines(filePath: string, start = 1, limit = 200, options: ReadLineOptions): Promise<{ path: string; lines: string[]; nextStart?: number; truncatedByBytes: boolean }> {
    const safePath = this.resolveAllowedPath(filePath);
    const data = await readFile(safePath);
    const truncatedByBytes = data.byteLength > options.maxBytes;
    const text = data.subarray(0, options.maxBytes).toString('utf8');
    const all = text.split(/\r?\n/);
    const begin = Math.max(start - 1, 0);
    const slice = all.slice(begin, begin + limit);
    const next = begin + limit < all.length ? start + limit : undefined;

    return {
      path: safePath,
      lines: options.withLineNumbers ? slice.map((line, i) => `${start + i}: ${line}`) : slice,
      nextStart: next,
      truncatedByBytes
    };
  }

  async readBytes(filePath: string, offset = 0, length = 64 * 1024): Promise<Buffer> {
    const safePath = this.resolveAllowedPath(filePath);
    const data = await readFile(safePath);
    return data.subarray(offset, offset + length);
  }

  async hash(filePath: string): Promise<{ path: string; sha256: string; bytes: number }> {
    const safePath = this.resolveAllowedPath(filePath);
    const data = await readFile(safePath);
    return {
      path: safePath,
      sha256: createHash('sha256').update(data).digest('hex'),
      bytes: data.byteLength
    };
  }

  async search(options: SearchOptions): Promise<{ root: string; hits: SearchHit[]; limitReached: boolean }> {
    const root = this.resolveAllowedPath(options.path ?? this.allowedRoots[0] ?? process.cwd());
    const pattern = options.file_glob ?? '**/*';
    const entries = await fg(pattern, {
      cwd: root,
      onlyFiles: true,
      dot: false,
      unique: true,
      absolute: true,
      followSymbolicLinks: false,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**']
    });

    const hits: SearchHit[] = [];
    const matcher = makeMatcher(options.query, options.regex, options.case_sensitive);

    for (const entry of entries) {
      if (hits.length >= options.max_results) break;

      if (options.include_filenames && matcher(path.basename(entry))) {
        hits.push({ path: entry, matchType: 'filename', snippet: path.relative(root, entry) });
        if (hits.length >= options.max_results) break;
      }

      if (!options.include_contents) continue;

      const fileStat = await stat(entry).catch(() => null);
      if (!fileStat || !fileStat.isFile() || fileStat.size > options.max_file_bytes) continue;

      const text = await readFile(entry, 'utf8').catch(() => null);
      if (text == null) continue;

      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        if (!matcher(lines[i])) continue;
        const before = Math.max(0, i - options.context_before);
        const after = Math.min(lines.length, i + options.context_after + 1);
        hits.push({
          path: entry,
          matchType: 'content',
          line: i + 1,
          snippet: lines[i],
          context: lines.slice(before, after).map((line, idx) => `${before + idx + 1}: ${line}`)
        });
        if (hits.length >= options.max_results) break;
      }
    }

    return { root, hits, limitReached: hits.length >= options.max_results };
  }

  private resolveAllowedPath(inputPath: string): string {
    const resolved = path.resolve(inputPath);
    if (this.allowedRoots.length === 0) return resolved;

    const normalizedRoots = this.allowedRoots.map((root) => path.resolve(root));
    if (normalizedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`))) {
      return resolved;
    }

    throw new Error(`path outside allowed roots: ${inputPath}`);
  }
}

function makeMatcher(query: string, regex: boolean, caseSensitive: boolean): (value: string) => boolean {
  if (regex) {
    const re = new RegExp(query, caseSensitive ? 'u' : 'iu');
    return (value) => re.test(value);
  }

  const needle = caseSensitive ? query : query.toLowerCase();
  return (value) => (caseSensitive ? value : value.toLowerCase()).includes(needle);
}
