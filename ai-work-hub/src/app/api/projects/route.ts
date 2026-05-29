import { NextResponse } from "next/server";
import { getDefaultProject } from "@/lib/services/app-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: [await getDefaultProject()] });
}
