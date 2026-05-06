import type { InMemoryMessageRepository } from "./in-memory-message-repository.js";
import type { MessageSearchQuery, WorkItemResponse } from "./types.js";

const TASK_MARKERS = ["todo", "please", "review", "confirm", "add"];

export class WorkItemService {
  constructor(private readonly repository: InMemoryMessageRepository) {}

  extract(query: MessageSearchQuery = {}): WorkItemResponse {
    const result = this.repository.search({ ...query, limit: query.limit ?? 50 });
    const candidates = result.items.filter((item) => TASK_MARKERS.some((marker) => `${item.text} ${item.ocrText ?? ""}`.toLowerCase().includes(marker)));

    return {
      source: "synthetic-skeleton",
      items: candidates.slice(0, 10).map((item) => ({
        title: item.text.length > 80 ? `${item.text.slice(0, 77)}...` : item.text,
        status: "candidate",
        evidenceItemKeys: [item.itemKey]
      })),
      caveats: ["Mock extraction only; candidates are marker-based synthetic skeletons.", "No production messages or external services were accessed."]
    };
  }
}
