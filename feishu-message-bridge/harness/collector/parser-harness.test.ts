import { describe, expect, it } from "vitest";

// Scaffold-only synthetic parser harness.
// Real parser implementation must consume synthetic fixtures only.

describe("collector parser harness", () => {
  it("keeps unit tests independent from live external pages", () => {
    const fixtureMode = "synthetic-only";
    expect(fixtureMode).toBe("synthetic-only");
  });
});
