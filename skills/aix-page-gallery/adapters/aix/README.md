# Verified AIX adapter

This overlay and runtime patch reproduce the AIX Page Gallery verified on 2026-07-22.

Use only in an isolated worktree. Start with:

```bash
python3 scripts/apply_aix_overlay.py --project /path/to/aix-master --dry-run
```

Use `--force` only after reviewing every conflict. The adapter moves `src/app/playground` outside the Expo Router tree unless `--keep-playground` is supplied.
