export type MessageKind = "text" | "image" | "link" | "quote" | "file" | "unknown";

export interface SyntheticMessageRecord {
  itemKey: string;
  conversationKey: string;
  conversationName: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  kind: MessageKind;
  text: string;
  ocrText?: string;
  threadKey?: string;
  rootItemKey?: string;
  parentItemKey?: string;
  threadTitle?: string;
}

export interface MessageSearchQuery {
  q?: string;
  keyword?: string;
  conversation?: string;
  conversationKey?: string;
  sender?: string;
  senderId?: string;
  kind?: MessageKind;
  threadKey?: string;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  cursor?: string;
}

export interface MessageSearchResult {
  items: SyntheticMessageRecord[];
  limit: number;
  nextCursor?: string;
}

export interface ThreadDetail {
  threadKey: string;
  rootItemKey: string;
  threadTitle: string;
  conversationName: string;
  replyCount: number;
  lastReplyAt: string;
  items: SyntheticMessageRecord[];
  partial: boolean;
}

export interface MessageItemResponse {
  id: string;
  conversation_name: string;
  sender_name: string;
  sent_at: string;
  item_type: MessageKind;
  text_snippet?: string;
  ocr_snippet?: string;
  thread_key?: string;
  source_metadata: Record<string, unknown>;
}

export interface MessageSearchResponse {
  items: MessageItemResponse[];
  limit: number;
  next_cursor?: string;
}

export interface ThreadItemResponse {
  thread_key: string;
  thread_title?: string;
  conversation_name: string;
  reply_count: number;
  last_reply_at: string;
  root_snippet?: string;
  source_metadata: Record<string, unknown>;
}

export interface ThreadSearchResponse {
  items: ThreadItemResponse[];
  limit: number;
  next_cursor?: string;
}

export interface ThreadDetailResponse {
  thread: ThreadItemResponse;
  items: MessageItemResponse[];
}

export interface SummaryResponse {
  summary: string;
  key_points: string[];
  source_count: number;
}

export interface WorkItemResponse {
  tasks: string[];
  decisions: string[];
  risks: string[];
  blockers: string[];
  source_count: number;
}
