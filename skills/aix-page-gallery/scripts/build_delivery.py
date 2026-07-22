#!/usr/bin/env python3
import argparse, hashlib, html, json, shutil, zipfile
from pathlib import Path


def zip_dir(src,out):
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(src.rglob('*')):
            if p.is_file(): z.write(p,p.relative_to(src.parent))


def main():
    ap=argparse.ArgumentParser(description='Build browsable Page Gallery delivery')
    ap.add_argument('--results',required=True); ap.add_argument('--screenshots',required=True)
    ap.add_argument('--output',required=True); ap.add_argument('--site'); ap.add_argument('--name',default='Page_Gallery_Final')
    a=ap.parse_args(); out=Path(a.output).resolve(); shutil.rmtree(out,ignore_errors=True); out.mkdir(parents=True)
    data=json.loads(Path(a.results).read_text()); shots=Path(a.screenshots).resolve()
    shutil.copytree(shots,out/'screenshots'); shutil.copy2(a.results,out/'routes.json')
    for n in ('capture-results.csv','CAPTURE_REPORT.md','audit-report.json','AUDIT_REPORT.md'):
        p=Path(a.results).parent/n
        if p.exists(): shutil.copy2(p,out/n)
    if a.site: shutil.copytree(Path(a.site).resolve(),out/'page-gallery'/'site')
    groups={}
    for x in data: groups.setdefault(x.get('category','other'),[]).append(x)
    css='body{font-family:-apple-system,sans-serif;margin:0;background:#f5f6f8;color:#161616}.h{position:sticky;top:0;background:#fff;padding:18px 24px;border-bottom:1px solid #ddd;z-index:2}.w{padding:24px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}.c{background:#fff;border-radius:14px;padding:12px;box-shadow:0 1px 5px #0001}.c img{width:100%;border:1px solid #eee;border-radius:10px}.r{font-size:12px;word-break:break-all;margin-top:8px}.s{font-size:11px;color:#666}.nv{border:2px dashed #aaa;padding:50px 8px;text-align:center;border-radius:10px;color:#777}'
    parts=[f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>{html.escape(a.name)}</title><style>{css}</style></head><body><div class="h"><h1>{html.escape(a.name)}</h1><p>{len(data)} routes</p></div><div class="w">']
    for cat,items in sorted(groups.items()):
        parts.append(f'<h2>{html.escape(cat)}</h2><div class="g">')
        for x in items:
            route=html.escape(x['route']); status=html.escape(x['status']); filename=Path(x['screenshot']).name
            matches=list((out/'screenshots').rglob(filename)); src=matches[0].relative_to(out).as_posix() if matches else ''
            visual='<div class="nv">Non-visual controller</div>' if x['status']=='non-visual' else f'<a href="{src}"><img loading="lazy" src="{src}" alt="{route}"></a>'
            parts.append(f'<article class="c">{visual}<div class="r">{route}</div><div class="s">{status}</div></article>')
        parts.append('</div>')
    parts.append('</div></body></html>'); (out/'index.html').write_text(''.join(parts))
    rendered=sum(x['status']=='rendered' for x in data); nonvisual=sum(x['status']=='non-visual' for x in data)
    (out/'README.md').write_text(f'# {a.name}\n\nOpen `index.html`.\n\n- Routes: {len(data)}\n- Rendered: {rendered}\n- Non-visual: {nonvisual}\n')
    full=out.parent/f'{out.name}.zip'; shots_zip=out.parent/f'{out.name}_screenshots.zip'; zip_dir(out,full); zip_dir(out/'screenshots',shots_zip)
    for p in (full,shots_zip): print(p,hashlib.sha256(p.read_bytes()).hexdigest())


if __name__=='__main__': main()
