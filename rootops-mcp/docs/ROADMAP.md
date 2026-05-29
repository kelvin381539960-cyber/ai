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

## Phase 6: Intelligence upgrades

- [x] tree-sitter outline backend with regex fallback
- [x] SQLite FTS5 index core
- [x] file.index_* MCP handler wiring
- [x] embedding index
- [ ] real remote agent daemon
