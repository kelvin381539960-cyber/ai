import path from 'node:path';
import { getDb } from '@/lib/db';
import { getDataDir, readTextFile, writeTextFile } from '@/lib/fs-store';
import { createId, nowIso } from '@/lib/ids';
import type { OutputRow } from '@/types/db';

export function updateOutput(outputId: string, input: { title: string; content: string }) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  writeTextFile(output.content_path, input.content);
  const now = nowIso();
  db.prepare('UPDATE outputs SET title = ?, updated_at = ? WHERE id = ?').run(input.title, now, outputId);
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, output.task_id);
  return db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId);
}

export function createOutputVersion(outputId: string, input: { title: string; content: string }) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  const row = db.prepare('SELECT MAX(version) AS maxVersion FROM outputs WHERE task_id = ? AND type = ?').get(output.task_id, output.type) as { maxVersion: number | null };
  const nextVersion = (row.maxVersion || 0) + 1;
  const now = nowIso();
  const newId = createId('output');
  const contentPath = path.join(getDataDir(), 'outputs', `${newId}.md`);
  writeTextFile(contentPath, input.content);
  db.prepare(`INSERT INTO outputs (id, task_id, type, title, content_path, version, is_final, source_run_ids_json, source_material_ids_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`).run(
    newId,
    output.task_id,
    output.type,
    input.title,
    contentPath,
    nextVersion,
    output.source_run_ids_json,
    output.source_material_ids_json,
    now,
    now
  );
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, output.task_id);
  return db.prepare('SELECT * FROM outputs WHERE id = ?').get(newId);
}

export function markOutputFinal(outputId: string) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  const now = nowIso();
  db.prepare('UPDATE outputs SET is_final = 0 WHERE task_id = ? AND type = ?').run(output.task_id, output.type);
  db.prepare('UPDATE outputs SET is_final = 1, updated_at = ? WHERE id = ?').run(now, outputId);
  db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?').run('done', now, output.task_id);
  return { ...output, content: readTextFile(output.content_path), is_final: 1 };
}
