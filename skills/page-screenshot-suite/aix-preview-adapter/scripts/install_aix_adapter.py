#!/usr/bin/env python3
import argparse, hashlib, json, shutil, time
from pathlib import Path
CRITICAL={'metro.config.js','tsconfig.json','package.json','src/app/_layout.tsx','src/app/index.tsx','src/aix/splash/SplashPage.tsx','src/network/AixUserAgent.ts'}
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def parse():
 p=argparse.ArgumentParser(); p.add_argument('--target',required=True); p.add_argument('--mode',choices=['check','install','snapshot'],default='check'); p.add_argument('--allow-overwrite',action='store_true'); return p.parse_args()
def main():
 a=parse(); skill=Path(__file__).resolve().parents[1]; source=skill/'templates/aix-source'; target=Path(a.target).resolve()
 if not source.is_dir() or not target.is_dir():raise SystemExit('Missing template or target')
 report={'mode':a.mode,'target':str(target),'matched':[],'missing':[],'different':[],'copied':[],'references':[]}; backup=target/'.page-gallery-backup'/time.strftime('%Y%m%d-%H%M%S'); reference=target/'.page-gallery-reference'
 for src in sorted(p for p in source.rglob('*') if p.is_file()):
  rel=src.relative_to(source).as_posix(); dst=target/rel
  if dst.is_file() and digest(dst)==digest(src):report['matched'].append(rel);continue
  (report['missing'] if not dst.exists() else report['different']).append(rel)
  if a.mode=='check':continue
  if rel in CRITICAL and a.mode=='install':
   ref=reference/rel;ref.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,ref);report['references'].append(rel);continue
  if a.mode=='snapshot' and not a.allow_overwrite:raise SystemExit('snapshot requires --allow-overwrite')
  if dst.exists():saved=backup/rel;saved.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dst,saved)
  dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);report['copied'].append(rel)
 out=target/'page-gallery-adapter-install-report.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'mode':a.mode,'matched':len(report['matched']),'missing':len(report['missing']),'different':len(report['different']),'copied':len(report['copied']),'references':len(report['references']),'report':str(out)},ensure_ascii=False))
if __name__=='__main__':main()
