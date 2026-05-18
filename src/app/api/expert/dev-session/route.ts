import { DEMO_EXPERT_LOGIN } from "@/data/expert-panel.mock";
import { issueDemoAccessToken } from "@/lib/expert-demo-token";
import { EXPERT_ACCESS_TOKEN_COOKIE } from "@/lib/expert-session";
import { NextResponse } from "next/server";

/**
 * One-click demo session (development only). Use when form login is awkward to debug.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const token = issueDemoAccessToken(DEMO_EXPERT_LOGIN.email);
  const res = NextResponse.redirect(new URL("/expert/queue", url.origin), 303);
  res.cookies.set(EXPERT_ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: false,
  });
  return res;
}
