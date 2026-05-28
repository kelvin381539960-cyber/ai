import { createHash } from 'node:crypto';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { decodeCursor, encodeCursor, stableOptionsHash } from './cursor.js';
import { buildFileOutline } from './outline.js';
import { searchWithRipgrep } from './rg-search.js';

export interface ReadLineOptions {
  maxBytes: number;
  withLineNumbers: boolean;
}

export interface ReadManyItem {
  path: string;
  offset_line?: number;
  limit_lines?: number;
  max_bytes?: number;
  with_line_numbers?: boolean;
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
  cursor?: string;
  backend?: 'auto' | 'rg' | 'native';
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

  async readMany(items: ReadManyItem[], maxTotalBytes: number): Promise<{ results: unknown[]; bytesUsed: number; truncated: boolean }> {
    const results: unknown[] = [];
    let bytesUsed = 0;
    let truncated = false;

    for (const item of items) {
      if (bytesUsed >= maxTotalBytes) {
        truncated = true;
        break;
      }

      const budget = Math.min(item.max_bytes ?? 128 * 1024, maxTotalBytes - bytesUsed);
      const before = bytesUsed;
      const result = await this.readLines(item.path, item.offset_line ?? 1, item.limit_lines ?? 200, {
        maxBytes: budget,
        withLineNumbers: item.with_line_numbers ?? true
      });
      bytesUsed += Buffer.byteLength(result.lines.join('\n'), 'utf8');
      results.push(result);

      if (bytesUsed === before || result.truncatedByBytes) truncated = true;
    }

    return { results, bytesUsed, truncated };
  }

  async outline(filePath: string, maxBytes = 512 * 1024, maxItems = 300): Promise<ReturnType<typeof buildFileOutline>> {
    const safePath = this.resolveAllowedPath(filePath);
    const data = await readFile(safePath);
    const text = data.subarray(0, maxBytes).toString('utf8');
    return buildFileOutline(safePath, text, maxItems);
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

  async search(options: SearchOptions): Promise<{ root: string; hits: SearchHit[]; limitReached: boolean; nextCursor?: string; backend: string }> {
    const root = this.resolveAllowedPath(options.path ?? this.allowedRoots[0] ?? process.cwd());
    const pageOffset = options.cursor ? decodeCursor(options.cursor).nextOffset : 0;
    const optionsHash = stableOptionsHash({
      root,
      query: options.query,
      file_glob: options.file_glob,
      regex: options.regex,
      case_sensitive: options.case_sensitive,
      include_filenames: options.include_filenames,
      include_contents: options.include_contents,
      max_file_bytes: options.max_file_bytes,
      context_before: options.context_before,
      context_after: options.context_after,
      backend: options.backend ?? 'auto'
    });

    let allHits: SearchHit[];
    let backend = 'native';

    if ((options.backend ?? 'auto') !== 'native') {
      const rg = await searchWithRipgrep(root, options);
      if (rg.available && !rg.error) {
        backend = 'rg';
        const filenameHits = options.include_filenames ? await this.searchFilenames(root, options) : [];
        allHits = [...filenameHits, ...rg.hits];
      } else if (options.backend === 'rg') {
        throw new Error(rg.error ?? 'ripgrep backend unavailable');
      } else {
        allHits = await this.searchNativeAll(root, options);
      }
    } else {
      allHits = await this.searchNativeAll(root, options);
    }

    const page = allHits.slice(pageOffset, pageOffset + options.max_results);
    const nextOffset = pageOffset + page.length;
    const limitReached = nextOffset < allHits.length;

    return {
      root,
      hits: page,
      limitReached,
      nextCursor: limitReached
        ? encodeCursor({ root, query: options.query, nextOffset, createdAt: new Date().toISOString(), optionsHash })
        : undefined,
      backend
    };
  }

  private async searchNativeAll(root: string, options: SearchOptions): Promise<SearchHit[]> {
    const entries = await this.listSearchEntries(root, options.file_glob);
    const hits: SearchHit[] = [];
    const matcher = makeMatcher(options.query, options.regex, options.case_sensitive);

    for (const entry of entries) {
      if (options.include_filenames && matcher(path.basename(entry))) {
        hits.push({ path: entry, matchType: 'filename', snippet: path.relative(root, entry) });
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
      }
    }

    return hits;
  }

  private async searchFilenames(root: string, options: SearchOptions): Promise<SearchHit[]> {
    const entries = await this.listSearchEntries(root, options.file_glob);
    const matcher = makeMatcher(options.query, options.regex, options.case_sensitive);
    return entries
      .filter((entry) => matcher(path.basename(entry)))
      .map((entry) => ({ path: entry, matchType: 'filename' as const, snippet: path.relative(root, entry) }));
  }

  private async listSearchEntries(root: string, fileGlob?: string): Promise<string[]> {
    return fg(fileGlob ?? '**/*', {
      cwd: root,
      onlyFiles: true,
      dot: false,
      unique: true,
      absolute: true,
      followSymbolicLinks: false,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**']
    });
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
