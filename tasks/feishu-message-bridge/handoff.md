# Feishu Message Bridge - Handoff

## Current Phase

Phase: Architecture and Planning
Status: In Progress

---

## Completed

- Created task directory.
- Created README.md.
- Created task-ledger.md.
- Created agent-harness-plan.md.
- Created decisions.md.

---

## Pending

- architecture.md
- implementation-plan.md
- prompts.md

---

## Current Understanding

System structure:

```text
Local Device A Collector
Local Device B Collector
        ↓
Tencent Cloud Bridge Service
        ↓
Storage / Index / GPT Action API
```

Current direction:

- Local devices handle runtime collection.
- Cloud handles unified query and indexing.
- V1 focuses on allowlist scope and incremental sync.
- OCR is included for image text extraction.

---

## Open Questions

### OQ-001

Final initial scan window:

- 30 days?
- 90 days?
- Different window by conversation tier?

### OQ-002

Database selection:

- SQLite
- PostgreSQL
- PostgreSQL + pgvector

### OQ-003

Collector runtime environment:

- macOS only?
- Windows + macOS?
- Linux support?

---

## Next Recommended Step

1. Create architecture.md.
2. Create implementation-plan.md.
3. Run Architecture Review Gate.
4. Wait for user confirmation before code implementation.
