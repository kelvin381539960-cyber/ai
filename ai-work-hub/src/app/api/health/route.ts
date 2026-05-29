import { NextResponse } from "next/server";
import { ensureAppReady } from "@/lib/services/app-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensureAppReady();
  return NextResponse.json({
    ok: true,
    app: "ai-work-hub",
    mode: "smart-workbench",
  });
}
