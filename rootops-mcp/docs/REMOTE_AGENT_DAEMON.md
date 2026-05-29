# Remote Agent Daemon

`remote.agent.bootstrap` installs and starts a lightweight Node.js HTTP daemon on the remote host.

## Bootstrap with nohup

```json
{
  "target": { "host": "example.com", "user": "root" },
  "install_path": "/tmp/aix-rootops-agent.js"
}
```

The result returns `installPath`, `port`, `token`, `pidFile`, `logFile`, and `probe`.

## Systemd install

For persistence across reboots:

```json
{
  "target": { "host": "example.com", "user": "root" },
  "install_path": "/opt/aix-rootops-agent/aix-rootops-agent.js",
  "service_name": "aix-rootops-agent",
  "port": 18765,
  "user": "root"
}
```

Tools:

- `remote.agent.systemd_install`
- `remote.agent.systemd_start`
- `remote.agent.systemd_stop`
- `remote.agent.systemd_status`

## Client tools

After exposing the remote agent through an SSH tunnel, use:

- `remote.agent.health`
- `remote.agent.hash`
- `remote.agent.read`
- `remote.agent.search`
- `remote.agent.exec`

Example tunnel:

```json
{
  "target": { "host": "example.com", "user": "root" },
  "local_port": 18765,
  "remote_port": 18765
}
```

Then call:

```json
{
  "base_url": "http://127.0.0.1:18765",
  "token": "ra_..."
}
```

## HTTP API

The daemon binds to `127.0.0.1` on the remote host.

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

## Safety

The daemon has token authentication and a small destructive-command blocklist. It is still a high-permission remote component. Keep it bound to `127.0.0.1` and access it through SSH tunnels.
