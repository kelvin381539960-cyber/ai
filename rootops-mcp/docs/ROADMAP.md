# Roadmap

## Phase 0: Scaffold

- [x] Project skeleton
- [x] Policy engine skeleton
- [x] Tool profile skeleton
- [x] Local model sidecar skeleton
- [x] File engine skeleton
- [x] Patch engine skeleton
- [x] Remote ops skeleton

## Phase 1: Real MCP server

- [x] Add MCP SDK server transport
- [x] Register read-only tools
- [x] Register local intelligence tools
- [x] Add JSON schema validation
- [x] Add structured error format
- [x] Persist audit log to disk
- [x] Add MCP client config examples
- [x] Add local smoke script

## Phase 2: File intelligence

- [x] Basic file.read with line window and byte budget
- [x] Basic file.search with glob, regex, context, byte cap
- [x] ripgrep backend
- [x] cursor pagination
- [x] read_many with byte budget
- [x] lightweight file.outline
- [x] context_pack
- [x] tree-sitter outline backend with regex fallback
- [x] SQLite FTS5 index core
- [x] register file.index_* MCP handlers
- [x] embedding index

## Phase 3: Patch transaction

- [x] snapshot provider
- [x] unified diff preview
- [x] expected_hash dry-run
- [x] local_patch_risk hook
- [x] apply patch tool
- [x] verify step
- [x] rollback/restore step
- [x] batch patch plan

## Phase 4: Remote ops

- [x] SSH exec
- [x] basic session records
- [x] rsync pull
- [x] rsync push
- [x] server groups
- [x] command risk screening
- [x] streaming exec
- [x] pseudo PTY sessions
- [x] tunnel management
- [x] remote agent bootstrap
- [x] real remote agent daemon

## Phase 5: Low-friction authorization

- [x] task scope creation
- [x] merged confirmation payload
- [x] risk threshold limits
- [x] audit export
- [x] emergency freeze
- [x] explicit approval token apply flow
- [x] persistent task scopes
- [x] persistent confirmation queue

## Phase 6: Intelligence upgrades

- [x] tree-sitter outline backend with regex fallback
- [x] SQLite FTS5 index core
- [x] file.index_* MCP handler wiring
- [x] embedding index
- [x] real remote agent daemon

## Phase 7: Hardening

- [ ] systemd service template for remote agent
- [ ] remote agent client tools
- [ ] install/test CI scripts
- [ ] typed integration tests
