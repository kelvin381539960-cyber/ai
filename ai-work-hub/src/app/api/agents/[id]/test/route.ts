import { NextResponse } from "next/server";
import { getAgent, updateAgentHealth } from "@/lib/services/app-service";
import { testCommand } from "@/lib/runtime/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const agent = await getAgent(id);
  if (!agent) return NextResponse.json({ ok: false, message: "Agent not found" }, { status: 404 });
  const result = await testCommand(agent.command);
  await updateAgentHealth(id, result.ok ? "ready" : "missing");
  return NextResponse.json(result);
}
