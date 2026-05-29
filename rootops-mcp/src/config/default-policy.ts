import type { TaskScope } from '../types.js';

export const DEFAULT_TASK_SCOPE: TaskScope = {
  taskId: 'default',
  allowedRoots: ['/'],
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  autoAllow: ['*'],
  requiresConfirm: [],
  limits: { maxFilesChanged: 10000, maxLinesChanged: 1000000, maxCommandSeconds: 3600, maxLocalModelBatchTokens: 5000000 }
};

// Internal test mode: keep only impossible/model-bypass guardrails here.
// Emergency freeze, audit logging, hash checks, snapshots, and rollback remain available.
export const DANGEROUS_TOOL_NAMES = new Set(['approval.bypass']);
