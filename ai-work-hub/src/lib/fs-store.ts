import fs from 'node:fs';
import path from 'node:path';

export function getDataDir(): string {
  return process.env.AI_WORK_HUB_DATA_DIR || path.join(process.cwd(), 'data');
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function ensureDataDirs(dataDir = getDataDir()): void {
  ensureDir(dataDir);
  for (const name of ['materials', 'outputs', 'runs', 'workflow-runs', 'exports', 'templates']) {
    ensureDir(path.join(dataDir, name));
  }
}

export function writeTextFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readTextFile(filePath?: string | null): string {
  if (!filePath || !fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}
