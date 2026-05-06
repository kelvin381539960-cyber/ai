import type { MessageRepository } from "../messages/message-repository.js";
import { MessageSearchService } from "../messages/search-service.js";
import { SummaryService } from "../messages/summary-service.js";
import { ThreadQueryService } from "../messages/thread-query-service.js";
import type { MessageSearchQuery } from "../messages/types.js";
import { WorkItemService } from "../messages/work-item-service.js";
import { toMessageSearchResponse, toThreadDetailResponse, toThreadSearchResponse } from "./response-mappers.js";

export interface RouteContext {
  repository: MessageRepository;
}

export function createSyntheticRouteContext(repository: MessageRepository): RouteContext {
  return { repository };
}

export function handleMessageSearch(query: MessageSearchQuery, context: RouteContext) {
  return toMessageSearchResponse(new MessageSearchService(context.repository).search(query));
}

export function handleThreadSearch(query: MessageSearchQuery, context: RouteContext) {
  const result = new ThreadQueryService(context.repository).searchThreads(query);
  return toThreadSearchResponse(result.items, result.limit, result.nextCursor);
}

export function handleThreadDetail(params: { threadKey: string }, context: RouteContext) {
  const detail = new ThreadQueryService(context.repository).getThread(params.threadKey);
  return detail ? toThreadDetailResponse(detail) : { error: "not_found", thread_key: params.threadKey };
}

export function handleSummary(query: MessageSearchQuery, context: RouteContext) {
  return new SummaryService(context.repository).summarize(query, "messages");
}

export function handleThreadSummary(query: MessageSearchQuery, context: RouteContext) {
  return new SummaryService(context.repository).summarize({ ...query, threadKey: query.threadKey }, "threads");
}

export function handleWorkItems(query: MessageSearchQuery, context: RouteContext) {
  return new WorkItemService(context.repository).extract(query);
}

export function handleThreadWorkItems(query: MessageSearchQuery, context: RouteContext) {
  return new WorkItemService(context.repository).extract(query);
}
