import { randomUUID } from 'node:crypto';
import { mkdir, appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { AuditEvent, AuthorizationDecision, RiskLevel } from '../types.js';

export interface AuditLogOptions {
  auditDir?: string;
  persist?: boolean;
}

export class AuditLog {
  private readonly events: AuditEvent[] = [];
  private readonly auditDir: string;
  private readonly persist: boolean;

  constructor(options: AuditLogOptions = {}) {
    this.auditDir = options.auditDir ?? process.env.ROOTOPS_AUDIT_DIR ?? '.var/audit';
    this.persist = options.persist ?? process.env.ROOTOPS_AUDIT_PERSIST !== 'false';
  }

  async init(): Promise<void> {
    if (!this.persist) return;
    await mkdir(this.auditDir, { recursive: true });
  }

  async record(input: {
    taskId: string;
    actor: string;
    toolName: string;
    risk: RiskLevel;
    decision: AuthorizationDecision;
    args: unknown;
  }): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      taskId: input.taskId,
      actor: input.actor,
      toolName: input.toolName,
      risk: input.risk,
      decision: input.decision,
      argsPreview: safePreview(input.args)
    };
    this.events.push(event);

    if (this.persist) {
      await mkdir(this.auditDir, { recursive: true });
      await appendFile(this.auditFilePath(event.timestamp), `${JSON.stringify(event)}\n`, 'utf8');
    }

    return event;
  }

  list(): AuditEvent[] {
    return [...this.events];
  }

  async listFromDisk(date = new Date().toISOString().slice(0, 10)): Promise<AuditEvent[]> {
    const file = path.join(this.auditDir, `${date}.jsonl`);
    const text = await readFile(file, 'utf8').catch(() => '');
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditEvent);
  }

  private auditFilePath(timestamp: string): string {
    const day = timestamp.slice(0, 10);
    return path.join(this.auditDir, `${day}.jsonl`);
  }
}

function safePreview(value: unknown): string {
  const json = JSON.stringify(value, null, 2) ?? '';
  return json.length > 2000 ? `${json.slice(0, 2000)}...` : json;
}
