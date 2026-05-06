# Feishu Message Bridge - Migration Plan

## 1. Purpose

Define the database migration plan before implementation.

This plan is for PostgreSQL from the start.

---

## 2. Migration Principles

- Use explicit migrations.
- Prefer append-only message records.
- Enforce dedup in the database.
- Keep thread reconstruction queryable.
- Keep sync state isolated by device and conversation.

---

## 3. Required Tables

### 3.1 devices

Purpose:

Track local Collector devices.

Fields:

- id uuid primary key
- device_key text unique not null
- display_name text
- created_at timestamptz not null
- last_seen_at timestamptz

---

### 3.2 conversations

Purpose:

Normalize conversation metadata.

Fields:

- id uuid primary key
- conversation_key text unique not null
- display_name text not null
- conversation_type text not null
- tier text
- ocr_enabled boolean default false
- thread_enabled boolean default true
- created_at timestamptz not null
- updated_at timestamptz not null

Indexes:

- conversation_key unique
- display_name index

---

### 3.3 messages

Purpose:

Store normalized message-like records.

Fields:

- id uuid primary key
- source_item_key text
- conversation_id uuid references conversations(id)
- sender_key text
- sender_name text
- sent_at timestamptz not null
- item_type text not null
- text_content text
- ocr_text text
- link_title text
- file_name text
- content_hash text not null
- dedup_key text not null unique
- device_id uuid references devices(id)
- sync_batch_id uuid
- created_at timestamptz not null

Indexes:

- dedup_key unique
- conversation_id + sent_at
- sender_name
- item_type
- text_content full-text index
- ocr_text full-text index

---

### 3.4 threads

Purpose:

Store threaded conversation root metadata.

Fields:

- id uuid primary key
- thread_key text unique not null
- conversation_id uuid references conversations(id)
- root_message_id uuid references messages(id)
- thread_title text
- reply_count integer default 0
- last_reply_at timestamptz
- is_partial boolean default false
- created_at timestamptz not null
- updated_at timestamptz not null

Indexes:

- thread_key unique
- conversation_id + last_reply_at
- thread_title full-text index

---

### 3.5 thread_items

Purpose:

Map messages to threaded structures.

Fields:

- id uuid primary key
- thread_id uuid references threads(id)
- message_id uuid references messages(id)
- parent_message_id uuid references messages(id)
- depth integer default 0
- sort_at timestamptz
- created_at timestamptz not null

Constraints:

- unique(thread_id, message_id)

Indexes:

- thread_id + sort_at
- parent_message_id

---

### 3.6 sync_batches

Purpose:

Track upload batches.

Fields:

- id uuid primary key
- batch_key text unique not null
- device_id uuid references devices(id)
- started_at timestamptz
- completed_at timestamptz
- item_count integer default 0
- status text not null
- created_at timestamptz not null

Indexes:

- batch_key unique
- device_id + created_at

---

### 3.7 sync_locks

Purpose:

Prevent duplicate sync jobs across devices.

Fields:

- lock_key text primary key
- owner_device_id uuid references devices(id)
- expires_at timestamptz not null
- created_at timestamptz not null
- renewed_at timestamptz

Indexes:

- expires_at

---

### 3.8 cursors

Purpose:

Track sync progress per device and conversation.

Fields:

- id uuid primary key
- device_id uuid references devices(id)
- conversation_id uuid references conversations(id)
- latest_seen_item_key text
- latest_seen_at timestamptz
- oldest_scanned_at timestamptz
- last_sync_at timestamptz
- sync_status text
- updated_at timestamptz not null

Constraints:

- unique(device_id, conversation_id)

Indexes:

- conversation_id + updated_at
- sync_status

---

## 4. Required Migration Files

Recommended initial migrations:

```text
infra/migrations/
├─ 0001_init_extensions.sql
├─ 0002_create_devices.sql
├─ 0003_create_conversations.sql
├─ 0004_create_sync_batches.sql
├─ 0005_create_messages.sql
├─ 0006_create_threads.sql
├─ 0007_create_thread_items.sql
├─ 0008_create_sync_locks.sql
└─ 0009_create_cursors.sql
```

---

## 5. Extension Requirements

Recommended PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Optional later:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 6. Gate Acceptance

Migration plan passes if:

- all required tables are represented
- dedup_key uniqueness is explicit
- thread query indexes are explicit
- cursor uniqueness is explicit
- sync lock TTL model is explicit
