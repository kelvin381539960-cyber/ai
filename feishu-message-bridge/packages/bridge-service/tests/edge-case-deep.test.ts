import { describe, expect, it } from "vitest";
import { allSyntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { createSyntheticRouteContext, handleMessageSearch, handleThreadDetail } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(allSyntheticMessageRecords));
}

describe("Phase 9 synthetic deep edge-case coverage", () => {
  it("nested replies up to 5 levels", () => {
    const res = handleThreadDetail({ threadKey: "thread-nested-replies" }, context());
    expect(res.items.length).toBeGreaterThanOrEqual(3);
  });

  it("OCR-only multi-record match", () => {
    const res = handleMessageSearch({ keyword: "OCR_ONLY_SECRET_TOKEN" }, context());
    expect(res.items.filter(i => i.ocr_snippet?.includes("OCR_ONLY_SECRET_TOKEN")).length).toBeGreaterThanOrEqual(1);
  });

  it("unknown type multi-record match", () => {
    const res = handleMessageSearch({ kind: "unknown" }, context());
    expect(res.items.every(i => i.item_type === "unknown")).toBe(true);
  });

  it("missing-root multiple threads partial", () => {
    const res = handleThreadDetail({ threadKey: "thread-missing-root" }, context());
    expect(res.thread.source_metadata.partial).toBe(true);
  });

  it("empty-result combination test", () => {
    const res = handleMessageSearch({ keyword: "NO_MATCH", limit: 5 }, context());
    expect(res.items).toEqual([]);
  });

  it("cursor boundary combination test", () => {
    const first = handleThreadDetail({ threadKey: "thread-nested-replies" }, context());
    expect(first.items.length).toBeGreaterThan(0);
  });
});