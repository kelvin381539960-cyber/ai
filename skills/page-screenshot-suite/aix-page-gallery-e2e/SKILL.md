---
name: aix-page-gallery-e2e
description: >-
  End-to-end page screenshot workflow for AIX or similar Expo Router apps.
  Use for complete page inventory, Web Preview adaptation, static export,
  route-by-route screenshots, quality audit, and packaged delivery.
allowed-tools: Bash
---

# AIX Page Gallery E2E

Coordinate: **inventory → adapt → export → capture → audit → deliver**.

Use sibling skills for implementation details:

- `expo-router-page-gallery`
- `aix-preview-adapter`
- `chrome-cdp-page-capture`
- `page-screenshot-audit`

## Rules

1. Work in an isolated branch/worktree; do not modify production source directly.
2. Preview mode must not call production mutation APIs.
3. Do not claim success from build output; verify screenshots and result records.
4. Separate fatal runtime exceptions from resource/analytics diagnostics.
5. Mark controller routes with no UI as `non-visual`.
6. Native/external features need explicit Preview adapters, not silent fake success.

## Inputs

Discover project root, route root, static output, registry, capture machine,
Chrome path, and delivery directory from the repository and environment.

## Pipeline

### 1. Inventory

Generate a route registry with route, category, source path, parameters,
Preview parameters, native capabilities, `internal`, and `nonVisual`.
Reconcile route count with source files and explain every exclusion.

### 2. Adapt

Add deterministic session/API fixtures, lightweight route presets, Web root
layout, local storage replacement, and Web/native module adapters.

### 3. Verify and export

```bash
npm run gallery:generate
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npm run gallery:export
```

Confirm route HTML, JS assets, registry JSON, and gallery HTTP response.

### 4. Capture

Prefer server build + Mac Chrome CDP capture. Package the static site and registry
with `scripts/package_portable.sh`, transfer the archive, then execute
`scripts/run_portable_capture.sh` on the Mac.

### 5. Audit

Require zero errors, zero unexplained blanks, no missing/corrupt PNGs, consistent
dimensions, and explicit explanations for duplicate screenshots.

### 6. Deliver

Include `index.html`, README, report, JSON/CSV route results, screenshots, and the
interactive static site. Create and integrity-test full and screenshot-only archives.

## Fix priority

Root/session → fixture shape → route params → native adapters → redirects/controller
routes → individual pages. Fix shared causes before patching individual routes.

## Completion report

State exact build/capture machines, output paths, route/status counts, PNG count,
dimensions, duplicate reasons, and whether source is committed or only on disk.
