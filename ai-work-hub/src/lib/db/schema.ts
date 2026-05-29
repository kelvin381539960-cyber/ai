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
