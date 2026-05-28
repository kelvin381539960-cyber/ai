import { NextResponse } from 'next/server';
import { listOutputs } from '@/services/query-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: listOutputs(100) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }, { status: 500 });
  }
}
