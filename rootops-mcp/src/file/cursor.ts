export interface SearchCursor {
  root: string;
  query: string;
  nextOffset: number;
  createdAt: string;
  optionsHash: string;
}

export function encodeCursor(cursor: SearchCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCursor(value: string): SearchCursor {
  const raw = Buffer.from(value, 'base64url').toString('utf8');
  const parsed = JSON.parse(raw) as SearchCursor;
  if (!parsed.root || !parsed.query || typeof parsed.nextOffset !== 'number') {
    throw new Error('invalid search cursor');
  }
  return parsed;
}

export function stableOptionsHash(value: unknown): string {
  return Buffer.from(JSON.stringify(sortKeys(value)), 'utf8').toString('base64url').slice(0, 32);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => [key, sortKeys(val)])
    );
  }
  return value;
}
