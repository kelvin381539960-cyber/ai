#!/usr/bin/env python3
import argparse, hashlib, json
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image, ImageStat

def parse_args():
    p=argparse.ArgumentParser(); p.add_argument('--results',required=True); p.add_argument('--screenshots',required=True); p.add_argument('--output',required=True); p.add_argument('--width',type=int,default=390); p.add_argument('--height',type=int,default=844); p.add_argument('--allow-mixed-dimensions',action='store_true'); return p.parse_args()

def resolve(item, rf, root):
    raw=Path(item.get('screenshot','')); candidates=[]
    if raw.is_absolute(): candidates.append(raw)
    else:
        candidates += [rf.parent/raw, root/raw, root/item.get('category','')/raw.name]
        if len(raw.parts)>1: candidates.append(root.joinpath(*raw.parts[1:]))
    return next((p for p in candidates if p.is_file()), candidates[-1] if candidates else root/raw.name)

def metrics(path):
    with Image.open(path) as im:
        im.load(); size=im.size; gray=im.convert('L').resize((64,64)); ex=gray.getextrema(); sd=ImageStat.Stat(gray).stddev[0]
    return size, round(sd,4), (ex[1]-ex[0]<=3 or sd<1.0)

def main():
    a=parse_args(); rf=Path(a.results).resolve(); root=Path(a.screenshots).resolve(); out=Path(a.output).resolve(); out.mkdir(parents=True,exist_ok=True)
    rows=json.loads(rf.read_text(encoding='utf-8')); statuses=Counter(x.get('status','unknown') for x in rows); pngs=sorted(root.rglob('*.png'))
    dims=Counter(); missing=[]; corrupt=[]; blankish=[]; wrong=[]; hashes=defaultdict(list)
    for x in rows:
        route=x.get('route',''); p=resolve(x,rf,root)
        if not p.is_file(): missing.append(route); continue
        try:
            size,sd,near=metrics(p); dims[size]+=1
            if not a.allow_mixed_dimensions and size!=(a.width,a.height): wrong.append({'route':route,'size':list(size)})
            if near and x.get('status')!='non-visual': blankish.append({'route':route,'stddev':sd})
            hashes[hashlib.sha256(p.read_bytes()).hexdigest()].append(route)
        except Exception as e: corrupt.append({'route':route,'error':str(e)})
    errors=[x.get('route','') for x in rows if x.get('status')=='error']; blanks=[x.get('route','') for x in rows if x.get('status')=='blank']; unknown=[x.get('route','') for x in rows if x.get('status') not in {'rendered','non-visual','error','blank'}]
    dup=[v for v in hashes.values() if len(v)>1]; fatal=bool(errors or blanks or unknown or missing or corrupt or blankish or wrong)
    data={'ok':not fatal,'routeCount':len(rows),'pngCount':len(pngs),'statusCounts':dict(statuses),'dimensions':{f'{w}x{h}':n for (w,h),n in dims.items()},'errors':errors,'blanks':blanks,'unknownStatuses':unknown,'missing':missing,'corrupt':corrupt,'nearBlankVisualRoutes':blankish,'wrongSize':wrong,'duplicateGroups':dup}
    (out/'audit-results.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    lines=['# Screenshot Audit','',f"- Result: {'PASS' if not fatal else 'FAIL'}",f'- Routes: {len(rows)}',f'- PNG files: {len(pngs)}',f'- Statuses: {dict(statuses)}',f"- Dimensions: {data['dimensions']}",'']
    for title,values in [('Errors',errors),('Blank visual routes',blanks),('Unknown statuses',unknown),('Missing screenshots',missing),('Corrupt screenshots',corrupt),('Near-blank visual routes',blankish),('Wrong dimensions',wrong),('Duplicate groups',dup)]:
        lines += [f'## {title}',''] + ([f'- `{v}`' for v in values] if values else ['- None']) + ['']
    (out/'AUDIT_REPORT.md').write_text('\n'.join(lines),encoding='utf-8'); print(json.dumps({'ok':not fatal,'routes':len(rows),'png':len(pngs),'statuses':dict(statuses),'duplicateGroups':len(dup)},ensure_ascii=False)); raise SystemExit(0 if not fatal else 2)
if __name__=='__main__': main()
