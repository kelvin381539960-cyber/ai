# Test Status

## Passed

- Skill structure validation
- Python compilation for all scripts
- JSON parsing for all manifests and fixtures
- Sensitive-data scan
- AIX adapter dry-run against original source
- Already-applied adapter detection
- Real adapter install on a disposable AIX copy
- 87-business-route generation
- TypeScript check
- Expo Web export with enforced 4GB Node heap
- Generic screenshot audit
- Delivery HTML and ZIP generation
- ZIP integrity validation
- Mac direct CDP fixture capture: 2 rendered + 1 non-visual
- Existing AIX final baseline: 87 PNG, 0 runtime errors, 0 blank visual pages
- Final Skill full AIX run on Mac: 87/87 routes, 86 rendered, 1 non-visual, 0 errors, 0 blanks, 87 PNG at 390x844

## Environment-specific limitation

The server does not provide a usable system Chrome or `websocket-client`, so the self-contained browser smoke test is designed to run on the Mac. The preflight check stops before capture when these dependencies are absent.
