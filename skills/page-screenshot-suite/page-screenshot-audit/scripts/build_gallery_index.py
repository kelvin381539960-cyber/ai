#!/usr/bin/env python3
import argparse, html, json
from collections import defaultdict
from pathlib import Path

def parse():
 p=argparse.ArgumentParser(); p.add_argument('--results',required=True); p.add_argument('--screenshots',required=True); p.add_argument('--output',required=True); p.add_argument('--title',default='Page Screenshot Gallery'); return p.parse_args()
def resolve(item,rf,root):
 raw=Path(item.get('screenshot','')); c=[rf.parent/raw,root/item.get('category','')/raw.name];
 if len(raw.parts)>1:c.append(root.joinpath(*raw.parts[1:]));
 return next((x for x in c if x.is_file()),c[-1])
def main():
 a=parse(); rf=Path(a.results).resolve(); root=Path(a.screenshots).resolve(); out=Path(a.output).resolve(); rows=json.loads(rf.read_text()); groups=defaultdict(list)
 for x in rows:groups[x.get('category','other')].append(x)
 css='body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f5f6f8;color:#161616}.head{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #ddd;padding:18px 24px}.wrap{padding:24px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}.card{background:white;border-radius:14px;padding:12px;box-shadow:0 1px 5px #0001}.card img{width:100%;border:1px solid #eee;border-radius:10px}.route{font-size:12px;word-break:break-all;margin-top:10px}.status{font-size:11px;color:#666}.nonvisual{border:2px dashed #aaa;padding:40px 10px;text-align:center;border-radius:10px;color:#777}'
 rendered=sum(x.get('status')=='rendered' for x in rows); nonvisual=sum(x.get('status')=='non-visual' for x in rows)
 parts=[f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(a.title)}</title><style>{css}</style></head><body><div class="head"><h1>{html.escape(a.title)}</h1><p>{rendered} visual · {nonvisual} non-visual · {len(rows)} total</p></div><div class="wrap">']
 for cat in sorted(groups):
  parts.append(f'<section><h2>{html.escape(cat)}</h2><div class="grid">')
  for x in groups[cat]:
   route=html.escape(x.get('route','')); status=html.escape(x.get('status','unknown')); parts.append('<article class="card">')
   if x.get('status')=='non-visual':parts.append('<div class="nonvisual">Non-visual flow controller route</div>')
   else:
    image=resolve(x,rf,root)
    try:src=image.relative_to(out.parent)
    except ValueError:src=image
    src=html.escape(str(src)); parts.append(f'<a href="{src}"><img loading="lazy" src="{src}" alt="{route}"></a>')
   parts.append(f'<div class="route">{route}</div><div class="status">{status}</div></article>')
  parts.append('</div></section>')
 parts.append('</div></body></html>'); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(''.join(parts),encoding='utf-8'); print(out)
if __name__=='__main__':main()
