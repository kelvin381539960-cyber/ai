#!/usr/bin/env python3
import hashlib
import json
import py_compile
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    'SKILL.md', 'README.md', 'VERSION', 'requirements.txt',
    'scripts/capture_cdp.py', 'scripts/serve_static.py', 'scripts/audit_gallery.py',
    'scripts/build_delivery.py', 'scripts/run_gallery.py', 'scripts/check_environment.py',
    'scripts/apply_aix_overlay.py', 'adapters/aix/manifest.json', 'adapters/aix/aix-runtime.patch',
    'tests/run_smoke_test.sh', 'tests/fixture-config/pageRegistry.json',
]
SECRET_PATTERNS = [
    re.compile(r'_auth\s*='),
    re.compile(r'BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY'),
    re.compile(r'AKIA[0-9A-Z]{16}'),
    re.compile(r'verdaccio\.atomecorp', re.I),
]


def main():
    failures=[]
    for relative in REQUIRED:
        if not (ROOT/relative).exists(): failures.append(f'missing {relative}')
    skill=(ROOT/'SKILL.md').read_text()
    if not skill.startswith('---\n') or 'name: aix-page-gallery' not in skill: failures.append('invalid SKILL.md frontmatter')
    for script in (ROOT/'scripts').glob('*.py'):
        try: py_compile.compile(str(script),doraise=True)
        except Exception as e: failures.append(f'compile {script.name}: {e}')
    for path in ROOT.rglob('*.json'):
        try: json.loads(path.read_text())
        except Exception as e: failures.append(f'json {path.relative_to(ROOT)}: {e}')
    for path in ROOT.rglob('*'):
        if not path.is_file() or path.suffix.lower() in {'.png','.jpg','.jpeg','.zip','.tgz'}: continue
        text=path.read_text(errors='ignore')
        for pattern in SECRET_PATTERNS:
            if pattern.search(text): failures.append(f'sensitive pattern {pattern.pattern} in {path.relative_to(ROOT)}')
    manifest=json.loads((ROOT/'adapters/aix/manifest.json').read_text())
    for item in manifest.get('overlayFiles',[]):
        path=ROOT/'adapters/aix/overlay'/item['path']
        if not path.exists(): failures.append(f"manifest missing {item['path']}"); continue
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        if digest!=item['sha256']: failures.append(f"manifest hash mismatch {item['path']}")
    result={'ok':not failures,'failures':failures,'root':str(ROOT)}
    print(json.dumps(result,indent=2)); raise SystemExit(0 if not failures else 2)


if __name__=='__main__': main()
