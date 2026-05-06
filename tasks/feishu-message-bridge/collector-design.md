# Collector Design

## 1. Purpose

The Collector runs on user devices and converts allowlisted workspace conversations into normalized records for the Bridge Service.

This file is design-only. No runtime code is implemented here.

---

## 2. Responsibilities

Collector owns:

- local runtime startup
- local session reuse
- allowlist loading
- conversation scanning
- item parsing
- threaded structure reconstruction
- OCR task execution
- local cursor update
- upload batching
- retry queue
- temporary file cleanup

Collector does not own:

- long-term global storage
- GPT Action API
- cloud indexing
- global dedup authority

---

## 3. Runtime Flow

```text
load config
  ↓
start local runtime
  ↓
restore local session
  ↓
fetch allowlist
  ↓
request cloud sync lock
  ↓
scan each allowlisted conversation
  ↓
parse new items until cursor/time boundary
  ↓
run OCR when needed
  ↓
build upload batch
  ↓
upload to Bridge Service
  ↓
update local cursor
  ↓
cleanup temporary files
```

---

## 4. Local State

Recommended local state:

```text
.collector-state/
├─ cursors.json
├─ device.json
├─ retry-queue.jsonl
└─ runtime-cache/
```

Rules:

- runtime files must be gitignored
- temporary OCR files must be deleted after processing
- retry queue stores bounded metadata and payload needed for retry

---

## 5. Allowlist Design

Allowlist config:

```yaml
conversations:
  - name: core-product
    tier: core
    initial_days: 90
    ocr_enabled: true
  - name: normal-sync
    tier: normal
    initial_days: 30
    ocr_enabled: false
```

Rules:

- no default all-scope scan
- each conversation must be explicitly configured
- OCR can be enabled per conversation

---

## 6. Parser Design

Parser outputs normalized item drafts:

```json
{
  "conversation_name": "name",
  "sender_name": "sender",
  "sent_at": "timestamp",
  "item_type": "text|image|link|quote|file|unknown",
  "text": "optional",
  "raw_hints": {}
}
```

Parser must be isolated behind adapters so page structure changes only affect adapter code.

---

## 7. Thread Reconstruction

Collector should capture enough metadata for cloud reconstruction.

Required draft fields:

- thread_key
- root_item_key
- parent_item_key
- thread_title
- is_thread_root
- is_thread_reply

If a stable native key is unavailable, Collector should provide a deterministic fallback key.

---

## 8. OCR Flow

```text
image item detected
  ↓
check conversation OCR setting
  ↓
download temporary image
  ↓
run OCR
  ↓
attach ocr_text
  ↓
delete temporary image
```

Failure rules:

- OCR failure should not block message upload
- record ocr_status
- retry OCR only within configured limits

---

## 9. Upload Batch

Batch shape:

```json
{
  "device_id": "device-a",
  "batch_id": "uuid",
  "conversation_name": "name",
  "items": []
}
```

Rules:

- batch size must be bounded
- failed uploads go to retry queue
- cloud remains dedup authority

---

## 10. Failure Handling

Expected failures:

- runtime unavailable
- session expired
- parser mismatch
- upload failed
- OCR failed
- sync lock denied

Handling:

- classify errors
- retry only safe transient failures
- stop on structural parser mismatch
- write concise local diagnostic logs

---

## 11. Collector Harness Requirements

Must support:

- mock conversation list
- mock item list
- mock threaded structures
- mock OCR input/output
- mock upload failures
- cursor stop condition
- retry queue replay

---

## 12. Gate 2 Acceptance

Collector design passes Gate 2 only if:

- allowlist is mandatory
- thread support is first-class
- OCR is bounded
- local state is isolated
- retry behavior is specified
- parser can be tested with fixtures
