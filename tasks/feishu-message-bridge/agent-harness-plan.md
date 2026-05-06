# Agent and Harness Plan

## Purpose

This file defines how future agents should execute the Feishu Message Bridge task.

## Required Reading Order

1. README.md
2. task-ledger.md
3. agent-harness-plan.md
4. handoff.md

## Agents

### PM Agent

- Maintain scope.
- Maintain task ledger.
- Track gaps.
- Stop at stage gates.

### Architecture Agent

- Design local collector, cloud service, database, index, and GPT Action.
- Keep module boundaries explicit.

### Security Agent

- Review configuration, storage, logs, and API output limits.
- Ensure repository stores code and documents only.

### Collector Agent

- Design local collection workflow.
- Design cursor, retry, local cache, and upload flow.

### Backend Agent

- Design cloud API, sync lock, dedup, storage, and search.

### Data Model Agent

- Design unified message schema.
- Support text, rich text, link, quote, and OCR text.

### GPT Action Agent

- Design OpenAPI schema.
- Provide search, summary, tasks, and sync request endpoints.

### Harness Agent

- Design mock tests for every module.
- Do not depend on live external pages for unit tests.

## Harness Areas

### Collector Harness

- Mock conversation list.
- Mock message list.
- Cursor stop condition.
- Duplicate content handling.
- OCR task creation.

### Sync Harness

- Device A gets lock.
- Device B fails to get lock.
- Expired lock can be reused.
- Duplicate upload is ignored.

### OCR Harness

- OCR success.
- OCR failure.
- Empty OCR result.
- Temporary file cleanup.

### API Harness

- Search endpoint.
- Summary endpoint.
- Task extraction endpoint.
- Sync request endpoint.
- Auth failure.

### Boundary Harness

- No business data in repository.
- No secrets in config templates.
- Logs are redacted.
- API responses are limited.

## Stage Gates

### Gate 1: Architecture Review

Required files:

- architecture.md
- decisions.md
- implementation-plan.md
- handoff.md

### Gate 2: MVP Design Review

Required artifacts:

- module structure
- API schema
- DB schema
- harness plan

### Gate 3: Collector MVP Review

Required checks:

- parser mock tests pass
- cursor logic passes
- cleanup logic passes

### Gate 4: Cloud API Review

Required checks:

- sync lock tests pass
- dedup tests pass
- search tests pass
- OpenAPI schema matches implementation

### Gate 5: Limited Validation

Required checks:

- only small allowlist scope
- short time window
- issues recorded in handoff.md
