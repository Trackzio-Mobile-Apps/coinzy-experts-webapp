import { NextRequest, NextResponse } from "next/server";
import { EXPERT_JWT_COOKIE } from "@/lib/expert/expertCookie";
import {
  expertIdFromJwt,
  reportMappingFromMutationResponse,
} from "@/lib/expert/expertJwt";
import { rememberExpertReportMapping } from "@/lib/expert/reportMapStore.server";

function getBackendBaseUrl(): string {
  const base =
    process.env.EXPERT_API_BASE_URL ??
    process.env.NEXT_PUBLIC_EXPERT_API_BASE_URL ??
    "http://localhost:3001";
  return base.replace(/\/$/, "");
}

function isReportMutation(path: string, method: string): boolean {
  if (method === "POST" && path === "experts/reports") return true;
  if (method === "PUT" && /^experts\/reports\/[^/]+$/.test(path)) return true;
  return false;
}

async function persistReportMappingFromResponse(
  token: string | undefined,
  responseBody: string,
  contentType: string | null,
): Promise<void> {
  if (!contentType?.includes("application/json")) return;

  const expertId = expertIdFromJwt(token);
  if (!expertId) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseBody);
  } catch {
    return;
  }

  const mapping = reportMappingFromMutationResponse(parsed);
  if (!mapping) return;

  try {
    await rememberExpertReportMapping(
      expertId,
      mapping.requestId,
      mapping.reportId,
    );
  } catch {
    // Non-fatal — client-side map sync remains a fallback.
  }
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const method = request.method;
  const path = pathSegments.join("/");
  const token = request.cookies.get(EXPERT_JWT_COOKIE)?.value;
  const bodyText =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  const target = new URL(`/${pathSegments.join("/")}`, getBackendBaseUrl());
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("authorization", authorization);
  } else {
    const isPublicAuthRoute = path === "experts/login";
    if (!isPublicAuthRoute) {
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const body =
    method === "GET" || method === "HEAD" ? undefined : bodyText;

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
        message:
          "Unable to reach the expert API. Check EXPERT_API_BASE_URL and backend availability.",
        data: null,
      },
      { status: 502 },
    );
  }

  const responseBody = await backendResponse.text();
  const responseContentType = backendResponse.headers.get("content-type");

  if (
    isReportMutation(path, method) &&
    backendResponse.ok &&
    responseBody
  ) {
    await persistReportMappingFromResponse(
      token,
      responseBody,
      responseContentType,
    );
  }

  const responseHeaders = new Headers();
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
