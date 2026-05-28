import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { SshTarget } from './remote-types.js';

export interface PtySessionRecord {
  id: string;
  target: SshTarget;
  cwd?: string;
  createdAt: string;
  finishedAt?: string;
  exitCode?: number | null;
  buffer: string;
}

export class PtyManager {
  private readonly sessions = new Map<string, { record: PtySessionRecord; child: ChildProcessWithoutNullStreams }>();

  open(target: SshTarget, cwd?: string): PtySessionRecord {
    const id = `pty_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const initialCommand = cwd ? `cd ${shellQuote(cwd)} && exec $SHELL -l` : 'exec $SHELL -l';
    const child = spawn('ssh', buildSshArgs(target, initialCommand), { stdio: 'pipe' });
    const record: PtySessionRecord = { id, target, cwd, createdAt: new Date().toISOString(), buffer: '' };

    child.stdout.on('data', (chunk: Buffer) => {
      record.buffer = trimBuffer(record.buffer + chunk.toString('utf8'));
    });
    child.stderr.on('data', (chunk: Buffer) => {
      record.buffer = trimBuffer(record.buffer + chunk.toString('utf8'));
    });
    child.on('close', (code) => {
      record.exitCode = code;
      record.finishedAt = new Date().toISOString();
    });

    this.sessions.set(id, { record, child });
    return { ...record };
  }

  write(id: string, input: string): { ok: true; id: string } {
    const item = this.sessions.get(id);
    if (!item) throw new Error(`pty session not found: ${id}`);
    item.child.stdin.write(input);
    return { ok: true, id };
  }

  read(id: string, clear = false): PtySessionRecord {
    const item = this.sessions.get(id);
    if (!item) throw new Error(`pty session not found: ${id}`);
    const snapshot = { ...item.record };
    if (clear) item.record.buffer = '';
    return snapshot;
  }

  close(id: string): { ok: boolean; id: string } {
    const item = this.sessions.get(id);
    if (!item) throw new Error(`pty session not found: ${id}`);
    const ok = item.child.kill('SIGTERM');
    this.sessions.delete(id);
    return { ok, id };
  }

  list(): PtySessionRecord[] {
    return [...this.sessions.values()].map((item) => ({ ...item.record }));
  }
}

function buildSshArgs(target: SshTarget, command: string): string[] {
  const args: string[] = ['-tt', '-o', 'StrictHostKeyChecking=accept-new'];
  if (target.port) args.push('-p', String(target.port));
  if (target.identityFile) args.push('-i', target.identityFile);
  args.push(`${target.user ? `${target.user}@` : ''}${target.host}`, command);
  return args;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function trimBuffer(value: string, max = 512 * 1024): string {
  return value.length > max ? value.slice(value.length - max) : value;
}
