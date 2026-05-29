import { randomBytes } from 'node:crypto';
import { RemoteOps } from './remote-ops.js';
import type { SshTarget } from './remote-types.js';

export interface RemoteAgentSystemdInstallInput {
  target: SshTarget;
  install_path?: string;
  service_name?: string;
  port?: number;
  token?: string;
  user?: string;
}

export class RemoteAgentSystemd {
  constructor(private readonly remote = new RemoteOps()) {}

  async install(input: RemoteAgentSystemdInstallInput): Promise<unknown> {
    const installPath = input.install_path ?? '/opt/aix-rootops-agent/aix-rootops-agent.js';
    const serviceName = input.service_name ?? 'aix-rootops-agent';
    const port = input.port ?? 18765;
    const token = input.token ?? `ra_${randomBytes(24).toString('hex')}`;
    const user = input.user ?? 'root';
    const servicePath = `/etc/systemd/system/${serviceName}.service`;
    const envPath = `/etc/${serviceName}.env`;
    const scriptDir = installPath.replace(/\/[^/]+$/, '');

    const command = [
      `mkdir -p ${shellQuote(scriptDir)}`,
      `test -f /tmp/aix-rootops-agent.js && cp /tmp/aix-rootops-agent.js ${shellQuote(installPath)} || true`,
      `chmod +x ${shellQuote(installPath)}`,
      `cat > ${shellQuote(envPath)} <<'EOF'`,
      `ROOTOPS_AGENT_TOKEN=${token}`,
      `ROOTOPS_AGENT_HOST=127.0.0.1`,
      `ROOTOPS_AGENT_PORT=${port}`,
      `EOF`,
      `chmod 600 ${shellQuote(envPath)}`,
      `cat > ${shellQuote(servicePath)} <<'EOF'`,
      `[Unit]`,
      `Description=AIX RootOps Remote Agent`,
      `After=network.target`,
      ``,
      `[Service]`,
      `Type=simple`,
      `User=${user}`,
      `EnvironmentFile=${envPath}`,
      `ExecStart=/usr/bin/env node ${installPath} serve`,
      `Restart=always`,
      `RestartSec=3`,
      `NoNewPrivileges=false`,
      ``,
      `[Install]`,
      `WantedBy=multi-user.target`,
      `EOF`,
      `systemctl daemon-reload`,
      `systemctl enable ${shellQuote(serviceName)}`,
      `systemctl restart ${shellQuote(serviceName)}`,
      `systemctl --no-pager --full status ${shellQuote(serviceName)} | head -80`
    ].join('\n');

    const result = await this.remote.sshExec(input.target, command, { timeoutMs: 120000 });
    return { ...result, serviceName, servicePath, envPath, installPath, port, token };
  }

  async action(target: SshTarget, serviceName = 'aix-rootops-agent', action: 'start' | 'stop' | 'status'): Promise<unknown> {
    const command = action === 'status'
      ? `systemctl --no-pager --full status ${shellQuote(serviceName)} | head -120`
      : `systemctl ${action} ${shellQuote(serviceName)} && systemctl --no-pager --full status ${shellQuote(serviceName)} | head -80`;
    return this.remote.sshExec(target, command, { timeoutMs: 120000 });
  }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
