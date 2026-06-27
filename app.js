/* =====================================================================
   Professor VPN — Download Page Logic
   - تشخیص خودکار نسخه (auto-update)
   - دانلود مقاوم در برابر نت ضعیف/فیلتر (stream + chunk + retry)
   - مخفی‌سازی منبع (پراکسی Worker؛ در نبودِ آن، fallback مبهم‌س��زی‌شده)
   ===================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------
     پیکربندی مسیرها
     - اگر سایت پشت همان دامنه‌ای باشد که Worker روی آن /api/* را سرو می‌کند،
       کافی است EDGE خالی بماند (مسیر نسبی /api/...).
     - اگر Worker روی دامنه/زیر‌دامنه جدا باشد، آدرس آن را در EDGE بگذارید،
       مثلا: const EDGE = "https://pvpn-edge.example.workers.dev";
     ------------------------------------------------------------------ */
  const EDGE = ""; // مسیر نسبی به‌صورت پیش‌فرض

  const API_VERSION = (EDGE || "") + "/api/version";
  const API_DOWNLOAD = (EDGE || "") + "/api/download";

  /* ------------------------------------------------------------------
     Fallback مبهم‌سازی‌شده (فقط وقتی Worker در دسترس نباشد).
     نام منبع به‌صورت مستقیم در کد نوشته نشده؛ از قطعات کدگذاری‌شده‌ی
     base64 در زمان اجرا بازسازی می‌شود تا در نگاه اول قابل خواندن نباشد.
     توجه: این روش «مبهم‌سازی» است نه رمزنگاری؛ امنیت کامل فقط با Worker.
     ------------------------------------------------------------------ */
  const _p = [
    "aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8=", // https://api.github.com/repos/
    "YXB0aXh6ZXJv",                               // owner
    "UFJGX1ZQTg==",                               // repo
  ];
  const _d = (s) => { try { return atob(s); } catch { return ""; } };
  const _fb = () => {
    const base = _d(_p[0]) + _d(_p[1]) + "/" + _d(_p[2]);
    return {
      latest: base + "/releases/latest",
      releases: base + "/releases?per_page=10",
      contents: base + "/contents/build",
    };
  };

  /* ------------------------------------------------------------------ DOM */
  const $ = (id) => document.getElementById(id);
  const versionText = $("versionText");
  const sizeText = $("sizeText");
  const btn = $("downloadBtn");
  const btnProgress = $("btnProgress");
  const dlStatus = $("dlStatus");
  const dlFill = $("dlFill");
  const dlPercent = $("dlPercent");
  const dlSpeed = $("dlSpeed");
  const dlSize = $("dlSize");
  const dlHint = $("dlHint");
  const toastEl = $("toast");
  const updatedAt = $("updatedAt");

  /* ------------------------------------------------------------------ utils */
  const faDigit = (s) =>
    String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  const fmtBytes = (b) => {
    if (!b || b < 0) return "—";
    const u = ["B", "KB", "MB", "GB"];
    let i = 0, n = b;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return faDigit(n.toFixed(n < 10 && i > 0 ? 1 : 0)) + " " + u[i];
  };
  const fmtSpeed = (bps) => fmtBytes(bps) + "/ث";

  let toastTimer;
  const toast = (msg, isErr = false) => {
    toastEl.textContent = msg;
    toastEl.classList.toggle("err", isErr);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3800);
  };

  /* ------------------------------------------------------------------ state */
  let META = { version: null, name: null, size: 0, url: API_DOWNLOAD, viaEdge: true };

  /* ------------------------------------------------------------------ version */
  async function fetchViaEdge() {
    const r = await fetch(API_VERSION, { cache: "no-store" });
    if (!r.ok) throw new Error("edge-bad");
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "edge-fail");
    return {
      version: j.version, name: j.name, size: j.size,
      url: (EDGE || "") + (j.url || "/api/download"), viaEdge: true,
    };
  }

  async function fetchViaFallback() {
    const F = _fb();
    const H = { Accept: "application/vnd.github+json" };
    let rel = null;

    try {
      const r = await fetch(F.latest, { headers: H, cache: "no-store" });
      if (r.ok) rel = await r.json();
    } catch {}
    if (!rel) {
      const r = await fetch(F.releases, { headers: H, cache: "no-store" });
      if (r.ok) { const arr = await r.json(); rel = (arr || []).find((x) => !x.draft); }
    }

    let version = null, asset = null;
    if (rel) {
      version = (rel.tag_name || rel.name || "").replace(/^v/i, "");
      asset = (rel.assets || []).find((a) => /\.apk$/i.test(a.name));
    }
    if (asset) {
      return { version, name: asset.name, size: asset.size,
        url: asset.browser_download_url, viaEdge: false };
    }

    // fallback نهایی: پوشه build
    const c = await fetch(F.contents, { headers: H, cache: "no-store" });
    if (c.ok) {
      const files = await c.json();
      const f = (files || []).find((x) => /\.apk$/i.test(x.name));
      if (f) {
        const m = f.name.match(/v?(\d+(?:\.\d+){1,3})/i);
        return { version: (version || (m && m[1]) || "0.0"),
          name: f.name, size: f.size, url: f.download_url, viaEdge: false };
      }
    }
    throw new Error("no-source");
  }

  async function loadMeta() {
    versionText.textContent = "…";
    let m;
    try {
      m = await fetchViaEdge();
    } catch {
      // Worker نبود → fallback (منبع مبهم‌سازی‌شده)
      try { m = await fetchViaFallback(); }
      catch (e) {
        versionText.textContent = "—";
        toast("دریافت اطلاعات نسخه ناموفق بود. اتصال خود را بررسی کنید.", true);
        return;
      }
    }
    META = m;
    versionText.textContent = "v" + faDigit(m.version || "?");
    sizeText.textContent = m.size ? fmtBytes(m.size) : "— مگابایت";
    const now = new Date();
    updatedAt.textContent = "آخرین بررسی: " + faDigit(now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }));
  }

  /* ------------------------------------------------------------------ download
     استراتژی مقاوم در برابر نت ضعیف/فیلتر:
       1) تلاش با fetch + ReadableStream برای نمایش پیشرفت واقعی.
       2) در صورت قطعی، تلاش مجدد خودکار با Range (resume) تا N بار.
       3) اگر استریم اصلاً پشتیبانی/اجازه نشد → دانلود ساده‌ی مستقیم.
     ------------------------------------------------------------------ */
  let downloading = false;

  function setProgress(received, total) {
    if (total > 0) {
      const pct = Math.min(100, (received / total) * 100);
      dlFill.style.width = pct + "%";
      btnProgress.style.width = pct + "%";
      dlPercent.textContent = faDigit(pct.toFixed(0)) + "٪";
      dlSize.textContent = fmtBytes(received) + " / " + fmtBytes(total);
    } else {
      dlPercent.textContent = "…";
      dlSize.textContent = fmtBytes(received);
    }
  }

  async function streamDownload(url, fileName) {
    const MAX_RETRY = 6;
    let received = 0;
    let total = 0;
    const chunks = [];
    let attempt = 0;
    let lastTs = performance.now();
    let lastBytes = 0;

    // اندازه کل را از META یا HEAD می‌گیریم
    total = META.size || 0;

    while (attempt <= MAX_RETRY) {
      try {
        const headers = {};
        if (received > 0) headers["Range"] = `bytes=${received}-`;

        const resp = await fetch(url, { headers, cache: "no-store" });
        if (!resp.ok && resp.status !== 206) throw new Error("http-" + resp.status);

        if (!total) {
          const cl = resp.headers.get("Content-Length");
          const cr = resp.headers.get("Content-Range");
          if (cr && cr.includes("/")) total = parseInt(cr.split("/")[1], 10) || 0;
          else if (cl) total = parseInt(cl, 10) + received;
        }

        if (!resp.body || !resp.body.getReader) {
          // مرورگر استریم را پشتیبانی نمی‌کند → دانلود ساده
          throw new Error("no-stream-support");
        }

        const reader = resp.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;

          // سرعت
          const nowTs = performance.now();
          if (nowTs - lastTs > 400) {
            const bps = ((received - lastBytes) / (nowTs - lastTs)) * 1000;
            dlSpeed.textContent = fmtSpeed(bps);
            lastTs = nowTs; lastBytes = received;
          }
          setProgress(received, total);
        }

        // کامل شد
        const blob = new Blob(chunks, { type: "application/vnd.android.package-archive" });
        saveBlob(blob, fileName);
        return true;
      } catch (err) {
        attempt++;
        if (String(err.message).includes("no-stream-support")) {
          // مستقیم دانلود کن
          directDownload(url, fileName);
          return true;
        }
        if (attempt > MAX_RETRY) throw err;
        // backoff و resume
        dlHint.textContent = `اتصال ضعیف — تلاش مجدد (${faDigit(attempt)})… ادامه از ${fmtBytes(received)}`;
        await new Promise((r) => setTimeout(r, Math.min(1500 * attempt, 6000)));
      }
    }
    throw new Error("retry-exhausted");
  }

  function saveBlob(blob, fileName) {
    const a = document.createElement("a");
    const objUrl = URL.createObjectURL(blob);
    a.href = objUrl;
    a.download = fileName || "ProfessorVPN.apk";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objUrl), 4000);
  }

  function directDownload(url, fileName) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "ProfessorVPN.apk";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function startDownload() {
    if (downloading) return;
    if (!META.url) { await loadMeta(); if (!META.url) return; }

    downloading = true;
    btn.disabled = true;
    btn.classList.add("is-downloading");
    btn.querySelector(".dl-btn__text").textContent = "در حال دانلود…";
    dlStatus.hidden = false;
    dlHint.textContent = "در حال آماده‌سازی اتصال امن…";
    setProgress(0, META.size || 0);

    const fileName = META.name || `ProfessorVPN-v${META.version || ""}.apk`;

    try {
      await streamDownload(META.url, fileName);
      dlHint.textContent = "دانلود کامل شد ✓ فایل را نصب کنید.";
      dlSpeed.textContent = "";
      toast("دانلود با موفقیت انجام شد ✓");
      btn.querySelector(".dl-btn__text").textContent = "دانلود مجدد";
    } catch (e) {
      // آخرین تلاش: دانلود ساده‌ی مرورگر
      try {
        directDownload(META.url, fileName);
        dlHint.textContent = "دانلود از طریق مرورگر آغاز شد…";
        toast("دانلود از طریق مرورگر آغاز شد.");
      } catch {
        dlHint.textContent = "خطا در دانلود. لطفاً دوباره تلاش کنید.";
        toast("دانلود ناموفق بود. دوباره تلاش کنید.", true);
      }
      btn.querySelector(".dl-btn__text").textContent = "تلاش مجدد";
    } finally {
      downloading = false;
      btn.disabled = false;
      btn.classList.remove("is-downloading");
      btnProgress.style.width = "0%";
    }
  }

  btn.addEventListener("click", startDownload);

  /* ------------------------------------------------------------------ reveal */
  function runReveal() {
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => {
      const delay = parseInt(el.dataset.delay || "0", 10);
      setTimeout(() => el.classList.add("in"), delay);
    });
  }

  /* ------------------------------------------------------------------ particles */
  function initParticles() {
    const c = $("particles");
    if (!c) return;
    const ctx = c.getContext("2d");
    let w, h, parts = [];
    const COUNT = window.innerWidth < 600 ? 28 : 54;
    const colors = ["#a855f7", "#e635c4", "#ff2d55"];

    function resize() {
      w = c.width = window.innerWidth * devicePixelRatio;
      h = c.height = window.innerHeight * devicePixelRatio;
    }
    function make() {
      parts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.8 + 0.4) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        col: colors[(Math.random() * colors.length) | 0],
        a: Math.random() * 0.5 + 0.2,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.globalAlpha = p.a;
        ctx.shadowBlur = 10 * devicePixelRatio;
        ctx.shadowColor = p.col;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    resize(); make(); tick();
    window.addEventListener("resize", () => { resize(); make(); });
  }

  /* ------------------------------------------------------------------ init */
  window.addEventListener("DOMContentLoaded", () => {
    runReveal();
    initParticles();
    loadMeta();
    // بررسی دوره‌ای نسخه (auto-update هر ۵ دقیقه)
    setInterval(loadMeta, 5 * 60 * 1000);
  });
})();
