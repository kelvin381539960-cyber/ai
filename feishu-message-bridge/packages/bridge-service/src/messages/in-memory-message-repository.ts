import { applyLimit } from "../api/limit.js";
import type { MessageSearchQuery, MessageSearchResult, SyntheticMessageRecord } from "./types.js";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function searchableText(record: SyntheticMessageRecord): string {
  return normalize([record.text, record.ocrText, record.threadTitle, record.conversationName, record.senderName].filter(Boolean).join(" "));
}

export class InMemoryMessageRepository {
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
    const textQuery = query.q ? normalize(query.q) : undefined;

    const matched = this.records.filter((record) => {
      if (query.conversationKey && record.conversationKey !== query.conversationKey) return false;
      if (query.senderId && record.senderId !== query.senderId) return false;
      if (query.kind && record.kind !== query.kind) return false;
      if (query.threadKey && record.threadKey !== query.threadKey) return false;
      if (textQuery && !searchableText(record).includes(textQuery)) return false;
      return true;
    });

    const page = matched.slice(offset);
    const limited = applyLimit(page, query.limit ?? 20, 100);
    const consumed = offset + limited.items.length;

    return {
      items: limited.items,
      nextCursor: consumed < matched.length ? String(consumed) : undefined
    };
  }
}
