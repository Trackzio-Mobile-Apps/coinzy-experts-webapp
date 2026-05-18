import { DEMO_EXPERT_LOGIN } from "@/data/expert-panel.mock";
import { issueDemoAccessToken } from "@/lib/expert-demo-token";
import { EXPERT_ACCESS_TOKEN_COOKIE } from "@/lib/expert-session";
import { NextResponse } from "next/server";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const fail = () =>
    NextResponse.redirect(new URL("/expert/login?error=1", url.origin), 303);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail();
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (
    email !== DEMO_EXPERT_LOGIN.email.toLowerCase() ||
    password !== DEMO_EXPERT_LOGIN.password
  ) {
    return fail();
  }

  const token = issueDemoAccessToken(email);
  const res = NextResponse.redirect(new URL("/expert/queue", url.origin), 303);
  res.cookies.set(EXPERT_ACCESS_TOKEN_COOKIE, token, cookieOptions);
  return res;
}
