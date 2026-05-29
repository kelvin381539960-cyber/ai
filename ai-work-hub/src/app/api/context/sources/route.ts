import { NextRequest, NextResponse } from "next/server";
import { createProjectSource, indexProjectSource, listProjectSources } from "@/lib/services/context-source-service";
import type { SourceType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listProjectSources() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = await createProjectSource({
    name: String(body.name ?? ""),
    type: (body.type ?? "server_folder") as SourceType,
    rootPath: String(body.rootPath ?? ""),
    includePatterns: Array.isArray(body.includePatterns) ? body.includePatterns.map(String) : undefined,
    excludePatterns: Array.isArray(body.excludePatterns) ? body.excludePatterns.map(String) : undefined,
  });
  if (body.indexNow !== false) {
    await indexProjectSource(id);
  }
  return NextResponse.json({ id });
}
