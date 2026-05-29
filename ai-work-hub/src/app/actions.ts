"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  createAgent,
  createKnowledge,
  createProject,
  createRule,
  createWorkflowFromTemplate,
  deleteAgent,
  deleteKnowledge,
  deleteProject,
  deleteRule,
  deleteWorkflow,
  duplicateWorkflow,
  toggleAgent,
  toggleRule,
  setActiveProject,
  updateAgent,
  updateKnowledge,
  updateProject,
  updateRule,
  updateWorkflowMeta,
} from "@/lib/services/app-service";
import {
  cancelRun,
  markOutputFinal,
  outputToKnowledge,
  retryRun,
  runWorkflow,
  saveOutputVersion,
} from "@/lib/services/run-service";
import {
  cancelWorkflowRun,
  completeManualStep,
  createWorkflowRun,
  retryWorkflowStep,
  startWorkflowRun,
} from "@/lib/services/workflow-run-service";
import {
  createProjectSource,
  deleteProjectSource,
  indexProjectSource,
  updateProjectSource,
} from "@/lib/services/context-source-service";
import { testCommand } from "@/lib/runtime/health";
import { updateAgentHealth } from "@/lib/services/app-service";
import type { AgentType, KnowledgeType, RuleType, SourceType, WorkflowFileReference } from "@/lib/types";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function tags(formData: FormData) {
  return value(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createKnowledgeAction(formData: FormData) {
  await createKnowledge({
    title: value(formData, "title"),
    content: value(formData, "content"),
    type: value(formData, "type") as KnowledgeType,
    tags: tags(formData),
  });
  redirect("/knowledge");
}

export async function createProjectAction(formData: FormData) {
  const id = await createProject({
    name: value(formData, "name"),
    description: value(formData, "description"),
  });
  await setActiveProject(id);
  redirect("/projects");
}

export async function switchProjectAction(formData: FormData) {
  await setActiveProject(value(formData, "projectId"));
  redirect("/");
}

export async function updateProjectAction(formData: FormData) {
  await updateProject(value(formData, "projectId"), {
    name: value(formData, "name"),
    description: value(formData, "description"),
  });
  redirect("/projects");
}

export async function deleteProjectAction(formData: FormData) {
  requireConfirmation(formData);
  await deleteProject(value(formData, "projectId"));
  redirect("/projects");
}

export async function updateKnowledgeAction(formData: FormData) {
  await updateKnowledge(value(formData, "knowledgeId"), {
    title: value(formData, "title"),
    content: value(formData, "content"),
    type: value(formData, "type") as KnowledgeType,
    tags: tags(formData),
  });
  redirect("/knowledge");
}

export async function deleteKnowledgeAction(formData: FormData) {
  requireConfirmation(formData);
  await deleteKnowledge(value(formData, "knowledgeId"));
  redirect("/knowledge");
}

export async function createProjectSourceAction(formData: FormData) {
  const id = await createProjectSource({
    name: value(formData, "name"),
    type: value(formData, "type") as SourceType,
    rootPath: value(formData, "rootPath"),
    includePatterns: lines(value(formData, "includePatterns")),
    excludePatterns: lines(value(formData, "excludePatterns")),
  });
  await indexProjectSource(id);
  redirect(`/context/sources/${id}`);
}

export async function indexProjectSourceAction(formData: FormData) {
  const id = value(formData, "sourceId");
  await indexProjectSource(id);
  redirect(`/context/sources/${id}`);
}

export async function updateProjectSourceAction(formData: FormData) {
  const id = value(formData, "sourceId");
  await updateProjectSource(id, {
    name: value(formData, "name"),
    includePatterns: lines(value(formData, "includePatterns")),
    excludePatterns: lines(value(formData, "excludePatterns")),
  });
  redirect(`/context/sources/${id}`);
}

export async function deleteProjectSourceAction(formData: FormData) {
  requireConfirmation(formData);
  await deleteProjectSource(value(formData, "sourceId"));
  redirect("/context");
}

export async function loginAction(formData: FormData) {
  const token = value(formData, "token");
  if (!process.env.AI_WORK_HUB_ACCESS_TOKEN || token === process.env.AI_WORK_HUB_ACCESS_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set("ai_work_hub_token", token || "open", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    redirect("/");
  }
  redirect("/login?error=1");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("ai_work_hub_token");
  redirect("/login");
}

export async function createRuleAction(formData: FormData) {
  await createRule({
    name: value(formData, "name"),
    content: value(formData, "content"),
    type: value(formData, "type") as RuleType,
  });
  redirect("/settings");
}

export async function updateRuleAction(formData: FormData) {
  await updateRule(value(formData, "ruleId"), {
    name: value(formData, "name"),
    content: value(formData, "content"),
    type: value(formData, "type") as RuleType,
  });
  redirect("/settings");
}

export async function toggleRuleAction(formData: FormData) {
  await toggleRule(value(formData, "ruleId"), value(formData, "enabled") === "true");
  redirect("/settings");
}

export async function deleteRuleAction(formData: FormData) {
  requireConfirmation(formData);
  await deleteRule(value(formData, "ruleId"));
  redirect("/settings");
}

export async function createWorkflowAction(formData: FormData) {
  const id = await createWorkflowFromTemplate(value(formData, "templateId"));
  redirect(`/workflows/${id}`);
}

export async function updateWorkflowMetaAction(formData: FormData) {
  const id = value(formData, "workflowId");
  await updateWorkflowMeta(id, {
    name: value(formData, "name"),
    scenario: value(formData, "scenario"),
    description: value(formData, "description"),
  });
  redirect(`/workflows/${id}`);
}

export async function duplicateWorkflowAction(formData: FormData) {
  const id = await duplicateWorkflow(value(formData, "workflowId"));
  redirect(`/workflows/${id}`);
}

export async function deleteWorkflowAction(formData: FormData) {
  requireConfirmation(formData);
  await deleteWorkflow(value(formData, "workflowId"));
  redirect("/workflows");
}

export async function createAgentAction(formData: FormData) {
  await createAgent({
    name: value(formData, "name"),
    type: value(formData, "type") as AgentType,
    agentKey: value(formData, "agentKey"),
    command: value(formData, "command"),
    capabilities: tags(formData),
  });
  redirect("/agents");
}

export async function updateAgentAction(formData: FormData) {
  await updateAgent(value(formData, "agentId"), {
    name: value(formData, "name"),
    type: value(formData, "type") as AgentType,
    agentKey: value(formData, "agentKey"),
    command: value(formData, "command"),
    capabilities: tags(formData),
    timeoutSeconds: Number(value(formData, "timeoutSeconds") || 300),
  });
  redirect("/agents");
}

export async function toggleAgentAction(formData: FormData) {
  await toggleAgent(value(formData, "agentId"), value(formData, "enabled") === "true");
  redirect("/agents");
}

export async function deleteAgentAction(formData: FormData) {
  requireConfirmation(formData);
  await deleteAgent(value(formData, "agentId"));
  redirect("/agents");
}

export async function testAgentAction(formData: FormData) {
  const agentId = value(formData, "agentId");
  const command = value(formData, "command");
  const result = await testCommand(command);
  await updateAgentHealth(agentId, result.ok ? "ready" : "missing");
  redirect("/agents");
}

export async function runWorkflowAction(formData: FormData) {
  const id = await runWorkflow({
    workflowId: value(formData, "workflowId"),
    goal: value(formData, "goal"),
    agentId: value(formData, "agentId") || undefined,
  });
  redirect(`/runs/${id}`);
}

export async function createWorkflowRunAction(formData: FormData) {
  const id = await createWorkflowRun({
    workflowId: value(formData, "workflowId"),
    title: value(formData, "title"),
    goal: value(formData, "goal"),
    background: value(formData, "background"),
    expectedOutput: value(formData, "expectedOutput"),
    constraints: value(formData, "constraints"),
    selectedKnowledgeIds: formData.getAll("knowledgeIds").map(String),
    selectedRuleIds: formData.getAll("ruleIds").map(String),
    selectedFileRefs: parseFileRefs(formData),
    workspacePath: value(formData, "workspacePath"),
    temporaryRules: value(formData, "temporaryRules"),
    agentId: value(formData, "agentId"),
  });
  await startWorkflowRun(id);
  redirect(`/workflow-runs/${id}`);
}

function lines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseFileRefs(formData: FormData): WorkflowFileReference[] {
  return formData.getAll("fileRefs").map((raw) => {
    const [sourceId, filePath] = String(raw).split("::");
    return {
      sourceId,
      filePath,
      mode: "reference_only" as const,
      reason: "Workflow 启动时选择",
    };
  }).filter((ref) => ref.sourceId && ref.filePath);
}

function requireConfirmation(formData: FormData) {
  if (value(formData, "confirmDelete") !== "yes") {
    throw new Error("Delete confirmation is required.");
  }
}

export async function startWorkflowRunAction(formData: FormData) {
  const id = value(formData, "workflowRunId");
  await startWorkflowRun(id);
  redirect(`/workflow-runs/${id}`);
}

export async function continueWorkflowRunAction(formData: FormData) {
  const id = value(formData, "workflowRunId");
  await completeManualStep(id, value(formData, "manualOutput"));
  redirect(`/workflow-runs/${id}`);
}

export async function cancelWorkflowRunAction(formData: FormData) {
  const id = value(formData, "workflowRunId");
  await cancelWorkflowRun(id);
  redirect(`/workflow-runs/${id}`);
}

export async function retryWorkflowStepAction(formData: FormData) {
  const id = value(formData, "workflowRunId");
  await retryWorkflowStep(id, value(formData, "stepId"));
  redirect(`/workflow-runs/${id}`);
}

export async function cancelRunAction(formData: FormData) {
  const id = value(formData, "runId");
  await cancelRun(id);
  redirect(`/runs/${id}`);
}

export async function retryRunAction(formData: FormData) {
  const id = await retryRun(value(formData, "runId"));
  redirect(`/runs/${id}`);
}

export async function saveOutputVersionAction(formData: FormData) {
  const id = await saveOutputVersion(value(formData, "outputId"), value(formData, "content"));
  redirect(`/outputs/${id}`);
}

export async function markOutputFinalAction(formData: FormData) {
  const id = value(formData, "outputId");
  await markOutputFinal(id);
  redirect(`/outputs/${id}`);
}

export async function outputToKnowledgeAction(formData: FormData) {
  await outputToKnowledge(value(formData, "outputId"));
  redirect("/knowledge");
}
