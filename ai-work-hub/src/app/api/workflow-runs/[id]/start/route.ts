import { NextResponse } from "next/server";
import { startWorkflowRun } from "@/lib/services/workflow-run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await startWorkflowRun(id);
  return NextResponse.json({ id });
}
