# Feishu Message Bridge - Implementation Task List

## 1. Current Phase

Phase: Implementation Planning
Status: In Progress

Gate status:

- Gate 1: Conditional Pass
- Gate 2: Conditional Pass

Allowed work:

- implementation planning
- repository scaffolding
- synthetic fixtures
- mock harness setup
- migration draft

Not allowed yet:

- real environment validation
- broad import
- production data import

---

## 2. Implementation Milestones

| Milestone | Goal | Status |
|---|---|---|
| I-001 | Create implementation plans | Doing |
| I-002 | Create code scaffold | Todo |
| I-003 | Add synthetic fixtures | Todo |
| I-004 | Add mock harness skeleton | Todo |
| I-005 | Add database migration draft | Todo |
| I-006 | Add OpenAPI validation harness | Todo |
| I-007 | Run Gate 3 scaffold review | Todo |

---

## 3. Task Breakdown

### I-001: Implementation planning files

Status: Doing
Owner: PM Agent

Outputs:

- implementation-task-list.md
- scaffold-plan.md
- migration-plan.md
- fixture-plan.md

Acceptance:

- next implementation steps are explicit
- no runtime code is created yet

---

### I-002: Repository scaffold

Status: Todo
Owner: Architecture Agent / Backend Agent / Collector Agent

Outputs:

```text
feishu-message-bridge/
├─ packages/collector/
├─ packages/bridge-service/
├─ packages/shared/
├─ packages/action-schema/
├─ harness/
├─ infra/
└─ docs/
```

Acceptance:

- directories exist
- package boundary is clear
- no production data exists
- .gitignore exists

---

### I-003: Config templates

Status: Todo
Owner: Security Agent

Outputs:

- .env.example
- collector allowlist template
- bridge service config template

Acceptance:

- placeholders only
- no real tokens
- no real workspace names

---

### I-004: Synthetic fixtures

Status: Todo
Owner: Harness Agent

Outputs:

- conversations fixture
- messages fixture
- threaded fixture
- OCR fixture
- API fixture

Acceptance:

- synthetic-only data
- covers text, image, link, quote, file, unknown
- covers threaded root and reply cases

---

### I-005: Mock harness skeleton

Status: Todo
Owner: Harness Agent

Outputs:

- collector harness skeleton
- thread harness skeleton
- sync harness skeleton
- OCR harness skeleton
- API harness skeleton
- boundary harness skeleton

Acceptance:

- test commands documented
- no live external page dependency

---

### I-006: Database migration draft

Status: Todo
Owner: Data Model Agent

Outputs:

- SQL migration draft
- indexes
- unique constraints

Acceptance:

- messages table
- threads table
- thread_items table
- devices table
- sync_batches table
- sync_locks table
- cursors table

---

### I-007: OpenAPI validation harness

Status: Todo
Owner: GPT Action Agent / Harness Agent

Outputs:

- OpenAPI schema validation script
- example requests
- example responses

Acceptance:

- schema can be validated locally
- examples align with openapi.yaml

---

## 4. First Implementation Sequence

Recommended order:

1. Create scaffold.
2. Add .gitignore and config templates.
3. Add synthetic fixtures.
4. Add shared schema stubs.
5. Add harness skeleton.
6. Add migration draft.
7. Add OpenAPI validation.
8. Run scaffold review.

---

## 5. Gate 3 Entry Criteria

Gate 3 review can start only after:

- scaffold exists
- fixtures exist
- harness skeleton exists
- migration draft exists
- OpenAPI validation exists
- handoff.md is updated

---

## 6. Open Items

| ID | Item | Recommendation |
|---|---|---|
| OI-001 | Initial import window | Core 90 days, normal 30 days |
| OI-002 | Runtime platform | macOS first |
| OI-003 | Database | PostgreSQL |
| OI-004 | Semantic search | postpone |
