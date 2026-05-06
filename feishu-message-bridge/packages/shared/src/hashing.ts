import { createHash } from "node:crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function normalizeContent(input: string | undefined): string {
  return (input ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export interface DedupInput {
  conversationKey: string;
  senderName?: string;
  sentAt: string;
  itemType: string;
  text?: string;
  ocrText?: string;
  sourceItemKey?: string;
}

export function buildContentHash(input: Pick<DedupInput, "text" | "ocrText">): string {
  return sha256(`${normalizeContent(input.text)}|${normalizeContent(input.ocrText)}`);
}

export function buildDedupKey(input: DedupInput): string {
  if (input.sourceItemKey && input.sourceItemKey.trim().length > 0) {
    return sha256(`source:${input.sourceItemKey}`);
  }

  const contentHash = buildContentHash(input);
  return sha256([
    input.conversationKey,
    input.senderName ?? "unknown-sender",
    input.sentAt,
    input.itemType,
    contentHash
  ].join("|"));
}
