# Feishu Message Bridge - Scaffold Plan

## 1. Purpose

Define the initial code scaffold before files are created.

This plan must be reviewed before actual scaffold implementation.

---

## 2. Target Root

Recommended code root:

```text
feishu-message-bridge/
```

The task docs remain in:

```text
tasks/feishu-message-bridge/
```

---

## 3. Target Scaffold

```text
feishu-message-bridge/
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ .gitignore
├─ README.md
├─ packages/
│  ├─ collector/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  ├─ src/
│  │  │  ├─ runtime/
│  │  │  ├─ browser/
│  │  │  ├─ scanner/
│  │  │  ├─ parser/
│  │  │  ├─ thread/
│  │  │  ├─ ocr/
│  │  │  ├─ cursor/
│  │  │  ├─ uploader/
│  │  │  └─ config/
│  │  └─ tests/
│  ├─ bridge-service/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  ├─ src/
│  │  │  ├─ api/
│  │  │  ├─ ingest/
│  │  │  ├─ sync-lock/
│  │  │  ├─ dedup/
│  │  │  ├─ search/
│  │  │  ├─ threads/
│  │  │  ├─ summary/
│  │  │  ├─ auth/
│  │  │  ├─ db/
│  │  │  └─ config/
│  │  └─ tests/
│  ├─ shared/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  ├─ src/
│  │  │  ├─ schema/
│  │  │  ├─ types/
│  │  │  ├─ hashing/
│  │  │  ├─ validation/
│  │  │  └─ errors/
│  │  └─ tests/
│  └─ action-schema/
│     ├─ package.json
│     ├─ openapi.yaml
│     └─ examples/
├─ harness/
│  ├─ fixtures/
│  │  ├─ conversations/
│  │  ├─ items/
│  │  ├─ ocr/
│  │  └─ api/
│  ├─ collector/
│  ├─ threads/
│  ├─ sync/
│  ├─ ocr/
│  ├─ api/
│  └─ boundary/
└─ infra/
   ├─ migrations/
   ├─ docker/
   ├─ nginx/
   └─ systemd/
```

---

## 4. Initial Files

Minimum initial scaffold should include:

- root package.json
- pnpm-workspace.yaml
- tsconfig.base.json
- root README.md
- .gitignore
- package.json per package
- placeholder README.md per package
- fixture README.md
- migration README.md

---

## 5. .gitignore Requirements

Must ignore:

```text
node_modules/
dist/
.env
.env.*
!.env.example
.collector-state/
runtime-cache/
*.sqlite
*.db
*.log
tmp/
ocr-temp/
```

---

## 6. Package Roles

### collector

Local runtime and data normalization.

### bridge-service

Cloud API, ingest, dedup, search, sync lock.

### shared

Shared types, schema, hashing, validation.

### action-schema

GPT Action OpenAPI schema and examples.

---

## 7. Scaffold Acceptance

Scaffold passes review if:

- package boundaries match module-structure.md
- no real runtime data is included
- .gitignore covers runtime state
- synthetic fixture folders exist
- migrations folder exists
- action-schema contains OpenAPI copy or reference
