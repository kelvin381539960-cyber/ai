#!/usr/bin/env python3
import argparse, http.server, os
from pathlib import Path

class ExpoStaticHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, request_path):
        translated=super().translate_path(request_path); candidate=Path(translated)
        if candidate.suffix=='':
            html_candidate=candidate.with_suffix('.html')
            if html_candidate.is_file(): return str(html_candidate)
        return translated
    def log_message(self, fmt, *args): print(fmt % args, flush=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('--directory',required=True);p.add_argument('--port',type=int,default=19006);a=p.parse_args();os.chdir(a.directory)
    http.server.ThreadingHTTPServer(('127.0.0.1',a.port),ExpoStaticHandler).serve_forever()
if __name__=='__main__':main()
