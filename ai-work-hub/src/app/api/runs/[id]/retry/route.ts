import { NextResponse } from "next/server";
import { retryRun } from "@/lib/services/run-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const retryId = await retryRun(id);
  return NextResponse.json({ id: retryId });
}
