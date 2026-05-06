import { describe, expect, it } from "vitest";
import { createSyntheticRateLimiter } from "../src/auth/action-rate-limit.js";

describe("Phase 9 synthetic rate-limit extended", () => {
  it("blocks after max requests with consecutive calls", () => {
    const limiter = createSyntheticRateLimiter({ maxRequests: 2 });
    expect(limiter.attempt().ok).toBe(true);
    expect(limiter.attempt().ok).toBe(true);
    expect(limiter.attempt()).toEqual({ ok: false, reason: "rate_limited" });
  });

  it("reset works correctly", () => {
    const limiter = createSyntheticRateLimiter({ maxRequests: 1 });
    expect(limiter.attempt().ok).toBe(true);
    expect(limiter.attempt()).toEqual({ ok: false, reason: "rate_limited" });
    limiter.reset();
    expect(limiter.attempt().ok).toBe(true);
  });
});