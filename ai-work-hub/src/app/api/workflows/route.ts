import { NextRequest, NextResponse } from "next/server";
import { createWorkflowFromTemplate, listWorkflows } from "@/lib/services/app-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listWorkflows() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { templateId: string };
  const id = await createWorkflowFromTemplate(body.templateId);
  return NextResponse.json({ id });
}
