import { describe, expect, it } from "vitest";
import { enforceLimit, validateRequiredString } from "../src/validation.js";

describe("validation helpers", () => {
  it("rejects empty required strings", () => {
    const result = validateRequiredString("", "field");
    expect(result.ok).toBe(false);
  });

  it("enforces bounded limits", () => {
    expect(enforceLimit(999)).toBe(50);
    expect(enforceLimit(0)).toBe(20);
    expect(enforceLimit(10)).toBe(10);
  });
});
