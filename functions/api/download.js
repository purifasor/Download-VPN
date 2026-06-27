// ============================================================================
//  GET /api/download?f=<fileName>
//  Streams the .apk through OUR edge so the real repo URL is never exposed.
//  - Supports HTTP Range / resume  -> great for weak / filtered networks
//  - Streams (no buffering)        -> low memory, fast start
//  - Validates filename            -> only .apk inside the build dir
// ============================================================================
import { getConfig } from "../_config.js";

export async function onRequest(context) {
  const { request, env } = context;
  const cfg = getConfig(env);
  const url = new URL(request.url);
  const f = url.searchParams.get("f") || "";

  // Strict whitelist: a single .apk filename, no path traversal.
  if (!/^[A-Za-z0-9._-]+\.apk$/i.test(f)) {
    return new Response("Bad request", { status: 400 });
  }

  // Real source URL is built here, on the server only.
  const src =
    `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}` +
    `/${cfg.branch}/${cfg.buildDir}/${f}`;

  // Forward Range header so the browser / download managers can resume.
  const fwdHeaders = {};
  const range = request.headers.get("Range");
  if (range) fwdHeaders["Range"] = range;

  const upstream = await fetch(src, {
    headers: fwdHeaders,
    cf: { cacheEverything: true, cacheTtl: 300 },
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.android.package-archive");
  headers.set("Content-Disposition", `attachment; filename="${f}"`);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=300");
  headers.set("Access-Control-Allow-Origin", "*");

  const cl = upstream.headers.get("Content-Length");
  if (cl) headers.set("Content-Length", cl);
  const cr = upstream.headers.get("Content-Range");
  if (cr) headers.set("Content-Range", cr);

  return new Response(upstream.body, {
    status: upstream.status, // 200 or 206
    headers,
  });
}
