import { Buffer } from 'node:buffer';
import { RemoteOps } from './remote-ops.js';
import type { SshTarget } from './remote-types.js';

export interface AgentBootstrapResult {
  ok: boolean;
  installPath: string;
  stdout: string;
  stderr: string;
  probe?: unknown;
}

const AGENT_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail
cmd="${1:-health}"
case "$cmd" in
  health)
    printf '{"ok":true,"agent":"aix-rootops-remote-agent","ts":"%s","host":"%s"}\n' "$(date -Is)" "$(hostname)"
    ;;
  hash)
    file="${2:?file required}"
    if command -v sha256sum >/dev/null 2>&1; then
      sha256sum "$file"
    else
      shasum -a 256 "$file"
    fi
    ;;
  stat)
    file="${2:?file required}"
    stat "$file"
    ;;
  which)
    shift
    for bin in "$@"; do
      if command -v "$bin" >/dev/null 2>&1; then echo "$bin=$(command -v "$bin")"; else echo "$bin="; fi
    done
    ;;
  *)
    echo "unknown command: $cmd" >&2
    exit 2
    ;;
esac
`;

export class AgentBootstrap {
  constructor(private readonly remote = new RemoteOps()) {}

  async install(target: SshTarget, installPath = '/tmp/aix-rootops-agent.sh'): Promise<AgentBootstrapResult> {
    const encoded = Buffer.from(AGENT_SCRIPT, 'utf8').toString('base64');
    const command = [
      `cat > ${shellQuote(installPath)}.b64 <<'EOF'`,
      encoded,
      'EOF',
      `base64 -d ${shellQuote(installPath)}.b64 > ${shellQuote(installPath)}`,
      `chmod +x ${shellQuote(installPath)}`,
      `rm -f ${shellQuote(installPath)}.b64`,
      `${shellQuote(installPath)} health`
    ].join('\n');

    const result = await this.remote.sshExec(target, command, { timeoutMs: 120000 });
    return {
      ok: result.ok,
      installPath,
      stdout: result.stdout,
      stderr: result.stderr,
      probe: parseProbe(result.stdout)
    };
  }
}

function parseProbe(stdout: string): unknown {
  const line = stdout.split(/\r?\n/).find((item) => item.trim().startsWith('{'));
  if (!line) return undefined;
  try { return JSON.parse(line); } catch { return undefined; }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
