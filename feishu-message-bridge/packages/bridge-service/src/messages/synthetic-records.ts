import type { SyntheticMessageRecord } from "./types.js";

export const syntheticMessageRecords: SyntheticMessageRecord[] = [
  {
    itemKey: "msg-001",
    conversationKey: "conv-product-alpha",
    conversationName: "Synthetic Product Alpha",
    senderId: "user-a",
    senderName: "Synthetic Alice",
    sentAt: "2026-01-01T09:00:00.000Z",
    kind: "text",
    text: "Please review the API skeleton for the Feishu Message Bridge mock search endpoint.",
    threadKey: "thread-api-skeleton",
    rootItemKey: "msg-001",
    threadTitle: "API skeleton review"
  },
  {
    itemKey: "msg-002",
    conversationKey: "conv-product-alpha",
    conversationName: "Synthetic Product Alpha",
    senderId: "user-b",
    senderName: "Synthetic Bob",
    sentAt: "2026-01-01T09:05:00.000Z",
    kind: "text",
    text: "I will add synthetic tests for search, thread detail, summary, and work item response shapes.",
    threadKey: "thread-api-skeleton",
    rootItemKey: "msg-001",
    parentItemKey: "msg-001",
    threadTitle: "API skeleton review"
  },
  {
    itemKey: "msg-003",
    conversationKey: "conv-product-alpha",
    conversationName: "Synthetic Product Alpha",
    senderId: "user-c",
    senderName: "Synthetic Casey",
    sentAt: "2026-01-01T09:10:00.000Z",
    kind: "image",
    text: "Synthetic image attachment",
    ocrText: "TODO confirm API response shape before Gate 5 review",
    threadKey: "thread-api-skeleton",
    rootItemKey: "msg-001",
    parentItemKey: "msg-002",
    threadTitle: "API skeleton review"
  },
  {
    itemKey: "msg-004",
    conversationKey: "conv-ops-beta",
    conversationName: "Synthetic Ops Beta",
    senderId: "user-d",
    senderName: "Synthetic Dana",
    sentAt: "2026-01-02T10:00:00.000Z",
    kind: "link",
    text: "Reference link placeholder for mock bridge service documentation. No external fetch is performed."
  }
];
