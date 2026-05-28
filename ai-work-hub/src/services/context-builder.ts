import { getDb } from '@/lib/db';

export function buildPrompt(taskId: string, assistantId: string): { prompt: string; usedMaterialIds: string[] } {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
  const assistant = db.prepare('SELECT * FROM assistants WHERE id = ?').get(assistantId) as any;
  const materials = db.prepare("SELECT * FROM materials WHERE task_id = ? AND usage_status IN ('active', 'key') ORDER BY usage_status DESC, created_at DESC").all(taskId) as any[];
  const outputs = db.prepare('SELECT * FROM outputs WHERE task_id = ? ORDER BY created_at DESC LIMIT 3').all(taskId) as any[];

  const materialText = materials.map((m) => `## ${m.title}\n状态：${m.usage_status}\n${m.content || m.source_url || m.file_path || ''}`).join('\n\n');
  const outputText = outputs.map((o) => `- ${o.title} v${o.version}${o.is_final ? '（最终版）' : ''}`).join('\n');

  const prompt = `# 角色\n${assistant.prompt_template || assistant.name}\n\n# 任务\n标题：${task.title}\n类型：${task.type}\n目标：${task.goal}\n预期输出：${task.expected_output || '未填写'}\n\n# 本次使用资料\n${materialText || '暂无资料'}\n\n# 最近输出\n${outputText || '暂无输出'}\n\n# 输出要求\n请直接给出可复制使用的结果。结论先行，结构清晰，避免空话。`;

  return { prompt, usedMaterialIds: materials.map((m) => m.id) };
}
