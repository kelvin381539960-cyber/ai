import { NextRequest, NextResponse } from "next/server";
import { buildContextPreview } from "@/lib/services/workflow-run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const preview = await buildContextPreview({
    title: String(body.title ?? ""),
    goal: String(body.goal ?? ""),
    background: String(body.background ?? ""),
    expectedOutput: String(body.expectedOutput ?? ""),
    constraints: String(body.constraints ?? ""),
    selectedKnowledgeIds: Array.isArray(body.selectedKnowledgeIds) ? body.selectedKnowledgeIds : [],
    selectedRuleIds: Array.isArray(body.selectedRuleIds) ? body.selectedRuleIds : [],
    temporaryRules: String(body.temporaryRules ?? ""),
  });
  return NextResponse.json({ preview });
}
