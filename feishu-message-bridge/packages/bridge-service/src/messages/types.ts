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
  conversationKey?: string;
  senderId?: string;
  kind?: MessageKind;
  threadKey?: string;
  limit?: number;
  cursor?: string;
}

export interface MessageSearchResult {
  items: SyntheticMessageRecord[];
  nextCursor?: string;
}

export interface ThreadDetail {
  threadKey: string;
  rootItemKey: string;
  threadTitle: string;
  replyCount: number;
  lastReplyAt: string;
  items: SyntheticMessageRecord[];
  partial: boolean;
}

export interface SummaryResponse {
  summary: string;
  source: "synthetic-skeleton";
  itemCount: number;
  threadCount: number;
  caveats: string[];
}

export interface WorkItemResponse {
  source: "synthetic-skeleton";
  items: Array<{
    title: string;
    status: "candidate";
    evidenceItemKeys: string[];
  }>;
  caveats: string[];
}
