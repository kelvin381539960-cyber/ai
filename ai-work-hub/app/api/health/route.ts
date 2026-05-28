import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDataDir } from '@/lib/fs-store';

export async function GET() {
  try {
    const db = getDb();
    const workspace = db.prepare('SELECT id, name FROM workspaces LIMIT 1').get();
    return NextResponse.json({
      ok: true,
      dataDir: getDataDir(),
      initialized: Boolean(workspace),
      workspace
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'unknown error'
    }, { status: 500 });
  }
}
