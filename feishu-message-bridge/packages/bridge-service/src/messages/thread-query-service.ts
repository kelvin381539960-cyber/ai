import { boundedItems } from "../api/limit.js";
import type { MessageRepository } from "./message-repository.js";
import type { MessageSearchQuery, ThreadDetail } from "./types.js";

export class ThreadQueryService {
  constructor(private readonly repository: MessageRepository) {}

  getThread(threadKey: string): ThreadDetail | undefined {
    const items = this.repository.findByThreadKey(threadKey);
    if (items.length === 0) return undefined;

    const root = items.find((item) => item.itemKey === item.rootItemKey) ?? items[0];
    const sorted = [...items].sort((a, b) => a.sentAt.localeCompare(b.sentAt) || a.itemKey.localeCompare(b.itemKey));

    return {
      threadKey,
      rootItemKey: root.rootItemKey ?? root.itemKey,
      threadTitle: root.threadTitle ?? "Synthetic thread",
      conversationName: root.conversationName,
      replyCount: Math.max(0, sorted.length - 1),
      lastReplyAt: sorted[sorted.length - 1].sentAt,
      items: sorted,
      partial: !items.some((item) => item.itemKey === item.rootItemKey)
    };
  }

  searchThreads(query: MessageSearchQuery = {}): { items: ThreadDetail[]; limit: number; nextCursor?: string } {
    const matched = this.repository.search({ ...query, limit: 50 }).items.filter((item) => item.threadKey);
    const threadKeys = [...new Set(matched.map((item) => item.threadKey).filter((key): key is string => Boolean(key)))];
    const details = threadKeys.map((threadKey) => this.getThread(threadKey)).filter((detail): detail is ThreadDetail => Boolean(detail));
    const cursor = query.cursor ? Number.parseInt(query.cursor, 10) : 0;
    const offset = Number.isFinite(cursor) && cursor > 0 ? cursor : 0;
    const page = details.slice(offset);
    const limited = boundedItems(page, query.limit ?? 20, 20, 50);
    const consumed = offset + limited.items.length;

    return {
      items: limited.items,
      limit: limited.limit,
      nextCursor: consumed < details.length ? String(consumed) : undefined
    };
  }
}
