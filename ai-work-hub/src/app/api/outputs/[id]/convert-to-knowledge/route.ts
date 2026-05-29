import { NextResponse } from "next/server";
import { outputToKnowledge } from "@/lib/services/run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const knowledgeId = await outputToKnowledge(id);
  return NextResponse.json({ id: knowledgeId });
}
