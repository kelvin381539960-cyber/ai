export type RiskLevel = 'R0' | 'R1' | 'R2' | 'R3' | 'R4';

export type ToolProfile =
  | 'read_only'
  | 'code_edit'
  | 'server_ops'
  | 'deploy'
  | 'database'
  | 'emergency'
  | 'admin'
  | 'local_intelligence';

export interface TaskScope {
  taskId: string;
  allowedRoots: string[];
  expiresAt: string;
  autoAllow: string[];
  requiresConfirm: string[];
  limits: {
    maxFilesChanged: number;
    maxLinesChanged: number;
    maxCommandSeconds: number;
    maxLocalModelBatchTokens: number;
  };
}

export interface ToolCallContext {
  taskId: string;
  actor: string;
  toolName: string;
  profile: ToolProfile;
  args: unknown;
  risk: RiskLevel;
}

export interface AuthorizationDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason: string;
  risk: RiskLevel;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  taskId: string;
  actor: string;
  toolName: string;
  risk: RiskLevel;
  decision: AuthorizationDecision;
  argsPreview: string;
}

export interface LocalRerankCandidate {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface LocalRerankResult extends LocalRerankCandidate {
  score: number;
}

export interface PatchOperation {
  path: string;
  expectedHash: string;
  oldText: string;
  newText: string;
  risk: RiskLevel;
  dryRunRequired: boolean;
  autoSnapshot: boolean;
}
