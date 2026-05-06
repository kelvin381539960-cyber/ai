import type { MessageRepository } from "./message-repository.js";
import type { MessageSearchQuery, SummaryResponse } from "./types.js";
import { toSummaryResponse } from "../routes/response-mappers.js";

export class SummaryService {
  constructor(private readonly repository: MessageRepository) {}

  summarize(query: MessageSearchQuery = {}, scope: "messages" | "threads" = "messages"): SummaryResponse {
    const result = this.repository.search({ ...query, limit: query.limit ?? 50 });
    const threadCount = new Set(result.items.map((item) => item.threadKey).filter(Boolean)).size;
    return toSummaryResponse(result.items.length, threadCount, scope);
  }
}
