# Acceptance Checklist

## Source and build

- [ ] Work happened in an isolated worktree.
- [ ] Original checkout is unchanged.
- [ ] No production API is reachable from Preview mode.
- [ ] No credentials or personal data are present in fixtures.
- [ ] TypeScript check exits `0`.
- [ ] Expo static export exits `0`.

## Route coverage

- [ ] Route registry excludes layouts, debug helpers, catch-all routes, and playground pages.
- [ ] Every business route has a deterministic Preview URL.
- [ ] Every required route parameter is populated.
- [ ] Every `nonVisual` route has source-code justification.
- [ ] Captured route count equals expected business route count.

## Capture quality

- [ ] Error routes: `0`.
- [ ] Blank visual routes: `0`.
- [ ] Missing screenshots: `0`.
- [ ] Invalid PNG files: `0`.
- [ ] Near-pure-white visual screenshots: `0`.
- [ ] All screenshots use the requested viewport.
- [ ] Native/external Preview pages are clearly labeled.
- [ ] Exact duplicate groups are explained.

## Delivery

- [ ] `index.html` opens and all screenshot links resolve.
- [ ] `routes.json` and CSV report are included.
- [ ] Capture and audit Markdown reports are included.
- [ ] Full delivery ZIP passes integrity validation.
- [ ] Screenshots-only ZIP passes integrity validation.
- [ ] SHA-256 values are recorded.
- [ ] Final response identifies exact machine and absolute paths.
