import { NextResponse } from 'next/server';
import { continueWorkflowRun } from '@/services/workflow-service';

export const dynamic = 'force-dynamic';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json({ ok: true, data: continueWorkflowRun(id) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }, { status: 500 });
  }
}
