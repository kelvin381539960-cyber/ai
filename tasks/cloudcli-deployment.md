# CloudCLI Deployment Runbook

## Current Deployment

- Server: `43.133.44.67`
- OS: Ubuntu 24.04
- Runtime: Node.js 22.22.2, npm 10.9.7
- CloudCLI: 1.32.0
- Service user: `cloudcli`
- systemd service: `cloudcli.service`
- Remote bind: `127.0.0.1:3101`
- Local access: SSH tunnel to `localhost:3001`

## Local Access

Open an SSH tunnel:

```bash
ssh -L 3001:127.0.0.1:3101 root@43.133.44.67
```

Then open:

```text
http://localhost:3001
```

Do not expose CloudCLI directly on the public internet.

## Server Operations

Check service:

```bash
ssh root@43.133.44.67 'systemctl status cloudcli.service'
```

Restart service:

```bash
ssh root@43.133.44.67 'systemctl restart cloudcli.service'
```

View logs:

```bash
ssh root@43.133.44.67 'journalctl -u cloudcli.service -n 120 --no-pager'
```

## Installed CLI Tools

The service runs as the `cloudcli` user. Verify tools with:

```bash
ssh root@43.133.44.67 'sudo -u cloudcli -H bash -lc "export PATH=/var/lib/cloudcli/.local/bin:$PATH; cursor-agent --version; codex --version; claude --version"'
```

Installed tools:

- Cursor Agent
- Codex CLI
- Claude Code CLI

Account login is still required for each tool before real use.

## Login Notes

Run login commands as the `cloudcli` user so CloudCLI can reuse the saved session:

```bash
ssh root@43.133.44.67
sudo -u cloudcli -H bash
export PATH=/var/lib/cloudcli/.local/bin:$PATH
cursor-agent
codex
claude
```

Follow each tool's interactive login flow. Do not store tokens or API keys in this repository.

## Paths

- CloudCLI data: `/var/lib/cloudcli/.cloudcli/auth.db`
- CloudCLI workspaces: `/srv/cloudcli/workspaces`
- User-local CLI bin: `/var/lib/cloudcli/.local/bin`
- CloudCLI package: `/usr/lib/node_modules/@cloudcli-ai/cloudcli`

