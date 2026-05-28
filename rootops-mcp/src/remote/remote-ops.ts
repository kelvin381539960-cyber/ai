import { execa } from 'execa';
import { assessCommandRisk } from './command-risk.js';
import type { RemoteExecOptions, RemoteExecResult, SshTarget } from './remote-types.js';

export class RemoteOps {
  async sshExec(target: SshTarget, command: string, options: RemoteExecOptions = {}): Promise<RemoteExecResult> {
    const risk = assessCommandRisk(command);
    if (!risk.allowed) {
      return { target, command, stdout: '', stderr: `blocked command: ${risk.reasons.join('; ')}`, exitCode: 126, ok: false };
    }

    const finalCommand = options.cwd ? `cd ${shellQuote(options.cwd)} && ${command}` : command;
    const result = await execa('ssh', buildSshArgs(target, finalCommand), {
      reject: false,
      timeout: options.timeoutMs ?? 300000,
      maxBuffer: 20 * 1024 * 1024
    });

    return { target, command, stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode ?? 0, ok: result.exitCode === 0 };
  }

  async rsyncPush(source: string, target: SshTarget, destination: string): Promise<{ stdout: string; stderr: string; exitCode: number; ok: boolean }> {
    const remote = `${target.user ? `${target.user}@` : ''}${target.host}:${destination}`;
    const args = ['-az', '--delete', source, remote];
    if (target.port) args.unshift('-e', `ssh -p ${target.port}`);
    const result = await execa('rsync', args, { reject: false, timeout: 600000, maxBuffer: 20 * 1024 * 1024 });
    return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode ?? 0, ok: result.exitCode === 0 };
  }

  async rsyncPull(target: SshTarget, source: string, destination: string): Promise<{ stdout: string; stderr: string; exitCode: number; ok: boolean }> {
    const remote = `${target.user ? `${target.user}@` : ''}${target.host}:${source}`;
    const args = ['-az', remote, destination];
    if (target.port) args.unshift('-e', `ssh -p ${target.port}`);
    const result = await execa('rsync', args, { reject: false, timeout: 600000, maxBuffer: 20 * 1024 * 1024 });
    return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode ?? 0, ok: result.exitCode === 0 };
  }

  async groupExec(targets: SshTarget[], command: string, options: RemoteExecOptions = {}): Promise<RemoteExecResult[]> {
    const results: RemoteExecResult[] = [];
    for (const target of targets) {
      results.push(await this.sshExec(target, command, options));
    }
    return results;
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
