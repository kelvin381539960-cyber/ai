import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { SshTarget } from './remote-types.js';

export interface TunnelRecord {
  id: string;
  target: SshTarget;
  localHost: string;
  localPort: number;
  remoteHost: string;
  remotePort: number;
  createdAt: string;
  status: 'starting' | 'running' | 'closed' | 'error';
  stderr: string;
}

export class TunnelManager {
  private readonly tunnels = new Map<string, { record: TunnelRecord; child: ChildProcessWithoutNullStreams }>();

  open(input: {
    target: SshTarget;
    localHost?: string;
    localPort: number;
    remoteHost?: string;
    remotePort: number;
  }): TunnelRecord {
    const id = `tun_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const record: TunnelRecord = {
      id,
      target: input.target,
      localHost: input.localHost ?? '127.0.0.1',
      localPort: input.localPort,
      remoteHost: input.remoteHost ?? '127.0.0.1',
      remotePort: input.remotePort,
      createdAt: new Date().toISOString(),
      status: 'starting',
      stderr: ''
    };

    const args = buildSshArgs(input.target, record);
    const child = spawn('ssh', args, { stdio: 'pipe' });

    child.stderr.on('data', (chunk: Buffer) => {
      record.stderr = trimBuffer(record.stderr + chunk.toString('utf8'));
      if (/error|failed|denied/i.test(record.stderr)) record.status = 'error';
    });
    child.on('spawn', () => {
      record.status = 'running';
    });
    child.on('close', () => {
      if (record.status !== 'error') record.status = 'closed';
    });

    this.tunnels.set(id, { record, child });
    return { ...record };
  }

  list(): TunnelRecord[] {
    return [...this.tunnels.values()].map((item) => ({ ...item.record }));
  }

  close(id: string): { ok: boolean; id: string } {
    const item = this.tunnels.get(id);
    if (!item) throw new Error(`tunnel not found: ${id}`);
    const ok = item.child.kill('SIGTERM');
    item.record.status = 'closed';
    this.tunnels.delete(id);
    return { ok, id };
  }
}

function buildSshArgs(target: SshTarget, record: TunnelRecord): string[] {
  const args: string[] = [
    '-N',
    '-o', 'ExitOnForwardFailure=yes',
    '-o', 'StrictHostKeyChecking=accept-new',
    '-L', `${record.localHost}:${record.localPort}:${record.remoteHost}:${record.remotePort}`
  ];
  if (target.port) args.push('-p', String(target.port));
  if (target.identityFile) args.push('-i', target.identityFile);
  args.push(`${target.user ? `${target.user}@` : ''}${target.host}`);
  return args;
}

function trimBuffer(value: string, max = 128 * 1024): string {
  return value.length > max ? value.slice(value.length - max) : value;
}
