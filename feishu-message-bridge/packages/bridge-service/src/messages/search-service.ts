import type { InMemoryMessageRepository } from "./in-memory-message-repository.js";
import type { MessageSearchQuery, MessageSearchResult } from "./types.js";

export class MessageSearchService {
  constructor(private readonly repository: InMemoryMessageRepository) {}

  search(query: MessageSearchQuery = {}): MessageSearchResult {
    return this.repository.search(query);
  }
}
