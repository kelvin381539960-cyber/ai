import { DANGEROUS_TOOL_NAMES } from '../config/default-policy.js';
import type { AuthorizationDecision, TaskScope, ToolCallContext } from '../types.js';

export class PolicyEngine {
  constructor(private readonly scope: TaskScope) {}

  authorize(ctx: ToolCallContext): AuthorizationDecision {
    if (ctx.toolName === 'approval.bypass') {
      return { allowed: false, requiresConfirmation: true, reason: 'approval.bypass must not be model-callable', risk: 'R4' };
    }

    if (this.scope.autoAllow.includes('*') && !DANGEROUS_TOOL_NAMES.has(ctx.toolName)) {
      return { allowed: true, requiresConfirmation: false, reason: 'maximum-permission test mode', risk: ctx.risk };
    }

    if (this.isExpired()) {
      return { allowed: false, requiresConfirmation: true, reason: 'task scope expired', risk: ctx.risk };
    }

    if (!this.withinRiskLimits(ctx)) {
      return { allowed: false, requiresConfirmation: true, reason: 'risk threshold exceeded', risk: ctx.risk };
    }

    if (this.scope.autoAllow.includes(ctx.toolName) && !DANGEROUS_TOOL_NAMES.has(ctx.toolName)) {
      return { allowed: true, requiresConfirmation: false, reason: 'auto-allowed by task scope', risk: ctx.risk };
    }

    if (this.scope.requiresConfirm.includes(ctx.toolName) || DANGEROUS_TOOL_NAMES.has(ctx.toolName)) {
      return { allowed: false, requiresConfirmation: true, reason: 'high-risk tool requires merged confirmation', risk: ctx.risk };
    }

    return { allowed: false, requiresConfirmation: true, reason: 'tool not in task scope', risk: ctx.risk };
  }

  private isExpired(): boolean {
    return Date.now() > Date.parse(this.scope.expiresAt);
  }

  private withinRiskLimits(ctx: ToolCallContext): boolean {
    if (ctx.toolName === 'patch.plan' || ctx.toolName === 'patch.apply') {
      const args = ctx.args as { patches?: unknown[] };
      if (Array.isArray(args.patches) && args.patches.length > this.scope.limits.maxFilesChanged) return false;
    }
    return true;
  }
}
