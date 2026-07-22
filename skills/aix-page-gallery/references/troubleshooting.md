# Troubleshooting

## Not Found or directory listing

Cause: the static server resolves a route directory before the exported `.html` file.

Fix: use `serve_static.py`; it checks `<path>.html` first for extensionless requests.

## Blank route with valid parameters

Check the final browser URL length. Large JSON data URLs, especially embedded SVG card images, can silently break navigation. Replace them with lightweight objects or local assets.

## `Cannot read properties of undefined`

Trace the consuming store or component. Add a fixture that matches the exact response shape. Common failures are missing arrays used by `.map`, objects used by `.find`, and optional strings passed to `.trim`.

## `Platform.Version.toString()` on Web

React Native Web may leave `Platform.Version` undefined. Use `String(Platform.Version ?? "web")` in Preview-safe code.

## WebView or KYC scan errors

Alias `react-native-webview` to the Preview WebView stub. Give passport and face routes different deterministic Preview URLs so their screenshots are distinguishable.

## Page automatically navigates away

For Web Preview, hold the page at a representative visual state. Keep native behavior unchanged through a `.web.tsx` file or a `Platform.OS === "web"` guard.

## Rendered page reported as error

Separate runtime exceptions from browser diagnostics. Password form warnings, missing favicon, blocked external images, and deprecation warnings are diagnostic unless the page body or runtime exception matches a fatal pattern.

## Screenshot dimensions vary

Use fixed viewport capture. Full-page layout metrics can retain or expand height on empty controller routes. The generic runner defaults to `390x844`.

## Chrome cannot start on Linux server

Use the portable static export on a Mac with installed Chrome. The CDP runner does not need Playwright browser downloads.

## Port already in use

Choose unused ports:

```bash
python3 scripts/run_gallery.py ... --port 19106 --cdp-port 9323
```

## Partial rerun erased screenshots

The capture script preserves the screenshot directory only when `GALLERY_ROUTES` is set. Use route-filtered runs for iteration, then perform one final unfiltered full run.

## Duplicate screenshots

Check whether both routes export the same component or represent the same loading state. Document legitimate duplicates. Treat unexplained duplicates as a routing or parameter problem.
