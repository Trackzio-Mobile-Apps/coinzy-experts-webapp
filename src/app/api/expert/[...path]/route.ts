import { NextRequest, NextResponse } from "next/server";
import { EXPERT_JWT_COOKIE } from "@/lib/expert/expertCookie";

function getBackendBaseUrl(): string {
  const base =
    process.env.EXPERT_API_BASE_URL ??
    process.env.NEXT_PUBLIC_EXPERT_API_BASE_URL ??
    "http://localhost:3001";
  return base.replace(/\/$/, "");
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const target = new URL(`/${pathSegments.join("/")}`, getBackendBaseUrl());
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("authorization", authorization);
  } else {
    const path = pathSegments.join("/");
    const isPublicAuthRoute = path === "experts/login";
    if (!isPublicAuthRoute) {
      const token = request.cookies.get(EXPERT_JWT_COOKIE)?.value;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  let backendResponse: Response;

  try {
    backendResponse = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        error: true,
        message: "Unable to reach the expert API. Is the backend running?",
        data: null,
      },
      { status: 502 },
    );
  }

  const responseBody = await backendResponse.text();
  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get("content-type");

  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
