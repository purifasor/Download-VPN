// ============================================================================
//  GET /api/version
//  Auto-detects the latest .apk in the (hidden) source repo.
//  Returns version + size + a TOKENIZED download path (never the real repo URL).
// ============================================================================
import { getConfig, pickLatest } from "../_config.js";

export async function onRequestGet({ env }) {
  const cfg = getConfig(env);

  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "pvpn-download-page",
  };
  if (cfg.token) headers["Authorization"] = `Bearer ${cfg.token}`;

  try {
    const apiUrl =
      `https://api.github.com/repos/${cfg.owner}/${cfg.repo}` +
      `/contents/${cfg.buildDir}?ref=${cfg.branch}`;

    const r = await fetch(apiUrl, { headers, cf: { cacheTtl: 120 } });
    if (!r.ok) throw new Error("upstream " + r.status);

    const files = await r.json();
    const latest = pickLatest(files, cfg.appName);
    if (!latest) throw new Error("no apk found");

    // We expose ONLY an opaque file id (the filename), not the repo.
    const body = {
      ok: true,
      name: cfg.appName,
      version: latest.version,
      fileName: latest.name,
      size: latest.size,
      sizeText: humanSize(latest.size),
      // client downloads through OUR proxy, repo stays hidden:
      downloadPath: `/api/download?f=${encodeURIComponent(latest.name)}`,
      updatedAt: new Date().toISOString(),
    };

    return json(body, 200);
  } catch (e) {
    return json({ ok: false, error: "version_unavailable" }, 502);
  }
}

function humanSize(b) {
  if (!b) return "—";
  const mb = b / (1024 * 1024);
  return mb >= 1 ? mb.toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB";
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
