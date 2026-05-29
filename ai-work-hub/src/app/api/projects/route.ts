import { NextRequest, NextResponse } from "next/server";
import { createProject, getActiveProject, listProjects } from "@/lib/services/app-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ active: await getActiveProject(), items: await listProjects() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = await createProject({
    name: String(body.name ?? ""),
    description: String(body.description ?? ""),
  });
  return NextResponse.json({ id });
}
