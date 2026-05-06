# Database Schema (Draft)

## 1. Core Tables

### messages

- id (pk)
- source_item_id
- conversation_id
- sender_name
- sent_at
- item_type
- text
- ocr_text
- content_hash
- dedup_key
- device_id
- created_at

Indexes:

- idx_conversation_time
- idx_sender
- idx_text_fts
- idx_ocr_fts

---

### threads

- thread_key (pk)
- conversation_id
- root_item_id
- thread_title
- reply_count
- last_reply_at
- created_at

---

### thread_items

- id (pk)
- thread_key
- parent_item_id
- message_id

---

### sync_locks

- lock_key
- owner_device_id
- expires_at

---

### cursors

- device_id
- conversation_id
- latest_seen_timestamp
- last_sync_at

---

## 2. Notes

- messages is append-only
- dedup_key must be unique
- threads reconstructed at ingest time
