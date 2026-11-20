import { NextRequest, NextResponse } from "next/server";
import { copyUpstreamSetCookies } from "@/lib/proxy-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendUrl() {
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://real-bingoweb-backend.onrender.com";
  return raw.replace(/\/$/, "").replace(/\/admin$/i, "");
}

/**
 * Proxy admin REST so browser session cookies (admin origin) reach the backend.
 * Prefer this route over next.config rewrites — rewrites to external hosts
 * can drop or mishandle Cookie headers on some hosts.
 */
async function proxy(req: NextRequest, pathSegments: string[]) {
  const subPath = pathSegments.join("/");
  const url = new URL(req.url);
  const target = `${getBackendUrl()}/admin/${subPath}${url.search}`;
  const isHttps = url.protocol === "https:";

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const origin = req.headers.get("origin") || url.origin;
  headers.set("origin", origin);
  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const body = await upstream.arrayBuffer();

  const resHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) resHeaders.set("content-type", upstreamType);

  // In case admin routes also refresh session cookies
  copyUpstreamSetCookies(upstream.headers, resHeaders, { isHttps });

  return new NextResponse(body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

type Ctx = { params: { path: string[] } };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path || []);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path || []);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path || []);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path || []);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path || []);
}
