import path from 'node:path';
import type { FileOutline, FileOutlineItem } from './outline-types.js';

const OUTLINE_PATTERNS: Array<{ kind: FileOutlineItem['kind']; regex: RegExp; nameGroup: number }> = [
  { kind: 'import', regex: /^\s*import\s+(.+?)\s+from\s+['"][^'"]+['"]/u, nameGroup: 1 },
  { kind: 'import', regex: /^\s*import\s+['"][^'"]+['"]/u, nameGroup: 0 },
  { kind: 'export', regex: /^\s*export\s+(?:default\s+)?(.+)/u, nameGroup: 1 },
  { kind: 'class', regex: /^\s*(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/u, nameGroup: 1 },
  { kind: 'interface', regex: /^\s*(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/u, nameGroup: 1 },
  { kind: 'type', regex: /^\s*(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/u, nameGroup: 1 },
  { kind: 'function', regex: /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/u, nameGroup: 1 },
  { kind: 'const', regex: /^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=/u, nameGroup: 1 },
  { kind: 'method', regex: /^\s*(?:public\s+|private\s+|protected\s+|static\s+|async\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*[:{]/u, nameGroup: 1 },
  { kind: 'class', regex: /^\s*(?:public\s+)?class\s+([A-Za-z_$][\w$]*)/u, nameGroup: 1 },
  { kind: 'interface', regex: /^\s*(?:public\s+)?interface\s+([A-Za-z_$][\w$]*)/u, nameGroup: 1 },
  { kind: 'function', regex: /^\s*(?:public\s+|private\s+|protected\s+|static\s+)*[\w<>\[\], ?]+\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*[{;]/u, nameGroup: 1 },
  { kind: 'function', regex: /^\s*def\s+([A-Za-z_][\w]*)\s*\(/u, nameGroup: 1 },
  { kind: 'class', regex: /^\s*class\s+([A-Za-z_][\w]*)/u, nameGroup: 1 },
  { kind: 'function', regex: /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)\s*\(/u, nameGroup: 1 },
  { kind: 'struct', regex: /^\s*(?:pub\s+)?struct\s+([A-Za-z_][\w]*)/u, nameGroup: 1 },
  { kind: 'enum', regex: /^\s*(?:pub\s+)?enum\s+([A-Za-z_][\w]*)/u, nameGroup: 1 },
  { kind: 'trait', regex: /^\s*(?:pub\s+)?trait\s+([A-Za-z_][\w]*)/u, nameGroup: 1 },
  { kind: 'impl', regex: /^\s*impl(?:<[^>]+>)?\s+([A-Za-z_][\w]*)/u, nameGroup: 1 },
  { kind: 'todo', regex: /\b(TODO|FIXME|HACK|XXX)\b\s*:?(.*)/iu, nameGroup: 0 }
];

export function buildRegexFileOutline(filePath: string, text: string, maxItems = 300, diagnostics: string[] = []): FileOutline {
  const lines = text.split(/\r?\n/);
  const items: FileOutlineItem[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of OUTLINE_PATTERNS) {
      const match = pattern.regex.exec(line);
      if (!match) continue;
      const name = pattern.nameGroup === 0 ? normalizeName(match[0]) : normalizeName(match[pattern.nameGroup] ?? match[0]);
      items.push({ kind: pattern.kind, name, line: i + 1, text: line.trim() });
      break;
    }
    if (items.length >= maxItems) break;
  }

  return { path: filePath, language: inferLanguage(filePath), backend: 'regex', items, truncated: items.length >= maxItems, diagnostics };
}

export const buildFileOutline = buildRegexFileOutline;

export function normalizeName(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 200);
}

export function inferLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts': return 'typescript';
    case '.tsx': return 'typescript-react';
    case '.js': return 'javascript';
    case '.jsx': return 'javascript-react';
    case '.java': return 'java';
    case '.kt': return 'kotlin';
    case '.py': return 'python';
    case '.go': return 'go';
    case '.rs': return 'rust';
    case '.md': return 'markdown';
    case '.json': return 'json';
    case '.yml':
    case '.yaml': return 'yaml';
    default: return ext ? ext.slice(1) : 'text';
  }
}
