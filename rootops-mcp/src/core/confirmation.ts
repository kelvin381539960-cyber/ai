import type { RiskLevel, ToolCallContext } from '../types.js';

export interface ConfirmationItem {
  toolName: string;
  risk: RiskLevel;
  reason: string;
  argsPreview: string;
}

export interface ConfirmationBatch {
  id: string;
  createdAt: string;
  items: ConfirmationItem[];
  summary: string;
}

export class ConfirmationQueue {
  private readonly batches = new Map<string, ConfirmationBatch>();

  create(ctx: ToolCallContext, reason: string): ConfirmationBatch {
    const id = `confirm_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
    const item: ConfirmationItem = {
      toolName: ctx.toolName,
      risk: ctx.risk,
      reason,
      argsPreview: safePreview(ctx.args)
    };
    const batch: ConfirmationBatch = {
      id,
      createdAt: new Date().toISOString(),
      items: [item],
      summary: `${ctx.toolName} requires confirmation (${ctx.risk})`
    };
    this.batches.set(id, batch);
    return batch;
  }

  list(): ConfirmationBatch[] {
    return [...this.batches.values()];
  }

  clear(id: string): { ok: boolean; id: string } {
    return { ok: this.batches.delete(id), id };
  }
}

function safePreview(value: unknown): string {
  const text = JSON.stringify(value, null, 2) ?? '';
  return text.length > 2000 ? `${text.slice(0, 2000)}...` : text;
}
