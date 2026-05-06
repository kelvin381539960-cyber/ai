export type ItemType = "text" | "rich_text" | "image" | "link" | "quote" | "file" | "unknown";

export interface MessageItem {
  id?: string;
  sourceItemKey?: string;
  conversationKey: string;
  conversationName: string;
  senderKey?: string;
  senderName?: string;
  sentAt: string;
  itemType: ItemType;
  text?: string;
  ocrText?: string;
  threadKey?: string;
  rootItemKey?: string;
  parentItemKey?: string;
  contentHash: string;
  dedupKey: string;
}

export interface ThreadItem {
  threadKey: string;
  conversationKey: string;
  rootItemKey?: string;
  threadTitle?: string;
  replyCount?: number;
  lastReplyAt?: string;
  isPartial?: boolean;
}

export interface SyncBatch {
  deviceId: string;
  batchId: string;
  startedAt: string;
  completedAt?: string;
  messages: MessageItem[];
  threads: ThreadItem[];
}

export interface OcrResult {
  messageKey: string;
  status: "success" | "empty" | "failed" | "disabled";
  text?: string;
  engine?: string;
  error?: string;
}
