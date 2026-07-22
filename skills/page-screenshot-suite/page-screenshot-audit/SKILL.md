---
name: page-screenshot-audit
description: >-
  Audit route screenshot runs for missing files, blank/error pages, inconsistent
  dimensions, corrupt images, near-uniform screenshots, and duplicate groups.
  Use after capture and before packaging delivery.
allowed-tools: Bash
---

# Page Screenshot Audit

Run `scripts/audit_screenshots.py` with result JSON, screenshot directory, and output.
Generate the visual index with `scripts/build_gallery_index.py`.

## Fatal

- any `error`
- any visual `blank`
- unknown status
- missing/corrupt screenshot
- unexpected dimensions
- near-blank image for a visual route
- registry/result count mismatch

## Allowed with explanation

- near-blank evidence for `non-visual`
- duplicate alias routes that intentionally mount the same UI
- non-fatal resource/analytics diagnostics

The audit must exit non-zero for fatal conditions so packaging automation stops.

## Duplicate workflow

Hash PNGs, compare final URL/body text/source routes, then classify each duplicate
group as intentional shared UI or a capture defect. Fix capture defects first.

## Delivery checks

Result count equals route count; screenshot count equals result count; visual PNGs
match rendered routes; dimensions are consistent; archives pass integrity tests.
