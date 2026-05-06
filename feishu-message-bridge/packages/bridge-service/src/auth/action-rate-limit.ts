export interface SyntheticRateLimitConfig {
  maxRequests: number;
}

export interface SyntheticRateLimitState {
  count: number;
}

export function createSyntheticRateLimiter(config: SyntheticRateLimitConfig) {
  const state: SyntheticRateLimitState = { count: 0 };

  return {
    attempt(): { ok: boolean; reason?: "rate_limited" } {
      if (state.count >= config.maxRequests) {
        return { ok: false, reason: "rate_limited" };
      }
      state.count++;
      return { ok: true };
    },
    reset() {
      state.count = 0;
    },
    state
  };
}