import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { assessCommandRisk } from './command-risk.js';
import type { SshTarget } from './remote-types.js';

export interface StreamProcessRecord {
  id: string;
  target: SshTarget;
  command: string;
  createdAt: string;
  finishedAt?: string;
  exitCode?: number | null;
  stdout: string;
  stderr: string;
}

export class StreamManager {
  private readonly processes = new Map<string, { record: StreamProcessRecord; child: ChildProcessWithoutNullStreams }>();

  start(target: SshTarget, command: string, options: { cwd?: string } = {}): StreamProcessRecord {
    const risk = assessCommandRisk(command);
    if (!risk.allowed) throw new Error(`blocked command: ${risk.reasons.join('; ')}`);

    const id = `stream_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const finalCommand = options.cwd ? `cd ${shellQuote(options.cwd)} && ${command}` : command;
    const child = spawn('ssh', buildSshArgs(target, finalCommand), { stdio: 'pipe' });
    const record: StreamProcessRecord = { id, target, command, createdAt: new Date().toISOString(), stdout: '', stderr: '' };

    child.stdout.on('data', (chunk: Buffer) => {
      record.stdout = trimBuffer(record.stdout + chunk.toString('utf8'));
    });
    child.stderr.on('data', (chunk: Buffer) => {
      record.stderr = trimBuffer(record.stderr + chunk.toString('utf8'));
    });
    child.on('close', (code) => {
      record.exitCode = code;
      record.finishedAt = new Date().toISOString();
    });

    this.processes.set(id, { record, child });
    return { ...record };
  }

  read(id: string, clear = false): StreamProcessRecord {
    const item = this.processes.get(id);
    if (!item) throw new Error(`stream not found: ${id}`);
    const snapshot = { ...item.record };
    if (clear) {
      item.record.stdout = '';
      item.record.stderr = '';
    }
    return snapshot;
  }

  kill(id: string, signal: NodeJS.Signals = 'SIGTERM'): { ok: boolean; id: string; signal: string } {
    const item = this.processes.get(id);
    if (!item) throw new Error(`stream not found: ${id}`);
    const ok = item.child.kill(signal);
    return { ok, id, signal };
  }

  list(): StreamProcessRecord[] {
    return [...this.processes.values()].map((item) => ({ ...item.record }));
  }
}

function buildSshArgs(target: SshTarget, command: string): string[] {
  const args: string[] = ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new'];
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
