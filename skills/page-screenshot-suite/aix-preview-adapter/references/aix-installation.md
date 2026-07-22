# AIX adapter installation

Check:

```bash
python3 scripts/install_aix_adapter.py --target /path/to/aix-master --mode check
```

Safe install copies additive files and writes high-risk merge references:

```bash
python3 scripts/install_aix_adapter.py --target /path/to/aix-master --mode install
```

Exact verified snapshot, only in a disposable worktree:

```bash
python3 scripts/install_aix_adapter.py --target /path/to/aix-master --mode snapshot --allow-overwrite
```

Replaced files are backed up under `.page-gallery-backup/<timestamp>/`.
