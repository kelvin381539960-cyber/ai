import { describe, expect, it } from "vitest";
import { createSyntheticRateLimiter } from "../src/auth/action-rate-limit.js";

describe("Synthetic rate-limit boundary tests", () => {
  it("blocks after max requests", () => {
    const limiter = createSyntheticRateLimiter({ maxRequests: 3 });

    expect(limiter.attempt().ok).toBe(true);
    expect(limiter.attempt().ok).toBe(true);
    expect(limiter.attempt().ok).toBe(true);
    expect(limiter.attempt()).toEqual({ ok: false, reason: "rate_limited" });
  });

  it("resets count correctly", () => {
    const limiter = createSyntheticRateLimiter({ maxRequests: 2 });
    limiter.attempt();
    limiter.attempt();
    expect(limiter.attempt()).toEqual({ ok: false, reason: "rate_limited" });
    limiter.reset();
    expect(limiter.attempt().ok).toBe(true);
  });
});