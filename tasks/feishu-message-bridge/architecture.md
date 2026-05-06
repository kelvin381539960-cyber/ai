# Feishu Message Bridge - Architecture

## 1. Goal

Build a personal workspace message assistant with:

- local collectors on two user devices
- a Tencent Cloud bridge service
- unified storage and indexing
- GPT Action APIs for query, summary, task extraction, and sync request

The design must be handoff-friendly for ChatGPT, Codex, Cursor, and future agents.

---

## 2. High-level Architecture

```text
Device A Collector                 Device B Collector
- browser automation               - browser automation
- local state                      - local state
- OCR worker                       - OCR worker
- upload client                    - upload client
        |                                  |
        | encrypted API upload             |
        v                                  v
                 Tencent Cloud Bridge Service
                 - sync lock
                 - ingest API
                 - dedup
                 - message store
                 - search index
                 - summary/query API
                 - GPT Action API
                              |
                              v
                         Custom GPT
```

---

## 3. Core Components

### 3.1 Local Collector

Responsibilities:

- manage local runtime session
- scan allowlisted conversations
- extract structured message items
- generate OCR text for image items
- maintain local cursor
- upload batches to cloud
- clean temporary files

Non-responsibilities:

- long-term storage
- global indexing
- GPT query handling
- cloud API authentication policy

---

### 3.2 Tencent Cloud Bridge Service

Responsibilities:

- receive collector upload batches
- provide device sync lock
- deduplicate uploaded items
- persist structured records
- maintain search index
- expose GPT Action APIs
- expose operational health endpoints

Non-responsibilities:

- running the end-user workspace web session
- storing local runtime secrets
- storing data in Git

---

### 3.3 Storage Layer

Recommended V1:

- PostgreSQL as primary database
- pgvector optional for semantic search
- PostgreSQL full-text search for keyword search

Alternative V1-lite:

- SQLite for single-node prototype
- migrate to PostgreSQL before multi-device long-term use

Recommendation:

Use PostgreSQL from the start if Tencent Cloud deployment is planned.

---

### 3.4 Search Layer

V1 search should support:

- keyword search
- time range filter
- conversation filter
- sender filter
- OCR text search
- source metadata return

V2 search may add:

- semantic search
- hybrid ranking
- project/topic classification

---

### 3.5 GPT Action Layer

Actions should query the Bridge Service, not the local Collector directly.

Recommended endpoints:

```text
POST /sync/request
GET  /messages/search
GET  /messages/summary
GET  /messages/tasks
GET  /health
```

Design principle:

- GPT receives bounded snippets, not raw unbounded data dumps.
- Every query must include time range or result limit.
- API responses must include enough source metadata for verification.

---

## 4. Data Flow

### 4.1 Incremental Sync Flow

```text
Collector starts
  ↓
Request sync lock from cloud
  ↓
If lock granted, scan allowlisted conversations
  ↓
Stop when reaching local cursor or configured time boundary
  ↓
Extract structured items
  ↓
Run OCR for image items when enabled
  ↓
Upload batch to cloud
  ↓
Cloud deduplicates and stores
  ↓
Cloud updates cursor and index
  ↓
Collector releases lock
```

---

### 4.2 Query Flow

```text
User asks GPT
  ↓
GPT calls Action API
  ↓
Bridge Service queries index
  ↓
Bridge returns bounded relevant snippets
  ↓
GPT summarizes, extracts tasks, or answers
```

---

## 5. Sync Lock Design

Purpose:

Avoid two local devices running the same sync job at the same time.

Recommended table:

```text
sync_locks
- lock_key
- owner_device_id
- expires_at
- created_at
- renewed_at
```

Behavior:

- Collector must acquire lock before sync.
- Lock has TTL.
- Expired lock can be acquired by another device.
- Collector should renew lock during long-running sync.
- Lock release is best effort; TTL protects against stale locks.

---

## 6. Dedup Design

Recommended dedup key:

```text
conversation_id + sender_id_or_name + normalized_timestamp + content_hash + item_type
```

If native message ID is available, use it as primary key.

Fallback:

- stable content hash
- timestamp bucket
- conversation identifier
- sender identifier

Dedup must happen in cloud, not only locally.

---

## 7. Cursor Design

Cursor exists at two levels:

### Local cursor

Used by Collector to know where to stop scanning.

### Cloud cursor

Used as canonical sync progress per:

```text
device_id + conversation_id
```

Recommended cursor fields:

- latest_seen_item_id
- latest_seen_timestamp
- oldest_scanned_timestamp
- last_sync_at
- sync_status

---

## 8. OCR Design

V1 OCR scope:

- extract text from image messages
- store OCR text as searchable field
- link OCR result to the original message item

V1 does not include:

- diagram structure parsing
- visual reasoning
- chart analysis
- face/person recognition

Recommended OCR engine:

- PaddleOCR for local OCR
- Tesseract only as fallback

Temporary image files:

- downloaded locally only when OCR is enabled
- deleted after OCR success or failure
- never committed to Git

---

## 9. Message Schema Draft

```json
{
  "id": "server-generated-id",
  "source_item_id": "optional-native-id",
  "conversation_id": "conversation-stable-id",
  "conversation_name": "name",
  "conversation_type": "group|direct|unknown",
  "sender_id": "optional-id",
  "sender_name": "display-name",
  "sent_at": "2026-05-06T10:30:00+08:00",
  "item_type": "text|rich_text|image|link|quote|file|unknown",
  "text": "message text",
  "ocr_text": "image text if available",
  "link_title": "optional",
  "file_name": "optional",
  "content_hash": "sha256",
  "dedup_key": "stable-dedup-key",
  "device_id": "collector-device-id",
  "sync_batch_id": "batch-id",
  "created_at": "server-time"
}
```

---

## 10. Security and Boundary Rules

Repository may contain:

- source code
- documentation
- config templates
- OpenAPI schemas
- test fixtures with synthetic data

Repository must not contain:

- real business messages
- real OCR output
- screenshots
- cookies
- tokens
- private runtime config

Cloud logs should:

- avoid full raw content
- include request IDs and item counts
- include redacted error metadata

GPT Action responses should:

- limit result count
- include source metadata
- avoid returning large raw dumps

---

## 11. Deployment Shape

Recommended Tencent Cloud layout:

```text
/opt/ops-bridge              existing service
/opt/feishu-message-bridge   new bridge service
/opt/shared-infra            optional shared reverse proxy / logs / scripts
```

Collector should run on local computers, not in Tencent Cloud.

---

## 12. Open Questions

| ID | Question | Recommendation |
|---|---|---|
| OQ-001 | Initial scan window | Core: 30-90 days; normal: 7-30 days |
| OQ-002 | DB choice | PostgreSQL from start |
| OQ-003 | Local OS support | confirm macOS / Windows split |
| OQ-004 | OCR engine | PaddleOCR |
| OQ-005 | Semantic search | V1 optional, keyword search required |

---

## 13. Gate 1 Review Checklist

Architecture can pass Gate 1 only if:

- module boundaries are clear
- local/cloud responsibilities are clear
- storage boundary is clear
- OCR scope is bounded
- Action APIs are bounded
- initial scan policy is confirmed
- implementation-plan.md exists
