# Installation and execution

## Install into an Agent-enabled project

```bash
/opt/AIX代码/.skills/page-screenshot-suite/aix-page-gallery-e2e/scripts/install_suite.sh /path/to/project
```

This installs five sibling skills under `<project>/.agents/skills/` and backs up
older copies under `.page-screenshot-skill-backup/<timestamp>/`.

## Self-test

```bash
<project>/.agents/skills/aix-page-gallery-e2e/scripts/self_test.sh
```

## AIX adapter check

```bash
<project>/.agents/skills/aix-preview-adapter/scripts/install_aix_adapter.py \
  --target /path/to/aix-master --mode check
```

## Build-node package

```bash
<project>/.agents/skills/aix-page-gallery-e2e/scripts/package_portable.sh \
  --project /path/to/aix-master \
  --site dist-page-gallery \
  --registry src/preview/pageRegistry.generated.json \
  --output /tmp/page-gallery-portable.tgz
```

## Mac capture-node execution

```bash
/path/to/aix-page-gallery-e2e/scripts/run_portable_capture.sh \
  --bundle /path/to/page-gallery-portable.tgz \
  --output /path/to/delivery
```

Use `GALLERY_RESUME=1` for interrupted capture recovery.
