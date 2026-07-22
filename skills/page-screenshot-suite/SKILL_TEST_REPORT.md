# Skill Suite Test Report

Date: 2026-07-22
Version: 1.0.0

## Passed

- Five named `SKILL.md` files present and discoverable among other project skills.
- AIX adapter template check: 43 matched, 0 missing, 0 different.
- Generic Expo scanner: 90 total routes, 87 business routes, 71 parameterized routes, 31 presets.
- `ivs-begin-page` correctly detected as non-visual.
- Python syntax checks: CDP capture, static server, audit, index builder, installer.
- Node syntax check: generic route scanner.
- Shell syntax checks: package, local runner, portable runner, installer, self-test.
- Portable bundle test: 368 members with site, registry, capture, audit, and index tools.
- Positive audit test passed with rendered + non-visual pages.
- Negative audit test rejected a near-blank visual page with exit code 2.
- Canonical suite and both AIX `.agents/skills` installations match.
- Installed self-tests pass in projects that contain additional unrelated skills.
- CDP capture supports per-route checkpoint and `GALLERY_RESUME=1` recovery.

## Platform note

The verified reference architecture uses Linux/server static export and macOS system
Chrome for CDP capture. The Linux server is not the reference browser node because its
headless browser previously failed under thread/sandbox constraints.
