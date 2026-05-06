import type { MessageSearchQuery, MessageSearchResult, SyntheticMessageRecord } from "./types.js";

export interface MessageRepository {
  list(): SyntheticMessageRecord[];
  findByItemKey(itemKey: string): SyntheticMessageRecord | undefined;
  findByThreadKey(threadKey: string): SyntheticMessageRecord[];
  search(query?: MessageSearchQuery): MessageSearchResult;
}
