import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const knowledgeItems = sqliteTable("knowledge_items", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").notNull().default("[]"),
  sourceRunId: text("source_run_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projectSources = sqliteTable("project_sources", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  rootPath: text("root_path").notNull().default(""),
  includePatterns: text("include_patterns").notNull().default("[]"),
  excludePatterns: text("exclude_patterns").notNull().default("[]"),
  readonly: integer("readonly", { mode: "boolean" }).notNull().default(true),
  status: text("status").notNull().default("pending"),
  fileCount: integer("file_count").notNull().default(0),
  lastIndexedAt: text("last_indexed_at"),
  errorMessage: text("error_message").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sourceFiles = sqliteTable("source_files", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  path: text("path").notNull(),
  language: text("language").notNull().default("text"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  mtimeMs: integer("mtime_ms").notNull().default(0),
  hash: text("hash").notNull().default(""),
  summary: text("summary").notNull().default(""),
  riskLevel: text("risk_level").notNull().default("normal"),
  indexedAt: text("indexed_at").notNull(),
});

export const rules = sqliteTable("rules", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workflows = sqliteTable("workflows", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  scenario: text("scenario").notNull(),
  description: text("description").notNull().default(""),
  definition: text("definition").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  agentKey: text("agent_key").notNull(),
  command: text("command").notNull().default(""),
  capabilities: text("capabilities").notNull().default("[]"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  timeoutSeconds: integer("timeout_seconds").notNull().default(300),
  healthStatus: text("health_status").notNull().default("unknown"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  workflowId: text("workflow_id"),
  agentId: text("agent_id"),
  title: text("title").notNull(),
  status: text("status").notNull(),
  goal: text("goal").notNull().default(""),
  contextSnapshot: text("context_snapshot").notNull().default(""),
  prompt: text("prompt").notNull().default(""),
  stdout: text("stdout").notNull().default(""),
  stderr: text("stderr").notNull().default(""),
  finalText: text("final_text").notNull().default(""),
  errorMessage: text("error_message").notNull().default(""),
  events: text("events").notNull().default("[]"),
  outputId: text("output_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workflowRuns = sqliteTable("workflow_runs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  workflowId: text("workflow_id").notNull(),
  agentId: text("agent_id"),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  background: text("background").notNull().default(""),
  expectedOutput: text("expected_output").notNull().default(""),
  constraints: text("constraints").notNull().default(""),
  status: text("status").notNull(),
  currentStepId: text("current_step_id"),
  selectedKnowledgeIds: text("selected_knowledge_ids").notNull().default("[]"),
  selectedRuleIds: text("selected_rule_ids").notNull().default("[]"),
  selectedFileRefs: text("selected_file_refs").notNull().default("[]"),
  workspacePath: text("workspace_path").notNull().default(""),
  temporaryRules: text("temporary_rules").notNull().default(""),
  contextSnapshot: text("context_snapshot").notNull().default(""),
  prompt: text("prompt").notNull().default(""),
  outputId: text("output_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workflowStepRuns = sqliteTable("workflow_step_runs", {
  id: text("id").primaryKey(),
  workflowRunId: text("workflow_run_id").notNull(),
  stepId: text("step_id").notNull(),
  stepType: text("step_type").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  input: text("input").notNull().default(""),
  output: text("output").notNull().default(""),
  error: text("error").notNull().default(""),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const agentHealthChecks = sqliteTable("agent_health_checks", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  commandExists: integer("command_exists", { mode: "boolean" }).notNull().default(false),
  harnessDetected: integer("harness_detected", { mode: "boolean" }).notNull().default(false),
  canRunPrompt: integer("can_run_prompt", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull(),
  message: text("message").notNull().default(""),
  checkedAt: text("checked_at").notNull(),
});

export const outputs = sqliteTable("outputs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  runId: text("run_id"),
  parentId: text("parent_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  isFinal: integer("is_final", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
