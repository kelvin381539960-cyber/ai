import type { MessageItem, ThreadItem } from "@fmb/shared";

export interface ReconstructedThread {
  thread: ThreadItem;
  items: MessageItem[];
}

export function reconstructThreads(messages: MessageItem[]): ReconstructedThread[] {
  const grouped = new Map<string, MessageItem[]>();

  for (const message of messages) {
    if (!message.threadKey) continue;

    const current = grouped.get(message.threadKey) ?? [];
    current.push(message);
    grouped.set(message.threadKey, current);
  }

  return Array.from(grouped.entries()).map(([threadKey, items]) => {
    const sorted = [...items].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
    const root = sorted.find((item) => item.rootItemKey && item.sourceItemKey === item.rootItemKey) ?? sorted[0];
    const replies = sorted.filter((item) => item.sourceItemKey !== root.sourceItemKey);

    return {
      thread: {
        threadKey,
        conversationKey: root.conversationKey,
        rootItemKey: root.rootItemKey ?? root.sourceItemKey,
        threadTitle: root.text?.slice(0, 80),
        replyCount: replies.length,
        lastReplyAt: sorted[sorted.length - 1]?.sentAt,
        isPartial: !root.rootItemKey
      },
      items: sorted
    };
  });
}
