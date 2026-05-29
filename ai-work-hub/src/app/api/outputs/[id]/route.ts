import { NextResponse } from "next/server";
import { getOutput } from "@/lib/services/app-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const output = await getOutput(id);
  if (!output) return NextResponse.json({ error: "Output not found" }, { status: 404 });
  return NextResponse.json(output);
}
