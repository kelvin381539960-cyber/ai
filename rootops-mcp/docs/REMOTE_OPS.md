# Remote Ops

Phase 4 introduces the first remote operations layer.

## Tools

- `remote.session.open`
- `remote.session.list`
- `remote.session.close`
- `remote.exec`
- `remote.rsync_push`
- `remote.rsync_pull`
- `remote.group.register`
- `remote.group.exec`

## Target shape

```json
{
  "host": "example.com",
  "user": "root",
  "port": 22,
  "identityFile": "/root/.ssh/id_rsa"
}
```

## Execute command

```json
{
  "target": {
    "host": "example.com",
    "user": "root"
  },
  "command": "uptime"
}
```

## Session flow

```json
{
  "target": {
    "host": "example.com",
    "user": "root"
  },
  "cwd": "/opt/app"
}
```

Then:

```json
{
  "session_id": "ssh_...",
  "command": "git status"
}
```

## Safety

`remote.exec` screens commands with a blocklist and high-risk detector.

Blocked examples:

- `rm -rf /`
- `mkfs`
- `shutdown`
- `reboot`
- `chmod -R 777`

High-risk examples are allowed at the command-risk layer but should be controlled by policy/profile in production:

- `sudo`
- `systemctl restart`
- `git push`
- database destructive SQL

## Current limitations

- Sessions are in-memory records, not persistent PTY shells.
- Streaming exec is not implemented yet.
- Server groups are in-memory.
- Tunnels are not implemented yet.
