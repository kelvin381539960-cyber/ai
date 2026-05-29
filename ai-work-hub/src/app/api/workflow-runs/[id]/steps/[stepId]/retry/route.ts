import { NextResponse } from "next/server";
import { retryWorkflowStep } from "@/lib/services/workflow-run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string; stepId: string }> },
) {
  const { id, stepId } = await context.params;
  await retryWorkflowStep(id, stepId);
  return NextResponse.json({ id, stepId });
}
