# Collector Design

## 1. Purpose

Define the local Collector runtime behavior, modules, data flow, and validation boundaries before code implementation.

The Collector runs on user devices and converts allowlisted workspace conversations into normalized records for the Bridge Service.

This file is design-only. No runtime code is implemented here.

---

## 2. Responsibilities

The Collector is responsible for:

- Managing local runtime state.
- Reusing local session state.
- Loading allowlist configuration.
- Scanning configured conversations.
- Parsing structured items from the local workspace UI.
- Reconstructing threaded conversation structures.
- Running OCR for configured image items.
- Maintaining local cursors.
- Uploading normalized batches to the cloud Bridge Service.
- Handling bounded retries.
- Cleaning temporary files.

The Collector is not responsible for:

- Long-term global storage.
- GPT Action APIs.
- Cloud authorization policy.
- Search ranking.
- Cross-device canonical state.
- Global dedup authority.

---

## 3. Proposed Module Layout

```text
collector/src/
├─ runtime/
│  ├─ app.ts
│  ├─ scheduler.ts
│  └─ lifecycle.ts
├─ browser/
│  ├─ browser-session.ts
│  ├─ page-controller.ts
│  └─ selectors.ts
├─ scanner/
│  ├─ conversation-scanner.ts
│  ├─ message-scanner.ts
│  └─ scroll-controller.ts
├─ parser/
│  ├─ message-parser.ts
│  ├─ rich-text-parser.ts
│  ├─ link-parser.ts
│  └─ media-parser.ts
├─ thread/
│  ├─ thread-detector.ts
│  ├─ thread-reconstructor.ts
│  └─ thread-normalizer.ts
├─ ocr/
│  ├─ ocr-worker.ts
│  ├─ image-temp-store.ts
│  └─ ocr-result-normalizer.ts
├─ cursor/
│  ├─ cursor-store.ts
│  └─ cursor-policy.ts
├─ uploader/
│  ├─ batch-builder.ts
│  ├─ upload-client.ts
│  └─ retry-queue.ts
└─ config/
   ├─ allowlist.ts
   ├─ runtime-config.ts
   └─ limits.ts
```

---

## 4. Runtime Flow

```text
Start Collector
  ↓
Load config and local cursor
  ↓
Request sync lock from Bridge Service
  ↓
If lock granted, open configured workspace page
  ↓
Scan allowlisted conversations
  ↓
Parse items and thread relations
  ↓
Run OCR for enabled image items
  ↓
Build normalized upload batch
  ↓
Upload batch to Bridge Service
  ↓
Persist local cursor
  ↓
Clean temporary files
  ↓
Release lock or let lock expire
```

---

## 5. Local State

Recommended local state:

```text
.collector-state/
├─ cursors.json
├─ device.json
├─ retry-queue.jsonl
└─ runtime-cache/
```

Rules:

- Runtime files must be gitignored.
- Temporary OCR files must be deleted after processing.
- Retry queue stores bounded metadata and payload needed for retry.
- Local state is not the global source of truth.

---

## 6. Allowlist Policy

V1 must use allowlist scope.

Allowlist fields:

```json
{
  "conversation_name": "AIX Project",
  "conversation_type": "group",
  "tier": "core",
  "initial_scan_days": 90,
  "ocr_enabled": true,
  "thread_enabled": true
}
```

Rules:

- No allowlist entry means no scan.
- No default all-scope scan.
- Core conversations may use larger initial windows.
- Normal conversations should use smaller windows.
- OCR can be enabled per conversation.
- Thread support should be enabled by default.

---

## 7. Cursor Policy

Cursor is stored locally and mirrored to cloud.

Local cursor key:

```text
device_id + conversation_key
```

Cursor fields:

```json
{
  "device_id": "macbook-a",
  "conversation_key": "conv-key",
  "latest_seen_item_key": "item-key",
  "latest_seen_at": "2026-05-06T10:30:00+08:00",
  "oldest_scanned_at": "2026-05-01T00:00:00+08:00",
  "last_sync_at": "2026-05-06T11:00:00+08:00"
}
```

Stop conditions:

- Reached latest local cursor.
- Reached configured initial scan boundary.
- Reached max items per conversation.
- Reached runtime timeout.

Cursor update rule:

- Cursor can advance only after the corresponding batch upload succeeds.
- Failed upload must not advance cursor.

---

## 8. Parser Design

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

Adapter principle:

- selectors.ts centralizes selectors
- message-parser.ts consumes adapter output
- harness fixtures test parser without live page dependency

---

## 9. Threaded Conversation Handling

Thread support is V1 required.

Collector must extract or infer:

- thread_key
- root_item_key
- parent_item_key
- thread_title
- is_thread_root
- is_thread_reply
- reply_count when available
- last_reply_at when available

Processing flow:

```text
Parse raw item
  ↓
Detect whether item belongs to a thread
  ↓
Assign root_item_key and parent_item_key
  ↓
Normalize thread_key
  ↓
Attach item to thread batch
  ↓
Upload messages and thread relations together
```

Fallback behavior:

- If thread relation cannot be confirmed, store item as non-threaded.
- If root item is missing, mark thread as partial.
- Bridge Service may later repair thread relations when more items arrive.

---

## 10. OCR Policy

OCR is V1 required for configured image items.

Rules:

- OCR runs locally.
- Image files are temporary.
- OCR text is linked to the message item.
- OCR failure must not block text item upload.
- OCR result may be empty.
- OCR retries must be bounded.

OCR output shape:

```json
{
  "message_key": "msg-key",
  "ocr_text": "recognized text",
  "ocr_status": "success|empty|failed",
  "ocr_engine": "paddleocr",
  "ocr_error": "optional redacted error"
}
```

---

## 11. Upload Batch Shape

```json
{
  "device_id": "macbook-a",
  "batch_id": "batch-001",
  "started_at": "2026-05-06T10:30:00+08:00",
  "completed_at": "2026-05-06T10:32:00+08:00",
  "messages": [],
  "threads": [],
  "cursors": []
}
```

Upload rules:

- Batch size must be bounded.
- Upload retry must be idempotent.
- Dedup happens in Bridge Service.
- Failed upload goes to local retry queue.

---

## 12. Failure Handling

| Failure | Handling |
|---|---|
| runtime unavailable | stop run, keep cursor unchanged |
| session expired | stop run and require manual refresh |
| parser mismatch | record redacted diagnostic metadata, continue only if safe |
| OCR failed | upload item with OCR failed status |
| upload failed | enqueue retry |
| lock denied | skip run |
| timeout | persist cursor only for uploaded items |

---

## 13. Harness Requirements

Collector must be testable without live external pages.

Required tests:

- parser fixture to normalized item
- thread fixture to reconstructed thread
- cursor stop condition
- OCR success / failure / empty result
- upload retry queue
- temp file cleanup

---

## 14. Gate 2 Acceptance

Collector design can pass Gate 2 only if:

- Allowlist policy is explicit.
- Cursor policy is explicit.
- Thread handling is first-class.
- OCR flow is bounded.
- Upload flow is idempotent.
- Mock harness can validate parser and thread reconstruction.
