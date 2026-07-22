#!/usr/bin/env python3
import base64, csv, json, os, re, shutil, subprocess, sys, tempfile, time
import urllib.parse, urllib.request
from pathlib import Path
import websocket

ROOT = Path(__file__).resolve().parent
SITE = Path(os.environ.get("GALLERY_SITE", ROOT / "site")).resolve()
REGISTRY = Path(os.environ.get("GALLERY_REGISTRY", ROOT / "config/pageRegistry.json")).resolve()
REPORT_DIR = Path(os.environ.get("GALLERY_REPORT_DIR", ROOT)).resolve()
OUTPUT = Path(os.environ.get("GALLERY_OUTPUT", REPORT_DIR / "screenshots")).resolve()
BASE_URL = os.environ.get("GALLERY_BASE_URL", "http://127.0.0.1:19006")
HEALTH_PATH = os.environ.get("GALLERY_HEALTH_PATH", "/")
HTTP_PORT = int(os.environ.get("GALLERY_HTTP_PORT", "19006"))
CDP_PORT = int(os.environ.get("GALLERY_CDP_PORT", "9223"))
WAIT_SECONDS = float(os.environ.get("GALLERY_WAIT_SECONDS", "1.8"))
VIEWPORT_WIDTH = int(os.environ.get("GALLERY_VIEWPORT_WIDTH", "390"))
VIEWPORT_HEIGHT = int(os.environ.get("GALLERY_VIEWPORT_HEIGHT", "844"))
FULL_PAGE = os.environ.get("GALLERY_FULL_PAGE", "0") in {"1", "true", "True"}
STRICT = os.environ.get("GALLERY_STRICT", "1") not in {"0", "false", "False"}
LIMIT = int(os.environ.get("GALLERY_LIMIT", "0"))
ROUTE_FILTER = {x.strip() for x in os.environ.get("GALLERY_ROUTES", "").split(",") if x.strip()}
CHROME = os.environ.get("CHROME_PATH", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

DEFAULT_PARAMS = {
    "preview": "1", "scenario": "default", "transactionId": "preview-card-payment",
    "cardId": "preview-card-001", "messageId": "preview-message-001", "id": "preview-id",
    "type": "VIRTUAL", "status": "SUCCESS", "resultType": "success", "fullName": "Preview User",
    "originalFullName": "Preview User", "countryCode": "SG", "currency": "USDT", "network": "ETH",
    "networkCode": "ETH", "asset": "USDT", "amount": "100", "sellCurrency": "USDT",
    "buyCurrency": "USDC", "nextPath": "/aix/debug/page-gallery", "modal": "card", "nextParams": "{}",
    "kycNavParams": json.dumps({"currentCountryISO":"SG","currentDisplayName":"Singapore",
      "allowCountryISOList":["SG","HK","US"],"targetPage":"/aix/home/home-page",
      "aaiPassportUrl":"preview://passport-verification","aaiLivenessUrl":"preview://face-verification"}),
    "depositMethod": json.dumps({"method":"EXCHANGE","displayName":"Exchange",
      "description":"Preview deposit method","currencies":[],"order":1}),
}

FATAL = re.compile(r"Application Error|Unexpected Application Error|TurboModuleRegistry|getEnforcing|"
                   r"Cannot read propert|Invariant Violation|Module not found|is not a function|"
                   r"is not a constructor|Maximum update depth", re.I)


def wait_http(url, timeout=30):
    deadline=time.time()+timeout; last=None
    while time.time()<deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status==200: return
        except Exception as e: last=e
        time.sleep(.25)
    raise RuntimeError(f"HTTP server not ready: {last}")


def get_json(url):
    with urllib.request.urlopen(url, timeout=5) as r: return json.load(r)


class CDP:
    def __init__(self, url):
        self.ws=websocket.create_connection(url, timeout=15, origin="http://127.0.0.1")
        self.next_id=0; self.events=[]
    def close(self): self.ws.close()
    def _recv(self):
        msg=json.loads(self.ws.recv())
        if "method" in msg: self.events.append(msg)
        return msg
    def call(self, method, params=None, timeout=30):
        self.next_id+=1; cid=self.next_id
        self.ws.send(json.dumps({"id":cid,"method":method,"params":params or {}}))
        deadline=time.time()+timeout
        while time.time()<deadline:
            self.ws.settimeout(max(.1, deadline-time.time())); msg=self._recv()
            if msg.get("id")!=cid: continue
            if "error" in msg: raise RuntimeError(f"{method}: {msg['error']}")
            return msg.get("result",{})
        raise TimeoutError(method)
    def wait_event(self, method, timeout=30):
        deadline=time.time()+timeout
        while time.time()<deadline:
            for i,event in enumerate(self.events):
                if event.get("method")==method: return self.events.pop(i)
            self.ws.settimeout(max(.1, deadline-time.time()))
            try: self._recv()
            except websocket.WebSocketTimeoutException: pass
        raise TimeoutError(method)
    def take(self, methods):
        selected=[e for e in self.events if e.get("method") in methods]
        self.events=[e for e in self.events if e.get("method") not in methods]
        return selected


def safe_name(value): return re.sub(r"[^a-zA-Z0-9._-]+", "-", value.lstrip("/"))


def build_url(item):
    params=dict(DEFAULT_PARAMS); params.update(item.get("previewParams") or {})
    for name in item.get("params",[]): params.setdefault(name, f"preview-{name}")
    return BASE_URL+item["route"]+"?"+urllib.parse.urlencode(params)


def event_message(event):
    p=event.get("params",{})
    if event.get("method")=="Runtime.exceptionThrown":
        d=p.get("exceptionDetails",{}); ex=d.get("exception",{})
        return ex.get("description") or d.get("text") or "Runtime exception"
    if event.get("method")=="Log.entryAdded": return p.get("entry",{}).get("text", "Log error")
    return json.dumps(p, ensure_ascii=False)


def report_path(p):
    try: return str(p.relative_to(REPORT_DIR))
    except ValueError: return str(p)


def write_reports(results):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR/"capture-results.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    with (REPORT_DIR/"capture-results.csv").open("w",newline="",encoding="utf-8-sig") as f:
        w=csv.writer(f); w.writerow(["route","category","status","screenshot","error"])
        for x in results: w.writerow([x["route"],x["category"],x["status"],x["screenshot"],x["navigationError"] or " | ".join(x["pageErrors"])])
    counts={}
    for x in results: counts[x["status"]]=counts.get(x["status"],0)+1
    lines=["# Page Gallery Capture","",f"- Total: {len(results)}",f"- Rendered: {counts.get('rendered',0)}",
      f"- Non-visual: {counts.get('non-visual',0)}",f"- Blank: {counts.get('blank',0)}",f"- Error: {counts.get('error',0)}","",
      "| Route | Category | Status | Screenshot |","|---|---|---|---|"]
    lines += [f"| {x['route']} | {x['category']} | {x['status']} | {x['screenshot']} |" for x in results]
    (REPORT_DIR/"CAPTURE_REPORT.md").write_text("\n".join(lines)+"\n")
    return counts


def main():
    if not Path(CHROME).exists(): raise FileNotFoundError(CHROME)
    registry=json.loads(REGISTRY.read_text())
    items=[x for x in registry if not x.get("internal")]
    if ROUTE_FILTER: items=[x for x in items if x.get("route") in ROUTE_FILTER]
    if LIMIT>0: items=items[:LIMIT]
    if not ROUTE_FILTER: shutil.rmtree(OUTPUT,ignore_errors=True)
    OUTPUT.mkdir(parents=True,exist_ok=True); REPORT_DIR.mkdir(parents=True,exist_ok=True)
    profile=tempfile.mkdtemp(prefix="page-gallery-chrome-")
    chrome_log=(REPORT_DIR/"chrome-cdp.log").open("w"); http_log=(REPORT_DIR/"http-server.log").open("w")
    http_proc=subprocess.Popen([sys.executable,str(ROOT/"serve_static.py"),"--port",str(HTTP_PORT),"--directory",str(SITE)],stdout=http_log,stderr=subprocess.STDOUT)
    chrome_proc=None; cdp=None
    try:
        wait_http(f"{BASE_URL}{HEALTH_PATH}")
        chrome_proc=subprocess.Popen([CHROME,"--headless=new",f"--remote-debugging-port={CDP_PORT}",
          "--remote-allow-origins=*",f"--user-data-dir={profile}","--disable-background-networking",
          "--disable-component-update","--disable-sync","--no-first-run","--no-default-browser-check","about:blank"],
          stdout=chrome_log,stderr=subprocess.STDOUT)
        wait_http(f"http://127.0.0.1:{CDP_PORT}/json/version")
        targets=get_json(f"http://127.0.0.1:{CDP_PORT}/json/list")
        target=next(x for x in targets if x.get("type")=="page")
        cdp=CDP(target["webSocketDebuggerUrl"])
        for method in ("Page.enable","Runtime.enable","Log.enable"): cdp.call(method)
        cdp.call("Emulation.setDeviceMetricsOverride",{"width":VIEWPORT_WIDTH,"height":VIEWPORT_HEIGHT,
          "deviceScaleFactor":1,"mobile":True,"screenWidth":VIEWPORT_WIDTH,"screenHeight":VIEWPORT_HEIGHT})
        results=[]
        for index,item in enumerate(items,1):
            cdp.events.clear(); directory=OUTPUT/item.get("category","other"); directory.mkdir(parents=True,exist_ok=True)
            shot_path=directory/f"{safe_name(item['route'])}.png"; nav_error=""; body=""; visual=0
            try:
                cdp.call("Page.navigate",{"url":build_url(item)},timeout=30); cdp.wait_event("Page.loadEventFired",timeout=30); time.sleep(WAIT_SECONDS)
                val=cdp.call("Runtime.evaluate",{"expression":"document.body?({text:document.body.innerText||'',visualNodes:document.querySelectorAll('img,svg,canvas,video').length}):({text:'',visualNodes:0})","returnByValue":True}).get("result",{}).get("value",{}) or {}
                body=val.get("text","") or ""; visual=int(val.get("visualNodes",0) or 0)
                metrics=cdp.call("Page.getLayoutMetrics"); content=metrics.get("cssContentSize") or metrics.get("contentSize") or {}
                width=VIEWPORT_WIDTH; height=min(max(VIEWPORT_HEIGHT,float(content.get("height",VIEWPORT_HEIGHT))),16000) if FULL_PAGE else VIEWPORT_HEIGHT
                png=cdp.call("Page.captureScreenshot",{"format":"png","fromSurface":True,"captureBeyondViewport":True,
                  "clip":{"x":0,"y":0,"width":width,"height":height,"scale":1}},timeout=45)
                shot_path.write_bytes(base64.b64decode(png["data"]))
            except Exception as e: nav_error=str(e)
            diagnostics=[]; fatal=[]
            for event in cdp.take({"Runtime.exceptionThrown","Log.entryAdded"}):
                msg=event_message(event)
                if not msg or msg in diagnostics: continue
                diagnostics.append(msg)
                if event.get("method")=="Runtime.exceptionThrown" and FATAL.search(msg): fatal.append(msg)
            looks_error=bool(FATAL.search(body))
            if item.get("nonVisual"): status="non-visual"
            elif nav_error or fatal or looks_error: status="error"
            elif body.strip() or visual>0: status="rendered"
            else: status="blank"
            final_url=cdp.call("Runtime.evaluate",{"expression":"location.href","returnByValue":True}).get("result",{}).get("value","")
            result={"route":item["route"],"category":item.get("category","other"),"status":status,
              "screenshot":report_path(shot_path),"bodyTextLength":len(body.strip()),"visualNodeCount":visual,
              "bodyTextPreview":body.strip()[:500],"finalUrl":final_url,"navigationError":nav_error,
              "pageErrors":fatal[:10],"diagnostics":diagnostics[:10]}
            results.append(result); print(f"[{index}/{len(items)}] {status} {item['route']}",flush=True)
        counts=write_reports(results); print("Summary:",counts,flush=True)
        if STRICT and (counts.get("error",0) or counts.get("blank",0)): raise SystemExit(2)
    finally:
        if cdp:
            try: cdp.close()
            except Exception: pass
        if chrome_proc:
            chrome_proc.terminate()
            try: chrome_proc.wait(timeout=5)
            except subprocess.TimeoutExpired: chrome_proc.kill()
        http_proc.terminate()
        try: http_proc.wait(timeout=5)
        except subprocess.TimeoutExpired: http_proc.kill()
        chrome_log.close(); http_log.close(); shutil.rmtree(profile,ignore_errors=True)


if __name__=="__main__": main()
