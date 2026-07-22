---
name: aix-page-gallery
description: Build a complete visual Page Gallery and stable batch screenshots for AIX or other Expo Router / React Native applications. Use when asked to enumerate every business screen, create a browser-preview layer for native pages, mock APIs safely, export Expo Web, capture all routes through Chrome DevTools Protocol, audit blank/error/missing screenshots, or deliver a browsable screenshot gallery.
license: MIT
metadata:
  version: "1.0.1"
  verified_project: "AIX Expo Router app"
  verified_date: "2026-07-22"
  verified_routes: "87"
allowed-tools: Bash Read Write Edit
---

# AIX Page Gallery

## Goal

Create a reproducible visual inventory of every business route without calling production APIs or requiring the real mobile runtime.

The finished run must produce:

1. A route registry covering every business page.
2. A static Expo Web build.
3. One PNG per route at a consistent mobile viewport.
4. Machine-readable capture and audit reports.
5. A browsable HTML screenshot index.
6. A clear classification for native-only and non-visual routes.

## Use this skill when

- The user asks to screenshot all app pages.
- The user asks for a Page Gallery, screen inventory, visual regression baseline, or full UI review.
- Expo Router pages cannot run in a browser because of native modules.
- Route pages require parameters, authentication state, API responses, camera, biometrics, WebView, file picker, or third-party SDKs.
- A previous screenshot run contains blank pages, Not Found pages, loading loops, or identical screenshots.

## Inputs

Resolve these before execution:

- `PROJECT_ROOT`: Expo application root containing `package.json` and `src/app`.
- `WORKTREE_ROOT`: isolated Git worktree; never modify the user's active production checkout.
- `OUTPUT_ROOT`: capture reports and screenshots.
- `CHROME_PATH`: Chrome or Chromium executable.
- Route root, normally `src/app/aix` for AIX.
- Expected mobile viewport, default `390x844`.

Do not ask the user for information that is already discoverable from the repository.

## Hard safety rules

- Work only in an isolated worktree or disposable copy.
- Never call production APIs during preview capture.
- Never submit forms, payments, KYC, card operations, transfers, or authentication requests.
- Never copy `.npmrc` credentials, tokens, private keys, cookies, or user data into this skill.
- Keep the project's existing private package source unless an approved local package is explicitly supplied.
- Native capabilities must use deterministic Preview adapters, not real device execution.
- Do not classify a route as `nonVisual` merely because it is blank. Confirm from source that it is a controller with no UI.
- Do not claim success while any visual route is `error`, `blank`, missing a screenshot, or near-pure-white.

## Architecture

### Generic execution layer

Located in `scripts/`:

- `check_environment.py`: validates Python, Chrome, websocket-client, Pillow, Node, and npm.
- `capture_cdp.py`: starts a static server and captures routes through raw Chrome DevTools Protocol.
- `serve_static.py`: maps extensionless Expo Router paths to generated `.html` files.
- `audit_gallery.py`: validates route counts, statuses, image existence, dimensions, near-blank images, and duplicates.
- `build_delivery.py`: creates the screenshot HTML index and ZIP packages.
- `run_gallery.py`: runs build, capture, audit, and delivery as one pipeline.

### Verified AIX adapter

Located in `adapters/aix/`:

- `overlay/`: new Web Preview files and native-module stubs.
- `aix-runtime.patch`: changes to existing AIX source files, excluding package credentials.
- `manifest.json`: paths, sizes, and SHA-256 values.
- `package-changes.md`: safe package and script changes.

## Required workflow

### 1. Preflight

```bash
python3 scripts/check_environment.py --project "$PROJECT_ROOT"
```

Required: Python 3.9+, Chrome or Chromium, `websocket-client`, Pillow, Node, and npm.

Install only missing Python runtime packages:

```bash
python3 -m pip install websocket-client pillow
```

### 2. Create an isolated worktree

```bash
git worktree add ../aix-page-gallery-worktree -b feature/aix-page-gallery
```

Confirm that the original application checkout remains unchanged.

### 3. Apply the AIX adapter

First dry-run:

```bash
python3 scripts/apply_aix_overlay.py --project "$PROJECT_ROOT" --dry-run
```

If the patch matches and conflicts are understood:

```bash
python3 scripts/apply_aix_overlay.py --project "$PROJECT_ROOT"
```

Use `--force` only after reviewing every reported overlay conflict.

The installer verifies the project, dry-runs the patch, detects conflicts, creates `.page-gallery-backup/<timestamp>`, applies the runtime patch, copies Preview adapters, moves Playground routes outside the business route tree, adds safe `gallery:*` scripts, and never alters `.npmrc`.

If `aix-runtime.patch` does not match, do not force it. Adapt the equivalent changes manually using `references/aix-adapter.md`.

### 4. Generate the route registry

```bash
npm run gallery:generate
```

Registry entries must include:

```json
{
  "id": "aix-card-card-home",
  "title": "Card Home",
  "category": "card",
  "route": "/aix/card/card-home",
  "sourcePath": "src/app/aix/card/card-home.tsx",
  "params": [],
  "previewParams": {},
  "nativeCapabilities": [],
  "internal": false,
  "nonVisual": false
}
```

Exclude layouts, catch-all helpers, debug-only routes, and component playgrounds from the business count.

### 5. Resolve route parameters

Do not rely only on thin `src/app` route files. Inspect the actual page component for `useLocalSearchParams`.

Add deterministic values to `preview-route-presets.js` for IDs, transactions, card options, KYC payloads, result states, messages, WebView URLs, and image URIs.

Avoid large data URLs inside query parameters. Long route URLs can silently produce blank pages. Use lightweight values or local static assets.

### 6. Build the Preview data layer

Preview API responses must be deterministic and isolated from production. Provide logged-in Preview user state, global configuration, and fixtures for home, wallet, card, KYC, messages, transactions, countries, and addresses. Safe empty promotion and reward responses are required.

Never infer that `{}` is sufficient. Match the shape consumed by stores and page components.

### 7. Adapt native capabilities

Use `.web.ts` files or Metro aliases for TurboModules, MMKV, WebView, biometrics, camera, KYC scans, file upload, crop, sharing, view-shot, cookies, MoEngage, AppsFlyer, Crashlytics, and Remote Config.

Preview adapters must show the real application shell and a clear deterministic placeholder or result. Do not pretend the real native action executed.

### 8. Type-check and export

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm run gallery:export
```

Expected output:

```text
dist-page-gallery/
src/preview/pageRegistry.generated.json
```

Warnings may remain, but type-check and export must exit `0`.

### 9. Run the complete pipeline

```bash
python3 scripts/run_gallery.py \
  --project "$PROJECT_ROOT" \
  --output "$OUTPUT_ROOT/run" \
  --name "AIX_Page_Gallery_Final"
```

For an existing static export:

```bash
python3 scripts/run_gallery.py \
  --site "$PROJECT_ROOT/dist-page-gallery" \
  --registry "$PROJECT_ROOT/src/preview/pageRegistry.generated.json" \
  --output "$OUTPUT_ROOT/run" \
  --skip-build \
  --name "AIX_Page_Gallery_Final"
```

Useful options:

```text
--routes /aix/home/home-page,/aix/card/card-home
--limit 10
--wait-seconds 2.5
--port 19006
--cdp-port 9223
--chrome /path/to/chrome
--no-delivery
```

Default screenshots use a fixed `390x844` viewport. Set `GALLERY_FULL_PAGE=1` only when full-page capture is explicitly required.

### 10. Audit and iterate

The pipeline fails when a visual route is `error` or `blank`, a screenshot is missing, unreadable, the wrong size, or near-pure-white, or the captured route count differs from the registry.

Exact duplicate images are warnings by default. Explain legitimate duplicates, such as two routes intentionally rendering the same component.

Fix failures in this order:

1. Missing or malformed route parameters.
2. Incorrect Preview API response shape.
3. Authentication or global state redirects.
4. Unsupported native module import.
5. Automatic navigation before capture.
6. External asset or WebView dependency.
7. Screenshot classification bug.

After each fix, rerun only affected routes, then rerun the full registry before delivery.

## Error classification

Fatal runtime patterns include `Cannot read properties`, `TurboModuleRegistry`, `getEnforcing`, `Invariant Violation`, `Module not found`, `is not a function`, and `Maximum update depth`.

Do not automatically fail a rendered page for browser password warnings, blocked external fonts, non-critical favicon 404s, or deprecated style warnings. Record those as diagnostics.

## Acceptance criteria

A completed run requires:

- `business routes = rendered visual routes + confirmed non-visual routes`
- `error = 0`
- `blank visual = 0`
- no missing screenshots
- all screenshots use the requested dimensions
- near-blank visual screenshots = 0
- every non-visual route has source-based justification
- native and external capabilities are visibly labeled as Preview behavior
- TypeScript check exits `0`
- static export exits `0`
- audit exits `0`
- delivery ZIP integrity check passes

## Verified AIX baseline

The adapter was verified with 87 business routes, 86 visual routes, one non-visual controller (`/aix/ivs/ivs-begin-page`), zero runtime errors, zero blank visual pages, 87 PNG files, and a 390x844 viewport.

See `examples/aix-routes-verified.json`.

## Self-test

```bash
tests/run_smoke_test.sh
```

Expected:

```text
SMOKE_TEST_PASS {'rendered': 2, 'non-visual': 1}
```

## Deliverables

```text
Page_Gallery_Final/
├── index.html
├── README.md
├── routes.json
├── capture-results.csv
├── CAPTURE_REPORT.md
├── audit-report.json
├── AUDIT_REPORT.md
├── screenshots/
└── page-gallery/site/
```

Also produce full-delivery and screenshots-only ZIP files with SHA-256 values.

When reporting completion, state the exact machine and absolute paths. Never imply that files are on the server when they only exist on the Mac, or vice versa.
