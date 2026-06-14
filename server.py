#!/usr/bin/env python3
"""
Moto Fácil · Servidor local
Serve arquivos estáticos + API REST para gerenciar o catálogo de motos.

Uso: python server.py
URL: http://localhost:4040
"""
import http.server, json, os, re, uuid, hashlib, mimetypes, urllib.parse
from pathlib import Path
from datetime import datetime

PORT = 4040
BASE = Path(__file__).parent
DATA = BASE / "data"
MOTO_PHOTOS = BASE / "assets" / "motos"

for d in [DATA, MOTO_PHOTOS]:
    d.mkdir(parents=True, exist_ok=True)

F_MOTOS  = DATA / "motos.json"
F_CONFIG = DATA / "config.json"
F_ADMIN  = DATA / "admin.json"

SESSIONS = {}  # token → True

# ── helpers ───────────────────────────────────────────────────────────────────
def rj(path, default=None):
    if default is None: default = {}
    return json.loads(path.read_text("utf-8")) if path.exists() else default

def wj(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), "utf-8")

# ── seed defaults ─────────────────────────────────────────────────────────────
if not F_MOTOS.exists():
    wj(F_MOTOS, [])

if not F_CONFIG.exists():
    wj(F_CONFIG, {
        "venda": {
            "preco": True, "entrada": True, "parcela": True,
            "km": True, "ano": True, "cor": True, "categoria": True
        },
        "aluguel": {
            "preco_diaria": True, "preco_mensal": True,
            "km": False, "ano": True, "cor": True, "categoria": True
        }
    })

if not F_ADMIN.exists():
    wj(F_ADMIN, {
        "username": "admin",
        "password_hash": hashlib.sha256(b"motofacil2026").hexdigest()
    })

# ── handler ───────────────────────────────────────────────────────────────────
class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_): pass  # suppress default logging

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Session")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")

    def err(self, msg, code=400):
        self.send_json({"error": msg}, code)

    def authed(self):
        return self.headers.get("X-Session", "") in SESSIONS

    def body(self):
        n = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(n) if n else b""

    # ── OPTIONS ───────────────────────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    # ── GET ───────────────────────────────────────────────────────────────────
    def do_GET(self):
        u   = urllib.parse.urlparse(self.path)
        p   = u.path
        qs  = urllib.parse.parse_qs(u.query)

        if p == "/api/motos":
            motos = rj(F_MOTOS, [])
            tipo  = qs.get("tipo", [None])[0]
            if tipo:
                motos = [m for m in motos if m.get("tipo") == tipo]
            if not self.authed():
                motos = [m for m in motos if m.get("disponivel", True)]
            self.send_json(motos)
            return

        if p == "/api/config":
            self.send_json(rj(F_CONFIG))
            return

        if p == "/api/auth":
            self.send_json({"authed": self.authed()})
            return

        if p == "/api/hero":
            assets = BASE / "assets"
            hero = None
            for nome in ["hero.jpg", "HERO.JPG", "hero.jpeg", "HERO.JPEG", "hero.png", "HERO.PNG", "hero.webp"]:
                candidate = assets / nome
                if candidate.exists():
                    hero = candidate
                    break
            if hero:
                mime, _ = mimetypes.guess_type(str(hero))
                data = hero.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", mime or "image/jpeg")
                self.send_header("Content-Length", len(data))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(data)
            else:
                self.err("Hero não encontrado", 404)
            return

        # Arquivos estáticos
        fp = BASE / p.lstrip("/")
        if fp.is_dir():
            fp = fp / "index.html"
        if fp.exists() and fp.is_file():
            mime, _ = mimetypes.guess_type(str(fp))
            data = fp.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mime or "application/octet-stream")
            self.send_header("Content-Length", len(data))
            # Nunca cachear — garante que alterações em JSX/CSS/imagens carregam sempre
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.end_headers()
            self.wfile.write(data)
        else:
            self.err("Não encontrado", 404)

    # ── POST ──────────────────────────────────────────────────────────────────
    def do_POST(self):
        p = urllib.parse.urlparse(self.path).path

        if p == "/api/login":
            try:
                d = json.loads(self.body())
                a = rj(F_ADMIN)
                h = hashlib.sha256(d.get("password", "").encode()).hexdigest()
                if d.get("username") == a.get("username") and h == a.get("password_hash"):
                    tok = str(uuid.uuid4())
                    SESSIONS[tok] = True
                    self.send_json({"token": tok})
                else:
                    self.err("Usuário ou senha incorretos", 401)
            except Exception as e:
                self.err(f"Erro no login: {e}")
            return

        if p == "/api/logout":
            SESSIONS.pop(self.headers.get("X-Session", ""), None)
            self.send_json({"ok": True})
            return

        if not self.authed():
            self.err("Não autorizado", 401)
            return

        if p == "/api/motos":
            try:
                m = json.loads(self.body())
                m["id"]         = str(uuid.uuid4())
                m["created_at"] = datetime.now().isoformat()
                m.setdefault("fotos",      [])
                m.setdefault("disponivel", True)
                m.setdefault("destaque",   False)
                motos = rj(F_MOTOS, [])
                motos.append(m)
                wj(F_MOTOS, motos)
                self.send_json(m, 201)
            except Exception as e:
                self.err(str(e))
            return

        if p == "/api/upload":
            ct  = self.headers.get("Content-Type", "")
            bm  = re.search(r"boundary=([^\s;]+)", ct)
            if not bm:
                self.err("Boundary ausente")
                return
            boundary = ("--" + bm.group(1)).encode()
            raw = self.body()
            for chunk in raw.split(boundary)[1:]:
                if chunk.strip() in (b"--", b""):
                    continue
                sep = chunk.find(b"\r\n\r\n")
                if sep < 0:
                    continue
                hdr  = chunk[:sep].decode("utf-8", "replace")
                data = chunk[sep + 4:].rstrip(b"\r\n--")
                fn_m = re.search(r'filename="([^"]+)"', hdr)
                if fn_m:
                    ext  = Path(fn_m.group(1)).suffix.lower() or ".jpg"
                    name = uuid.uuid4().hex + ext
                    (MOTO_PHOTOS / name).write_bytes(data)
                    self.send_json({"url": f"/assets/motos/{name}"})
                    return
            self.err("Arquivo não encontrado no upload")
            return

        if p == "/api/config":
            try:
                wj(F_CONFIG, json.loads(self.body()))
                self.send_json({"ok": True})
            except Exception as e:
                self.err(str(e))
            return

        self.err("Rota não encontrada", 404)

    # ── PUT ───────────────────────────────────────────────────────────────────
    def do_PUT(self):
        if not self.authed():
            self.err("Não autorizado", 401)
            return
        m = re.match(r"^/api/motos/([^/]+)$", urllib.parse.urlparse(self.path).path)
        if m:
            mid = m.group(1)
            try:
                upd   = json.loads(self.body())
                motos = rj(F_MOTOS, [])
                for i, moto in enumerate(motos):
                    if moto["id"] == mid:
                        upd["id"]         = mid
                        upd["created_at"] = moto.get("created_at")
                        motos[i]          = upd
                        wj(F_MOTOS, motos)
                        self.send_json(upd)
                        return
                self.err("Moto não encontrada", 404)
            except Exception as e:
                self.err(str(e))
            return
        self.err("Rota não encontrada", 404)

    # ── DELETE ────────────────────────────────────────────────────────────────
    def do_DELETE(self):
        if not self.authed():
            self.err("Não autorizado", 401)
            return
        m = re.match(r"^/api/motos/([^/]+)$", urllib.parse.urlparse(self.path).path)
        if m:
            mid   = m.group(1)
            motos = [x for x in rj(F_MOTOS, []) if x["id"] != mid]
            wj(F_MOTOS, motos)
            self.send_json({"ok": True})
            return
        self.err("Rota não encontrada", 404)


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    httpd = http.server.ThreadingHTTPServer(("", PORT), Handler)
    print(f"\n  Moto Facil  ->  http://localhost:{PORT}")
    print(f"  Venda       ->  http://localhost:{PORT}/catalogo.html?tipo=venda")
    print(f"  Aluguel     ->  http://localhost:{PORT}/catalogo.html?tipo=aluguel")
    print(f"  Admin       ->  http://localhost:{PORT}/admin.html")
    print(f"\n  Login padrao: admin / motofacil2026\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Encerrado.\n")
