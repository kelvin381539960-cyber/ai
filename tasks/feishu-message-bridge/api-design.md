# API Design

## 1. Principles

- bounded responses only
- explicit filters
- paginated search
- thread-aware APIs
- source metadata included

---

## 2. Sync APIs

### POST /sync/request

Purpose:

Request a collector sync cycle.

Request:

```json
{
  "device_id": "device-a",
  "mode": "incremental"
}
```

Response:

```json
{
  "accepted": true,
  "sync_job_id": "job-001"
}
```

---

## 3. Search APIs

### GET /messages/search

Filters:

- keyword
- sender
- conversation
- from_time
- to_time
- limit

---

### GET /threads/search

Filters:

- keyword
- thread_title
- conversation
- from_time
- to_time

---

## 4. Summary APIs

### GET /messages/summary

Purpose:

Summarize bounded result set.

---

### GET /threads/summary

Purpose:

Summarize one thread or filtered thread set.

---

## 5. Task Extraction APIs

### GET /messages/tasks

Returns:

- tasks
- decisions
- risks
- blockers

---

### GET /threads/tasks

Same as message tasks, but thread scoped.

---

## 6. Metadata Rules

Every response item should include:

- conversation_name
- sender_name
- sent_at
- source_type
- thread_key (if applicable)

---

## 7. Safety Rules

- limit defaults required
- max limit enforced
- no unbounded dump endpoint
- auth required for all endpoints except health
