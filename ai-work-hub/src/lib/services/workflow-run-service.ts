import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  agents,
  knowledgeItems,
  outputs,
  rules,
  workflowRuns,
  workflowStepRuns,
  workflows,
} from "@/lib/db/schema";
import { newId, nowIso } from "@/lib/id";
import { runAgent } from "@/lib/runtime/adapter";
import { resolveFileReferences } from "@/lib/services/context-source-service";
import { getDefaultProject, parseJson } from "@/lib/services/app-service";
import type { WorkflowFileReference, WorkflowRunInput } from "@/lib/types";

const runtimeSteps = [
  { stepId: "input", stepType: "input", title: "确认目标" },
  { stepId: "select_knowledge", stepType: "select_knowledge", title: "选择资料" },
  { stepId: "select_rules", stepType: "select_rules", title: "选择规则" },
  { stepId: "build_context", stepType: "build_context", title: "构建上下文" },
  { stepId: "select_agent", stepType: "select_agent", title: "确认 Agent" },
  { stepId: "run_agent", stepType: "run_agent", title: "执行 Agent" },
  { stepId: "review_output", stepType: "review_output", title: "审阅输出" },
  { stepId: "save_output", stepType: "save_output", title: "保存 Output" },
];

export async function recommendKnowledge(query: string) {
  const project = await getDefaultProject();
  const items = await db
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.projectId, project.id))
    .orderBy(desc(knowledgeItems.updatedAt));
  const terms = query
    .toLowerCase()
    .split(/\s+|，|,|。/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

  return items.map((item) => {
    const text = `${item.title}\n${item.content}\n${item.tags}`.toLowerCase();
    const hits = terms.filter((term) => text.includes(term));
    return {
      ...item,
      score: hits.length + (item.type === "background" ? 1 : 0),
      reason: hits.length > 0 ? `命中：${hits.slice(0, 3).join(", ")}` : "最近或项目背景资料",
    };
  }).sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt));
}

export async function buildContextPreview(input: Omit<WorkflowRunInput, "workflowId" | "agentId">) {
  const project = await getDefaultProject();
  const selectedKnowledge = input.selectedKnowledgeIds.length
    ? await db.select().from(knowledgeItems).where(and(eq(knowledgeItems.projectId, project.id), inArray(knowledgeItems.id, input.selectedKnowledgeIds)))
    : [];
  const selectedRules = input.selectedRuleIds.length
    ? await db.select().from(rules).where(and(eq(rules.projectId, project.id), inArray(rules.id, input.selectedRuleIds)))
    : [];

  const knowledgeBlock = selectedKnowledge
    .map((item, index) => `## K${index + 1}. ${item.title}\n类型：${item.type}\n标签：${parseJson<string[]>(item.tags, []).join(", ") || "无"}\n${item.content}`)
    .join("\n\n");
  const rulesBlock = selectedRules.map((rule, index) => `R${index + 1}. ${rule.name}\n${rule.content}`).join("\n\n");
  const resolvedFiles = await resolveFileReferences(input.selectedFileRefs);
  const fileBlock = resolvedFiles
    .map(({ ref, source, file }, index) => {
      const mode = ref.mode === "full_file" ? "reference_only" : ref.mode;
      return `F${index + 1}. ${source.name}/${file.path}\n引用方式：${mode}\n语言：${file.language}\n大小：${file.sizeBytes} bytes\n摘要：${file.summary || "无摘要"}\n原因：${ref.reason || "用户选择"}`;
    })
    .join("\n\n");

  return `# 任务\n标题：${input.title}\n目标：${input.goal}\n背景：${input.background || "无"}\n预期输出：${input.expectedOutput || "无"}\n限制条件：${input.constraints || "无"}\n工作目录：${input.workspacePath || "未指定"}\n\n# 已选资料\n${knowledgeBlock || "未选择资料。"}\n\n# 已选代码/文件引用\n${fileBlock || "未选择文件引用。"}\n\n# 已选规则\n${rulesBlock || "未选择规则。"}\n\n# 临时规则\n${input.temporaryRules || "无"}`;
}

export async function createWorkflowRun(input: WorkflowRunInput) {
  const project = await getDefaultProject();
  const [workflow] = await db.select().from(workflows).where(and(eq(workflows.id, input.workflowId), eq(workflows.projectId, project.id))).limit(1);
  if (!workflow) throw new Error("Workflow not found");
  const [agent] = await db.select().from(agents).where(eq(agents.id, input.agentId)).limit(1);
  if (!agent) throw new Error("Agent not found");

  const now = nowIso();
  const id = newId("wrun");
  const contextSnapshot = await buildContextPreview(input);
  const prompt = buildExecutionPrompt(workflow.name, contextSnapshot);

  await db.insert(workflowRuns).values({
    id,
    projectId: project.id,
    workflowId: workflow.id,
    agentId: agent.id,
    title: input.title,
    goal: input.goal,
    background: input.background,
    expectedOutput: input.expectedOutput,
    constraints: input.constraints,
    status: "pending",
    currentStepId: "input",
    selectedKnowledgeIds: JSON.stringify(input.selectedKnowledgeIds),
    selectedRuleIds: JSON.stringify(input.selectedRuleIds),
    selectedFileRefs: JSON.stringify(input.selectedFileRefs),
    workspacePath: input.workspacePath,
    temporaryRules: input.temporaryRules,
    contextSnapshot,
    prompt,
    outputId: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(workflowStepRuns).values(
    runtimeSteps.map((step, index) => ({
      id: newId("step"),
      workflowRunId: id,
      stepId: step.stepId,
      stepType: step.stepType,
      title: step.title,
      status: index === 0 ? "pending" : "pending",
      input: "",
      output: "",
      error: "",
      startedAt: null,
      endedAt: null,
      createdAt: now,
      updatedAt: now,
    })),
  );

  return id;
}

export async function startWorkflowRun(id: string) {
  await db.update(workflowRuns).set({ status: "running", updatedAt: nowIso() }).where(eq(workflowRuns.id, id));
  return runNextStep(id);
}

export async function runNextStep(id: string) {
  const [run] = await db.select().from(workflowRuns).where(eq(workflowRuns.id, id)).limit(1);
  if (!run) throw new Error("Workflow run not found");
  if (["success", "failed", "cancelled"].includes(run.status)) return id;

  const steps = await db.select().from(workflowStepRuns).where(eq(workflowStepRuns.workflowRunId, id));
  const orderedSteps = runtimeSteps
    .map((runtimeStep) => steps.find((step) => step.stepId === runtimeStep.stepId))
    .filter((step) => step !== undefined);
  const current = orderedSteps.find((step) => step.status === "pending" || step.status === "running" || step.status === "waiting_user");
  if (!current) {
    await db.update(workflowRuns).set({ status: "success", currentStepId: null, updatedAt: nowIso() }).where(eq(workflowRuns.id, id));
    return id;
  }

  if (current.status === "waiting_user") return id;

  const now = nowIso();
  await db
    .update(workflowStepRuns)
    .set({ status: "running", startedAt: current.startedAt ?? now, updatedAt: now })
    .where(eq(workflowStepRuns.id, current.id));
  await db.update(workflowRuns).set({ status: "running", currentStepId: current.stepId, updatedAt: now }).where(eq(workflowRuns.id, id));

  try {
    if (current.stepType === "run_agent") {
      await runAgentStep(run, current.id);
      return id;
    }

    if (current.stepType === "review_output") {
      await completeStep(current.id, "waiting_user", "", "请审阅 Output Draft，确认后继续。");
      await db.update(workflowRuns).set({ status: "waiting_user", currentStepId: current.stepId, updatedAt: nowIso() }).where(eq(workflowRuns.id, id));
      return id;
    }

    await completeStep(current.id, "success", getStepInput(run, current.stepType), getStepOutput(run, current.stepType));
    return runNextStep(id);
  } catch (error) {
    await completeStep(current.id, "failed", "", error instanceof Error ? error.message : String(error));
    await db.update(workflowRuns).set({ status: "failed", currentStepId: current.stepId, updatedAt: nowIso() }).where(eq(workflowRuns.id, id));
    return id;
  }
}

export async function completeManualStep(id: string, content?: string) {
  const [run] = await db.select().from(workflowRuns).where(eq(workflowRuns.id, id)).limit(1);
  if (!run) throw new Error("Workflow run not found");
  const [step] = await db
    .select()
    .from(workflowStepRuns)
    .where(and(eq(workflowStepRuns.workflowRunId, id), eq(workflowStepRuns.status, "waiting_user")))
    .limit(1);
  if (!step) return id;

  if (content?.trim() && step.stepType === "run_agent") {
    await createOutputForRun(run, content.trim());
  }

  await completeStep(step.id, "success", "", content?.trim() || "用户已确认。");
  await db.update(workflowRuns).set({ status: "running", updatedAt: nowIso() }).where(eq(workflowRuns.id, id));
  return runNextStep(id);
}

export async function retryWorkflowStep(id: string, stepId: string) {
  const now = nowIso();
  await db
    .update(workflowStepRuns)
    .set({ status: "pending", error: "", output: "", startedAt: null, endedAt: null, updatedAt: now })
    .where(and(eq(workflowStepRuns.workflowRunId, id), eq(workflowStepRuns.stepId, stepId)));
  await db.update(workflowRuns).set({ status: "running", currentStepId: stepId, updatedAt: now }).where(eq(workflowRuns.id, id));
  return runNextStep(id);
}

export async function cancelWorkflowRun(id: string) {
  const now = nowIso();
  await db.update(workflowRuns).set({ status: "cancelled", updatedAt: now }).where(eq(workflowRuns.id, id));
  await db
    .update(workflowStepRuns)
    .set({ status: "cancelled", endedAt: now, updatedAt: now })
    .where(and(eq(workflowStepRuns.workflowRunId, id), eq(workflowStepRuns.status, "running")));
}

export async function getWorkflowRun(id: string) {
  const [run] = await db.select().from(workflowRuns).where(eq(workflowRuns.id, id)).limit(1);
  if (!run) return null;
  const steps = await db.select().from(workflowStepRuns).where(eq(workflowStepRuns.workflowRunId, id));
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, run.workflowId)).limit(1);
  const [agent] = run.agentId ? await db.select().from(agents).where(eq(agents.id, run.agentId)).limit(1) : [];
  const [output] = run.outputId ? await db.select().from(outputs).where(eq(outputs.id, run.outputId)).limit(1) : [];
  return {
    run,
    steps: runtimeSteps.map((runtimeStep) => steps.find((step) => step.stepId === runtimeStep.stepId)).filter(Boolean),
    workflow,
    agent,
    output,
  };
}

export async function listWorkflowRuns() {
  const project = await getDefaultProject();
  return db.select().from(workflowRuns).where(eq(workflowRuns.projectId, project.id)).orderBy(desc(workflowRuns.createdAt));
}

async function runAgentStep(run: typeof workflowRuns.$inferSelect, stepRunId: string) {
  const [agent] = await db.select().from(agents).where(eq(agents.id, run.agentId ?? "")).limit(1);
  if (!agent) throw new Error("Agent not found");
  const result = await runAgent(
    {
      runId: run.id,
      projectId: run.projectId,
      workflowId: run.workflowId,
      agentId: agent.id,
      prompt: run.prompt,
      contextSnapshot: run.contextSnapshot,
      workspacePath: run.workspacePath || undefined,
      timeoutSeconds: agent.timeoutSeconds,
    },
    agent,
  );

  if (result.status === "waiting_user") {
    const outputId = await createOutputForRun(
      run,
      `# 待外部 AI 执行\n\n请复制以下 Prompt 到外部 AI，完成后回填结果。\n\n\`\`\`md\n${run.prompt}\n\`\`\``,
    );
    await db.update(workflowRuns).set({ status: "waiting_user", outputId, currentStepId: "run_agent", updatedAt: nowIso() }).where(eq(workflowRuns.id, run.id));
    await completeStep(stepRunId, "waiting_user", run.prompt, "等待用户复制 Prompt 并回填外部 AI 输出。");
    return;
  }

  if (result.status !== "success") {
    throw new Error(result.errorMessage || result.stderr || "Agent execution failed");
  }

  const finalText = result.finalText || result.stdout || "";
  const outputId = await createOutputForRun(run, finalText);
  await db.update(workflowRuns).set({ outputId, updatedAt: nowIso() }).where(eq(workflowRuns.id, run.id));
  await completeStep(stepRunId, "success", run.prompt, finalText);
}

async function createOutputForRun(run: typeof workflowRuns.$inferSelect, content: string) {
  if (run.outputId) {
    await db.update(outputs).set({ content, updatedAt: nowIso() }).where(eq(outputs.id, run.outputId));
    return run.outputId;
  }
  const now = nowIso();
  const outputId = newId("out");
  await db.insert(outputs).values({
    id: outputId,
    projectId: run.projectId,
    runId: run.id,
    parentId: null,
    title: run.title,
    content,
    version: 1,
    isFinal: false,
    createdAt: now,
    updatedAt: now,
  });
  await db.update(workflowRuns).set({ outputId, updatedAt: now }).where(eq(workflowRuns.id, run.id));
  return outputId;
}

async function completeStep(stepRunId: string, status: string, input: string, output: string) {
  await db
    .update(workflowStepRuns)
    .set({
      status,
      input,
      output,
      error: status === "failed" ? output : "",
      endedAt: status === "waiting_user" ? null : nowIso(),
      updatedAt: nowIso(),
    })
    .where(eq(workflowStepRuns.id, stepRunId));
}

function getStepInput(run: typeof workflowRuns.$inferSelect, stepType: string) {
  if (stepType === "build_context") return run.contextSnapshot;
  return run.goal;
}

function getStepOutput(run: typeof workflowRuns.$inferSelect, stepType: string) {
  if (stepType === "input") return "目标已确认。";
  if (stepType === "select_knowledge") return `${parseJson<string[]>(run.selectedKnowledgeIds, []).length} 条资料已选择。`;
  if (stepType === "select_rules") return `${parseJson<string[]>(run.selectedRuleIds, []).length} 条规则已选择。`;
  if (stepType === "build_context") {
    const refs = parseJson<WorkflowFileReference[]>(run.selectedFileRefs, []);
    return `Context Preview 已生成，包含 ${refs.length} 个文件引用。`;
  }
  if (stepType === "select_agent") return `Agent 已选择：${run.agentId ?? "未选择"}`;
  if (stepType === "save_output") return run.outputId ? "Output 已保存。" : "等待 Output。";
  return "步骤完成。";
}

function buildExecutionPrompt(workflowName: string, contextSnapshot: string) {
  return `你是 AI Work Hub 的执行 Agent。\n\n请基于 Workflow「${workflowName}」完成任务。\n\n${contextSnapshot}\n\n# 输出要求\n- 使用 Markdown。\n- 内容要可直接进入 Output Workspace 编辑、版本化和定稿。\n- 不要编造证据；不确定内容标记为假设。`;
}
