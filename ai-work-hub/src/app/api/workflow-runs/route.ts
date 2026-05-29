import { NextRequest, NextResponse } from "next/server";
import { createWorkflowRun, listWorkflowRuns } from "@/lib/services/workflow-run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listWorkflowRuns() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = await createWorkflowRun({
    workflowId: String(body.workflowId),
    title: String(body.title),
    goal: String(body.goal),
    background: String(body.background ?? ""),
    expectedOutput: String(body.expectedOutput ?? ""),
    constraints: String(body.constraints ?? ""),
    selectedKnowledgeIds: Array.isArray(body.selectedKnowledgeIds) ? body.selectedKnowledgeIds : [],
    selectedRuleIds: Array.isArray(body.selectedRuleIds) ? body.selectedRuleIds : [],
    selectedFileRefs: Array.isArray(body.selectedFileRefs) ? body.selectedFileRefs : [],
    workspacePath: String(body.workspacePath ?? ""),
    temporaryRules: String(body.temporaryRules ?? ""),
    agentId: String(body.agentId),
  });
  return NextResponse.json({ id });
}
