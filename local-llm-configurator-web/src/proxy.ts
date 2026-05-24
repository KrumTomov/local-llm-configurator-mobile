import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://127.0.0.1:8081",
  "http://localhost:8081",
  "http://127.0.0.1:19006",
  "http://localhost:19006",
];

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/mobile/v1")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = NextResponse.next();

  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/mobile/v1/:path*",
};

function getCorsHeaders(origin: string | null) {
  const headers = new Headers();
  const allowedOrigin =
    origin && (allowedOrigins.includes(origin) || origin.startsWith("http://192.168."))
      ? origin
      : allowedOrigins[0];

  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");

  return headers;
}
