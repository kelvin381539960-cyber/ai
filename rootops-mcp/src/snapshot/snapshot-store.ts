import { createHash, randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface SnapshotRecord {
  id: string;
  sourcePath: string;
  snapshotPath: string;
  sha256: string;
  bytes: number;
  createdAt: string;
  reason: string;
}

export interface SnapshotStoreOptions {
  rootDir?: string;
}

export class SnapshotStore {
  private readonly rootDir: string;

  constructor(options: SnapshotStoreOptions = {}) {
    this.rootDir = options.rootDir ?? process.env.ROOTOPS_SNAPSHOT_DIR ?? '.var/snapshots';
  }

  async create(sourcePath: string, reason = 'manual'): Promise<SnapshotRecord> {
    const data = await readFile(sourcePath);
    const sha256 = createHash('sha256').update(data).digest('hex');
    const id = `snap_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const createdAt = new Date().toISOString();
    const snapshotPath = path.join(this.rootDir, `${id}.bin`);
    const metaPath = path.join(this.rootDir, `${id}.json`);

    await mkdir(this.rootDir, { recursive: true });
    await copyFile(sourcePath, snapshotPath);

    const record: SnapshotRecord = {
      id,
      sourcePath,
      snapshotPath,
      sha256,
      bytes: data.byteLength,
      createdAt,
      reason
    };

    await writeFile(metaPath, JSON.stringify(record, null, 2), 'utf8');
    return record;
  }
}
