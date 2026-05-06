# Feishu Message Bridge - Implementation Plan

## 1. Execution Strategy

The project follows:

```text
Architecture First
→ Harness First
→ Mock First
→ Limited Validation
→ Gradual Expansion
```

No direct large-scale implementation before:

- architecture review
- harness review
- storage boundary review
- GPT Action review

---

## 2. Milestones

| Milestone | Goal | Status |
|---|---|---|
| M1 | SSOT setup | In Progress |
| M2 | Architecture and planning | In Progress |
| M3 | Harness and schema design | Todo |
| M4 | Collector MVP | Todo |
| M5 | Cloud API MVP | Todo |
| M6 | GPT Action MVP | Todo |
| M7 | Limited validation | Todo |
| M8 | Operational hardening | Todo |

---

## 3. Phase Breakdown

## Phase 1 - SSOT and Planning

Goal:

- establish project structure
- establish Agent workflow
- establish handoff rules
- establish architecture baseline

Deliverables:

- README.md
- task-ledger.md
- decisions.md
- handoff.md
- architecture.md
- implementation-plan.md
- agent-harness-plan.md

Exit Criteria:

- Gate 1 review passes
- user confirms architecture direction

---

## Phase 2 - Schema and Harness Design

Goal:

- define data structures
- define API contracts
- define test strategy

Deliverables:

- message schema
- DB schema
- OpenAPI schema
- mock harness plan
- sync lock design
- dedup design

Exit Criteria:

- Gate 2 review passes
- all critical flows have harness coverage

---

## Phase 3 - Collector MVP

Goal:

- build local collector prototype
- verify incremental scan logic
- verify OCR pipeline

Scope:

- allowlist conversations only
- small time window only
- no large-scale scan

Deliverables:

- local runtime manager
- conversation scanner
- message parser
- OCR worker
- upload client
- local cursor store

Required Harness:

- parser harness
- scroll harness
- OCR harness
- retry harness

Exit Criteria:

- Gate 3 passes
- parser works against mock structures
- OCR flow works locally

---

## Phase 4 - Cloud API MVP

Goal:

- receive uploaded batches
- deduplicate records
- expose query APIs

Deliverables:

- ingest API
- sync lock API
- PostgreSQL schema
- keyword search
- result pagination
- operational logging

Required Harness:

- dedup harness
- lock harness
- API auth harness
- pagination harness

Exit Criteria:

- Gate 4 passes
- Action-compatible API available

---

## Phase 5 - GPT Action MVP

Goal:

- connect Custom GPT with cloud APIs
- verify bounded query and summary workflow

Deliverables:

- OpenAPI schema
- Action auth
- search endpoint
- summary endpoint
- task extraction endpoint
- sync request endpoint

Required Harness:

- Action schema validation
- bounded response validation
- query filter validation

Exit Criteria:

- GPT can search indexed records
- GPT can summarize limited scoped data

---

## Phase 6 - Limited Validation

Goal:

- validate end-to-end workflow safely

Validation scope:

- 1 to 2 allowlist conversations
- short time window
- one local device first
- low-frequency sync

Validation items:

- incremental sync
- dedup
- OCR search
- Action query
- operational logs

Exit Criteria:

- no critical operational issue
- no uncontrolled data growth
- no repeated duplicate ingestion

---

## Phase 7 - Multi-device Validation

Goal:

- validate dual-device operation

Validation items:

- sync lock behavior
- lock expiration
- duplicate uploads
- conflict handling
- cursor continuity

Exit Criteria:

- stable switching between two devices
- no repeated large sync loops

---

## Phase 8 - Operational Hardening

Goal:

- improve stability and maintainability

Potential additions:

- structured monitoring
- retry queue
- dead-letter queue
- semantic search
- topic clustering
- project classification
- attachment parsing
- admin dashboard

---

## 4. Risk Register

| Risk ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-001 | unstable page structure | High | parser abstraction + harness |
| R-002 | repeated duplicate ingestion | High | cloud dedup + sync lock |
| R-003 | local runtime interruption | Medium | cursor persistence + retry |
| R-004 | OCR cost explosion | Medium | OCR allowlist + batching |
| R-005 | oversized API responses | Medium | bounded pagination |
| R-006 | uncontrolled storage growth | Medium | retention policy + limits |
| R-007 | multi-device conflict | High | lock TTL + canonical cursor |

---

## 5. Recommended Tech Stack

| Layer | Recommendation |
|---|---|
| Collector Runtime | Node.js + Playwright |
| OCR | PaddleOCR |
| Cloud API | Node.js / NestJS or Fastify |
| Database | PostgreSQL |
| Search | PostgreSQL FTS |
| Semantic Search | pgvector (optional V1) |
| Queue | optional later |
| Deployment | Tencent Cloud Linux |

---

## 6. Review Policy

Every phase requires:

- implementation review
- harness review
- storage boundary review
- rollback review
- handoff update

No phase can skip review.

---

## 7. Handoff Policy

Every completed phase must update:

- task-ledger.md
- decisions.md
- handoff.md

Codex or future agents must not rely on chat history.
