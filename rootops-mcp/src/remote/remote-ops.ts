import { execa } from 'execa';

export interface SshTarget {
  host: string;
  user?: string;
  port?: number;
  identityFile?: string;
}

export class RemoteOps {
  async sshExec(target: SshTarget, command: string): Promise<{ stdout: string; stderr: string }> {
    const args = buildSshArgs(target, command);
    const result = await execa('ssh', args, { timeout: 300000 });
    return { stdout: result.stdout, stderr: result.stderr };
  }

  async rsyncPush(source: string, target: SshTarget, destination: string): Promise<{ stdout: string; stderr: string }> {
    const remote = `${target.user ? `${target.user}@` : ''}${target.host}:${destination}`;
    const args = ['-az', '--delete', source, remote];
    if (target.port) args.unshift('-e', `ssh -p ${target.port}`);
    const result = await execa('rsync', args, { timeout: 600000 });
    return { stdout: result.stdout, stderr: result.stderr };
  }
}

function buildSshArgs(target: SshTarget, command: string): string[] {
  const args: string[] = [];
  if (target.port) args.push('-p', String(target.port));
  if (target.identityFile) args.push('-i', target.identityFile);
  args.push(`${target.user ? `${target.user}@` : ''}${target.host}`, command);
  return args;
}
