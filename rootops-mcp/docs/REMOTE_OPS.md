# Remote Ops

Phase 4 remote operations layer.

## Tools

Basic:

- `remote.session.open`
- `remote.session.list`
- `remote.session.close`
- `remote.exec`
- `remote.rsync_push`
- `remote.rsync_pull`
- `remote.group.register`
- `remote.group.exec`

Streaming:

- `remote.exec_stream.start`
- `remote.exec_stream.read`
- `remote.exec_stream.kill`
- `remote.exec_stream.list`

Pseudo PTY:

- `remote.pty.open`
- `remote.pty.write`
- `remote.pty.read`
- `remote.pty.close`
- `remote.pty.list`

Tunnels:

- `remote.tunnel.open`
- `remote.tunnel.list`
- `remote.tunnel.close`

Remote agent:

- `remote.agent.bootstrap`

## Target shape

```json
{
  "host": "example.com",
  "user": "root",
  "port": 22,
  "identityFile": "/root/.ssh/id_rsa"
}
```

## SSH tunnel

```json
{
  "target": { "host": "example.com", "user": "root" },
  "local_host": "127.0.0.1",
  "local_port": 15432,
  "remote_host": "127.0.0.1",
  "remote_port": 5432
}
```

Close:

```json
{
  "tunnel_id": "tun_..."
}
```

## Remote agent bootstrap

```json
{
  "target": { "host": "example.com", "user": "root" },
  "install_path": "/tmp/aix-rootops-agent.sh"
}
```

The first agent version supports:

```bash
/tmp/aix-rootops-agent.sh health
/tmp/aix-rootops-agent.sh hash /path/file
/tmp/aix-rootops-agent.sh stat /path/file
/tmp/aix-rootops-agent.sh which rg git node python3
```

## Current limitations

- Pseudo PTY uses ssh stdin/stdout pipes, not `node-pty`.
- Sessions, tunnels, and server groups are in-memory.
- Remote agent is a lightweight shell helper, not a full daemon yet.
