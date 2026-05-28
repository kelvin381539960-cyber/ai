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

## Target shape

```json
{
  "host": "example.com",
  "user": "root",
  "port": 22,
  "identityFile": "/root/.ssh/id_rsa"
}
```

## Streaming command

```json
{
  "target": { "host": "example.com", "user": "root" },
  "command": "tail -f /var/log/syslog"
}
```

Read:

```json
{
  "stream_id": "stream_...",
  "clear": true
}
```

Kill:

```json
{
  "stream_id": "stream_...",
  "signal": "SIGTERM"
}
```

## Pseudo PTY

Open:

```json
{
  "target": { "host": "example.com", "user": "root" },
  "cwd": "/opt/app"
}
```

Write:

```json
{
  "pty_id": "pty_...",
  "input": "git status\n"
}
```

Read:

```json
{
  "pty_id": "pty_...",
  "clear": true
}
```

## Safety

`remote.exec` and `remote.exec_stream.start` screen commands with a blocklist and high-risk detector.

Blocked examples:

- `rm -rf /`
- `mkfs`
- `shutdown`
- `reboot`
- `chmod -R 777`

## Current limitations

- Pseudo PTY uses ssh stdin/stdout pipes, not `node-pty`.
- Sessions are in-memory.
- Server groups are in-memory.
- Tunnels are not implemented yet.
- Remote agent bootstrap is not implemented yet.
