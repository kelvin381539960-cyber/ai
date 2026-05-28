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

- [ ] Add MCP SDK server transport
- [ ] Register read-only tools
- [ ] Register local intelligence tools
- [ ] Add JSON schema validation
- [ ] Add structured error format

## Phase 2: File intelligence

- [ ] ripgrep search
- [ ] cursor pagination
- [ ] read_many with byte budget
- [ ] tree-sitter outline
- [ ] SQLite FTS5 index
- [ ] embedding index
- [ ] context_pack

## Phase 3: Patch transaction

- [ ] snapshot provider
- [ ] unified diff preview
- [ ] expected_hash apply
- [ ] local_patch_risk integration
- [ ] verify step
- [ ] rollback step

## Phase 4: Remote ops

- [ ] SSH session pool
- [ ] streaming exec
- [ ] rsync pull
- [ ] server groups
- [ ] tunnel management
- [ ] remote agent bootstrap

## Phase 5: Low-friction authorization

- [ ] task scope creation
- [ ] merged confirmation payload
- [ ] risk threshold limits
- [ ] audit export
- [ ] emergency freeze
