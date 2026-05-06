# Security Boundary

## 1. Purpose

Define what this project may store, where it may store it, and what must never be committed to the repository.

---

## 2. Repository Boundary

Repository may contain:

- source code
- documentation
- task files
- config templates
- synthetic fixtures
- OpenAPI schemas
- deployment scripts

Repository must not contain:

- real workspace data
- real OCR outputs
- screenshots from production use
- cookies
- tokens
- private config
- database dumps
- local runtime state

---

## 3. Local Runtime Boundary

Local Collector may store:

- device id
- local cursor
- retry queue
- temporary runtime cache
- local session state

Local Collector must clean:

- temporary OCR images
- stale runtime cache
- failed temporary downloads

Local Collector must not commit any runtime state to Git.

---

## 4. Cloud Boundary

Cloud Bridge Service may store:

- normalized records
- OCR text
- sync metadata
- dedup keys
- search index
- audit-friendly operational metadata

Cloud Bridge Service should avoid:

- verbose raw-content logs
- unbounded response dumps
- storing runtime secrets in repository-controlled files

---

## 5. API Boundary

All non-health APIs require authentication.

Rules:

- response limit required
- max result limit enforced
- time range strongly recommended
- pagination required for larger result sets
- source metadata included for verification
- no all-data export endpoint in V1

---

## 6. Logging Boundary

Logs may include:

- request id
- batch id
- item count
- error category
- duration
- device label

Logs must avoid:

- full content body
- full OCR text
- tokens
- raw session state

---

## 7. Config Boundary

Config templates may include:

- variable names
- default safe values
- example placeholders

Config templates must not include:

- real tokens
- real URLs if private
- real device identifiers
- real workspace names when sensitive

---

## 8. Harness Boundary

Harness fixtures must be synthetic.

Synthetic fixture rules:

- use fake names
- use fake conversations
- use fake timestamps
- use fake text
- do not copy real examples into fixtures

---

## 9. Gate 2 Acceptance

Security boundary passes Gate 2 only if:

- repository boundary is explicit
- local/cloud boundaries are explicit
- API response limits are explicit
- logging redaction is explicit
- harness uses synthetic fixtures only
