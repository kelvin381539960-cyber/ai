import type { FileEngine, SearchHit } from './file-engine.js';

export interface ContextPackOptions {
  root?: string;
  query: string;
  maxFiles: number;
  maxTotalBytes: number;
  linesPerFile: number;
  fileGlob?: string;
}

export interface ContextPackItem {
  path: string;
  reason: string;
  hits: SearchHit[];
  content?: unknown;
}

export interface ContextPack {
  query: string;
  items: ContextPackItem[];
  bytesUsed: number;
  truncated: boolean;
}

export async function buildContextPack(fileEngine: FileEngine, options: ContextPackOptions): Promise<ContextPack> {
  const search = await fileEngine.search({
    path: options.root,
    query: options.query,
    max_results: Math.max(options.maxFiles * 5, 20),
    file_glob: options.fileGlob,
    regex: false,
    case_sensitive: false,
    include_filenames: true,
    include_contents: true,
    max_file_bytes: 512 * 1024,
    context_before: 2,
    context_after: 2,
    backend: 'auto'
  });

  const grouped = new Map<string, SearchHit[]>();
  for (const hit of search.hits) {
    const bucket = grouped.get(hit.path) ?? [];
    bucket.push(hit);
    grouped.set(hit.path, bucket);
  }

  const selected = [...grouped.entries()].slice(0, options.maxFiles);
  const readMany = await fileEngine.readMany(
    selected.map(([path, hits]) => ({
      path,
      offset_line: Math.max(1, (hits.find((h) => h.line)?.line ?? 1) - 20),
      limit_lines: options.linesPerFile,
      max_bytes: Math.floor(options.maxTotalBytes / Math.max(selected.length, 1)),
      with_line_numbers: true
    })),
    options.maxTotalBytes
  );

  return {
    query: options.query,
    items: selected.map(([path, hits], index) => ({
      path,
      reason: hits.some((h) => h.matchType === 'filename') ? 'filename/content match' : 'content match',
      hits,
      content: readMany.results[index]
    })),
    bytesUsed: readMany.bytesUsed,
    truncated: readMany.truncated || search.limitReached
  };
}
