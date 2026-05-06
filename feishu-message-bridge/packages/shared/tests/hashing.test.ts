import { describe, expect, it } from "vitest";
import { buildContentHash, buildDedupKey } from "../src/hashing.js";

describe("hashing helpers", () => {
  it("normalizes equivalent content into stable hash", () => {
    const a = buildContentHash({ text: " Synthetic   Text " });
    const b = buildContentHash({ text: "synthetic text" });

    expect(a).toBe(b);
  });

  it("uses source item key when available", () => {
    const a = buildDedupKey({
      conversationKey: "conv",
      senderName: "sender-a",
      sentAt: "2026-05-06T10:00:00+08:00",
      itemType: "text",
      text: "one",
      sourceItemKey: "source-001"
    });
    const b = buildDedupKey({
      conversationKey: "other-conv",
      senderName: "sender-b",
      sentAt: "2026-05-06T11:00:00+08:00",
      itemType: "image",
      text: "two",
      sourceItemKey: "source-001"
    });

    expect(a).toBe(b);
  });
});
