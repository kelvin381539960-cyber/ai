import { describe, expect, it } from "vitest";
import type { MessageItem } from "@fmb/shared";
import { reconstructThreads } from "../src/thread/thread-reconstructor.js";

function buildMessage(partial: Partial<MessageItem>): MessageItem {
  return {
    conversationKey: "synthetic-conv",
    conversationName: "synthetic conversation",
    sentAt: "2026-05-06T10:00:00+08:00",
    itemType: "text",
    contentHash: "hash",
    dedupKey: "dedup",
    ...partial
  };
}

describe("thread reconstructor", () => {
  it("reconstructs root with replies", () => {
    const threads = reconstructThreads([
      buildMessage({ sourceItemKey: "root", threadKey: "thread-1", rootItemKey: "root", text: "Root", sentAt: "2026-05-06T10:00:00+08:00" }),
      buildMessage({ sourceItemKey: "reply", threadKey: "thread-1", rootItemKey: "root", parentItemKey: "root", text: "Reply", sentAt: "2026-05-06T10:05:00+08:00" })
    ]);

    expect(threads).toHaveLength(1);
    expect(threads[0].thread.replyCount).toBe(1);
    expect(threads[0].thread.rootItemKey).toBe("root");
  });

  it("marks missing root as partial", () => {
    const threads = reconstructThreads([
      buildMessage({ sourceItemKey: "reply", threadKey: "thread-2", parentItemKey: "missing-root", text: "Reply only" })
    ]);

    expect(threads[0].thread.isPartial).toBe(true);
  });
});
