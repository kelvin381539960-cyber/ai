import { describe, expect, it } from "vitest";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { syntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { handleMessageSearch, handleSummary, handleThreadDetail, handleWorkItems, createSyntheticRouteContext } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(syntheticMessageRecords));
}

describe("Phase 4B synthetic API skeleton", () => {
  it("searches synthetic records without external access", () => {
    const response = handleMessageSearch({ q: "Gate 5", limit: 5 }, context());

    expect(response.items).toHaveLength(1);
    expect(response.items[0].itemKey).toBe("msg-003");
    expect(response.nextCursor).toBeUndefined();
  });

  it("returns bounded paged search responses", () => {
    const first = handleMessageSearch({ limit: 2 }, context());
    const second = handleMessageSearch({ limit: 2, cursor: first.nextCursor }, context());

    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).toBe("2");
    expect(second.items.map((item) => item.itemKey)).toEqual(["msg-003", "msg-004"]);
  });

  it("returns thread detail response shape", () => {
    const response = handleThreadDetail({ threadKey: "thread-api-skeleton" }, context());

    expect("items" in response).toBe(true);
    if ("items" in response) {
      expect(response.replyCount).toBe(2);
      expect(response.rootItemKey).toBe("msg-001");
      expect(response.items.map((item) => item.itemKey)).toEqual(["msg-001", "msg-002", "msg-003"]);
    }
  });

  it("returns summary skeleton response shape", () => {
    const response = handleSummary({ conversationKey: "conv-product-alpha" }, context());

    expect(response.source).toBe("synthetic-skeleton");
    expect(response.itemCount).toBe(3);
    expect(response.caveats.join(" ")).toContain("Mock response only");
  });

  it("returns work item extraction skeleton response shape", () => {
    const response = handleWorkItems({ threadKey: "thread-api-skeleton" }, context());

    expect(response.source).toBe("synthetic-skeleton");
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].status).toBe("candidate");
  });
});
