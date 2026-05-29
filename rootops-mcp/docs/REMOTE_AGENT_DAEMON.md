# Remote Agent Daemon

`remote.agent.bootstrap` now installs and starts a lightweight Node.js HTTP daemon on the remote host.

## Install/start

```json
{
  "target": { "host": "example.com", "user": "root" },
  "install_path": "/tmp/aix-rootops-agent.js"
}
```

The result returns:

- `installPath`
- `port`
- `token`
- `pidFile`
- `logFile`
- `probe`

Default port:

```text
18765
```

Override from the MCP host before starting the server:

```text
ROOTOPS_REMOTE_AGENT_PORT=18765
```

## HTTP API

The daemon binds to `127.0.0.1` on the remote host. Access it through SSH tunnel or local remote execution.

Auth:

```text
Authorization: Bearer <token>
```

Endpoints:

- `GET /health`
- `GET /v1/hash?path=/path/file`
- `GET /v1/read?path=/path/file&offset=0&length=65536`
- `GET /v1/search?root=/opt/app&q=query&max=50`
- `POST /v1/exec` with `{ "command": "uptime", "cwd": "/opt/app", "timeoutMs": 300000 }`

## CLI compatibility

The installed script also supports:

```bash
/tmp/aix-rootops-agent.js health
/tmp/aix-rootops-agent.js hash /path/file
/tmp/aix-rootops-agent.js stat /path/file
/tmp/aix-rootops-agent.js which rg git node python3
```

## Safety

The daemon has token authentication and a small destructive-command blocklist. It is still a high-permission remote component. Keep it bound to `127.0.0.1` and access it through SSH tunnels.
