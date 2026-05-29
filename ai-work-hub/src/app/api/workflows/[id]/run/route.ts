import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "@/lib/services/run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as { goal: string; agentId?: string };
  const runId = await runWorkflow({ workflowId: id, goal: body.goal, agentId: body.agentId });
  return NextResponse.json({ id: runId });
}
