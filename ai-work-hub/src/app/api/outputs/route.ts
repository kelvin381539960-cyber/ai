import { NextResponse } from "next/server";
import { listOutputs } from "@/lib/services/app-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listOutputs() });
}
