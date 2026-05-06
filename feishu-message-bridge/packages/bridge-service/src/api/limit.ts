export interface BoundedResult<T> {
  items: T[];
  limit: number;
  nextCursor?: string;
}

export function clampLimit(value: unknown, defaultLimit = 20, maxLimit = 50): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return defaultLimit;
  const integer = Math.floor(value);
  if (integer < 1) return defaultLimit;
  return Math.min(integer, maxLimit);
}

export function boundedItems<T>(items: T[], inputLimit: unknown, defaultLimit = 20, maxLimit = 50): BoundedResult<T> {
  const limit = clampLimit(inputLimit, defaultLimit, maxLimit);
  const sliced = items.slice(0, limit);
  const nextCursor = items.length > limit ? String(limit) : undefined;

  return {
    items: sliced,
    limit,
    nextCursor
  };
}
