import { InMemoryMessageRepository } from "../messages/in-memory-message-repository.js";
import { MessageSearchService } from "../messages/search-service.js";
import { SummaryService } from "../messages/summary-service.js";
import { ThreadQueryService } from "../messages/thread-query-service.js";
import type { MessageSearchQuery } from "../messages/types.js";
import { WorkItemService } from "../messages/work-item-service.js";

export interface RouteContext {
  repository: InMemoryMessageRepository;
}

export function createSyntheticRouteContext(repository: InMemoryMessageRepository): RouteContext {
  return { repository };
}

export function handleMessageSearch(query: MessageSearchQuery, context: RouteContext) {
  return new MessageSearchService(context.repository).search(query);
}

export function handleThreadDetail(params: { threadKey: string }, context: RouteContext) {
  const detail = new ThreadQueryService(context.repository).getThread(params.threadKey);
  return detail ?? { error: "not_found", threadKey: params.threadKey };
}

export function handleSummary(query: MessageSearchQuery, context: RouteContext) {
  return new SummaryService(context.repository).summarize(query);
}

export function handleWorkItems(query: MessageSearchQuery, context: RouteContext) {
  return new WorkItemService(context.repository).extract(query);
}
