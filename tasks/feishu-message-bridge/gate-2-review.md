# Feishu Message Bridge - Gate 2 MVP Design Review

## 1. Review Scope

Reviewed files:

- module-structure.md
- db-schema.md
- api-design.md
- openapi.yaml
- collector-design.md
- harness-plan.md
- security-boundary.md
- decisions.md
- handoff.md

Review goal:

Determine whether the project can move from design artifacts into implementation planning.

---

## 2. Overall Result

Status: Conditional Pass

Allowed next phase:

- Code implementation planning
- Repository scaffolding
- Synthetic fixtures
- Mock harness setup

Not allowed yet:

- Real environment validation
- Broad sync jobs
- Production data import
- Large initial import

---

## 3. Architecture Review

Result: Pass

Findings:

- Module separation is clear: collector, bridge-service, shared, action-schema, infra, harness.
- Threaded conversation support has dedicated modules.
- Cloud and local responsibilities remain separated.

Required follow-up:

- Create actual repository scaffold when implementation begins.

---

## 4. Data Model Review

Result: Conditional Pass

Findings:

- Core tables are identified.
- Thread tables are present.
- Dedup and cursor concepts are present.

Gaps before database implementation:

- db-schema.md is still high-level.
- Need SQL migration draft.
- Need explicit unique constraints.
- Need indexes for thread search.

Must-fix before DB code:

- Create migration draft for messages, threads, thread_items, cursors, sync_locks, devices, sync_batches.

---

## 5. API Review

Result: Pass for design

Findings:

- openapi.yaml exists.
- Message and thread endpoints exist.
- Responses are bounded.
- Health endpoint is unauthenticated.
- Non-health APIs use bearer auth.

Required follow-up:

- Add example requests and responses during implementation.
- Validate OpenAPI against implementation in API harness.

---

## 6. Collector Review

Result: Conditional Pass

Findings:

- Allowlist policy is explicit.
- Cursor update rule is clear.
- Thread support is V1 required.
- OCR flow is bounded.
- Upload retry is idempotent by design.

Gaps before collector code:

- Runtime platform needs confirmation: macOS only or macOS + Windows.
- Browser session strategy needs implementation detail.
- Selector abstraction must be isolated in adapter files.

---

## 7. Harness Review

Result: Pass

Findings:

- Harness categories cover collector, thread, sync, OCR, API, and boundary tests.
- Fixtures are synthetic-only.
- Live external pages are not required for unit tests.

Required follow-up:

- Add fixture files during implementation.
- Add test commands to package scripts.

---

## 8. Security Boundary Review

Result: Pass

Findings:

- Repository boundary is explicit.
- Local runtime boundary is explicit.
- Cloud boundary is explicit.
- Logging and config rules are explicit.
- Business data must not enter Git.

Required follow-up:

- Add .gitignore during scaffold.
- Add config templates with placeholder values only.
- Add boundary harness checks.

---

## 9. Threaded Conversation Capability Review

Result: Pass

Findings:

- Thread capability is now V1 scope.
- Thread search, detail, summary, and task extraction endpoints are included.
- Thread harness exists.
- Collector design includes thread reconstruction.

Required follow-up:

- Make thread reconstruction part of first implementation milestone, not a later enhancement.

---

## 10. Open Questions Before Implementation

| ID | Question | Recommendation |
|---|---|---|
| OQ-001 | Initial import window | Core 90 days, normal 30 days |
| OQ-002 | Runtime platform | Start with macOS first unless Windows is required immediately |
| OQ-003 | DB | PostgreSQL from start |
| OQ-004 | Semantic search | Postpone until keyword search works |

---

## 11. Gate 2 Decision

Gate 2 Result: Conditional Pass

The project may move into implementation planning and repository scaffolding.

Implementation must start with:

1. Scaffold packages and docs.
2. Add config templates and .gitignore.
3. Add synthetic fixtures.
4. Add mock harness skeleton.
5. Add database migration draft.
6. Add OpenAPI validation test.

Do not run real validation yet.
