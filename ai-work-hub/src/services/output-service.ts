import { getDb } from '@/lib/db';
import { readTextFile, writeTextFile } from '@/lib/fs-store';
import { nowIso } from '@/lib/ids';

export function updateOutput(outputId: string, input: { title: string; content: string }) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as any;
  if (!output) throw new Error('Output 不存在');
  writeTextFile(output.content_path, input.content);
  const now = nowIso();
  db.prepare('UPDATE outputs SET title = ?, updated_at = ? WHERE id = ?').run(input.title, now, outputId);
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, output.task_id);
  return db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId);
}

export function markOutputFinal(outputId: string) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as any;
  if (!output) throw new Error('Output 不存在');
  const now = nowIso();
  db.prepare('UPDATE outputs SET is_final = 0 WHERE task_id = ? AND type = ?').run(output.task_id, output.type);
  db.prepare('UPDATE outputs SET is_final = 1, updated_at = ? WHERE id = ?').run(now, outputId);
  db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?').run('done', now, output.task_id);
  return { ...output, content: readTextFile(output.content_path), is_final: 1 };
}
