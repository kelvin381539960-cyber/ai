import { cookies } from "next/headers";
import { and, desc, eq, like, or, inArray } from "drizzle-orm";
import { db, initDb } from "@/lib/db/client";
import {
  agents,
  knowledgeItems,
  outputs,
  projectSources,
  projects,
  rules,
  runs,
  workflows,
} from "@/lib/db/schema";
import { newId, nowIso } from "@/lib/id";
import { defaultRules } from "@/lib/templates/rules";
import { buildLinearDefinition, workflowTemplates } from "@/lib/templates/workflows";
import type { AgentType, KnowledgeType, RuleType, WorkflowDefinition } from "@/lib/types";

const activeProjectCookie = "ai_work_hub_project_id";

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function ensureAppReady() {
  await initDb();
  const existingProjects = await db.select().from(projects).limit(1);
  if (existingProjects.length === 0) {
    const now = nowIso();
    await db.insert(projects).values({
      id: "project_default",
      name: "Default Project",
      description: "用于沉淀 PRD、调研、方案和复盘的默认项目空间。",
      createdAt: now,
      updatedAt: now,
    });
  }

  const projectId = "project_default";
  const existingRules = await db.select().from(rules).limit(1);
  if (existingRules.length === 0) {
    const now = nowIso();
    await db.insert(rules).values(
      defaultRules.map((rule) => ({
        ...rule,
        projectId,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  const existingWorkflows = await db.select().from(workflows).limit(1);
  if (existingWorkflows.length === 0) {
    const now = nowIso();
    await db.insert(workflows).values(
      workflowTemplates.map((template) => ({
        id: `workflow_${template.id}`,
        projectId,
        name: template.name,
        scenario: template.scenario,
        description: template.description,
        definition: JSON.stringify(buildLinearDefinition(template)),
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  const existingAgents = await db.select().from(agents).limit(1);
  if (existingAgents.length === 0) {
    const now = nowIso();
    await db.insert(agents).values([
      {
        id: "agent_manual",
        name: "Manual Agent",
        type: "manual",
        agentKey: "manual",
        command: "",
        capabilities: JSON.stringify(["prd", "research", "proposal", "review"]),
        enabled: true,
        timeoutSeconds: 300,
        healthStatus: "ready",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "agent_cursor",
        name: "Cursor Agent",
        type: "harness",
        agentKey: "cursor",
        command: "harness",
        capabilities: JSON.stringify(["code", "project", "prd", "research"]),
        enabled: true,
        timeoutSeconds: 900,
        healthStatus: "unknown",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "agent_codex",
        name: "Codex Agent",
        type: "harness",
        agentKey: "codex",
        command: "harness",
        capabilities: JSON.stringify(["code", "review", "analysis", "proposal"]),
        enabled: true,
        timeoutSeconds: 900,
        healthStatus: "unknown",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "agent_claude",
        name: "Claude Agent",
        type: "harness",
        agentKey: "claude",
        command: "harness",
        capabilities: JSON.stringify(["analysis", "writing", "prd", "research"]),
        enabled: true,
        timeoutSeconds: 900,
        healthStatus: "unknown",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
}

async function seedProjectDefaults(projectId: string) {
  const now = nowIso();
  await db.insert(rules).values(
    defaultRules.map((rule) => ({
      ...rule,
      id: newId("rule"),
      projectId,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    })),
  );
  await db.insert(workflows).values(
    workflowTemplates.map((template) => ({
      id: newId("workflow"),
      projectId,
      name: template.name,
      scenario: template.scenario,
      description: template.description,
      definition: JSON.stringify(buildLinearDefinition(template)),
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function listProjects() {
  await ensureAppReady();
  return db.select().from(projects).orderBy(desc(projects.updatedAt));
}

export async function getActiveProject() {
  await ensureAppReady();
  const cookieStore = await cookies();
  const activeId = cookieStore.get(activeProjectCookie)?.value;
  if (activeId) {
    const [active] = await db.select().from(projects).where(eq(projects.id, activeId)).limit(1);
    if (active) return active;
  }
  const [project] = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(1);
  return project;
}

export async function getDefaultProject() {
  return getActiveProject();
}

export async function createProject(input: { name: string; description: string }) {
  await ensureAppReady();
  const now = nowIso();
  const id = newId("project");
  await db.insert(projects).values({
    id,
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  });
  await seedProjectDefaults(id);
  return id;
}

export async function updateProject(id: string, input: { name: string; description: string }) {
  await ensureAppReady();
  await db.update(projects).set({ name: input.name, description: input.description, updatedAt: nowIso() }).where(eq(projects.id, id));
}

export async function deleteProject(id: string) {
  await ensureAppReady();
  const projectList = await db.select().from(projects);
  if (projectList.length <= 1) throw new Error("At least one project is required.");
  await db.delete(projects).where(eq(projects.id, id));
}

export async function setActiveProject(id: string) {
  await ensureAppReady();
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) throw new Error("Project not found");
  const cookieStore = await cookies();
  cookieStore.set(activeProjectCookie, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getDashboard() {
  const project = await getActiveProject();
  const [knowledge, workflowList, agentList, runList, outputList, ruleList, sourceList] =
    await Promise.all([
      db.select().from(knowledgeItems).where(eq(knowledgeItems.projectId, project.id)).orderBy(desc(knowledgeItems.updatedAt)).limit(5),
      db.select().from(workflows).where(eq(workflows.projectId, project.id)).orderBy(desc(workflows.updatedAt)),
      db.select().from(agents).orderBy(desc(agents.updatedAt)),
      db.select().from(runs).where(eq(runs.projectId, project.id)).orderBy(desc(runs.createdAt)).limit(5),
      db.select().from(outputs).where(eq(outputs.projectId, project.id)).orderBy(desc(outputs.updatedAt)).limit(5),
      db.select().from(rules).where(and(eq(rules.projectId, project.id), eq(rules.enabled, true))),
      db.select().from(projectSources).where(eq(projectSources.projectId, project.id)).orderBy(desc(projectSources.updatedAt)).limit(5),
    ]);
  return { project, knowledge, workflows: workflowList, agents: agentList, runs: runList, outputs: outputList, rules: ruleList, sources: sourceList };
}

export async function createKnowledge(input: {
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
  sourceRunId?: string;
}) {
  const project = await getDefaultProject();
  const now = nowIso();
  const id = newId("kn");
  await db.insert(knowledgeItems).values({
    id,
    projectId: project.id,
    type: input.type,
    title: input.title,
    content: input.content,
    tags: JSON.stringify(input.tags),
    sourceRunId: input.sourceRunId,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateKnowledge(id: string, input: {
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
}) {
  const project = await getActiveProject();
  await db
    .update(knowledgeItems)
    .set({
      title: input.title,
      content: input.content,
      type: input.type,
      tags: JSON.stringify(input.tags),
      updatedAt: nowIso(),
    })
    .where(and(eq(knowledgeItems.id, id), eq(knowledgeItems.projectId, project.id)));
}

export async function deleteKnowledge(id: string) {
  const project = await getActiveProject();
  await db.delete(knowledgeItems).where(and(eq(knowledgeItems.id, id), eq(knowledgeItems.projectId, project.id)));
}

export async function listKnowledge(query?: string) {
  const project = await getActiveProject();
  if (!query) {
    return db.select().from(knowledgeItems).where(eq(knowledgeItems.projectId, project.id)).orderBy(desc(knowledgeItems.updatedAt));
  }
  const pattern = `%${query}%`;
  return db
    .select()
    .from(knowledgeItems)
    .where(
      and(
        eq(knowledgeItems.projectId, project.id),
        or(
          like(knowledgeItems.title, pattern),
          like(knowledgeItems.content, pattern),
          like(knowledgeItems.tags, pattern),
        ),
      ),
    )
    .orderBy(desc(knowledgeItems.updatedAt));
}

export async function createRule(input: { name: string; content: string; type: RuleType }) {
  const project = await getDefaultProject();
  const now = nowIso();
  const id = newId("rule");
  await db.insert(rules).values({
    id,
    projectId: project.id,
    type: input.type,
    name: input.name,
    content: input.content,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateRule(id: string, input: { name: string; content: string; type: RuleType }) {
  const project = await getActiveProject();
  await db
    .update(rules)
    .set({ name: input.name, content: input.content, type: input.type, updatedAt: nowIso() })
    .where(and(eq(rules.id, id), eq(rules.projectId, project.id)));
}

export async function toggleRule(id: string, enabled: boolean) {
  const project = await getActiveProject();
  await db.update(rules).set({ enabled, updatedAt: nowIso() }).where(and(eq(rules.id, id), eq(rules.projectId, project.id)));
}

export async function deleteRule(id: string) {
  const project = await getActiveProject();
  await db.delete(rules).where(and(eq(rules.id, id), eq(rules.projectId, project.id)));
}

export async function listRules() {
  const project = await getActiveProject();
  return db.select().from(rules).where(eq(rules.projectId, project.id)).orderBy(desc(rules.updatedAt));
}

export async function listWorkflows() {
  const project = await getActiveProject();
  return db.select().from(workflows).where(eq(workflows.projectId, project.id)).orderBy(desc(workflows.updatedAt));
}

export async function getWorkflow(id: string) {
  await ensureAppReady();
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return workflow;
}

export async function createWorkflowFromTemplate(templateId: string) {
  const template = workflowTemplates.find((item) => item.id === templateId);
  if (!template) throw new Error("Workflow template not found");
  const project = await getDefaultProject();
  const now = nowIso();
  const id = newId("workflow");
  await db.insert(workflows).values({
    id,
    projectId: project.id,
    name: template.name,
    scenario: template.scenario,
    description: template.description,
    definition: JSON.stringify(buildLinearDefinition(template)),
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateWorkflowDefinition(id: string, definition: WorkflowDefinition) {
  await ensureAppReady();
  await db.update(workflows).set({ definition: JSON.stringify(definition), updatedAt: nowIso() }).where(eq(workflows.id, id));
}

export async function updateWorkflowMeta(id: string, input: { name: string; scenario: string; description: string }) {
  const project = await getActiveProject();
  await db
    .update(workflows)
    .set({ name: input.name, scenario: input.scenario, description: input.description, updatedAt: nowIso() })
    .where(and(eq(workflows.id, id), eq(workflows.projectId, project.id)));
}

export async function duplicateWorkflow(id: string) {
  const workflow = await getWorkflow(id);
  if (!workflow) throw new Error("Workflow not found");
  const now = nowIso();
  const copyId = newId("workflow");
  await db.insert(workflows).values({
    id: copyId,
    projectId: workflow.projectId,
    name: `${workflow.name} Copy`,
    scenario: workflow.scenario,
    description: workflow.description,
    definition: workflow.definition,
    createdAt: now,
    updatedAt: now,
  });
  return copyId;
}

export async function deleteWorkflow(id: string) {
  const project = await getActiveProject();
  if (id.startsWith("workflow_")) throw new Error("Default workflows cannot be deleted. Duplicate it first.");
  await db.delete(workflows).where(and(eq(workflows.id, id), eq(workflows.projectId, project.id)));
}

export async function listAgents() {
  await ensureAppReady();
  return db.select().from(agents).orderBy(desc(agents.updatedAt));
}

export async function getAgent(id: string) {
  await ensureAppReady();
  const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return agent;
}

export async function createAgent(input: {
  name: string;
  type: AgentType;
  agentKey: string;
  command: string;
  capabilities: string[];
}) {
  const now = nowIso();
  const id = newId("agent");
  await ensureAppReady();
  await db.insert(agents).values({
    id,
    name: input.name,
    type: input.type,
    agentKey: input.agentKey,
    command: input.command,
    capabilities: JSON.stringify(input.capabilities),
    enabled: true,
    timeoutSeconds: 300,
    healthStatus: "unknown",
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateAgent(id: string, input: {
  name: string;
  type: AgentType;
  agentKey: string;
  command: string;
  capabilities: string[];
  timeoutSeconds: number;
}) {
  await ensureAppReady();
  await db
    .update(agents)
    .set({
      name: input.name,
      type: input.type,
      agentKey: input.agentKey,
      command: input.command,
      capabilities: JSON.stringify(input.capabilities),
      timeoutSeconds: input.timeoutSeconds,
      updatedAt: nowIso(),
    })
    .where(eq(agents.id, id));
}

export async function toggleAgent(id: string, enabled: boolean) {
  await ensureAppReady();
  await db.update(agents).set({ enabled, updatedAt: nowIso() }).where(eq(agents.id, id));
}

export async function deleteAgent(id: string) {
  await ensureAppReady();
  if (id.startsWith("agent_")) throw new Error("Default agents cannot be deleted. Disable them instead.");
  await db.delete(agents).where(eq(agents.id, id));
}

export async function updateAgentHealth(id: string, status: string) {
  await ensureAppReady();
  await db.update(agents).set({ healthStatus: status, updatedAt: nowIso() }).where(eq(agents.id, id));
}

export async function listRuns() {
  const project = await getActiveProject();
  return db.select().from(runs).where(eq(runs.projectId, project.id)).orderBy(desc(runs.createdAt));
}

export async function getRun(id: string) {
  await ensureAppReady();
  const [run] = await db.select().from(runs).where(eq(runs.id, id)).limit(1);
  return run;
}

export async function listOutputs() {
  const project = await getActiveProject();
  return db.select().from(outputs).where(eq(outputs.projectId, project.id)).orderBy(desc(outputs.updatedAt));
}

export async function getOutput(id: string) {
  await ensureAppReady();
  const [output] = await db.select().from(outputs).where(eq(outputs.id, id)).limit(1);
  return output;
}

export async function getOutputFamily(id: string) {
  const output = await getOutput(id);
  if (!output) return { output: null, versions: [] };
  const rootId = output.parentId ?? output.id;
  const versions = await db
    .select()
    .from(outputs)
    .where(or(eq(outputs.id, rootId), eq(outputs.parentId, rootId), inArray(outputs.id, [output.id])))
    .orderBy(desc(outputs.version));
  return { output, versions };
}
