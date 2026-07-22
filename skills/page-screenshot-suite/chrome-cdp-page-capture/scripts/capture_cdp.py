#!/usr/bin/env python3
import base64, csv, json, os, re, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request
from pathlib import Path
import websocket

ROOT=Path(__file__).resolve().parent
SITE=ROOT/'site';REGISTRY=ROOT/'config'/'pageRegistry.json'
OUTPUT=Path(os.environ.get('GALLERY_OUTPUT',ROOT/'screenshots'))
RESULTS_DIR=Path(os.environ.get('GALLERY_RESULTS_DIR',ROOT))
BASE_URL=os.environ.get('GALLERY_BASE_URL','http://127.0.0.1:19006')
LIMIT=int(os.environ.get('GALLERY_LIMIT','0'));SETTLE=float(os.environ.get('GALLERY_SETTLE_SECONDS','1.8'))
ROUTE_FILTER={x.strip() for x in os.environ.get('GALLERY_ROUTES','').split(',') if x.strip()}
CLEAR_OUTPUT=os.environ.get('GALLERY_CLEAR_OUTPUT','1')!='0';START_SERVER=os.environ.get('GALLERY_START_SERVER','1')!='0';HEALTH_ROUTE=os.environ.get('GALLERY_HEALTH_ROUTE','')
HTTP_PORT=int(urllib.parse.urlparse(BASE_URL).port or 19006);CDP_PORT=int(os.environ.get('GALLERY_CDP_PORT','9223'))
DEFAULT_PARAMS={'preview':'1','scenario':'default','transactionId':'preview-card-payment','cardId':'preview-card-001','messageId':'preview-message-001','id':'preview-id','type':'VIRTUAL','status':'SUCCESS','resultType':'success','fullName':'Preview User','originalFullName':'Preview User','countryCode':'SG','currency':'USDT','network':'ETH','networkCode':'ETH','asset':'USDT','amount':'100','sellCurrency':'USDT','buyCurrency':'USDC','nextPath':'/aix/debug/page-gallery','modal':'card','nextParams':'{}'}
DEFAULT_PARAMS['kycNavParams']=json.dumps({'currentCountryISO':'SG','currentDisplayName':'Singapore','allowCountryISOList':['SG','HK','US'],'targetPage':'/aix/home/home-page','aaiPassportUrl':'preview://passport-verification','aaiLivenessUrl':'preview://face-verification'})
DEFAULT_PARAMS['depositMethod']=json.dumps({'method':'EXCHANGE','displayName':'Exchange','description':'Preview deposit method','currencies':[],'order':1})

def chrome_path():
    explicit=os.environ.get('CHROME_PATH')
    candidates=[explicit,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',shutil.which('google-chrome'),shutil.which('chromium'),shutil.which('chromium-browser')]
    return next((x for x in candidates if x and Path(x).exists()),None)

def wait_http(url,timeout=30):
    deadline=time.time()+timeout;last=None
    while time.time()<deadline:
        try:
            with urllib.request.urlopen(url,timeout=2) as r:
                if r.status==200:return
        except Exception as e:last=e
        time.sleep(.25)
    raise RuntimeError(f'HTTP not ready: {last}')

def get_json(url):
    with urllib.request.urlopen(url,timeout=5) as r:return json.load(r)

class CDP:
    def __init__(self,url):
        self.ws=websocket.create_connection(url,timeout=15,origin='http://127.0.0.1');self.next_id=0;self.events=[]
    def close(self):self.ws.close()
    def receive(self):
        m=json.loads(self.ws.recv())
        if 'method' in m:self.events.append(m)
        return m
    def call(self,method,params=None,timeout=30):
        self.next_id+=1;cid=self.next_id;self.ws.send(json.dumps({'id':cid,'method':method,'params':params or {}}));deadline=time.time()+timeout
        while time.time()<deadline:
            self.ws.settimeout(max(.1,deadline-time.time()));m=self.receive()
            if m.get('id')!=cid:continue
            if 'error' in m:raise RuntimeError(f"{method}: {m['error']}")
            return m.get('result',{})
        raise TimeoutError(method)
    def wait_event(self,method,timeout=30):
        deadline=time.time()+timeout
        while time.time()<deadline:
            for i,e in enumerate(self.events):
                if e.get('method')==method:return self.events.pop(i)
            self.ws.settimeout(max(.1,deadline-time.time()))
            try:self.receive()
            except websocket.WebSocketTimeoutException:pass
        raise TimeoutError(method)
    def take(self,methods):
        selected=[e for e in self.events if e.get('method') in methods];self.events=[e for e in self.events if e.get('method') not in methods];return selected

def safe_name(value):return re.sub(r'[^a-zA-Z0-9._-]+','-',value.lstrip('/'))
def build_url(item):
    params=dict(DEFAULT_PARAMS);params.update(item.get('previewParams') or {})
    for name in item.get('params',[]):params.setdefault(name,f'preview-{name}')
    return BASE_URL+item['route']+'?'+urllib.parse.urlencode(params)
def event_message(event):
    p=event.get('params',{})
    if event.get('method')=='Runtime.exceptionThrown':
        d=p.get('exceptionDetails',{});x=d.get('exception',{});return x.get('description') or d.get('text') or 'Runtime exception'
    if event.get('method')=='Log.entryAdded':return p.get('entry',{}).get('text','Log error')
    return json.dumps(p,ensure_ascii=False)

def write_reports(rows):
    RESULTS_DIR.mkdir(parents=True,exist_ok=True)
    (RESULTS_DIR/'capture-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (RESULTS_DIR/'capture-results.csv').open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.writer(f);w.writerow(['route','category','status','screenshot','error'])
        for x in rows:w.writerow([x['route'],x['category'],x['status'],x['screenshot'],x.get('navigationError') or ' | '.join(x.get('pageErrors',[]))])
    counts={}
    for x in rows:counts[x['status']]=counts.get(x['status'],0)+1
    lines=['# Page Gallery Capture','',f'- Total routes: {len(rows)}',f"- Rendered: {counts.get('rendered',0)}",f"- Non-visual: {counts.get('non-visual',0)}",f"- Blank: {counts.get('blank',0)}",f"- Error: {counts.get('error',0)}",'','| Route | Category | Status | Screenshot |','|---|---|---|---|']
    lines += [f"| {x['route']} | {x['category']} | {x['status']} | {x['screenshot']} |" for x in rows]
    (RESULTS_DIR/'CAPTURE_REPORT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8');return counts

def main():
    chrome=chrome_path()
    if not chrome:raise FileNotFoundError('Chrome/Chromium not found; set CHROME_PATH')
    registry=json.loads(REGISTRY.read_text(encoding='utf-8'));items=[x for x in registry if not x.get('internal')]
    if ROUTE_FILTER:items=[x for x in items if x.get('route') in ROUTE_FILTER]
    if LIMIT>0:items=items[:LIMIT]
    if CLEAR_OUTPUT:shutil.rmtree(OUTPUT,ignore_errors=True)
    OUTPUT.mkdir(parents=True,exist_ok=True);RESULTS_DIR.mkdir(parents=True,exist_ok=True)
    profile=tempfile.mkdtemp(prefix='page-gallery-chrome-');chrome_log=(RESULTS_DIR/'chrome-cdp.log').open('w',encoding='utf-8');http_log=(RESULTS_DIR/'http-server.log').open('w',encoding='utf-8');http_process=None;chrome_process=None;cdp=None
    try:
        if START_SERVER:
            http_process=subprocess.Popen([sys.executable,str(ROOT/'serve_static.py'),'--port',str(HTTP_PORT),'--directory',str(SITE)],stdout=http_log,stderr=subprocess.STDOUT);health=HEALTH_ROUTE or (items[0]['route'] if items else '/');wait_http(BASE_URL+health)
        chrome_process=subprocess.Popen([chrome,'--headless=new',f'--remote-debugging-port={CDP_PORT}','--remote-allow-origins=*',f'--user-data-dir={profile}','--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--no-default-browser-check','about:blank'],stdout=chrome_log,stderr=subprocess.STDOUT)
        wait_http(f'http://127.0.0.1:{CDP_PORT}/json/version');targets=get_json(f'http://127.0.0.1:{CDP_PORT}/json/list');page=next(x for x in targets if x.get('type')=='page');cdp=CDP(page['webSocketDebuggerUrl'])
        cdp.call('Page.enable');cdp.call('Runtime.enable');cdp.call('Log.enable');cdp.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True,'screenWidth':390,'screenHeight':844})
        rows=[];fatal_pattern=re.compile(r'Application Error|Unexpected Application Error|TurboModuleRegistry|getEnforcing|Cannot read properties|Invariant Violation|Module not found',re.I)
        for index,item in enumerate(items,1):
            cdp.events.clear();directory=OUTPUT/item.get('category','other');directory.mkdir(parents=True,exist_ok=True);shot_path=directory/f"{safe_name(item['route'])}.png";nav_error='';body='';visual=0;page_errors=[];diagnostics=[]
            try:
                cdp.call('Page.navigate',{'url':build_url(item)},timeout=30);cdp.wait_event('Page.loadEventFired',timeout=30);time.sleep(SETTLE)
                value=cdp.call('Runtime.evaluate',{'expression':"document.body ? ({text: document.body.innerText || '', visualNodes: document.querySelectorAll('img,svg,canvas,video').length}) : ({text:'',visualNodes:0})",'returnByValue':True}).get('result',{}).get('value',{}) or {}
                body=value.get('text','') or '';visual=int(value.get('visualNodes',0) or 0);layout=cdp.call('Page.getLayoutMetrics');content=layout.get('cssContentSize') or layout.get('contentSize') or {};width=max(390,min(float(content.get('width',390)),390));height=max(844,min(float(content.get('height',844)),16000))
                image=cdp.call('Page.captureScreenshot',{'format':'png','fromSurface':True,'captureBeyondViewport':True,'clip':{'x':0,'y':0,'width':width,'height':height,'scale':1}},timeout=45);shot_path.write_bytes(base64.b64decode(image['data']))
            except Exception as e:nav_error=str(e)
            for event in cdp.take({'Runtime.exceptionThrown','Log.entryAdded'}):
                message=event_message(event)
                if not message:continue
                if event.get('method')=='Runtime.exceptionThrown' and fatal_pattern.search(message):
                    if message not in page_errors:page_errors.append(message)
                elif message not in diagnostics:diagnostics.append(message)
            body_error=bool(fatal_pattern.search(body));status='non-visual' if item.get('nonVisual') else ('error' if nav_error or page_errors or body_error else ('rendered' if body.strip() or visual>0 else 'blank'))
            final_url=cdp.call('Runtime.evaluate',{'expression':'location.href','returnByValue':True}).get('result',{}).get('value','')
            try:relative=str(shot_path.relative_to(ROOT))
            except ValueError:relative=str(shot_path)
            rows.append({'route':item['route'],'category':item.get('category','other'),'status':status,'screenshot':relative,'bodyTextLength':len(body.strip()),'visualNodeCount':visual,'bodyTextPreview':body.strip()[:500],'finalUrl':final_url,'navigationError':nav_error,'pageErrors':page_errors[:10],'diagnostics':diagnostics[:10]})
            print(f"[{index}/{len(items)}] {status} {item['route']}",flush=True)
        print('Summary:',write_reports(rows),flush=True)
    finally:
        if cdp:
            try:cdp.close()
            except Exception:pass
        if chrome_process:
            chrome_process.terminate()
            try:chrome_process.wait(timeout=5)
            except subprocess.TimeoutExpired:chrome_process.kill()
        if http_process:
            http_process.terminate()
            try:http_process.wait(timeout=5)
            except subprocess.TimeoutExpired:http_process.kill()
        chrome_log.close();http_log.close();shutil.rmtree(profile,ignore_errors=True)

if __name__=='__main__':main()
