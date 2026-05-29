import { NextRequest, NextResponse } from "next/server";
import { createAgent, listAgents } from "@/lib/services/app-service";
import type { AgentType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listAgents() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    name: string;
    type: AgentType;
    agentKey: string;
    command: string;
    capabilities?: string[];
  };
  const id = await createAgent({
    name: body.name,
    type: body.type,
    agentKey: body.agentKey,
    command: body.command,
    capabilities: body.capabilities ?? [],
  });
  return NextResponse.json({ id });
}
