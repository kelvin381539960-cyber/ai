# Harness Plan

## 1. Purpose

Define mock-first verification before implementation.

The harness must validate core logic without depending on live external pages or real business data.

---

## 2. Harness Principles

- Use synthetic fixtures only.
- Keep all fixtures safe for Git.
- Verify parser behavior with mock structures.
- Verify cloud behavior with isolated test database.
- Every implementation phase must add or update tests.

---

## 3. Fixture Layout

```text
harness/fixtures/
├─ conversations/
│  ├─ allowlist-basic.json
│  └─ allowlist-threaded.json
├─ items/
│  ├─ text-items.json
│  ├─ image-items.json
│  ├─ link-items.json
│  └─ threaded-items.json
├─ ocr/
│  ├─ image-text-success.json
│  ├─ image-text-empty.json
│  └─ image-text-failure.json
└─ api/
   ├─ search-request.json
   ├─ search-response.json
   ├─ thread-response.json
   └─ work-items-response.json
```

---

## 4. Collector Harness

Must verify:

- allowlist loading
- conversation list parsing
- item parsing
- time boundary stop condition
- cursor stop condition
- upload batch construction
- retry queue behavior
- temporary cleanup behavior

Acceptance:

- collector parser can run using fixture-only input
- no live page required for parser tests

---

## 5. Thread Harness

Must verify:

- root item detection
- reply assignment
- nested reply assignment
- deterministic fallback thread key
- thread-level aggregation
- OCR text attached to correct threaded item

Acceptance:

- given threaded-items fixture, system produces stable thread view

---

## 6. Sync Harness

Must verify:

- device A lock granted
- device B lock denied while lock active
- expired lock reused
- lock renewal
- upload after lock expiration rejected or safely handled

Acceptance:

- concurrent sync behavior is deterministic

---

## 7. Dedup Harness

Must verify:

- identical item uploaded twice is stored once
- same text at different time is not incorrectly merged
- same item from different device is stored once
- item with native id uses native id as strongest key
- fallback dedup key works without native id

Acceptance:

- dedup behavior is stable and explainable

---

## 8. OCR Harness

Must verify:

- OCR success
- OCR empty result
- OCR failure
- retry limit
- temporary file cleanup
- OCR text indexing

Acceptance:

- OCR failure does not block non-OCR data ingestion

---

## 9. API Harness

Must verify:

- /health
- /sync/request
- /messages/search
- /messages/summary
- /messages/tasks
- /threads/search
- /threads/{thread_key}
- /threads/summary
- /threads/tasks

Acceptance:

- API response matches openapi.yaml
- limit constraints enforced
- source metadata included

---

## 10. Boundary Harness

Must verify:

- no runtime secrets in config templates
- no real business data in fixtures
- logs are redacted
- API responses are bounded
- temporary files are cleaned

Acceptance:

- repository remains code/docs/templates/fixtures only

---

## 11. Suggested Test Commands

```text
pnpm test:collector
pnpm test:threads
pnpm test:sync
pnpm test:ocr
pnpm test:api
pnpm test:boundary
pnpm test:all
```

---

## 12. Gate 2 Acceptance

Harness plan passes Gate 2 only if:

- every V1 module has a test category
- threaded conversation support has dedicated tests
- OCR has success and failure tests
- API has schema validation tests
- boundary tests are mandatory
