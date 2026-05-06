# Feishu Message Bridge - Decisions

## D-001: Runtime Placement

Status: Confirmed

Decision:

- Local computers run the Collector.
- Tencent Cloud runs the Bridge Service, storage, index, and GPT Action API.
- Cloud service does not run the workspace web client session.

Rationale:

- Local runtime matches the user's normal working environment.
- Cloud service is better suited for stable API, index, and storage.
- This keeps collection and query responsibilities separated.

---

## D-002: Multi-device Strategy

Status: Confirmed

Decision:

- Support two local devices.
- Both devices may run Collector.
- Cloud sync lock decides which device performs one sync job.

Rationale:

- User switches between two computers.
- One cloud index provides a single query surface for GPT.

---

## D-003: Storage Boundary

Status: Confirmed

Decision:

- Git stores code, task files, templates, and docs only.
- Long-term business data is stored in database, not Git.
- Local Collector keeps only runtime state and temporary cache.

---

## D-004: Image Text Extraction

Status: Confirmed

Decision:

- V1 includes OCR for image text.
- V1 does not include advanced visual reasoning.
- OCR output is stored as searchable text linked to the source item.

---

## D-005: Initial Scan Window

Status: Open

Current recommendation:

- Core allowlist conversations: 30 to 90 days.
- Normal allowlist conversations: 7 to 30 days.
- After initial import, use incremental sync only.

Needs user confirmation before implementation.

---

## D-006: SSOT Rule

Status: Confirmed

Decision:

- tasks/feishu-message-bridge is the single source of truth.
- Any Agent or Codex handoff must read README.md, task-ledger.md, decisions.md, and handoff.md first.
- Chat history is not the execution source of truth.

---

## D-007: Threaded Conversation Capability

Status: Confirmed

Decision:

- V1 must support threaded conversation structures.
- The system must preserve root item, replies, parent-child relation, and thread-level summary context.
- Thread search and thread summary are first-class GPT Action use cases.

Required model fields:

- thread_key
- root_item_key
- parent_item_key
- thread_title
- reply_count
- last_reply_at

Required future APIs:

- GET /threads/search
- GET /threads/{thread_key}
- GET /threads/summary
- GET /threads/tasks

Required harness:

- thread reconstruction
- reply assignment
- nested reply handling
- OCR inside threaded items
- thread summary validation
