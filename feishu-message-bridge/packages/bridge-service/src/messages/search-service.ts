import type { MessageRepository } from "./message-repository.js";
import type { MessageSearchQuery, MessageSearchResult } from "./types.js";

export class MessageSearchService {
  constructor(private readonly repository: MessageRepository) {}

  search(query: MessageSearchQuery = {}): MessageSearchResult {
    return this.repository.search(query);
  }
}
