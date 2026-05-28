import { randomUUID } from 'node:crypto';
import type { RemoteSession, SshTarget } from './remote-types.js';

export class RemoteSessionPool {
  private readonly sessions = new Map<string, RemoteSession>();

  open(target: SshTarget, cwd?: string): RemoteSession {
    const id = `ssh_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const session: RemoteSession = { id, target, cwd, createdAt: now, lastUsedAt: now };
    this.sessions.set(id, session);
    return session;
  }

  get(id: string): RemoteSession {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`remote session not found: ${id}`);
    session.lastUsedAt = new Date().toISOString();
    return session;
  }

  close(id: string): { ok: boolean; id: string } {
    return { ok: this.sessions.delete(id), id };
  }

  list(): RemoteSession[] {
    return [...this.sessions.values()];
  }
}
