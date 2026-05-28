import path from 'node:path';
import { execa } from 'execa';
import type { SearchHit, SearchOptions } from './file-engine.js';

export interface RgSearchResult {
  available: boolean;
  hits: SearchHit[];
  error?: string;
}

export async function searchWithRipgrep(root: string, options: SearchOptions): Promise<RgSearchResult> {
  if (!options.include_contents) return { available: false, hits: [] };

  const rgAvailable = await execa('rg', ['--version']).then(() => true).catch(() => false);
  if (!rgAvailable) return { available: false, hits: [], error: 'rg not found' };

  const args: string[] = [
    '--json',
    '--line-number',
    '--max-filesize',
    String(options.max_file_bytes),
    '--context',
    String(Math.max(options.context_before, options.context_after)),
    '--glob',
    '!node_modules',
    '--glob',
    '!.git',
    '--glob',
    '!dist',
    '--glob',
    '!build',
    '--glob',
    '!.next'
  ];

  if (!options.case_sensitive) args.push('--ignore-case');
  if (!options.regex) args.push('--fixed-strings');
  if (options.file_glob) args.push('--glob', options.file_glob);

  args.push(options.query, root);

  const result = await execa('rg', args, {
    reject: false,
    maxBuffer: 20 * 1024 * 1024,
    timeout: 120000
  });

  if (result.exitCode > 1) {
    return { available: true, hits: [], error: result.stderr || result.stdout };
  }

  const hits: SearchHit[] = [];
  const contextByPathLine = new Map<string, string[]>();

  for (const line of result.stdout.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const event = JSON.parse(line) as RgJsonEvent;
    if (event.type === 'context') {
      const filePath = event.data.path.text;
      const lineNo = event.data.line_number;
      const key = `${filePath}:${lineNo}`;
      contextByPathLine.set(key, [`${lineNo}: ${event.data.lines.text.replace(/\r?\n$/, '')}`]);
      continue;
    }

    if (event.type !== 'match') continue;
    const filePath = event.data.path.text;
    const lineNo = event.data.line_number;
    hits.push({
      path: filePath,
      matchType: 'content',
      line: lineNo,
      snippet: event.data.lines.text.replace(/\r?\n$/, ''),
      context: collectNearbyContext(contextByPathLine, filePath, lineNo)
    });
  }

  if (options.include_filenames) {
    // Filename matches are handled by the native layer so basename search remains cheap and consistent.
  }

  return { available: true, hits };
}

function collectNearbyContext(map: Map<string, string[]>, filePath: string, lineNo: number): string[] {
  const context: string[] = [];
  for (let i = lineNo - 20; i <= lineNo + 20; i += 1) {
    const item = map.get(`${filePath}:${i}`);
    if (item) context.push(...item);
  }
  return context;
}

interface RgJsonEvent {
  type: 'begin' | 'end' | 'match' | 'context' | 'summary';
  data: {
    path: { text: string };
    line_number: number;
    lines: { text: string };
  };
}

export function normalizeHitPath(root: string, hit: SearchHit): SearchHit {
  return { ...hit, path: path.resolve(root, hit.path) };
}
