import { EXPERT_ACCESS_TOKEN_COOKIE } from "@/lib/expert-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/expert/login", url.origin), 303);
  res.cookies.set(EXPERT_ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
