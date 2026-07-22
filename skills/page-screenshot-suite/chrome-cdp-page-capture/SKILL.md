---
name: chrome-cdp-page-capture
description: >-
  Capture static page-gallery routes with installed Chrome and Chrome DevTools
  Protocol. Use when Playwright browser downloads or headless shells are unstable,
  especially for macOS screenshot execution.
allowed-tools: Bash
---

# Chrome CDP Page Capture

Requirements: Python 3, Chrome/Chromium, `websocket-client`, static `site/`, and
`config/pageRegistry.json`.

Expected portable layout:

```text
.gallery-portable/
├── site/
├── config/pageRegistry.json
├── capture_cdp.py
└── serve_static.py
```

Run `capture_cdp.py` with `GALLERY_OUTPUT` and optionally `CHROME_PATH`,
`GALLERY_LIMIT`, `GALLERY_ROUTES`, and `GALLERY_BASE_URL`.

## Static server requirement

For extensionless routes, prefer a sibling `route.html` before returning a directory
listing. Use the bundled `serve_static.py`.

## Status classification

- rendered: text or visual DOM exists and no fatal runtime exception
- non-visual: registry explicitly marks a controller route
- blank: no text/visual DOM and not non-visual
- error: navigation error, fatal exception, or application error content

Resource 404s, analytics failures, blocked external resources, and password-form
warnings are diagnostics unless they break the page.

## Stability

Use a fresh temporary Chrome profile, reuse one target, wait for load plus a fixed
settle delay, cap full-page height, preserve logs, and never use a filtered rerun to
overwrite the final full-output directory.

Outputs include PNGs, JSON/CSV results, Markdown report, Chrome log, and HTTP log.
Always run the audit skill next.
