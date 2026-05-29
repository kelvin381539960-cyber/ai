import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { outputs, runs } from "@/lib/db/schema";
import { newId, nowIso } from "@/lib/id";
import { runAgent } from "@/lib/runtime/adapter";
import { getDefaultProject, getWorkflow, listAgents, listKnowledge, listRules, parseJson } from "@/lib/services/app-service";
import type { WorkflowDefinition } from "@/lib/types";

export async function buildContextSnapshot(goal: string) {
  const [knowledge, rules] = await Promise.all([listKnowledge(), listRules()]);
  const knowledgeBlock = knowledge
    .slice(0, 8)
    .map((item) => `## ${item.title}\n类型：${item.type}\n${item.content}`)
    .join("\n\n");
  const rulesBlock = rules
    .filter((rule) => rule.enabled)
    .map((rule) => `- ${rule.name}: ${rule.content}`)
    .join("\n");

  return `# Task Goal\n${goal}\n\n# Project Knowledge\n${knowledgeBlock || "暂无项目知识。"}\n\n# Rules\n${rulesBlock || "暂无规则。"}`;
}

export async function runWorkflow(input: {
  workflowId: string;
  goal: string;
  agentId?: string;
}) {
  const project = await getDefaultProject();
  const workflow = await getWorkflow(input.workflowId);
  if (!workflow) throw new Error("Workflow not found");
  const agents = await listAgents();
  const agent =
    (input.agentId ? agents.find((item) => item.id === input.agentId) : undefined) ??
    agents.find((item) => item.id === "agent_manual") ??
    agents[0];
  if (!agent) throw new Error("No agent available");

  const runId = newId("run");
  const outputId = newId("out");
  const now = nowIso();
  const contextSnapshot = await buildContextSnapshot(input.goal);
  const definition = parseJson<WorkflowDefinition>(workflow.definition, { nodes: [], edges: [] });
  const prompt = buildPrompt(workflow.name, input.goal, contextSnapshot);

  await db.insert(runs).values({
    id: runId,
    projectId: project.id,
    workflowId: workflow.id,
    agentId: agent.id,
    title: `${workflow.name}: ${input.goal.slice(0, 42)}`,
    status: "running",
    goal: input.goal,
    contextSnapshot,
    prompt,
    stdout: "",
    stderr: "",
    finalText: "",
    errorMessage: "",
    events: JSON.stringify([
      { time: now, type: "workflow_started", message: `${definition.nodes.length} steps queued` },
    ]),
    outputId,
    createdAt: now,
    updatedAt: now,
  });

  const result = await runAgent(
    {
      runId,
      projectId: project.id,
      workflowId: workflow.id,
      agentId: agent.id,
      prompt,
      contextSnapshot,
      timeoutSeconds: agent.timeoutSeconds,
    },
    agent,
  );

  const finalText =
    result.finalText ||
    `# ${workflow.name}\n\n当前 Agent 没有返回正文。\n\n## Prompt\n\n${prompt}`;
  const status = result.status === "waiting_user" ? "waiting_user" : result.status;

  await db.insert(outputs).values({
    id: outputId,
    projectId: project.id,
    runId,
    parentId: null,
    title: workflow.name,
    content:
      result.status === "waiting_user"
        ? `# 待外部 AI 执行\n\n请复制以下 Prompt 到外部 AI，之后可把结果保存为新版本。\n\n\`\`\`md\n${prompt}\n\`\`\``
        : finalText,
    version: 1,
    isFinal: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  await db
    .update(runs)
    .set({
      status,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      finalText,
      errorMessage: result.errorMessage ?? "",
      events: JSON.stringify([
        { time: now, type: "workflow_started", message: `${definition.nodes.length} steps queued` },
        { time: nowIso(), type: "agent_completed", message: status },
      ]),
      updatedAt: nowIso(),
    })
    .where(eq(runs.id, runId));

  return runId;
}

export async function cancelRun(id: string) {
  await db.update(runs).set({ status: "cancelled", updatedAt: nowIso() }).where(eq(runs.id, id));
}

export async function retryRun(id: string) {
  const [run] = await db.select().from(runs).where(eq(runs.id, id)).limit(1);
  if (!run?.workflowId) throw new Error("Only workflow runs can be retried");
  return runWorkflow({ workflowId: run.workflowId, goal: run.goal, agentId: run.agentId ?? undefined });
}

export async function saveOutputVersion(outputId: string, content: string) {
  const [output] = await db.select().from(outputs).where(eq(outputs.id, outputId)).limit(1);
  if (!output) throw new Error("Output not found");
  const now = nowIso();
  const id = newId("out");
  await db.insert(outputs).values({
    id,
    projectId: output.projectId,
    runId: output.runId,
    parentId: output.parentId ?? output.id,
    title: output.title,
    content,
    version: output.version + 1,
    isFinal: false,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function markOutputFinal(outputId: string) {
  const [output] = await db.select().from(outputs).where(eq(outputs.id, outputId)).limit(1);
  if (!output) throw new Error("Output not found");
  const familyId = output.parentId ?? output.id;
  await db
    .update(outputs)
    .set({ isFinal: false, updatedAt: nowIso() })
    .where(eq(outputs.parentId, familyId));
  await db.update(outputs).set({ isFinal: true, updatedAt: nowIso() }).where(eq(outputs.id, outputId));
}

export async function outputToKnowledge(outputId: string) {
  const [output] = await db.select().from(outputs).where(eq(outputs.id, outputId)).limit(1);
  if (!output) throw new Error("Output not found");
  const { createKnowledge } = await import("@/lib/services/app-service");
  return createKnowledge({
    title: output.title,
    content: output.content,
    type: "output",
    tags: ["output", output.isFinal ? "final" : "draft"],
    sourceRunId: output.runId ?? undefined,
  });
}

function buildPrompt(workflowName: string, goal: string, contextSnapshot: string) {
  return `你是一个产品/运营智能工作台中的执行 Agent。\n\n请基于 Workflow「${workflowName}」完成任务。\n\n${contextSnapshot}\n\n# Output Requirement\n请输出 Markdown。内容要可直接进入 Output Library 编辑和版本化。`;
}
