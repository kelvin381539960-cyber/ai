import { describe, expect, it } from "vitest";
import { authorizeSyntheticAction } from "../src/auth/action-auth.js";
import { InMemoryMessageRepository } from "../src/messages/in-memory-message-repository.js";
import { allSyntheticMessageRecords } from "../src/messages/synthetic-records.js";
import { createSyntheticRouteContext, handleMessageSearch, handleThreadDetail, handleThreadSearch } from "../src/routes/handlers.js";

function context() {
  return createSyntheticRouteContext(new InMemoryMessageRepository(allSyntheticMessageRecords));
}

describe("Post-Gate-6 synthetic edge-case hardening", () => {
  it("returns empty OpenAPI-aligned search response for unmatched query", () => {
    const response = handleMessageSearch({ keyword: "NO_SYNTHETIC_MATCH", limit: 10 }, context());

    expect(response.items).toEqual([]);
    expect(response.limit).toBe(10);
    expect(response.next_cursor).toBeUndefined();
  });

  it("finds OCR-only matches without using real OCR", () => {
    const response = handleMessageSearch({ keyword: "OCR_ONLY_SECRET_TOKEN" }, context());

    expect(response.items).toHaveLength(1);
    expect(response.items[0].id).toBe("edge-005");
    expect(response.items[0].ocr_snippet).toContain("OCR_ONLY_SECRET_TOKEN");
  });

  it("keeps unknown message types searchable", () => {
    const response = handleMessageSearch({ kind: "unknown" }, context());

    expect(response.items.map((item) => item.id)).toEqual(["edge-006"]);
    expect(response.items[0].item_type).toBe("unknown");
  });

  it("marks missing-root thread detail as partial", () => {
    const response = handleThreadDetail({ threadKey: "thread-missing-root" }, context());

    expect("thread" in response).toBe(true);
    if ("thread" in response) {
      expect(response.thread.thread_key).toBe("thread-missing-root");
      expect(response.thread.source_metadata.root_item_key).toBe("edge-root-missing");
      expect(response.thread.source_metadata.partial).toBe(true);
    }
  });

  it("preserves nested reply parent metadata in thread detail items", () => {
    const response = handleThreadDetail({ threadKey: "thread-nested-replies" }, context());

    expect("items" in response).toBe(true);
    if ("items" in response) {
      expect(response.items.map((item) => item.id)).toEqual(["edge-002", "edge-003", "edge-004"]);
      expect(response.items[2].source_metadata.parent_item_key).toBe("edge-003");
      expect(response.thread.reply_count).toBe(2);
    }
  });

  it("handles cursor beyond available results as an empty final page", () => {
    const response = handleMessageSearch({ limit: 2, cursor: "999" }, context());

    expect(response.items).toEqual([]);
    expect(response.limit).toBe(2);
    expect(response.next_cursor).toBeUndefined();
  });

  it("keeps thread search bounded at cursor boundaries", () => {
    const first = handleThreadSearch({ limit: 1 }, context());
    const second = handleThreadSearch({ limit: 1, cursor: first.next_cursor }, context());

    expect(first.items).toHaveLength(1);
    expect(first.next_cursor).toBe("1");
    expect(second.items).toHaveLength(1);
    expect(second.items[0].thread_key).not.toBe(first.items[0].thread_key);
  });
});

describe("Synthetic GPT Action auth boundary", () => {
  const config = { expectedBearerToken: "synthetic-action-token" };

  it("rejects missing bearer token", () => {
    expect(authorizeSyntheticAction({}, config)).toEqual({ ok: false, reason: "missing_authorization" });
  });

  it("rejects invalid auth scheme", () => {
    expect(authorizeSyntheticAction({ authorization: "Basic synthetic-action-token" }, config)).toEqual({ ok: false, reason: "invalid_scheme" });
  });

  it("rejects wrong bearer token", () => {
    expect(authorizeSyntheticAction({ authorization: "Bearer wrong-token" }, config)).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("accepts matching synthetic bearer token", () => {
    expect(authorizeSyntheticAction({ authorization: "Bearer synthetic-action-token" }, config)).toEqual({ ok: true });
  });
});
