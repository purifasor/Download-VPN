// ============================================================================
//  Professor VPN — Secure Download Edge (Cloudflare Worker)
//  ---------------------------------------------------------------------------
//  - Serves the static download page from /public (ASSETS binding)
//  - /api/version  : auto-detects the latest .apk in the (HIDDEN) source repo
//  - /api/download : streams the .apk through this edge (repo URL never exposed)
//
//  SECURITY: the source repository is referenced ONLY inside this server-side
//  worker. It is never sent to the browser and never appears in client code.
//  Override via Cloudflare vars/secrets: SRC_OWNER, SRC_REPO, SRC_BRANCH,
//  SRC_BUILD_DIR, APP_NAME, GH_TOKEN.
// ============================================================================

const DEFAULTS = {
  SRC_OWNER: "aptixzero",
  SRC_REPO: "PRF_VPN",
  SRC_BRANCH: "main",
  SRC_BUILD_DIR: "build",
  APP_NAME: "ProfessorVPN",
};

function cfg(env) {
  return {
    owner: env.SRC_OWNER || DEFAULTS.SRC_OWNER,
    repo: env.SRC_REPO || DEFAULTS.SRC_REPO,
    branch: env.SRC_BRANCH || DEFAULTS.SRC_BRANCH,
    buildDir: env.SRC_BUILD_DIR || DEFAULTS.SRC_BUILD_DIR,
    appName: env.APP_NAME || DEFAULTS.APP_NAME,
    token: env.GH_TOKEN || null,
  };
}

function pickLatest(files) {
  const apks = files.filter((f) => f.type === "file" && /\.apk$/i.test(f.name));
  if (!apks.length) return null;
  const parsed = apks.map((f) => {
    const m = f.name.match(/v?(\d+)\.(\d+)(?:\.(\d+))?/i);
    const major = m ? +m[1] : 0;
    const minor = m ? +m[2] : 0;
    const patch = m && m[3] ? +m[3] : 0;
    const version = m ? `${major}.${minor}${m[3] ? "." + patch : ""}` : "0.0";
    return { ...f, major, minor, patch, version };
  });
  parsed.sort((a, b) =>
    b.major - a.major || b.minor - a.minor || b.patch - a.patch
  );
  return parsed[0];
}

function humanSize(b) {
  if (!b) return "—";
  const mb = b / 1048576;
  return mb >= 1 ? mb.toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB";
}

function json(obj, status = 200, maxAge = 60) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}`,
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex",
    },
  });
}

async function handleVersion(env) {
  const c = cfg(env);
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pvpn-edge",
  };
  if (c.token) headers["Authorization"] = `Bearer ${c.token}`;
  try {
    const apiUrl =
      `https://api.github.com/repos/${c.owner}/${c.repo}` +
      `/contents/${c.buildDir}?ref=${c.branch}`;
    const r = await fetch(apiUrl, { headers, cf: { cacheTtl: 120 } });
    if (!r.ok) throw new Error("upstream " + r.status);
    const files = await r.json();
    const latest = pickLatest(files);
    if (!latest) throw new Error("no apk");
    return json({
      ok: true,
      name: c.appName,
      version: latest.version,
      fileName: latest.name,
      size: latest.size,
      sizeText: humanSize(latest.size),
      downloadPath: `/api/download?f=${encodeURIComponent(latest.name)}`,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return json({ ok: false, error: "version_unavailable" }, 502, 10);
  }
}

async function handleDownload(request, env) {
  const c = cfg(env);
  const url = new URL(request.url);
  const f = url.searchParams.get("f") || "";
  if (!/^[A-Za-z0-9._-]+\.apk$/i.test(f)) {
    return new Response("Bad request", { status: 400 });
  }
  const src =
    `https://raw.githubusercontent.com/${c.owner}/${c.repo}` +
    `/${c.branch}/${c.buildDir}/${f}`;

  const fwd = {};
  const range = request.headers.get("Range");
  if (range) fwd["Range"] = range;

  const upstream = await fetch(src, {
    headers: fwd,
    cf: { cacheEverything: true, cacheTtl: 300 },
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
  if (cl) h.set("Content-Length", cl);
  const cr = upstream.headers.get("Content-Range");
  if (cr) h.set("Content-Range", cr);
  return new Response(upstream.body, { status: upstream.status, headers: h });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type",
        },
      });
    }

    if (url.pathname === "/api/version") return handleVersion(env);
    if (url.pathname === "/api/download") return handleDownload(request, env);

    // Everything else -> static assets (the download page)
    return env.ASSETS.fetch(request);
  },
};
