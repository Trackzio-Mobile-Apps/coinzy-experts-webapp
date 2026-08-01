import { NextResponse } from "next/server";

/** Exposes the expert API base URL to the browser for Socket.IO (server env only). */
export async function GET() {
  const url = (
    process.env.EXPERT_API_BASE_URL ??
    process.env.NEXT_PUBLIC_EXPERT_API_BASE_URL ??
    process.env.NEXT_PUBLIC_EXPERT_SOCKET_URL ??
    ""
  ).replace(/\/$/, "");

  return NextResponse.json({ url });
}
