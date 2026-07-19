/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Admin + auth traffic goes through app/api/*/route.ts proxies so
  // session cookies are rewritten onto this origin and forwarded correctly.
  // Do not rewrite /api/admin to the backend here — that bypasses cookie handling.
};

module.exports = nextConfig;
