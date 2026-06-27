#!/usr/bin/env python3
"""Local preview server that mimics the Cloudflare Worker (HTML + /api/* + /icon.png).
ONLY for local visual testing — production uses the real Worker (src/index.js)."""
import http.server, socketserver, json, re, urllib.request, urllib.parse, os

OWNER, REPO, BRANCH, BUILD = "aptixzero", "PRF_VPN", "main", "build"
APP = "ProfessorVPN"

def read_page():
    js = open("src/page.js", encoding="utf-8").read()
    m = re.search(r"export const PAGE_HTML = `(.*)`;\s*$", js, re.S)
    html = m.group(1)
    html = html.replace("\\`", "`").replace("\\$", "$").replace("\\\\", "\\")
    return html

def gh(url):
    req = urllib.request.Request(url, headers={"User-Agent": "dev", "Accept": "application/vnd.github+json"})
    return json.load(urllib.request.urlopen(req, timeout=15))

def pick_latest(files):
    apks = [f for f in files if f.get("type") == "file" and f["name"].lower().endswith(".apk")]
    def ver(f):
        m = re.search(r"v?(\d+)\.(\d+)(?:\.(\d+))?", f["name"], re.I)
        return (int(m.group(1)), int(m.group(2)), int(m.group(3) or 0)) if m else (0, 0, 0)
    apks.sort(key=ver, reverse=True)
    if not apks: return None
    f = apks[0]; v = ver(f)
    f["version"] = f"{v[0]}.{v[1]}" + (f".{v[2]}" if v[2] else "")
    return f

class H(http.server.SimpleHTTPRequestHandler):
    def _send(self, code, body, ctype="text/html; charset=utf-8", extra=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        if extra:
            for k, v in extra.items(): self.send_header(k, v)
        self.end_headers()
        if isinstance(body, str): body = body.encode()
        self.wfile.write(body)

    def do_GET(self):
        p = urllib.parse.urlparse(self.path)
        if p.path in ("/", "/index.html"):
            return self._send(200, read_page())
        if p.path in ("/icon.png", "/apple-touch-icon.png"):
            with open("public/icon.png", "rb") as f:
                return self._send(200, f.read(), "image/png")
        if p.path == "/api/version":
            try:
                files = gh(f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{BUILD}?ref={BRANCH}")
                l = pick_latest(files)
                mb = l["size"]/1048576
                return self._send(200, json.dumps({
                    "ok": True, "name": APP, "version": l["version"], "fileName": l["name"],
                    "size": l["size"], "sizeText": f"{mb:.1f} MB",
                    "downloadPath": "/api/download?f=" + urllib.parse.quote(l["name"]),
                }), "application/json")
            except Exception as e:
                return self._send(502, json.dumps({"ok": False, "error": str(e)}), "application/json")
        if p.path == "/api/download":
            q = urllib.parse.parse_qs(p.query)
            f = q.get("f", [""])[0]
            if not re.match(r"^[A-Za-z0-9._-]+\.apk$", f):
                return self._send(400, "bad")
            src = f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{BRANCH}/{BUILD}/{f}"
            req = urllib.request.Request(src, headers={"User-Agent": "dev"})
            up = urllib.request.urlopen(req, timeout=60)
            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Disposition", f'attachment; filename="{f}"')
            cl = up.headers.get("Content-Length")
            if cl: self.send_header("Content-Length", cl)
            self.end_headers()
            while True:
                chunk = up.read(65536)
                if not chunk: break
                self.wfile.write(chunk)
            return
        return self._send(404, "not found")

    def log_message(self, *a): pass

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    PORT = 8000
    with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), H) as httpd:
        print(f"preview on {PORT}")
        httpd.serve_forever()
