#!/usr/bin/env python3
import argparse
import importlib.util
import json
import platform
import shutil
import sys
from pathlib import Path


def find_chrome(explicit=''):
    if explicit and Path(explicit).exists():
        return explicit
    candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    for name in ('google-chrome', 'chromium', 'chrome'):
        found = shutil.which(name)
        if found:
            return found
    return ''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--project')
    parser.add_argument('--chrome', default='')
    args = parser.parse_args()
    chrome = find_chrome(args.chrome)
    checks = {
        'python': {'ok': sys.version_info >= (3, 9), 'value': sys.version.split()[0]},
        'websocket-client': {'ok': importlib.util.find_spec('websocket') is not None},
        'Pillow': {'ok': importlib.util.find_spec('PIL') is not None},
        'chrome': {'ok': bool(chrome), 'value': chrome},
    }
    if args.project:
        root = Path(args.project)
        checks.update({
            'project': {'ok': root.is_dir(), 'value': str(root)},
            'package.json': {'ok': (root / 'package.json').is_file()},
            'node': {'ok': bool(shutil.which('node')), 'value': shutil.which('node')},
            'npm': {'ok': bool(shutil.which('npm')), 'value': shutil.which('npm')},
        })
    ok = all(value['ok'] for value in checks.values())
    print(json.dumps({'ok': ok, 'platform': platform.platform(), 'checks': checks}, indent=2))
    if not ok:
        print('Install missing Python packages with: python3 -m pip install websocket-client pillow', file=sys.stderr)
    raise SystemExit(0 if ok else 2)


if __name__ == '__main__':
    main()
