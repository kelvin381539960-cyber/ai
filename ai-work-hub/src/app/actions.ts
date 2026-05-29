"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  createAgent,
  createKnowledge,
  createRule,
  createWorkflowFromTemplate,
} from "@/lib/services/app-service";
import {
  cancelRun,
  markOutputFinal,
  outputToKnowledge,
  retryRun,
  runWorkflow,
  saveOutputVersion,
} from "@/lib/services/run-service";
import { testCommand } from "@/lib/runtime/health";
import { updateAgentHealth } from "@/lib/services/app-service";
import type { AgentType, KnowledgeType, RuleType } from "@/lib/types";

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

export async function createWorkflowAction(formData: FormData) {
  const id = await createWorkflowFromTemplate(value(formData, "templateId"));
  redirect(`/workflows/${id}`);
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
