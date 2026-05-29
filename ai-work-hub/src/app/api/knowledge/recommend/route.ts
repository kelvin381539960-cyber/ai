import { NextRequest, NextResponse } from "next/server";
import { recommendKnowledge } from "@/lib/services/workflow-run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ items: await recommendKnowledge(q) });
}
