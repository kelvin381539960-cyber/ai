# Page Screenshot Skill Suite

A reusable workflow for Expo Router / React Native page inventory, Web Preview, route screenshots, audit, and delivery.

## Skills

1. `aix-page-gallery-e2e`: full orchestration.
2. `expo-router-page-gallery`: route registry and static export.
3. `chrome-cdp-page-capture`: Chrome DevTools Protocol capture on macOS.
4. `page-screenshot-audit`: missing/blank/error/dimension/duplicate audit.
5. `aix-preview-adapter`: AIX-specific Preview fixtures and Web/native adapters.

## Verified baseline

The reference AIX run produced 87 route records: 86 visual screenshots, 1 explicitly non-visual controller route, 0 errors, and 0 unexplained blanks.

## Recommended stable entry

Use `../aix-page-gallery/` for new work. It is the consolidated v1.0.0 skill with fixed-viewport raw Chrome CDP capture, strict audit, a safe AIX overlay installer, enforced 4GB Node heap for Expo export, and complete delivery packaging.

The modular skills in this directory remain as references. The consolidated skill is the supported execution path.
