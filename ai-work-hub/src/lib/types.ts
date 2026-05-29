export type KnowledgeType =
  | "background"
  | "prd"
  | "rule"
  | "research"
  | "decision"
  | "output"
  | "note";

export type RuleType = "output" | "workflow" | "project" | "quality";

export type AgentType = "harness" | "direct_cli" | "manual";

export type RunStatus =
  | "pending"
  | "running"
  | "waiting_user"
  | "success"
  | "failed"
  | "cancelled"
  | "timeout";

export type WorkflowStepType =
  | "input"
  | "collect_context"
  | "apply_rules"
  | "select_agent"
  | "run_agent"
  | "review_output"
  | "save_output"
  | "update_knowledge";

export type WorkflowStep = {
  id: string;
  type: WorkflowStepType;
  title: string;
  description: string;
  config?: Record<string, string>;
};

export type WorkflowDefinition = {
  nodes: Array<{
    id: string;
    type: WorkflowStepType;
    title: string;
    description: string;
    x: number;
    y: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
};

export type AgentExecutionRequest = {
  runId: string;
  projectId: string;
  workflowId?: string;
  stepId?: string;
  agentId: string;
  workspacePath?: string;
  prompt: string;
  contextSnapshot: string;
  timeoutSeconds: number;
};

export type AgentExecutionResult = {
  runId: string;
  agentId: string;
  status: "success" | "failed" | "cancelled" | "timeout" | "waiting_user";
  stdout?: string;
  stderr?: string;
  finalText?: string;
  errorMessage?: string;
};
