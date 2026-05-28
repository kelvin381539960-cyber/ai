import { getDb } from '@/lib/db';
import { readTextFile } from '@/lib/fs-store';
import type { OutputRow, TaskRow, MaterialRow } from '@/types/db';

export function searchAll(query: string): {
  tasks: TaskRow[];
  materials: MaterialRow[];
  outputs: Array<OutputRow & { content: string }>;
} {
  const db = getDb();
  const q = `%${query.trim()}%`;
  if (!query.trim()) return { tasks: [], materials: [], outputs: [] };

  const tasks = db.prepare(`
    SELECT * FROM tasks
    WHERE title LIKE ? OR goal LIKE ? OR expected_output LIKE ?
    ORDER BY updated_at DESC
    LIMIT 20
  `).all(q, q, q) as TaskRow[];

  const materials = db.prepare(`
    SELECT * FROM materials
    WHERE title LIKE ? OR content LIKE ? OR source_url LIKE ?
    ORDER BY updated_at DESC
    LIMIT 20
  `).all(q, q, q) as MaterialRow[];

  const outputRows = db.prepare(`
    SELECT * FROM outputs
    WHERE title LIKE ?
    ORDER BY updated_at DESC
    LIMIT 20
  `).all(q) as OutputRow[];

  const outputs = outputRows.map((output) => ({
    ...output,
    content: readTextFile(output.content_path)
  })).filter((output) => output.title.includes(query) || output.content.includes(query));

  return { tasks, materials, outputs };
}
