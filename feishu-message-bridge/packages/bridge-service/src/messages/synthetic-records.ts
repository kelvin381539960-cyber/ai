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

export const syntheticEdgeCaseMessageRecords: SyntheticMessageRecord[] = [
  {
    itemKey: "edge-001",
    conversationKey: "conv-edge-missing-root",
    conversationName: "Synthetic Edge Missing Root",
    senderId: "edge-user-a",
    senderName: "Synthetic Edge Alice",
    sentAt: "2026-01-03T08:00:00.000Z",
    kind: "text",
    text: "Reply whose root item is intentionally absent from synthetic fixtures.",
    threadKey: "thread-missing-root",
    rootItemKey: "edge-root-missing",
    parentItemKey: "edge-root-missing",
    threadTitle: "Missing root synthetic thread"
  },
  {
    itemKey: "edge-002",
    conversationKey: "conv-edge-nested",
    conversationName: "Synthetic Edge Nested",
    senderId: "edge-user-b",
    senderName: "Synthetic Edge Bob",
    sentAt: "2026-01-03T09:00:00.000Z",
    kind: "text",
    text: "Nested thread root for edge-case validation.",
    threadKey: "thread-nested-replies",
    rootItemKey: "edge-002",
    threadTitle: "Nested synthetic thread"
  },
  {
    itemKey: "edge-003",
    conversationKey: "conv-edge-nested",
    conversationName: "Synthetic Edge Nested",
    senderId: "edge-user-c",
    senderName: "Synthetic Edge Casey",
    sentAt: "2026-01-03T09:01:00.000Z",
    kind: "quote",
    text: "First-level reply for nested edge-case validation.",
    threadKey: "thread-nested-replies",
    rootItemKey: "edge-002",
    parentItemKey: "edge-002",
    threadTitle: "Nested synthetic thread"
  },
  {
    itemKey: "edge-004",
    conversationKey: "conv-edge-nested",
    conversationName: "Synthetic Edge Nested",
    senderId: "edge-user-d",
    senderName: "Synthetic Edge Dana",
    sentAt: "2026-01-03T09:02:00.000Z",
    kind: "file",
    text: "Second-level nested reply for synthetic-only validation.",
    threadKey: "thread-nested-replies",
    rootItemKey: "edge-002",
    parentItemKey: "edge-003",
    threadTitle: "Nested synthetic thread"
  },
  {
    itemKey: "edge-005",
    conversationKey: "conv-edge-ocr",
    conversationName: "Synthetic Edge OCR",
    senderId: "edge-user-e",
    senderName: "Synthetic Edge Evan",
    sentAt: "2026-01-03T10:00:00.000Z",
    kind: "image",
    text: "Synthetic image without visible keyword in text field.",
    ocrText: "OCR_ONLY_SECRET_TOKEN appears only in OCR text for query validation."
  },
  {
    itemKey: "edge-006",
    conversationKey: "conv-edge-unknown",
    conversationName: "Synthetic Edge Unknown",
    senderId: "edge-user-f",
    senderName: "Synthetic Edge Finn",
    sentAt: "2026-01-03T11:00:00.000Z",
    kind: "unknown",
    text: "Unknown synthetic message type placeholder should remain searchable and bounded."
  }
];

export const allSyntheticMessageRecords: SyntheticMessageRecord[] = [
  ...syntheticMessageRecords,
  ...syntheticEdgeCaseMessageRecords
];
