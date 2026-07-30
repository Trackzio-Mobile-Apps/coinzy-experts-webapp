import { EXPERT_JWT_COOKIE } from "@/lib/expert/expertCookie";
import { NextRequest, NextResponse } from "next/server";

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }
  if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    return true;
  }
  return false;
}

function isAllowedMediaUrl(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return false;
  }
  if (isPrivateHost(url.hostname)) {
    return false;
  }
  return true;
}

/** Server-side fetch for report media — avoids browser CORS when embedding in PDFs. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(EXPERT_JWT_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: true, message: "Unauthorized." }, { status: 401 });
  }

  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: true, message: "Missing url." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: true, message: "Invalid url." }, { status: 400 });
  }

  if (!isAllowedMediaUrl(target)) {
    return NextResponse.json({ error: true, message: "Forbidden url." }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: true, message: "Unable to fetch media." },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Unable to fetch media." },
      { status: 502 },
    );
  }
}
