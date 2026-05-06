import type { InMemoryMessageRepository } from "./in-memory-message-repository.js";
import type { MessageSearchQuery, SummaryResponse } from "./types.js";

export class SummaryService {
  constructor(private readonly repository: InMemoryMessageRepository) {}

  summarize(query: MessageSearchQuery = {}): SummaryResponse {
    const result = this.repository.search({ ...query, limit: query.limit ?? 50 });
    const threadCount = new Set(result.items.map((item) => item.threadKey).filter(Boolean)).size;

    return {
      summary: result.items.length === 0 ? "No synthetic records matched the summary query." : `Synthetic summary skeleton over ${result.items.length} record(s).`,
      source: "synthetic-skeleton",
      itemCount: result.items.length,
      threadCount,
      caveats: ["Mock response only; no real Feishu data was read.", "Summary text is a skeleton and not an LLM-generated production summary."]
    };
  }
}
