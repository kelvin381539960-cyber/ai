#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys
from pathlib import Path
from check_environment import find_chrome

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'scripts'


def call(command, **kwargs):
    print('+', ' '.join(map(str, command)), flush=True)
    return subprocess.run(command, **kwargs)


def main():
    parser = argparse.ArgumentParser(description='Build, capture, audit and package an Expo Page Gallery')
    parser.add_argument('--project')
    parser.add_argument('--site')
    parser.add_argument('--registry')
    parser.add_argument('--output', required=True)
    parser.add_argument('--build-command', default='npm run gallery:export')
    parser.add_argument('--skip-build', action='store_true')
    parser.add_argument('--site-relative', default='dist-page-gallery')
    parser.add_argument('--registry-relative', default='src/preview/pageRegistry.generated.json')
    parser.add_argument('--chrome', default='')
    parser.add_argument('--port', type=int, default=19006)
    parser.add_argument('--cdp-port', type=int, default=9223)
    parser.add_argument('--wait-seconds', type=float, default=1.8)
    parser.add_argument('--routes', default='')
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--health-path', default='/')
    parser.add_argument('--name', default='Page_Gallery_Final')
    parser.add_argument('--no-delivery', action='store_true')
    args = parser.parse_args()

    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    project = Path(args.project).resolve() if args.project else None

    check = [sys.executable, str(SCRIPTS / 'check_environment.py')]
    if project:
        check += ['--project', str(project)]
    if args.chrome:
        check += ['--chrome', args.chrome]
    if call(check).returncode:
        raise SystemExit(2)

    if project and not args.skip_build:
        print('+', args.build_command, flush=True)
        build_env = os.environ.copy()
        build_env.setdefault('NODE_OPTIONS', '--max-old-space-size=4096')
        if subprocess.run(args.build_command, cwd=project, shell=True, env=build_env).returncode:
            raise SystemExit(3)

    if args.site:
        site = Path(args.site).resolve()
    elif project:
        site = project / args.site_relative
    else:
        raise SystemExit('--site or --project is required')

    if args.registry:
        registry = Path(args.registry).resolve()
    elif project:
        registry = project / args.registry_relative
    else:
        raise SystemExit('--registry or --project is required')

    if not site.is_dir() or not registry.is_file():
        raise SystemExit(f'Missing site or registry: {site} / {registry}')

    env = os.environ.copy()
    scheme = 'http'
    host = '127.0.0.1'
    env.update({
        'GALLERY_SITE': str(site),
        'GALLERY_REGISTRY': str(registry),
        'GALLERY_REPORT_DIR': str(output),
        'GALLERY_OUTPUT': str(output / 'screenshots'),
        'GALLERY_BASE_URL': f'{scheme}://{host}:{args.port}',
        'GALLERY_HTTP_PORT': str(args.port),
        'GALLERY_CDP_PORT': str(args.cdp_port),
        'GALLERY_WAIT_SECONDS': str(args.wait_seconds),
        'GALLERY_HEALTH_PATH': args.health_path,
        'GALLERY_STRICT': '0',
        'GALLERY_LIMIT': str(args.limit),
        'GALLERY_ROUTES': args.routes,
    })
    chrome = args.chrome or find_chrome()
    env['CHROME_PATH'] = chrome

    capture = call([sys.executable, str(SCRIPTS / 'capture_cdp.py')], env=env)
    result_file = output / 'capture-results.json'
    audit = None
    if result_file.exists():
        audit_registry = registry
        if args.routes or args.limit > 0:
            import json
            selected = [item for item in json.loads(registry.read_text()) if not item.get('internal')]
            if args.routes:
                allowed = {value.strip() for value in args.routes.split(',') if value.strip()}
                selected = [item for item in selected if item.get('route') in allowed]
            if args.limit > 0:
                selected = selected[:args.limit]
            audit_registry = output / 'selected-registry.json'
            audit_registry.write_text(json.dumps(selected, ensure_ascii=False, indent=2) + '\n')
        audit = call([
            sys.executable, str(SCRIPTS / 'audit_gallery.py'),
            '--results', str(result_file),
            '--registry', str(audit_registry),
            '--screenshots', str(output / 'screenshots'),
            '--report-dir', str(output),
        ])

    ok = capture.returncode == 0 and audit is not None and audit.returncode == 0
    if ok and not args.no_delivery:
        delivery = output.parent / args.name
        command = [
            sys.executable, str(SCRIPTS / 'build_delivery.py'),
            '--results', str(result_file),
            '--screenshots', str(output / 'screenshots'),
            '--output', str(delivery),
            '--site', str(site),
            '--name', args.name,
        ]
        if call(command).returncode:
            ok = False

    print(f'OUTPUT={output}')
    print(f'RESULT={"PASS" if ok else "FAIL"}')
    raise SystemExit(0 if ok else 2)


if __name__ == '__main__':
    main()
