CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_key text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  conversation_type text NOT NULL,
  tier text,
  ocr_enabled boolean DEFAULT false,
  thread_enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_batches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_key text UNIQUE NOT NULL,
  device_id uuid REFERENCES devices(id),
  started_at timestamptz,
  completed_at timestamptz,
  item_count integer DEFAULT 0,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_item_key text,
  conversation_id uuid REFERENCES conversations(id),
  sender_key text,
  sender_name text,
  sent_at timestamptz NOT NULL,
  item_type text NOT NULL,
  text_content text,
  ocr_text text,
  link_title text,
  file_name text,
  content_hash text NOT NULL,
  dedup_key text NOT NULL UNIQUE,
  device_id uuid REFERENCES devices(id),
  sync_batch_id uuid REFERENCES sync_batches(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_key text UNIQUE NOT NULL,
  conversation_id uuid REFERENCES conversations(id),
  root_message_id uuid REFERENCES messages(id),
  thread_title text,
  reply_count integer DEFAULT 0,
  last_reply_at timestamptz,
  is_partial boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thread_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id uuid REFERENCES threads(id),
  message_id uuid REFERENCES messages(id),
  parent_message_id uuid REFERENCES messages(id),
  depth integer DEFAULT 0,
  sort_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(thread_id, message_id)
);

CREATE TABLE IF NOT EXISTS sync_locks (
  lock_key text PRIMARY KEY,
  owner_device_id uuid REFERENCES devices(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  renewed_at timestamptz
);

CREATE TABLE IF NOT EXISTS cursors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id uuid REFERENCES devices(id),
  conversation_id uuid REFERENCES conversations(id),
  latest_seen_item_key text,
  latest_seen_at timestamptz,
  oldest_scanned_at timestamptz,
  last_sync_at timestamptz,
  sync_status text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(device_id, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(conversation_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_name);
CREATE INDEX IF NOT EXISTS idx_threads_conversation_reply ON threads(conversation_id, last_reply_at);
CREATE INDEX IF NOT EXISTS idx_thread_items_thread_sort ON thread_items(thread_id, sort_at);
