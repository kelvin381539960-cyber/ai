import { readFile, writeFile } from 'node:fs/promises';
import { FileEngine } from '../file/file-engine.js';
import type { PatchOperation } from '../types.js';

export class PatchEngine {
  constructor(private readonly fileEngine = new FileEngine()) {}

  async dryRun(patch: PatchOperation): Promise<{ ok: boolean; reason: string; preview: string }> {
    const currentHash = await this.fileEngine.hash(patch.path);
    if (currentHash.sha256 !== patch.expectedHash) {
      return { ok: false, reason: 'expected_hash mismatch', preview: '' };
    }

    const text = await readFile(patch.path, 'utf8');
    if (!text.includes(patch.oldText)) {
      return { ok: false, reason: 'oldText not found', preview: '' };
    }

    const next = text.replace(patch.oldText, patch.newText);
    return {
      ok: true,
      reason: 'patch can be applied',
      preview: simplePreview(text, next)
    };
  }

  async apply(patch: PatchOperation): Promise<{ ok: boolean; reason: string; newHash?: string }> {
    const dry = await this.dryRun(patch);
    if (!dry.ok) return { ok: false, reason: dry.reason };

    const text = await readFile(patch.path, 'utf8');
    await writeFile(patch.path, text.replace(patch.oldText, patch.newText), 'utf8');
    const newHash = await this.fileEngine.hash(patch.path);
    return { ok: true, reason: 'patch applied', newHash: newHash.sha256 };
  }
}

function simplePreview(before: string, after: string): string {
  return [
    '--- before length',
    String(before.length),
    '+++ after length',
    String(after.length)
  ].join('\n');
}
