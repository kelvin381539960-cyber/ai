import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import type { RiskLevel, ToolCallContext } from '../types.js';
import { JsonStore } from './json-store.js';

export interface ConfirmationItem {
  toolName: string;
  risk: RiskLevel;
  reason: string;
  argsPreview: string;
  argsHash: string;
}

export interface ConfirmationBatch {
  id: string;
  createdAt: string;
  items: ConfirmationItem[];
  summary: string;
  approvedTokenHash?: string;
  approvedAt?: string;
  usedAt?: string;
  expiresAt?: string;
}

interface ConfirmationState {
  batches: ConfirmationBatch[];
}

export class ConfirmationQueue {
  private readonly batches = new Map<string, ConfirmationBatch>();
  private readonly store: JsonStore<ConfirmationState>;

  constructor(storeDir = process.env.ROOTOPS_STATE_DIR ?? '.var/state') {
    this.store = new JsonStore<ConfirmationState>(path.join(storeDir, 'confirmations.json'), { batches: [] });
  }

  async init(): Promise<void> {
    const state = await this.store.read();
    this.batches.clear();
    for (const batch of state.batches) this.batches.set(batch.id, batch);
    await this.persist();
  }

  async create(ctx: ToolCallContext, reason: string): Promise<ConfirmationBatch> {
    const argsHash = hashArgs(ctx.args);
    const existing = [...this.batches.values()].find((batch) => {
      const item = batch.items[0];
      return !batch.usedAt && item?.toolName === ctx.toolName && item.argsHash === argsHash;
    });
    if (existing) return existing;

    const id = `confirm_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const item: ConfirmationItem = {
      toolName: ctx.toolName,
      risk: ctx.risk,
      reason,
      argsPreview: safePreview(ctx.args),
      argsHash
    };
    const batch: ConfirmationBatch = {
      id,
      createdAt: new Date().toISOString(),
      items: [item],
      summary: `${ctx.toolName} requires confirmation (${ctx.risk})`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
    this.batches.set(id, batch);
    await this.persist();
    return batch;
  }

  list(): ConfirmationBatch[] {
    return [...this.batches.values()];
  }

  async clear(id: string): Promise<{ ok: boolean; id: string }> {
    const ok = this.batches.delete(id);
    await this.persist();
    return { ok, id };
  }

  async approve(id: string, ttlMinutes = 10): Promise<{ confirmation: ConfirmationBatch; approvalToken: string }> {
    const batch = this.batches.get(id);
    if (!batch) throw new Error(`confirmation not found: ${id}`);
    if (batch.usedAt) throw new Error(`confirmation already used: ${id}`);
    const approvalToken = `appr_${randomUUID().replace(/-/g, '')}`;
    batch.approvedTokenHash = hashToken(approvalToken);
    batch.approvedAt = new Date().toISOString();
    batch.expiresAt = new Date(Date.now() + Math.max(1, ttlMinutes) * 60 * 1000).toISOString();
    await this.persist();
    return { confirmation: batch, approvalToken };
  }

  async consume(toolName: string, args: unknown, token?: string): Promise<boolean> {
    if (!token) return false;
    const tokenHash = hashToken(token);
    const argsHash = hashArgs(stripApprovalToken(args));
    const now = Date.now();
    const batch = [...this.batches.values()].find((candidate) => {
      const item = candidate.items[0];
      return Boolean(candidate.approvedTokenHash === tokenHash && !candidate.usedAt && item?.toolName === toolName && item.argsHash === argsHash && (!candidate.expiresAt || Date.parse(candidate.expiresAt) > now));
    });
    if (!batch) return false;
    batch.usedAt = new Date().toISOString();
    await this.persist();
    return true;
  }

  private async persist(): Promise<void> {
    await this.store.write({ batches: this.list() });
  }
}

export function stripApprovalToken(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const copy = { ...(value as Record<string, unknown>) };
  delete copy.approval_token;
  return copy;
}

function safePreview(value: unknown): string {
  const text = JSON.stringify(stripApprovalToken(value), null, 2) ?? '';
  return text.length > 2000 ? `${text.slice(0, 2000)}...` : text;
}

function hashArgs(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(sortKeys(stripApprovalToken(value)))).digest('hex');
}

function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => [key, sortKeys(val)]));
  }
  return value;
}
