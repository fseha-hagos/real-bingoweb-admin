const backendUrl = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001"
)
  .replace(/\/$/, "")
  .replace(/\/admin$/i, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Admin REST API → Express /admin/*
      // Auth is handled by app/api/auth/[...all]/route.ts (not rewritten)
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
