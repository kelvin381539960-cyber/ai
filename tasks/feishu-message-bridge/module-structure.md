# Feishu Message Bridge - Module Structure

## 1. Purpose

Define the intended code and documentation layout before implementation.

This file is a design artifact only. It does not create runtime code.

---

## 2. Proposed Repository Layout

```text
feishu-message-bridge/
├─ packages/
│  ├─ collector/
│  │  ├─ src/
│  │  │  ├─ runtime/
│  │  │  ├─ browser/
│  │  │  ├─ scanner/
│  │  │  ├─ parser/
│  │  │  ├─ thread/
│  │  │  ├─ ocr/
│  │  │  ├─ cursor/
│  │  │  ├─ uploader/
│  │  │  └─ config/
│  │  └─ tests/
│  │
│  ├─ bridge-service/
│  │  ├─ src/
│  │  │  ├─ api/
│  │  │  ├─ ingest/
│  │  │  ├─ sync-lock/
│  │  │  ├─ dedup/
│  │  │  ├─ search/
│  │  │  ├─ threads/
│  │  │  ├─ summary/
│  │  │  ├─ auth/
│  │  │  ├─ db/
│  │  │  └─ config/
│  │  └─ tests/
│  │
│  ├─ shared/
│  │  ├─ src/
│  │  │  ├─ schema/
│  │  │  ├─ types/
│  │  │  ├─ hashing/
│  │  │  ├─ validation/
│  │  │  └─ errors/
│  │  └─ tests/
│  │
│  └─ action-schema/
│     ├─ openapi.yaml
│     └─ examples/
│
├─ infra/
│  ├─ docker/
│  ├─ nginx/
│  ├─ systemd/
│  └─ migrations/
│
├─ harness/
│  ├─ fixtures/
│  ├─ collector/
│  ├─ sync/
│  ├─ ocr/
│  ├─ api/
│  ├─ threads/
│  └─ boundary/
│
├─ docs/
│  ├─ architecture.md
│  ├─ collector-design.md
│  ├─ api-design.md
│  ├─ db-schema.md
│  ├─ harness-plan.md
│  └─ security-boundary.md
│
└─ README.md
```

---

## 3. Package Responsibilities

## 3.1 collector

Local runtime package.

Responsibilities:

- runtime startup
- local session handling
- allowlist loading
- conversation scanning
- item parsing
- threaded structure reconstruction
- OCR processing
- local cursor management
- batch upload
- local temporary cleanup

Must not:

- own long-term global storage
- expose GPT Action APIs
- store production data in Git

---

## 3.2 bridge-service

Cloud service package.

Responsibilities:

- sync lock
- batch ingest
- deduplication
- database persistence
- thread reconstruction verification
- keyword search
- thread search
- summary APIs
- GPT Action APIs
- auth and rate limits

---

## 3.3 shared

Shared schema and utility package.

Responsibilities:

- normalized item types
- shared validators
- hash functions
- error types
- API response types

---

## 3.4 action-schema

GPT Action contract package.

Responsibilities:

- OpenAPI schema
- example requests
- example responses
- schema validation fixtures

---

## 4. Threaded Conversation Support

Thread support must be treated as a first-class module, not an afterthought.

Required modules:

```text
collector/src/thread/
bridge-service/src/threads/
harness/threads/
```

Required concepts:

- thread_key
- root_item_key
- parent_item_key
- reply_count
- last_reply_at
- thread_title

---

## 5. Harness Placement

Harness must be outside implementation packages so tests can verify modules without relying on real external pages.

Required harness areas:

- collector parser harness
- thread reconstruction harness
- sync lock harness
- dedup harness
- OCR harness
- API harness
- boundary harness

---

## 6. Gate 2 Acceptance

This module structure passes Gate 2 only if:

- collector, service, shared, and action schema are separated
- thread support has dedicated modules
- harness has dedicated fixtures
- implementation code has not mixed docs, runtime data, or secrets
