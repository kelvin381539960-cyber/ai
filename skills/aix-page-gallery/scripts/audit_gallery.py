#!/usr/bin/env python3
import argparse, hashlib, json
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image, ImageStat


def main():
    ap=argparse.ArgumentParser(description='Audit Page Gallery screenshots and statuses')
    ap.add_argument('--results',required=True); ap.add_argument('--registry'); ap.add_argument('--screenshots',required=True)
    ap.add_argument('--report-dir',required=True); ap.add_argument('--width',type=int,default=390); ap.add_argument('--height',type=int,default=844)
    ap.add_argument('--blank-stddev',type=float,default=1.2); ap.add_argument('--blank-lightness',type=float,default=248); ap.add_argument('--fail-on-duplicates',action='store_true')
    a=ap.parse_args(); results=json.loads(Path(a.results).read_text()); shots=Path(a.screenshots); report=Path(a.report_dir); report.mkdir(parents=True,exist_ok=True)
    expected=None
    if a.registry:
        reg=json.loads(Path(a.registry).read_text()); expected=len([x for x in reg if not x.get('internal')])
    failures=[]; warnings=[]; sizes=Counter(); hashes=defaultdict(list); near_blank=[]; missing=[]
    for item in results:
        rel=item.get('screenshot',''); p=Path(rel) if Path(rel).is_absolute() else report/rel
        if not p.exists():
            matches=list(shots.rglob(Path(rel).name)); p=matches[0] if matches else p
        if not p.exists(): missing.append(item['route']); continue
        try:
            im=Image.open(p).convert('RGB'); sizes[im.size]+=1
            if im.size!=(a.width,a.height): failures.append(f"wrong size {item['route']}: {im.size}")
            hashes[hashlib.sha256(p.read_bytes()).hexdigest()].append(item['route'])
            if item.get('status')!='non-visual':
                stats=ImageStat.Stat(im.resize((32,64)).convert('L'))
                if stats.mean[0]>=a.blank_lightness and stats.stddev[0]<a.blank_stddev: near_blank.append(item['route'])
        except Exception as e: failures.append(f"invalid image {item['route']}: {e}")
    counts=Counter(x.get('status','unknown') for x in results)
    if counts['error']: failures.append(f"error routes: {counts['error']}")
    if counts['blank']: failures.append(f"blank routes: {counts['blank']}")
    if missing: failures.append(f"missing screenshots: {len(missing)}")
    if near_blank: failures.append(f"near-blank visual screenshots: {len(near_blank)}")
    if expected is not None and len(results)!=expected: failures.append(f"route count {len(results)} != {expected}")
    duplicates=[v for v in hashes.values() if len(v)>1]
    if duplicates: (failures if a.fail_on_duplicates else warnings).append(f"duplicate groups: {len(duplicates)}")
    data={'ok':not failures,'routeCount':len(results),'expectedRouteCount':expected,'statusCounts':dict(counts),
      'imageCount':sum(sizes.values()),'sizes':{f'{w}x{h}':n for (w,h),n in sizes.items()},'missing':missing,
      'nearBlank':near_blank,'duplicateGroups':duplicates,'failures':failures,'warnings':warnings}
    (report/'audit-report.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    lines=['# Page Gallery Audit','',f"- Result: {'PASS' if data['ok'] else 'FAIL'}",f"- Routes: {len(results)}",
      f"- Statuses: {dict(counts)}",f"- Images: {data['imageCount']}",f"- Sizes: {data['sizes']}",'']
    if failures: lines+=['## Failures','']+[f'- {x}' for x in failures]+['']
    if warnings: lines+=['## Warnings','']+[f'- {x}' for x in warnings]+['']
    if duplicates: lines+=['## Exact duplicate groups','']+[f"- {', '.join(g)}" for g in duplicates]+['']
    (report/'AUDIT_REPORT.md').write_text('\n'.join(lines)); print(json.dumps(data,ensure_ascii=False,indent=2))
    raise SystemExit(0 if data['ok'] else 2)


if __name__=='__main__': main()
