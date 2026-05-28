import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FileEngine } from '../file/file-engine.js';
import { SnapshotStore } from '../snapshot/snapshot-store.js';
import type { PatchOperation } from '../types.js';
import { buildSimpleDiffPreview } from './diff.js';

export interface PatchApplyResult {
  ok: boolean;
  reason: string;
  oldHash?: string;
  newHash?: string;
  snapshot?: unknown;
  verify?: PatchVerifyResult;
}

export interface PatchVerifyResult {
  ok: boolean;
  reason: string;
  path: string;
  sha256: string;
  containsNewText: boolean;
  containsOldText: boolean;
}

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
      preview: buildSimpleDiffPreview(text, next, path.basename(patch.path))
    };
  }

  async createSnapshot(path: string, reason: string): Promise<unknown> {
    return this.snapshotStore.create(path, reason);
  }

  async restoreSnapshot(snapshotId: string, targetPath?: string): Promise<unknown> {
    return this.snapshotStore.restore(snapshotId, targetPath);
  }

  async apply(patch: PatchOperation): Promise<PatchApplyResult> {
    const dry = await this.dryRun(patch);
    if (!dry.ok) return { ok: false, reason: dry.reason, oldHash: dry.currentHash };

    const snapshot = patch.autoSnapshot ? await this.snapshotStore.create(patch.path, 'pre-patch') : undefined;
    const text = await readFile(patch.path, 'utf8');
    await writeFile(patch.path, text.replace(patch.oldText, patch.newText), 'utf8');
    const newHash = await this.fileEngine.hash(patch.path);
    const verify = await this.verify(patch.path, patch.newText, patch.oldText);
    return { ok: true, reason: 'patch applied', oldHash: dry.currentHash, newHash: newHash.sha256, snapshot, verify };
  }

  async verify(path: string, expectedText: string, oldText?: string): Promise<PatchVerifyResult> {
    const hash = await this.fileEngine.hash(path);
    const text = await readFile(path, 'utf8');
    return {
      ok: text.includes(expectedText) && (oldText ? !text.includes(oldText) : true),
      reason: 'verification completed',
      path,
      sha256: hash.sha256,
      containsNewText: text.includes(expectedText),
      containsOldText: oldText ? text.includes(oldText) : false
    };
  }
}
