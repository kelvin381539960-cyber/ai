export interface TextDiffPreview {
  beforeLength: number;
  afterLength: number;
  removedLines: string[];
  addedLines: string[];
}

export function buildSimpleDiffPreview(before: string, after: string, maxLines = 80): TextDiffPreview {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const removedLines: string[] = [];
  const addedLines: string[] = [];
  const max = Math.max(beforeLines.length, afterLines.length);

  for (let i = 0; i < max; i += 1) {
    if (beforeLines[i] === afterLines[i]) continue;
    if (beforeLines[i] != null && removedLines.length < maxLines) removedLines.push(`${i + 1}: ${beforeLines[i]}`);
    if (afterLines[i] != null && addedLines.length < maxLines) addedLines.push(`${i + 1}: ${afterLines[i]}`);
    if (removedLines.length >= maxLines && addedLines.length >= maxLines) break;
  }

  return { beforeLength: before.length, afterLength: after.length, removedLines, addedLines };
}
