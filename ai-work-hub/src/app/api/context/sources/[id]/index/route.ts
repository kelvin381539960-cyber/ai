import { NextResponse } from "next/server";
import { indexProjectSource } from "@/lib/services/context-source-service";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fileCount = await indexProjectSource(id);
  return NextResponse.json({ id, fileCount });
}
