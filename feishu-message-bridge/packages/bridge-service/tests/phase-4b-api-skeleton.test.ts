import { describe, expect, it } from "vitest";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { syntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { handleMessageSearch, handleSummary, handleThreadDetail, handleThreadSearch, handleWorkItems, createSyntheticRouteContext } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(syntheticMessageRecords));
}

describe("Phase 4B synthetic API skeleton", () => {
  it("searches synthetic records without external access using OpenAPI-aligned shape", () => {
    const response = handleMessageSearch({ keyword: "Gate 5", limit: 5 }, context());

    expect(response.items).toHaveLength(1);
    expect(response.items[0].id).toBe("msg-003");
    expect(response.items[0].ocr_snippet).toContain("Gate 5");
    expect(response.next_cursor).toBeUndefined();
  });

  it("returns bounded paged search responses", () => {
    const first = handleMessageSearch({ limit: 2 }, context());
    const second = handleMessageSearch({ limit: 2, cursor: first.next_cursor }, context());

    expect(first.items).toHaveLength(2);
    expect(first.limit).toBe(2);
    expect(first.next_cursor).toBe("2");
    expect(second.items.map((item) => item.id)).toEqual(["msg-003", "msg-004"]);
  });

  it("returns thread search response shape", () => {
    const response = handleThreadSearch({ keyword: "review" }, context());

    expect(response.items).toHaveLength(1);
    expect(response.items[0].thread_key).toBe("thread-api-skeleton");
    expect(response.items[0].reply_count).toBe(2);
  });

  it("returns thread detail response shape", () => {
    const response = handleThreadDetail({ threadKey: "thread-api-skeleton" }, context());

    expect("items" in response).toBe(true);
    if ("items" in response) {
      expect(response.thread.reply_count).toBe(2);
      expect(response.thread.source_metadata.root_item_key).toBe("msg-001");
      expect(response.items.map((item) => item.id)).toEqual(["msg-001", "msg-002", "msg-003"]);
    }
  });

  it("returns summary skeleton response shape", () => {
    const response = handleSummary({ conversation: "Synthetic Product Alpha" }, context());

    expect(response.source_count).toBe(3);
    expect(response.key_points.join(" ")).toContain("Mock response only");
  });

  it("returns work item extraction skeleton response shape", () => {
    const response = handleWorkItems({ threadKey: "thread-api-skeleton" }, context());

    expect(response.tasks.length).toBeGreaterThan(0);
    expect(response.decisions).toEqual([]);
    expect(response.risks).toEqual([]);
    expect(response.blockers).toEqual([]);
  });
});
