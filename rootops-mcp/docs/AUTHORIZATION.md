# Authorization and Safety

Current default mode is maximum-permission internal test mode.

## Default behavior

The default task scope uses:

```json
{
  "allowedRoots": ["/"],
  "autoAllow": ["*"],
  "requiresConfirm": [],
  "ttl": "365 days"
}
```

This means normal MCP tools are allowed without confirmation during internal testing.

## Still blocked

`approval.bypass` remains blocked because it must not be model-callable.

## Still retained

Even in maximum-permission mode, these remain available:

- audit logging
- emergency freeze
- patch hash checks
- snapshots
- rollback/restore tools
- approval token flow for future restricted scopes

## Emergency freeze

Use:

```json
{
  "reason": "manual freeze"
}
```

with `safety.freeze` to stop non-readonly execution.

## Switching back to restricted mode

Replace the default scope with explicit `autoAllow` and `requiresConfirm` lists, and restore dangerous tools in `DANGEROUS_TOOL_NAMES`.
