---
name: expo-router-page-gallery
description: >-
  Build a deterministic route registry and static Web gallery from an Expo Router
  project. Use to list all business pages, resolve actual Page component parameters,
  inject Preview values, and export screenshotable route HTML.
allowed-tools: Bash
---

# Expo Router Page Gallery

## Workflow

1. Read `src/app`, root layout, route constants, and representative Route/Page files.
2. Follow thin route re-exports/imports; parameters often live in the real Page component.
3. Generate a registry with route, category, source, params, previewParams,
   nativeCapabilities, internal, and nonVisual.
4. Add deterministic route-specific values for JSON/session/detail parameters.
5. Create isolated Preview session and API fixtures.
6. Add platform-specific Web adapters for native dependencies.
7. Typecheck and export the static Web site.

## Registry command

Use the bundled scanner or the verified AIX generator:

```bash
node scripts/scan_routes.js --project /path/to/project \
  --route-root src/app/aix --app-root src/app \
  --output src/preview/pageRegistry.generated.json \
  --ts-output src/preview/pageRegistry.generated.ts \
  --presets scripts/preview-route-presets.js
```

## Parameter rules

- Generic strings are not valid replacements for serialized objects.
- Keep card/KYC/IVS/message/wallet presets small and deterministic.
- Never embed large base64/SVG data in query parameters; URL overflow can silently blank pages.
- Detail routes need valid IDs and matching fixture endpoints.

## Preview rules

- Fixed signed-in user and global config.
- No production mutations.
- Arrays must be present even when empty.
- Match the repository's exact response envelope.
- List and detail endpoints require separate fixtures.

## Web adapters

Use `.web.ts` / `.web.tsx` for MMKV, TurboModules, WebView, camera/file picker,
biometrics, analytics, attribution, remote config, cookies/share/view-shot, and
pull-to-refresh. Preserve native files unchanged.

## Common diagnoses

- blank/no error: invalid route JSON or automatic `router.back()`
- `map/find` on undefined: fixture shape mismatch
- `toString` on undefined: missing Web platform/device value
- WebView crash: native implementation loaded on Web
- directory listing: static server preferred a directory over sibling `.html`
- identical unrelated screenshots: redirect/fallback/final URL issue
- loader never ends: fixture never reaches expected terminal state

## Acceptance

Registry count reconciles with source business routes, typecheck passes, static export
succeeds, and every excluded route has a documented reason.
