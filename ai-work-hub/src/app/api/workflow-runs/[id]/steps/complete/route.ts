import { NextRequest, NextResponse } from "next/server";
import { completeManualStep } from "@/lib/services/workflow-run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  await completeManualStep(id, typeof body.content === "string" ? body.content : undefined);
  return NextResponse.json({ id });
}
