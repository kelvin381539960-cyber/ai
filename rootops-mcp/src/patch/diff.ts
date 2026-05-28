export interface TextDiffPreview {
  beforeLength: number;
  afterLength: number;
  removedLines: string[];
  addedLines: string[];
  unified: string;
}

export function buildSimpleDiffPreview(before: string, after: string, filePath = 'file', maxLines = 120): TextDiffPreview {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const removedLines: string[] = [];
  const addedLines: string[] = [];
  const unifiedLines: string[] = [`--- a/${filePath}`, `+++ b/${filePath}`];
  const max = Math.max(beforeLines.length, afterLines.length);
  let emitted = 0;
  let hunkOpen = false;

  for (let i = 0; i < max; i += 1) {
    if (beforeLines[i] === afterLines[i]) {
      if (hunkOpen && emitted < maxLines) {
        unifiedLines.push(` ${beforeLines[i] ?? ''}`);
        emitted += 1;
      }
      continue;
    }

    if (!hunkOpen) {
      const start = Math.max(1, i - 2);
      unifiedLines.push(`@@ -${start},? +${start},? @@`);
      for (let c = Math.max(0, i - 2); c < i; c += 1) {
        unifiedLines.push(` ${beforeLines[c] ?? ''}`);
        emitted += 1;
      }
      hunkOpen = true;
    }

    if (beforeLines[i] != null) {
      if (removedLines.length < maxLines) removedLines.push(`${i + 1}: ${beforeLines[i]}`);
      if (emitted < maxLines) unifiedLines.push(`-${beforeLines[i]}`);
    }
    if (afterLines[i] != null) {
      if (addedLines.length < maxLines) addedLines.push(`${i + 1}: ${afterLines[i]}`);
      if (emitted < maxLines) unifiedLines.push(`+${afterLines[i]}`);
    }
    emitted += 2;
    if (emitted >= maxLines) {
      unifiedLines.push('... diff truncated ...');
      break;
    }
  }

  return {
    beforeLength: before.length,
    afterLength: after.length,
    removedLines,
    addedLines,
    unified: unifiedLines.join('\n')
  };
}
