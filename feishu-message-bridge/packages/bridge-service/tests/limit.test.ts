import { describe, expect, it } from "vitest";
import { boundedItems, clampLimit } from "../src/api/limit.js";

describe("api limit helpers", () => {
  it("clamps limits", () => {
    expect(clampLimit(999)).toBe(50);
    expect(clampLimit(5)).toBe(5);
    expect(clampLimit(-1)).toBe(20);
  });

  it("returns bounded items", () => {
    const result = boundedItems([1, 2, 3, 4], 2);
    expect(result.items).toEqual([1, 2]);
    expect(result.nextCursor).toBe("2");
  });
});
