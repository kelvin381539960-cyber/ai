import { NextRequest, NextResponse } from "next/server";
import { createKnowledge, listKnowledge } from "@/lib/services/app-service";
import type { KnowledgeType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  return NextResponse.json({ items: await listKnowledge(query) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title: string;
    content: string;
    type?: KnowledgeType;
    tags?: string[];
  };
  const id = await createKnowledge({
    title: body.title,
    content: body.content,
    type: body.type ?? "note",
    tags: body.tags ?? [],
  });
  return NextResponse.json({ id });
}
