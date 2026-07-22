#!/usr/bin/env python3
import argparse
import http.server
import os
from pathlib import Path


class ExpoStaticHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        translated = super().translate_path(path)
        candidate = Path(translated)
        if candidate.suffix == "":
            html_candidate = candidate.with_suffix(".html")
            if html_candidate.is_file():
                return str(html_candidate)
        return translated

    def log_message(self, format: str, *args) -> None:
        print(format % args, flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--directory", required=True)
    parser.add_argument("--port", type=int, default=19006)
    args = parser.parse_args()
    os.chdir(args.directory)
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", args.port),
        ExpoStaticHandler,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
