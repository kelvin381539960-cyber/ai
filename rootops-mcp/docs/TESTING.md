# Testing

## Local checks

```bash
npm run check
npm run smoke
npm run smoke:policy
npm run smoke:agent-client
npm test
npm run ci
```

## What the tests cover

- `npm run check`: TypeScript type check.
- `npm run smoke`: existing MCP/file/search/context smoke path.
- `npm run smoke:policy`: task policy defaults and dangerous-tool confirmation behavior.
- `npm run smoke:agent-client`: remote agent HTTP client against a local mock server.

## GitHub Actions

The workflow is located at:

```text
.github/workflows/ci.yml
```

It runs for changes under `rootops-mcp/**`.

## Notes

Optional native packages such as `tree-sitter` parsers and `better-sqlite3` may fail on some machines. Core tests should still identify whether the TypeScript surface and safe smoke paths remain valid.
