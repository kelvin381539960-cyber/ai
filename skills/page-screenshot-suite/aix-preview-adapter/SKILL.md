---
name: aix-preview-adapter
description: >-
  Adapt AIX React Native / Expo Router pages for deterministic Web Preview without
  changing native production behavior. Use for native-module crashes, route parameter
  blanks, API fixture errors, KYC/IVS/WebView/camera/biometric flows, and Splash capture.
allowed-tools: Bash
---

# AIX Preview Adapter

Verified source templates are under `templates/aix-source/`. Apply only in an isolated
worktree. See `references/aix-file-manifest.md` and use the installer in `scripts/`.

## Layers

- Web/native root layout split
- deterministic signed-in Preview session and global configuration
- Web request adapter plus exact response-shape fixtures
- lightweight route presets
- MMKV/local storage substitute
- TurboModule/codegen/WebView/biometric/file/share/analytics Web stubs
- Web-specific IVS biometric and Splash representations

## AIX rules

- Scan real Page/Route components, not only thin `src/app` files.
- Do not put card image data into URL parameters.
- Rewards/promotions default to valid empty structures.
- KYC passport and face scans use distinct Preview identifiers.
- `/aix/ivs/ivs-begin-page` is `nonVisual`.
- Web Splash stays visible long enough to capture a Web-loadable image.
- `Platform.Version` and device values need Web-safe fallbacks.

## Installation

`check` compares a target project with the verified template. `install` copies additive
files and places critical merge references under `.page-gallery-reference/`. `snapshot`
may overwrite all verified files only with `--allow-overwrite` in a disposable worktree.

## Validation

Generate registry, typecheck with increased Node memory, export, smoke-test Home/Card/
Wallet/KYC/IVS/WebView/Message/Splash, run all routes, then audit.

Known legitimate duplicates: card entrance/introduction and some KYC loading states.
