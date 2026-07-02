import {
  clearedExpertJwtCookieOptions,
  EXPERT_JWT_COOKIE,
  expertJwtCookieOptions,
} from "@/lib/expert/expertCookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const authenticated = Boolean(jar.get(EXPERT_JWT_COOKIE)?.value);

  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: true, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const token =
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    typeof (body as { token: unknown }).token === "string"
      ? (body as { token: string }).token.trim()
      : "";

  if (!token) {
    return NextResponse.json(
      { error: true, message: "Token is required." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(EXPERT_JWT_COOKIE, token, expertJwtCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(EXPERT_JWT_COOKIE, "", clearedExpertJwtCookieOptions());
  return response;
}
