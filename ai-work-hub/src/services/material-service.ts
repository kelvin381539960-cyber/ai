import { getDb } from '@/lib/db';
import { createId, nowIso } from '@/lib/ids';

export function addMaterial(taskId: string, input: { title: string; content: string; type: string; usageStatus: 'active' | 'key' | 'excluded' | 'archived' }) {
  const db = getDb();
  const now = nowIso();
  const id = createId('material');
  db.prepare(`INSERT INTO materials (id, task_id, type, title, content, usage_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, taskId, input.type, input.title, input.content, input.usageStatus, now, now);
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, taskId);
  return db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
}
