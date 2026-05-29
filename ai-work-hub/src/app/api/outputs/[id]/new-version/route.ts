import { NextRequest, NextResponse } from "next/server";
import { saveOutputVersion } from "@/lib/services/run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as { content: string };
  const nextId = await saveOutputVersion(id, body.content);
  return NextResponse.json({ id: nextId });
}
