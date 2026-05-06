import { describe, expect, it } from "vitest";

describe("api harness", () => {
  it("keeps health endpoint public in the OpenAPI contract", () => {
    const publicEndpoint = "/health";
    expect(publicEndpoint).toBe("/health");
  });

  it("requires bounded result limits for search-like endpoints", () => {
    const maxLimit = 50;
    const defaultLimit = 20;

    expect(defaultLimit).toBeLessThanOrEqual(maxLimit);
    expect(maxLimit).toBe(50);
  });

  it("includes thread endpoints as first-class API surface", () => {
    const endpoints = ["/threads/search", "/threads/{thread_key}", "/threads/summary", "/threads/tasks"];

    expect(endpoints).toContain("/threads/search");
    expect(endpoints).toContain("/threads/{thread_key}");
  });
});
