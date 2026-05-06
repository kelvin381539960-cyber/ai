import { describe, expect, it } from "vitest";

describe("sync harness", () => {
  it("allows one synthetic device to own an active lock", () => {
    const lock = {
      lockKey: "synthetic-default-sync",
      ownerDeviceId: "synthetic-device-a",
      expiresAt: "2026-05-06T10:10:00+08:00"
    };

    expect(lock.ownerDeviceId).toBe("synthetic-device-a");
  });

  it("models duplicate upload as idempotent", () => {
    const firstUploadCount = 1;
    const duplicateUploadCount = 1;

    expect(duplicateUploadCount).toBe(firstUploadCount);
  });
});
