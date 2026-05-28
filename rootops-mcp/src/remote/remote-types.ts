export interface SshTarget {
  host: string;
  user?: string;
  port?: number;
  identityFile?: string;
}

export interface RemoteSession {
  id: string;
  target: SshTarget;
  cwd?: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface ServerGroup {
  name: string;
  targets: SshTarget[];
}

export interface RemoteExecOptions {
  timeoutMs?: number;
  cwd?: string;
}

export interface RemoteExecResult {
  target: SshTarget;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  ok: boolean;
}
