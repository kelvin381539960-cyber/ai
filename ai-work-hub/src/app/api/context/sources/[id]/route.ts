import { NextRequest, NextResponse } from "next/server";
import { getProjectSource } from "@/lib/services/context-source-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const data = await getProjectSource(id, query);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
