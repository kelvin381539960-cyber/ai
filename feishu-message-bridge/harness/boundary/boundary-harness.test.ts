import { describe, expect, it } from "vitest";

const forbiddenPatterns = [
  /BEGIN PRIVATE KEY/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /Cookie:/i,
  /session=/i
];

describe("boundary harness", () => {
  it("documents forbidden runtime patterns", () => {
    expect(forbiddenPatterns.length).toBeGreaterThan(0);
  });

  it("allows synthetic placeholder content", () => {
    const content = "synthetic placeholder only";
    const hasForbidden = forbiddenPatterns.some((pattern) => pattern.test(content));

    expect(hasForbidden).toBe(false);
  });
});
