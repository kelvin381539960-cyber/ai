# Remote Agent Lifecycle Tools

This document covers the systemd lifecycle tools for the remote RootOps agent.

## Tools

- `remote.agent.systemd_install`
- `remote.agent.systemd_start`
- `remote.agent.systemd_stop`
- `remote.agent.systemd_status`
- `remote.agent.systemd_uninstall`
- `remote.agent.systemd_rotate_token`

## Uninstall

```json
{
  "target": { "host": "example.com", "user": "root" },
  "service_name": "aix-rootops-agent"
}
```

The uninstall path stops and disables the service, removes:

```text
/etc/systemd/system/<service>.service
/etc/<service>.env
```

Then runs:

```bash
systemctl daemon-reload
```

It intentionally does not delete the installed agent script under `/opt/aix-rootops-agent` unless a future purge tool is added.

## Rotate token

```json
{
  "target": { "host": "example.com", "user": "root" },
  "service_name": "aix-rootops-agent"
}
```

Optional explicit token:

```json
{
  "target": { "host": "example.com", "user": "root" },
  "service_name": "aix-rootops-agent",
  "new_token": "ra_custom_token"
}
```

The tool updates:

```text
/etc/<service>.env
```

Then restarts the service and returns the new token.

## Integration note

The base implementation lives in:

```text
src/remote/remote-agent-systemd.ts
```

The MCP wiring helper lives in:

```text
src/mcp/systemd-lifecycle-wiring.ts
```

If the main `server.ts` uses modular wiring, import `isSystemdLifecycleTool` and `callSystemdLifecycleTool` and dispatch before the main switch.
