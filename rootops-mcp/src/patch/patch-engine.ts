import { readFile, writeFile } from 'node:fs/promises';
import { FileEngine } from '../file/file-engine.js';
import { SnapshotStore } from '../snapshot/snapshot-store.js';
import type { PatchOperation } from '../types.js';
import { buildSimpleDiffPreview } from './diff.js';

export class PatchEngine {
  constructor(
    private readonly fileEngine = new FileEngine(),
    private readonly snapshotStore = new SnapshotStore()
  ) {}

  async dryRun(patch: PatchOperation): Promise<{ ok: boolean; reason: string; preview?: unknown; currentHash?: string }> {
    const currentHash = await this.fileEngine.hash(patch.path);
    if (currentHash.sha256 !== patch.expectedHash) {
      return { ok: false, reason: 'expected_hash mismatch', currentHash: currentHash.sha256 };
    }

    const text = await readFile(patch.path, 'utf8');
    if (!text.includes(patch.oldText)) {
      return { ok: false, reason: 'oldText not found', currentHash: currentHash.sha256 };
    }

    const next = text.replace(patch.oldText, patch.newText);
    return {
      ok: true,
      reason: 'patch can be applied',
      currentHash: currentHash.sha256,
      preview: buildSimpleDiffPreview(text, next)
    };
  }

  async createSnapshot(path: string, reason: string): Promise<unknown> {
    return this.snapshotStore.create(path, reason);
  }

  async apply(patch: PatchOperation): Promise<{ ok: boolean; reason: string; newHash?: string; snapshot?: unknown }> {
    const dry = await this.dryRun(patch);
    if (!dry.ok) return { ok: false, reason: dry.reason };

    const snapshot = patch.autoSnapshot ? await this.snapshotStore.create(patch.path, 'pre-patch') : undefined;
    const text = await readFile(patch.path, 'utf8');
    await writeFile(patch.path, text.replace(patch.oldText, patch.newText), 'utf8');
    const newHash = await this.fileEngine.hash(patch.path);
    return { ok: true, reason: 'patch applied', newHash: newHash.sha256, snapshot };
  }
}
