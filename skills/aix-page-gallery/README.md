# AIX Page Gallery Skill

A reusable and verified workflow for turning an Expo Router / React Native application into a safe Web Preview, capturing every business route, auditing screenshot quality, and packaging the result.

## Canonical location

```text
/Users/kelvin/Documents/Playground/skills/aix-page-gallery
```

## Quick self-test

```bash
cd /Users/kelvin/Documents/Playground/skills/aix-page-gallery
tests/run_smoke_test.sh
```

## Capture an existing export

```bash
python3 scripts/run_gallery.py \
  --site /path/to/dist-page-gallery \
  --registry /path/to/pageRegistry.generated.json \
  --output /path/to/output/run \
  --skip-build \
  --name AIX_Page_Gallery_Final
```

## Apply the verified AIX adapter

Always use an isolated worktree.

```bash
python3 scripts/apply_aix_overlay.py --project /path/to/aix-master --dry-run
python3 scripts/apply_aix_overlay.py --project /path/to/aix-master
```

Then run:

```bash
npm install
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm run gallery:export
```

See `SKILL.md` for the full mandatory workflow and acceptance criteria.
