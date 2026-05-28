import { randomUUID } from 'node:crypto';
import type { AuditEvent, AuthorizationDecision, RiskLevel } from '../types.js';

export class AuditLog {
  private readonly events: AuditEvent[] = [];

  record(input: {
    taskId: string;
    actor: string;
    toolName: string;
    risk: RiskLevel;
    decision: AuthorizationDecision;
    args: unknown;
  }): AuditEvent {
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
    return event;
  }

  list(): AuditEvent[] {
    return [...this.events];
  }
}

function safePreview(value: unknown): string {
  const json = JSON.stringify(value, null, 2) ?? '';
  return json.length > 2000 ? `${json.slice(0, 2000)}...` : json;
}
