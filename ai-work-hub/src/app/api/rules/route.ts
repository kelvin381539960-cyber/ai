import { NextRequest, NextResponse } from "next/server";
import { createRule, listRules } from "@/lib/services/app-service";
import type { RuleType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listRules() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { name: string; content: string; type?: RuleType };
  const id = await createRule({
    name: body.name,
    content: body.content,
    type: body.type ?? "output",
  });
  return NextResponse.json({ id });
}
