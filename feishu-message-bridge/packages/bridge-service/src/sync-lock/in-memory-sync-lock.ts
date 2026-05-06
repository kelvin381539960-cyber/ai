export interface SyncLockRecord {
  lockKey: string;
  ownerDeviceId: string;
  expiresAtMs: number;
}

export interface AcquireLockInput {
  lockKey: string;
  ownerDeviceId: string;
  ttlMs: number;
  nowMs?: number;
}

export class InMemorySyncLockStore {
  private readonly locks = new Map<string, SyncLockRecord>();

  acquire(input: AcquireLockInput): { acquired: boolean; lock?: SyncLockRecord; reason?: string } {
    const nowMs = input.nowMs ?? Date.now();
    const existing = this.locks.get(input.lockKey);

    if (existing && existing.expiresAtMs > nowMs && existing.ownerDeviceId !== input.ownerDeviceId) {
      return { acquired: false, lock: existing, reason: "lock_active" };
    }

    const lock: SyncLockRecord = {
      lockKey: input.lockKey,
      ownerDeviceId: input.ownerDeviceId,
      expiresAtMs: nowMs + input.ttlMs
    };

    this.locks.set(input.lockKey, lock);
    return { acquired: true, lock };
  }

  release(lockKey: string, ownerDeviceId: string): boolean {
    const existing = this.locks.get(lockKey);

    if (!existing || existing.ownerDeviceId !== ownerDeviceId) {
      return false;
    }

    return this.locks.delete(lockKey);
  }
}
