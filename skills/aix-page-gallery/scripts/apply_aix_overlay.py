#!/usr/bin/env python3
import argparse
import filecmp
import json
import shutil
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADAPTER = ROOT / 'adapters' / 'aix'
OVERLAY = ADAPTER / 'overlay'
PATCH = ADAPTER / 'aix-runtime.patch'
SCRIPTS = {
    'gallery:generate': 'node scripts/generate-page-gallery-registry.js',
    'gallery:web': 'npm run gallery:generate && CI=1 EXPO_NO_TELEMETRY=1 expo start --web --port 19006',
    'gallery:export': 'npm run gallery:generate && NODE_OPTIONS=--max-old-space-size=4096 EXPO_NO_TELEMETRY=1 expo export --platform web --output-dir dist-page-gallery',
}


def patch_command(reverse=False, dry=True):
    command = ['patch', '-p1', '--batch', '--silent', '--forward']
    if reverse:
        command.append('-R')
    if dry:
        command.append('--dry-run')
    command += ['-i', str(PATCH)]
    return command


def patch_state(project):
    quiet = {'stdout': subprocess.DEVNULL, 'stderr': subprocess.DEVNULL}
    if subprocess.run(patch_command(), cwd=project, **quiet).returncode == 0:
        return 'apply'
    if subprocess.run(patch_command(reverse=True), cwd=project, **quiet).returncode == 0:
        return 'applied'
    return 'conflict'


def main():
    parser = argparse.ArgumentParser(description='Apply verified AIX Page Gallery overlay in an isolated worktree')
    parser.add_argument('--project', required=True)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--keep-playground', action='store_true')
    parser.add_argument('--skip-patch', action='store_true')
    args = parser.parse_args()

    project = Path(args.project).resolve()
    if not (project / 'package.json').is_file() or not (project / 'src/app').is_dir():
        raise SystemExit('Not an Expo project root')

    state = 'skipped' if args.skip_patch else patch_state(project)
    if state == 'conflict':
        raise SystemExit('AIX runtime patch does not match this source version; adapt the patch manually')

    files = []
    conflicts = []
    for source in OVERLAY.rglob('*'):
        if not source.is_file():
            continue
        relative = source.relative_to(OVERLAY)
        target = project / relative
        files.append((source, target))
        if target.exists() and not filecmp.cmp(source, target, shallow=False):
            conflicts.append(str(relative))

    if conflicts and not args.force:
        raise SystemExit('Overlay conflicts; review and rerun with --force:\n' + '\n'.join(conflicts))

    plan = {
        'project': str(project),
        'patch': state,
        'overlayFiles': len(files),
        'conflicts': conflicts,
        'movePlayground': not args.keep_playground,
    }
    print(json.dumps(plan, indent=2))
    if args.dry_run:
        return

    backup = project / '.page-gallery-backup' / time.strftime('%Y%m%d-%H%M%S')
    backup.mkdir(parents=True)

    backup_paths = [target.relative_to(project) for _, target in files if target.exists()]
    backup_paths += [Path(value) for value in (ADAPTER / 'patched-files.txt').read_text().splitlines()
                     if value and value not in {'.npmrc', 'package.json'}]
    for relative in dict.fromkeys(backup_paths):
        source = project / relative
        if source.exists():
            destination = backup / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

    if state == 'apply':
        if subprocess.run(patch_command(dry=False), cwd=project).returncode:
            raise SystemExit('Patch failed after successful dry-run')

    for source, target in files:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

    playground = project / 'src/app/playground'
    excluded = project / 'src/preview/excluded-routes/playground'
    if not args.keep_playground and playground.exists() and not excluded.exists():
        excluded.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(playground, excluded)

    package_path = project / 'package.json'
    package = json.loads(package_path.read_text())
    package.setdefault('scripts', {}).update(SCRIPTS)
    package.setdefault('dependencies', {}).setdefault('@lottiefiles/dotlottie-react', '^0.13.5')
    package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n')

    print(f'Applied. Backup: {backup}')
    print('Next: npm install && npm run gallery:export')


if __name__ == '__main__':
    main()
