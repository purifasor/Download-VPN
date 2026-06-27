/**
 * Professor VPN — Secure Download Proxy (Cloudflare Worker)
 * --------------------------------------------------------------
 * هدف: مخفی نگه‌داشتن کامل منبع (GitHub repo) از سمت کاربر.
 * مرورگر کاربر هرگز نام ریپازیتوری را نمی‌بیند؛ همه‌چیز از طریق
 * همین Worker پراکسی می‌شود.
 *
 * مسیرها:
 *   GET /api/version   -> آخرین نسخه + متادیتا (JSON)  (auto-update)
 *   GET /api/download  -> استریم فایل APK با پشتیبانی Range (resumable)
 *
 * پیکربندی منبع فقط اینجا (سمت سرور) قرار دارد و هرگز به کلاینت نمی‌رسد.
 * بهتر است مقادیر حساس را به‌صورت Secret/Env تنظیم کنید:
 *   - REPO_OWNER  (مثلا با: wrangler secret put REPO_OWNER)
 *   - REPO_NAME
 *   - GH_TOKEN    (اختیاری: برای افزایش rate-limit گیت‌هاب)
 */

const DEFAULTS = {
  // اگر Env/Secret ست نشده باشد از این مقادیر استفاده می‌شود.
  // برای امنیت بیشتر، اینها را به‌صورت Secret ست کنید و خالی بگذارید.
  REPO_OWNER: "",
  REPO_NAME: "",
  ASSET_REGEX: "\\.apk$", // کدام asset دانلود شود
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
  "Access-Control-Expose-Headers":
    "Content-Length, Content-Range, Accept-Ranges, Content-Disposition",
};

function cfg(env) {
  return {
    owner: env.REPO_OWNER || DEFAULTS.REPO_OWNER,
    name: env.REPO_NAME || DEFAULTS.REPO_NAME,
    assetRegex: new RegExp(env.ASSET_REGEX || DEFAULTS.ASSET_REGEX, "i"),
    token: env.GH_TOKEN || "",
  };
}

function ghHeaders(token) {
  const h = {
    "User-Agent": "PVPN-Download-Edge",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** آخرین release و asset مناسب را پیدا می‌کند (auto-update). */
async function resolveLatest(env) {
  const c = cfg(env);
  if (!c.owner || !c.name) {
    throw new Error("source-not-configured");
  }

  // 1) تلاش برای latest release
  let rel = null;
  const base = `https://api.github.com/repos/${c.owner}/${c.name}`;
  let r = await fetch(`${base}/releases/latest`, {
    headers: ghHeaders(c.token),
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (r.ok) {
    rel = await r.json();
  } else {
    // 2) fallback: همه releases و اولین غیر-draft
    const all = await fetch(`${base}/releases?per_page=10`, {
      headers: ghHeaders(c.token),
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (all.ok) {
      const arr = await all.json();
      rel = (arr || []).find((x) => !x.draft) || null;
    }
  }

  let asset = null;
  let version = null;

  if (rel) {
    version = (rel.tag_name || rel.name || "").replace(/^v/i, "");
    asset = (rel.assets || []).find((a) => c.assetRegex.test(a.name)) || null;
  }

  // 3) fallback نهایی: جستجو در پوشه build داخل ریپو
  if (!asset) {
    const cont = await fetch(`${base}/contents/build`, {
      headers: ghHeaders(c.token),
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (cont.ok) {
      const files = await cont.json();
      const f = (files || []).find((x) => c.assetRegex.test(x.name));
      if (f) {
        asset = {
          name: f.name,
          size: f.size,
          // download از raw استفاده می‌کند
          _raw: f.download_url,
        };
        const m = f.name.match(/v?(\d+(?:\.\d+){1,3})/i);
        if (m && !version) version = m[1];
      }
    }
  }

  if (!asset) throw new Error("asset-not-found");

  return {
    version: version || "0.0",
    name: asset.name,
    size: asset.size || 0,
    // آدرس واقعی فقط داخل Worker می‌ماند:
    _download: asset.browser_download_url || asset._raw,
  };
}

async function handleVersion(env) {
  try {
    const info = await resolveLatest(env);
    const body = JSON.stringify({
      ok: true,
      version: info.version,
      name: info.name,
      size: info.size,
      // به کلاینت فقط مسیر امن خودمان را می‌دهیم:
      url: "/api/download",
      ts: Date.now(),
    });
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=120",
        ...CORS,
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e.message || e) }),
      { status: 502, headers: { "Content-Type": "application/json", ...CORS } }
    );
  }
}

async function handleDownload(req, env) {
  let info;
  try {
    info = await resolveLatest(env);
  } catch (e) {
    return new Response("source unavailable", { status: 502, headers: CORS });
  }

  const range = req.headers.get("Range");
  const upstreamHeaders = { "User-Agent": "PVPN-Download-Edge" };
  if (range) upstreamHeaders["Range"] = range;

  // استریم مستقیم از منبع؛ بدنه پاس داده می‌شود (resumable / Range)
  const upstream = await fetch(info._download, {
    headers: upstreamHeaders,
    redirect: "follow",
    cf: { cacheEverything: true, cacheTtl: 1800 },
  });

  const h = new Headers(upstream.headers);
  // پاک‌سازی هدرهایی که ممکن است منبع را لو بدهند
  h.delete("Server");
  h.delete("Via");
  h.delete("X-GitHub-Request-Id");
  h.delete("X-Served-By");
  h.delete("X-Fastly-Request-ID");
  h.set("Content-Type", "application/vnd.android.package-archive");
  h.set("Accept-Ranges", "bytes");
  h.set(
    "Content-Disposition",
    `attachment; filename="${info.name}"`
  );
  for (const [k, v] of Object.entries(CORS)) h.set(k, v);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: h,
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === "/api/version") return handleVersion(env);
    if (url.pathname === "/api/download") return handleDownload(req, env);

    // health
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    return new Response("Not Found", { status: 404, headers: CORS });
  },
};
