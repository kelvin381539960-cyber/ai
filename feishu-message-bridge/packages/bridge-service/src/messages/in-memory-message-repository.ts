import { boundedItems } from "../api/limit.js";
import type { MessageRepository } from "./message-repository.js";
import type { MessageSearchQuery, MessageSearchResult, SyntheticMessageRecord } from "./types.js";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function searchableText(record: SyntheticMessageRecord): string {
  return normalize([record.text, record.ocrText, record.threadTitle, record.conversationName, record.senderName].filter(Boolean).join(" "));
}

function isAtOrAfter(value: string, fromTime?: string): boolean {
  return !fromTime || value >= fromTime;
}

function isAtOrBefore(value: string, toTime?: string): boolean {
  return !toTime || value <= toTime;
}

export class InMemoryMessageRepository implements MessageRepository {
  private readonly records: SyntheticMessageRecord[];

  constructor(records: SyntheticMessageRecord[] = []) {
    this.records = [...records].sort((a, b) => a.sentAt.localeCompare(b.sentAt) || a.itemKey.localeCompare(b.itemKey));
  }

  list(): SyntheticMessageRecord[] {
    return [...this.records];
  }

  findByItemKey(itemKey: string): SyntheticMessageRecord | undefined {
    return this.records.find((record) => record.itemKey === itemKey);
  }

  findByThreadKey(threadKey: string): SyntheticMessageRecord[] {
    return this.records.filter((record) => record.threadKey === threadKey);
  }

  search(query: MessageSearchQuery = {}): MessageSearchResult {
    const cursor = query.cursor ? Number.parseInt(query.cursor, 10) : 0;
    const offset = Number.isFinite(cursor) && cursor > 0 ? cursor : 0;
    const textQuery = query.keyword ?? query.q;
    const normalizedTextQuery = textQuery ? normalize(textQuery) : undefined;
    const conversationQuery = query.conversation ? normalize(query.conversation) : undefined;
    const senderQuery = query.sender ? normalize(query.sender) : undefined;

    const matched = this.records.filter((record) => {
      if (query.conversationKey && record.conversationKey !== query.conversationKey) return false;
      if (conversationQuery && normalize(record.conversationName) !== conversationQuery && normalize(record.conversationKey) !== conversationQuery) return false;
      if (query.senderId && record.senderId !== query.senderId) return false;
      if (senderQuery && normalize(record.senderName) !== senderQuery && normalize(record.senderId) !== senderQuery) return false;
      if (query.kind && record.kind !== query.kind) return false;
      if (query.threadKey && record.threadKey !== query.threadKey) return false;
      if (!isAtOrAfter(record.sentAt, query.fromTime)) return false;
      if (!isAtOrBefore(record.sentAt, query.toTime)) return false;
      if (normalizedTextQuery && !searchableText(record).includes(normalizedTextQuery)) return false;
      return true;
    });

    const page = matched.slice(offset);
    const limited = boundedItems(page, query.limit ?? 20, 20, 50);
    const consumed = offset + limited.items.length;

    return {
      items: limited.items,
      limit: limited.limit,
      nextCursor: consumed < matched.length ? String(consumed) : undefined
    };
  }
}
