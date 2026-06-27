var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-xebdRv/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/page.js
var PAGE_HTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#05010a" />
<title>Professor VPN \u2014 \u062F\u0627\u0646\u0644\u0648\u062F</title>
<meta name="description" content="\u0622\u062E\u0631\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0631\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u06A9\u0646\u06CC\u062F." />
<link rel="icon" href="/icon.png" />
<link rel="apple-touch-icon" href="/icon.png" />
<style>
:root{
  --bg:#05010a;
  --bg2:#0b0414;
  --purple:#a855f7;
  --purple-deep:#7c3aed;
  --red:#ff2d55;
  --red-neon:#ff0040;
  --magenta:#e635ff;
  --text:#f3eaff;
  --muted:#9a86c4;
  --glass:rgba(168,85,247,.08);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{
  font-family:"Vazirmatn","Segoe UI",Tahoma,sans-serif;
  background:var(--bg);
  color:var(--text);
  overflow-x:hidden;
  min-height:100dvh;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px 16px;
}

/* ---------- animated neon background ---------- */
.bg-glow{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55;animation:float 14s ease-in-out infinite}
.orb.p1{width:480px;height:480px;background:var(--purple-deep);top:-140px;right:-120px}
.orb.p2{width:420px;height:420px;background:var(--red-neon);bottom:-160px;left:-120px;animation-delay:-5s;opacity:.4}
.orb.p3{width:360px;height:360px;background:var(--magenta);top:40%;left:50%;transform:translate(-50%,-50%);animation-delay:-9s;opacity:.3}
@keyframes float{
  0%,100%{transform:translate(0,0) scale(1)}
  33%{transform:translate(30px,-40px) scale(1.08)}
  66%{transform:translate(-25px,25px) scale(.95)}
}
.grid-overlay{
  position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.16;
  background-image:linear-gradient(rgba(168,85,247,.25) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(168,85,247,.25) 1px,transparent 1px);
  background-size:46px 46px;
  mask-image:radial-gradient(circle at 50% 40%,#000 0%,transparent 75%);
  -webkit-mask-image:radial-gradient(circle at 50% 40%,#000 0%,transparent 75%);
}
.scanline{
  position:fixed;left:0;right:0;height:2px;z-index:0;pointer-events:none;
  background:linear-gradient(90deg,transparent,var(--red-neon),transparent);
  opacity:.4;animation:scan 7s linear infinite;
}
@keyframes scan{0%{top:-5%}100%{top:105%}}

/* ---------- card ---------- */
.wrap{position:relative;z-index:2;width:100%;max-width:430px;animation:rise .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}

.card{
  position:relative;
  background:linear-gradient(160deg,rgba(20,7,34,.92),rgba(8,3,16,.92));
  border:1px solid rgba(168,85,247,.28);
  border-radius:30px;
  padding:30px 24px 26px;
  backdrop-filter:blur(14px);
  box-shadow:0 0 1px rgba(168,85,247,.6),
             0 22px 70px rgba(124,58,237,.32),
             0 0 90px rgba(255,0,64,.12) inset;
  overflow:hidden;
}
.card::before{
  content:"";position:absolute;inset:0;border-radius:30px;padding:1px;
  background:linear-gradient(130deg,var(--purple),transparent 35%,transparent 65%,var(--red-neon));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  opacity:.7;pointer-events:none;animation:borderPulse 4s ease-in-out infinite;
}
@keyframes borderPulse{0%,100%{opacity:.45}50%{opacity:.9}}

/* phone mockup holding the icon */
.phone{
  width:118px;height:118px;margin:0 auto 18px;position:relative;
  display:flex;align-items:center;justify-content:center;
  animation:bob 5s ease-in-out infinite;
}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.phone .halo{
  position:absolute;inset:-22px;border-radius:34px;
  background:conic-gradient(from 0deg,var(--purple),var(--red-neon),var(--magenta),var(--purple));
  filter:blur(20px);opacity:.7;animation:spin 8s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.phone .screen{
  position:relative;width:100%;height:100%;border-radius:28px;overflow:hidden;
  border:2px solid rgba(168,85,247,.5);
  box-shadow:0 0 24px rgba(255,0,64,.45),0 0 40px rgba(168,85,247,.4);
  background:#0a0312;
}
.phone .screen img{width:100%;height:100%;object-fit:cover;display:block}

.title{
  text-align:center;font-size:30px;font-weight:800;letter-spacing:.5px;
  background:linear-gradient(92deg,#fff,var(--purple) 45%,var(--red-neon));
  -webkit-background-clip:text;background-clip:text;color:transparent;
  text-shadow:0 0 24px rgba(168,85,247,.35);
}
.subtitle{text-align:center;color:var(--muted);font-size:13px;margin-top:6px;letter-spacing:2px}

.badges{display:flex;gap:10px;justify-content:center;margin:20px 0 22px;flex-wrap:wrap}
.badge{
  display:inline-flex;align-items:center;gap:7px;
  font-size:13px;font-weight:600;padding:9px 15px;border-radius:14px;
  background:var(--glass);border:1px solid rgba(168,85,247,.3);
  color:var(--text);
}
.badge .dot{width:8px;height:8px;border-radius:50%;background:var(--red-neon);
  box-shadow:0 0 10px var(--red-neon);animation:blink 1.6s infinite}
@keyframes blink{50%{opacity:.35}}
.badge.ver{color:#fff;border-color:rgba(255,0,64,.5);background:rgba(255,0,64,.1)}

/* download button */
.btn{
  position:relative;display:flex;align-items:center;justify-content:center;gap:10px;
  width:100%;padding:18px;border:none;cursor:pointer;
  font-family:inherit;font-size:18px;font-weight:800;color:#fff;
  border-radius:18px;overflow:hidden;
  background:linear-gradient(100deg,var(--purple-deep),var(--red-neon));
  box-shadow:0 0 24px rgba(255,0,64,.5),0 0 40px rgba(124,58,237,.4);
  transition:transform .15s,box-shadow .25s;
}
.btn:active{transform:scale(.97)}
.btn:hover{box-shadow:0 0 36px rgba(255,0,64,.75),0 0 60px rgba(124,58,237,.6)}
.btn::after{
  content:"";position:absolute;top:0;left:-60%;width:50%;height:100%;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.5),transparent);
  transform:skewX(-20deg);animation:sheen 3.2s infinite;
}
@keyframes sheen{0%{left:-60%}55%,100%{left:140%}}
.btn[disabled]{opacity:.6;cursor:wait}
.btn svg{width:22px;height:22px}

/* progress */
.progress-wrap{margin-top:16px;display:none}
.progress-wrap.show{display:block;animation:rise .4s both}
.bar{height:12px;border-radius:10px;background:rgba(168,85,247,.15);overflow:hidden;border:1px solid rgba(168,85,247,.3)}
.bar > i{display:block;height:100%;width:0%;border-radius:10px;
  background:linear-gradient(90deg,var(--purple),var(--red-neon));
  box-shadow:0 0 14px var(--red-neon);transition:width .25s}
.pinfo{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:8px}

.foot{text-align:center;color:var(--muted);font-size:11px;margin-top:22px;line-height:1.9;opacity:.8}
.foot b{color:var(--purple)}

.note{
  margin-top:14px;text-align:center;font-size:12px;color:var(--muted);
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.shield{width:14px;height:14px;fill:var(--purple)}

@media (max-width:380px){
  .title{font-size:26px}.card{padding:26px 18px 22px}
}
</style>
</head>
<body>
  <div class="bg-glow">
    <div class="orb p1"></div><div class="orb p2"></div><div class="orb p3"></div>
  </div>
  <div class="grid-overlay"></div>
  <div class="scanline"></div>

  <div class="wrap">
    <div class="card">
      <div class="phone">
        <div class="halo"></div>
        <div class="screen"><img src="/icon.png" alt="app" /></div>
      </div>

      <h1 class="title">Professor VPN</h1>
      <div class="subtitle">SECURE \xB7 FAST \xB7 ANONYMOUS</div>

      <div class="badges">
        <span class="badge ver" id="verBadge"><span class="dot"></span>v<span id="ver">\u2026</span></span>
        <span class="badge" id="sizeBadge">\u2026</span>
        <span class="badge">Android</span>
      </div>

      <button class="btn" id="dlBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>
        <span id="btnText">\u062F\u0627\u0646\u0644\u0648\u062F</span>
      </button>

      <div class="progress-wrap" id="prog">
        <div class="bar"><i id="barFill"></i></div>
        <div class="pinfo"><span id="pPct">0%</span><span id="pInfo">\u0622\u0645\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC\u2026</span></div>
      </div>

      <div class="note">
        <svg class="shield" viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/></svg>
        \u062F\u0627\u0646\u0644\u0648\u062F \u0627\u0645\u0646 \u0648 \u0628\u0647\u06CC\u0646\u0647 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0636\u0639\u06CC\u0641
      </div>

      <div class="foot">
        \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062E\u0648\u062F\u06A9\u0627\u0631 \u0622\u062E\u0631\u06CC\u0646 \u0646\u0633\u062E\u0647 \xB7 <b id="updated">\u0622\u0646\u0644\u0627\u06CC\u0646</b>
      </div>
    </div>
  </div>

<script>
const $ = (id)=>document.getElementById(id);
let META = null;

async function loadVersion(){
  try{
    const r = await fetch('/api/version',{cache:'no-store'});
    const d = await r.json();
    if(!d.ok) throw 0;
    META = d;
    $('ver').textContent = d.version;
    $('sizeBadge').textContent = d.sizeText || '';
    $('updated').textContent = '\u0646\u0633\u062E\u0647 \u0641\u0639\u0644\u06CC: v'+d.version;
    document.title = d.name + ' v' + d.version + ' \u2014 \u062F\u0627\u0646\u0644\u0648\u062F';
  }catch(e){
    $('ver').textContent = '\u2014';
    $('sizeBadge').textContent = '\u0622\u0641\u0644\u0627\u06CC\u0646';
    $('updated').textContent = '\u0627\u062A\u0635\u0627\u0644 \u062F\u0648\u0628\u0627\u0631\u0647\u2026';
    // retry quietly
    setTimeout(loadVersion, 4000);
  }
}

// Robust streamed download with progress + resume-friendly fallback.
async function download(){
  if(!META){ await loadVersion(); if(!META) return; }
  const btn = $('dlBtn'), prog = $('prog'), fill = $('barFill');
  btn.disabled = true; $('btnText').textContent = '\u062F\u0631 \u062D\u0627\u0644 \u062F\u0627\u0646\u0644\u0648\u062F\u2026';
  prog.classList.add('show');
  $('pInfo').textContent = '\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0631\u0648\u0631\u2026';

  const fileName = META.fileName;
  const path = META.downloadPath;

  try{
    const resp = await fetch(path, {cache:'no-store'});
    if(!resp.ok) throw new Error('net');
    const total = +(resp.headers.get('Content-Length')) || META.size || 0;
    const reader = resp.body.getReader();
    const chunks = []; let received = 0;

    while(true){
      const {done, value} = await reader.read();
      if(done) break;
      chunks.push(value); received += value.length;
      if(total){
        const pct = Math.min(100, Math.round(received/total*100));
        fill.style.width = pct+'%';
        $('pPct').textContent = pct+'%';
        $('pInfo').textContent = fmt(received)+' / '+fmt(total);
      }else{
        $('pInfo').textContent = fmt(received);
      }
    }

    const blob = new Blob(chunks,{type:'application/vnd.android.package-archive'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click();
    a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 4000);

    fill.style.width='100%'; $('pPct').textContent='100%';
    $('pInfo').textContent='\u062F\u0627\u0646\u0644\u0648\u062F \u06A9\u0627\u0645\u0644 \u0634\u062F \u2713';
    $('btnText').textContent='\u062F\u0627\u0646\u0644\u0648\u062F \u062F\u0648\u0628\u0627\u0631\u0647';
  }catch(e){
    // Fallback: let the browser / download-manager handle it (resumable).
    $('pInfo').textContent='\u0627\u062F\u0627\u0645\u0647 \u0628\u0627 \u0645\u0631\u0648\u0631\u06AF\u0631\u2026';
    const a=document.createElement('a');
    a.href=path; a.download=fileName; document.body.appendChild(a); a.click(); a.remove();
    $('btnText').textContent='\u062F\u0627\u0646\u0644\u0648\u062F \u062F\u0648\u0628\u0627\u0631\u0647';
  }finally{
    btn.disabled = false;
  }
}

function fmt(b){
  const mb=b/1048576;
  return mb>=1 ? mb.toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';
}

$('dlBtn').addEventListener('click', download);
loadVersion();
// keep version fresh (auto-update) every 5 min
setInterval(loadVersion, 300000);
<\/script>
</body>
</html>
`;

// src/icon.js
var ICON_B64 = "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";

// src/index.js
function b64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++)
    bytes[i] = bin.charCodeAt(i);
  return bytes;
}
__name(b64ToBytes, "b64ToBytes");
var DEFAULTS = {
  SRC_OWNER: "aptixzero",
  SRC_REPO: "PRF_VPN",
  SRC_BRANCH: "main",
  SRC_BUILD_DIR: "build",
  APP_NAME: "ProfessorVPN"
};
function cfg(env) {
  return {
    owner: env.SRC_OWNER || DEFAULTS.SRC_OWNER,
    repo: env.SRC_REPO || DEFAULTS.SRC_REPO,
    branch: env.SRC_BRANCH || DEFAULTS.SRC_BRANCH,
    buildDir: env.SRC_BUILD_DIR || DEFAULTS.SRC_BUILD_DIR,
    appName: env.APP_NAME || DEFAULTS.APP_NAME,
    token: env.GH_TOKEN || null
  };
}
__name(cfg, "cfg");
function pickLatest(files) {
  const apks = files.filter((f) => f.type === "file" && /\.apk$/i.test(f.name));
  if (!apks.length)
    return null;
  const parsed = apks.map((f) => {
    const m = f.name.match(/v?(\d+)\.(\d+)(?:\.(\d+))?/i);
    const major = m ? +m[1] : 0;
    const minor = m ? +m[2] : 0;
    const patch = m && m[3] ? +m[3] : 0;
    const version = m ? `${major}.${minor}${m[3] ? "." + patch : ""}` : "0.0";
    return { ...f, major, minor, patch, version };
  });
  parsed.sort(
    (a, b) => b.major - a.major || b.minor - a.minor || b.patch - a.patch
  );
  return parsed[0];
}
__name(pickLatest, "pickLatest");
function humanSize(b) {
  if (!b)
    return "\u2014";
  const mb = b / 1048576;
  return mb >= 1 ? mb.toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB";
}
__name(humanSize, "humanSize");
function json(obj, status = 200, maxAge = 60) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}`,
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex"
    }
  });
}
__name(json, "json");
async function handleVersion(env) {
  const c = cfg(env);
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pvpn-edge"
  };
  if (c.token)
    headers["Authorization"] = `Bearer ${c.token}`;
  try {
    const apiUrl = `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.buildDir}?ref=${c.branch}`;
    const r = await fetch(apiUrl, { headers, cf: { cacheTtl: 120 } });
    if (!r.ok)
      throw new Error("upstream " + r.status);
    const files = await r.json();
    const latest = pickLatest(files);
    if (!latest)
      throw new Error("no apk");
    return json({
      ok: true,
      name: c.appName,
      version: latest.version,
      fileName: latest.name,
      size: latest.size,
      sizeText: humanSize(latest.size),
      downloadPath: `/api/download?f=${encodeURIComponent(latest.name)}`,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (e) {
    return json({ ok: false, error: "version_unavailable" }, 502, 10);
  }
}
__name(handleVersion, "handleVersion");
async function handleDownload(request, env) {
  const c = cfg(env);
  const url = new URL(request.url);
  const f = url.searchParams.get("f") || "";
  if (!/^[A-Za-z0-9._-]+\.apk$/i.test(f)) {
    return new Response("Bad request", { status: 400 });
  }
  const src = `https://raw.githubusercontent.com/${c.owner}/${c.repo}/${c.branch}/${c.buildDir}/${f}`;
  const fwd = {};
  const range = request.headers.get("Range");
  if (range)
    fwd["Range"] = range;
  const upstream = await fetch(src, {
    headers: fwd,
    cf: { cacheEverything: true, cacheTtl: 300 }
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Not found", { status: 404 });
  }
  const h = new Headers();
  h.set("Content-Type", "application/vnd.android.package-archive");
  h.set("Content-Disposition", `attachment; filename="${f}"`);
  h.set("Accept-Ranges", "bytes");
  h.set("Cache-Control", "public, max-age=300");
  h.set("Access-Control-Allow-Origin", "*");
  const cl = upstream.headers.get("Content-Length");
  if (cl)
    h.set("Content-Length", cl);
  const cr = upstream.headers.get("Content-Range");
  if (cr)
    h.set("Content-Range", cr);
  return new Response(upstream.body, { status: upstream.status, headers: h });
}
__name(handleDownload, "handleDownload");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type"
        }
      });
    }
    if (url.pathname === "/api/version")
      return handleVersion(env);
    if (url.pathname === "/api/download")
      return handleDownload(request, env);
    if (url.pathname === "/icon.png" || url.pathname === "/apple-touch-icon.png") {
      return new Response(b64ToBytes(ICON_B64), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(PAGE_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer",
          "X-Robots-Tag": "noindex"
        }
      });
    }
    if (env.ASSETS) {
      try {
        return await env.ASSETS.fetch(request);
      } catch (_) {
      }
    }
    return new Response(PAGE_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-xebdRv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-xebdRv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
