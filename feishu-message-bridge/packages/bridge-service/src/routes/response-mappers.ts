import type { MessageItemResponse, MessageSearchResult, MessageSearchResponse, SyntheticMessageRecord, SummaryResponse, ThreadDetail, ThreadDetailResponse, ThreadItemResponse, ThreadSearchResponse, WorkItemResponse } from "../messages/types.js";

function snippet(value?: string, maxLength = 160): string | undefined {
  if (!value) return undefined;
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export function toMessageItemResponse(record: SyntheticMessageRecord): MessageItemResponse {
  return {
    id: record.itemKey,
    conversation_name: record.conversationName,
    sender_name: record.senderName,
    sent_at: record.sentAt,
    item_type: record.kind,
    text_snippet: snippet(record.text),
    ocr_snippet: snippet(record.ocrText),
    thread_key: record.threadKey,
    source_metadata: {
      synthetic: true,
      conversation_key: record.conversationKey,
      sender_id: record.senderId,
      root_item_key: record.rootItemKey,
      parent_item_key: record.parentItemKey
    }
  };
}

export function toMessageSearchResponse(result: MessageSearchResult): MessageSearchResponse {
  return {
    items: result.items.map(toMessageItemResponse),
    limit: result.limit,
    next_cursor: result.nextCursor
  };
}

export function toThreadItemResponse(detail: ThreadDetail): ThreadItemResponse {
  const root = detail.items.find((item) => item.itemKey === detail.rootItemKey) ?? detail.items[0];
  return {
    thread_key: detail.threadKey,
    thread_title: detail.threadTitle,
    conversation_name: detail.conversationName,
    reply_count: detail.replyCount,
    last_reply_at: detail.lastReplyAt,
    root_snippet: snippet(root?.text),
    source_metadata: {
      synthetic: true,
      root_item_key: detail.rootItemKey,
      partial: detail.partial
    }
  };
}

export function toThreadDetailResponse(detail: ThreadDetail): ThreadDetailResponse {
  return {
    thread: toThreadItemResponse(detail),
    items: detail.items.map(toMessageItemResponse)
  };
}

export function toThreadSearchResponse(details: ThreadDetail[], limit: number, nextCursor?: string): ThreadSearchResponse {
  return {
    items: details.map(toThreadItemResponse),
    limit,
    next_cursor: nextCursor
  };
}

export function toSummaryResponse(sourceCount: number, threadCount: number, scope: "messages" | "threads"): SummaryResponse {
  return {
    summary: sourceCount === 0 ? `No synthetic ${scope} matched the summary query.` : `Synthetic ${scope} summary skeleton over ${sourceCount} source item(s).`,
    key_points: [
      "Mock response only; no real Feishu data was read.",
      `Synthetic thread count: ${threadCount}.`
    ],
    source_count: sourceCount
  };
}

export function toWorkItemResponse(candidates: SyntheticMessageRecord[]): WorkItemResponse {
  const taskTitles = candidates.slice(0, 10).map((item) => snippet(item.text, 100) ?? item.itemKey);
  return {
    tasks: taskTitles,
    decisions: [],
    risks: [],
    blockers: [],
    source_count: candidates.length
  };
}
