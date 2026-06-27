// ============================================================================
//  SECURE CONFIG  (SERVER-SIDE ONLY)
//  This file runs ONLY on Cloudflare's edge servers.
//  The values here are NEVER sent to the browser / never appear in client code.
//  You can also override these with Cloudflare environment variables:
//     SRC_OWNER, SRC_REPO, SRC_BRANCH, SRC_BUILD_DIR, APP_NAME
// ============================================================================

export function getConfig(env) {
  return {
    // Source repository (kept private on the server, hidden from the client)
    owner:    (env && env.SRC_OWNER)     || "aptixzero",
    repo:     (env && env.SRC_REPO)      || "PRF_VPN",
    branch:   (env && env.SRC_BRANCH)    || "main",
    buildDir: (env && env.SRC_BUILD_DIR) || "build",
    appName:  (env && env.APP_NAME)      || "ProfessorVPN",
    // Optional GitHub token to raise API rate limits (set as secret GH_TOKEN)
    token:    (env && env.GH_TOKEN)      || null,
  };
}

// Pick the newest .apk from a file list and parse its version.
export function pickLatest(files, appName) {
  const apks = files.filter(
    (f) => f.type === "file" && /\.apk$/i.test(f.name)
  );
  if (apks.length === 0) return null;

  const parsed = apks.map((f) => {
    const m = f.name.match(/v?(\d+)\.(\d+)(?:\.(\d+))?/i);
    const major = m ? parseInt(m[1], 10) : 0;
    const minor = m ? parseInt(m[2], 10) : 0;
    const patch = m && m[3] ? parseInt(m[3], 10) : 0;
    const version = m
      ? `${major}.${minor}${m[3] ? "." + patch : ""}`
      : "0.0";
    return { ...f, major, minor, patch, version };
  });

  parsed.sort((a, b) => {
    if (b.major !== a.major) return b.major - a.major;
    if (b.minor !== a.minor) return b.minor - a.minor;
    return b.patch - a.patch;
  });

  return parsed[0];
}
