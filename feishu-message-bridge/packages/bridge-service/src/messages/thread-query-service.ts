import type { InMemoryMessageRepository } from "./in-memory-message-repository.js";
import type { ThreadDetail } from "./types.js";

export class ThreadQueryService {
  constructor(private readonly repository: InMemoryMessageRepository) {}

  getThread(threadKey: string): ThreadDetail | undefined {
    const items = this.repository.findByThreadKey(threadKey);
    if (items.length === 0) return undefined;

    const root = items.find((item) => item.itemKey === item.rootItemKey) ?? items[0];
    const sorted = [...items].sort((a, b) => a.sentAt.localeCompare(b.sentAt) || a.itemKey.localeCompare(b.itemKey));

    return {
      threadKey,
      rootItemKey: root.rootItemKey ?? root.itemKey,
      threadTitle: root.threadTitle ?? "Synthetic thread",
      replyCount: Math.max(0, sorted.length - 1),
      lastReplyAt: sorted[sorted.length - 1].sentAt,
      items: sorted,
      partial: !items.some((item) => item.itemKey === item.rootItemKey)
    };
  }
}
