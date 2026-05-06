import { describe, expect, it } from "vitest";
import { InMemorySyncLockStore } from "../src/sync-lock/in-memory-sync-lock.js";

describe("in-memory sync lock", () => {
  it("denies another owner while lock is active", () => {
    const store = new InMemorySyncLockStore();
    const first = store.acquire({ lockKey: "sync", ownerDeviceId: "device-a", ttlMs: 1000, nowMs: 0 });
    const second = store.acquire({ lockKey: "sync", ownerDeviceId: "device-b", ttlMs: 1000, nowMs: 100 });

    expect(first.acquired).toBe(true);
    expect(second.acquired).toBe(false);
    expect(second.reason).toBe("lock_active");
  });

  it("allows acquisition after expiration", () => {
    const store = new InMemorySyncLockStore();
    store.acquire({ lockKey: "sync", ownerDeviceId: "device-a", ttlMs: 1000, nowMs: 0 });
    const next = store.acquire({ lockKey: "sync", ownerDeviceId: "device-b", ttlMs: 1000, nowMs: 1001 });

    expect(next.acquired).toBe(true);
    expect(next.lock?.ownerDeviceId).toBe("device-b");
  });
});
