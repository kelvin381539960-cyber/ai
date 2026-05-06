import type { MessageRepository } from "./message-repository.js";
import type { MessageSearchQuery, WorkItemResponse } from "./types.js";
import { toWorkItemResponse } from "../routes/response-mappers.js";

const TASK_MARKERS = ["todo", "please", "review", "confirm", "add"];

export class WorkItemService {
  constructor(private readonly repository: MessageRepository) {}

  extract(query: MessageSearchQuery = {}): WorkItemResponse {
    const result = this.repository.search({ ...query, limit: query.limit ?? 50 });
    const candidates = result.items.filter((item) => TASK_MARKERS.some((marker) => `${item.text} ${item.ocrText ?? ""}`.toLowerCase().includes(marker)));
    return toWorkItemResponse(candidates);
  }
}
