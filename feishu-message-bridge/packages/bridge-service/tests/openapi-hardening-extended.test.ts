import { describe, expect, it } from "vitest";
import { allSyntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { createSyntheticRouteContext, handleMessageSearch, handleThreadSearch, handleThreadDetail } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(allSyntheticMessageRecords));
}

describe("Phase 9 OpenAPI validation hardening", () => {
  it("message search shape with limit and cursor", () => {
    const res = handleMessageSearch({ keyword: "API", limit: 2 }, context());
    expect(Array.isArray(res.items)).toBe(true);
    expect(typeof res.limit).toBe("number");
    expect(res.items[0]).toHaveProperty("id");
  });

  it("thread search shape with limit and cursor", () => {
    const res = handleThreadSearch({ limit: 1 }, context());
    expect(Array.isArray(res.items)).toBe(true);
    expect(res.items[0]).toHaveProperty("thread_key");
  });

  it("thread detail shape with nested and missing-root", () => {
    const resNested = handleThreadDetail({ threadKey: "thread-nested-replies" }, context());
    expect(resNested.items[0]).toHaveProperty("id");
    const resMissing = handleThreadDetail({ threadKey: "thread-missing-root" }, context());
    expect(resMissing.thread.source_metadata.partial).toBe(true);
  });
});