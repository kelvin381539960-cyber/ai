import { describe, expect, it } from "vitest";
import { allSyntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { createSyntheticRouteContext, handleMessageSearch, handleThreadSearch, handleThreadDetail } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(allSyntheticMessageRecords));
}

describe("OpenAPI-aligned boundary validation", () => {
  it("message search shape", () => {
    const res = handleMessageSearch({ limit: 5 }, context());
    expect(Array.isArray(res.items)).toBe(true);
    expect(typeof res.limit).toBe("number");
    expect(res.items[0]).toHaveProperty("id");
    expect(res.items[0]).toHaveProperty("conversation_name");
  });

  it("thread search shape", () => {
    const res = handleThreadSearch({ limit: 3 }, context());
    expect(Array.isArray(res.items)).toBe(true);
    expect(typeof res.limit).toBe("number");
    expect(res.items[0]).toHaveProperty("thread_key");
  });

  it("thread detail shape", () => {
    const res = handleThreadDetail({ threadKey: "thread-api-skeleton" }, context());
    expect(res).toHaveProperty("thread");
    expect(Array.isArray(res.items)).toBe(true);
  });
});