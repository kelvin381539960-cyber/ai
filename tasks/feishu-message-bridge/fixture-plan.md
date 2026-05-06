# Feishu Message Bridge - Fixture Plan

## 1. Purpose

Define synthetic fixtures required for mock-first implementation.

Fixtures must be safe for Git and must not include real workspace data.

---

## 2. Fixture Principles

- Synthetic data only.
- Fake names only.
- Fake conversations only.
- Fake timestamps only.
- No copied production text.
- No real screenshots.
- No real OCR output.
- Every fixture should have expected output when possible.

---

## 3. Target Fixture Layout

```text
feishu-message-bridge/harness/fixtures/
├─ conversations/
│  ├─ allowlist-basic.json
│  ├─ allowlist-core-normal.json
│  └─ allowlist-threaded.json
├─ items/
│  ├─ text-items.json
│  ├─ rich-text-items.json
│  ├─ link-items.json
│  ├─ quote-items.json
│  ├─ file-items.json
│  ├─ image-items.json
│  └─ unknown-items.json
├─ threads/
│  ├─ root-only.json
│  ├─ root-with-replies.json
│  ├─ nested-replies.json
│  ├─ missing-root.json
│  └─ mixed-thread-and-normal.json
├─ ocr/
│  ├─ ocr-success.json
│  ├─ ocr-empty.json
│  ├─ ocr-failure.json
│  └─ ocr-disabled.json
├─ sync/
│  ├─ lock-granted.json
│  ├─ lock-denied.json
│  ├─ lock-expired.json
│  └─ duplicate-upload.json
└─ api/
   ├─ messages-search-response.json
   ├─ threads-search-response.json
   ├─ thread-detail-response.json
   ├─ summary-response.json
   └─ work-items-response.json
```

---

## 4. Conversation Fixtures

Required cases:

- empty conversation list
- one allowlisted conversation
- core conversation with OCR enabled
- normal conversation with OCR disabled
- threaded conversation enabled
- non-allowlisted conversation ignored

Expected output:

- normalized allowlist entries
- tier assignment
- scan window assignment
- OCR flag
- thread flag

---

## 5. Item Fixtures

Required item types:

- text
- rich_text
- image
- link
- quote
- file
- unknown

Each fixture should include:

- input structure
- expected normalized item
- expected content_hash behavior
- expected item_type

---

## 6. Thread Fixtures

Required cases:

- root item only
- root item with two replies
- nested reply
- missing root item
- mixed normal and threaded items
- image item inside thread

Expected output:

- thread_key
- root_item_key
- parent_item_key
- depth
- ordered thread view
- partial thread flag when root is missing

---

## 7. OCR Fixtures

Required cases:

- OCR success
- OCR empty result
- OCR failure
- OCR disabled by conversation config

Expected output:

- ocr_status
- ocr_text
- redacted error metadata if failed
- temporary file cleanup expectation

---

## 8. Sync Fixtures

Required cases:

- device A lock granted
- device B lock denied
- expired lock reused
- duplicate upload ignored
- cursor update only after upload success

Expected output:

- lock state
- stored item count
- cursor state
- retry queue state

---

## 9. API Fixtures

Required responses:

- messages search
- threads search
- thread detail
- message summary
- thread summary
- work item extraction

Expected output:

- bounded result count
- source metadata exists
- no unbounded raw dump
- shape matches openapi.yaml

---

## 10. Boundary Fixture Checks

Boundary harness must reject fixture files that contain:

- token-like strings
- private key markers
- cookie-like headers
- real-looking production screenshots
- database dumps
- runtime cache paths

---

## 11. Acceptance

Fixture plan passes if:

- all V1 features have fixture coverage
- threaded conversation cases are explicit
- OCR cases are explicit
- sync and dedup cases are explicit
- API fixtures align with openapi.yaml
- fixtures are synthetic-only
