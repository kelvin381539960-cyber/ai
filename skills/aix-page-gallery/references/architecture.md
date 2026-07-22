# Architecture

## Pipeline

```text
Expo Router source
  -> route scanner
  -> route registry + Preview parameter presets
  -> Web Preview adapters + deterministic API fixtures
  -> Expo static export
  -> local extensionless static server
  -> Chrome DevTools Protocol capture
  -> screenshot/status audit
  -> browsable delivery and ZIP files
```

## Separation of concerns

### Project adapter

Project-specific code is responsible for making every route render safely in Web Preview:

- root layout selection
- state seeding
- API fixtures
- route parameter presets
- native module aliases
- native-only page placeholders

### Generic runner

The generic runner does not know application business logic. It only:

- serves static files
- visits registry routes
- captures PNG images
- classifies runtime errors
- audits output quality
- packages delivery artifacts

## Why raw CDP

The verified server environment could not run Playwright Chromium reliably. The Mac runner talks directly to an installed Chrome through Chrome DevTools Protocol, avoiding browser downloads and reducing dependencies.

## Static route mapping

Expo exports `/aix/card/card-home.html`, while the router expects `/aix/card/card-home`. `serve_static.py` maps an extensionless request to the corresponding HTML file before falling back to directory handling.

## Screenshot policy

The default is a fixed mobile viewport of `390x844`. This produces comparable screenshots and prevents an empty controller route from inheriting a previous page's long layout height. Full-page capture is opt-in.
