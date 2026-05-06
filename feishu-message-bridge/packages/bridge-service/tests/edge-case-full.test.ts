import { describe, expect, it } from "vitest";
import { allSyntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { createSyntheticRouteContext, handleMessageSearch, handleThreadDetail, handleThreadSearch } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(allSyntheticMessageRecords));
}

describe("Phase 8 synthetic edge-case full coverage", () => {
  it("empty-result search", () => {
    const res = handleMessageSearch({ keyword: "NO_MATCH", limit: 10 }, context());
    expect(res.items).toEqual([]);
  });

  it("nested replies preserved", () => {
    const res = handleThreadDetail({ threadKey: "thread-nested-replies" }, context());
    expect(res.items.map(i => i.id)).toEqual(["edge-002","edge-003","edge-004"]);
    expect(res.items[2].source_metadata.parent_item_key).toBe("edge-003");
  });

  it("missing-root thread partial", () => {
    const res = handleThreadDetail({ threadKey: "thread-missing-root" }, context());
    expect(res.thread.source_metadata.partial).toBe(true);
  });

  it("OCR-only match", () => {
    const res = handleMessageSearch({ keyword: "OCR_ONLY_SECRET_TOKEN" }, context());
    expect(res.items[0].ocr_snippet).toContain("OCR_ONLY_SECRET_TOKEN");
  });

  it("unknown type searchable", () => {
    const res = handleMessageSearch({ kind: "unknown" }, context());
    expect(res.items[0].item_type).toBe("unknown");
  });

  it("cursor beyond range returns empty page", () => {
    const res = handleMessageSearch({ limit: 2, cursor: "999" }, context());
    expect(res.items).toEqual([]);
  });

  it("thread search cursor boundaries", () => {
    const first = handleThreadSearch({ limit: 1 }, context());
    const second = handleThreadSearch({ limit: 1, cursor: first.next_cursor }, context());
    expect(first.items.length).toBe(1);
    expect(second.items.length).toBe(1);
  });
});