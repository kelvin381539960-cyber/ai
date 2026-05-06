# Feishu Message Bridge - Handoff

## Current Phase

Phase: Phase 4A - Mock Module Implementation
Status: Ready to Start

---

## Completed

- Created task directory.
- Created README.md.
- Created task-ledger.md.
- Created agent-harness-plan.md.
- Created decisions.md.
- Created handoff.md.
- Created architecture.md.
- Created implementation-plan.md.
- Created gate-1-review.md.
- Created module-structure.md.
- Created db-schema.md.
- Created api-design.md.
- Created openapi.yaml.
- Created collector-design.md.
- Created harness-plan.md.
- Created security-boundary.md.
- Created prompts.md.
- Created gate-2-review.md.
- Created implementation-task-list.md.
- Created scaffold-plan.md.
- Created migration-plan.md.
- Created fixture-plan.md.
- Created code scaffold under feishu-message-bridge/.
- Created safe config templates.
- Created synthetic fixtures.
- Created mock harness skeletons.
- Created initial PostgreSQL migration draft.
- Created gate-3-review.md.

---

## Current Architecture Direction

```text
Local Device A Collector
Local Device B Collector
        ↓
Tencent Cloud Bridge Service
        ↓
Storage / Index / GPT Action API
```

Confirmed V1 capabilities:

- Two local Collectors.
- Tencent Cloud Bridge Service.
- Allowlist scope.
- Incremental sync.
- Image OCR text extraction.
- Threaded conversation support.
- GPT Action APIs for search, summary, work item extraction, and sync request.

---

## Gate Status

Gate 1: Conditional Pass
Gate 2: Conditional Pass
Gate 3: Conditional Pass

Allowed next:

- shared schema validation
- hash / dedup helper
- thread reconstruction from synthetic fixtures
- in-memory sync lock mock
- API response limit helper
- OpenAPI validation hardening

Not allowed yet:

- real environment validation
- broad import
- production data import
- real browser automation
- real message collection

---

## Open Questions

### OQ-001: Initial import window

Current recommendation:

- Core conversations: 90 days.
- Normal conversations: 30 days.

### OQ-002: Collector runtime environment

Current recommendation:

- macOS first.
- Windows support later if needed.

### OQ-003: Database choice

Current recommendation:

- PostgreSQL from start.
- PostgreSQL FTS for V1 search.
- pgvector optional after keyword search is stable.

---

## Next Recommended Step

Start Phase 4A: Mock Module Implementation.

Recommended order:

1. Shared validation helpers.
2. Hash / dedup helper.
3. Thread reconstruction function.
4. In-memory sync lock mock.
5. API response limit helper.
6. OpenAPI validation hardening.
7. Gate 4 mock implementation review.

Codex / Agent handoff note:

Do not use chat history as execution source. Read README.md, task-ledger.md, decisions.md, handoff.md, gate-3-review.md, and implementation-task-list.md first.
