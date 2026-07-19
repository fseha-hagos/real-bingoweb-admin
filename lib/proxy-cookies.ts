/**
 * Rewrite upstream Set-Cookie so the browser stores the session on the
 * admin origin (Vercel), not the backend host.
 *
 * Critical: do NOT strip `Secure` on HTTPS. Better Auth uses `__Secure-`
 * cookie names; browsers reject those cookies without the Secure flag.
 * That left AuthGuard working (localStorage) while /api/admin got 401.
 */
export function rewriteUpstreamSetCookie(
  raw: string,
  opts: { isHttps: boolean }
): string {
  let cookie = raw.replace(/;\s*Domain=[^;]*/gi, "");

  // Ensure cookie is sent to both /api/auth and /api/admin
  if (/;\s*Path=/i.test(cookie)) {
    cookie = cookie.replace(/;\s*Path=[^;]*/gi, "; Path=/");
  } else {
    cookie += "; Path=/";
  }

  if (!opts.isHttps) {
    // Local http:// — __Secure-/__Host- require Secure, so drop the prefix
    const eq = cookie.indexOf("=");
    if (eq > 0) {
      const name = cookie.slice(0, eq);
      const rest = cookie.slice(eq);
      cookie =
        name.replace(/^__Secure-/i, "").replace(/^__Host-/i, "") + rest;
    }
    cookie = cookie.replace(/;\s*Secure/gi, "");
    cookie = cookie.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  }

  return cookie;
}

export function copyUpstreamSetCookies(
  upstream: Headers,
  resHeaders: Headers,
  opts: { isHttps: boolean }
) {
  const getSetCookie = (
    upstream as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.();

  if (getSetCookie && getSetCookie.length > 0) {
    for (const c of getSetCookie) {
      resHeaders.append("set-cookie", rewriteUpstreamSetCookie(c, opts));
    }
    return;
  }

  const single = upstream.get("set-cookie");
  if (single) {
    resHeaders.append("set-cookie", rewriteUpstreamSetCookie(single, opts));
  }
}
