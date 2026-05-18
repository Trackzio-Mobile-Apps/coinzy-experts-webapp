import { cookies } from "next/headers";
import type { DemoAccessPayload } from "@/lib/expert-demo-token";
import { verifyDemoAccessToken } from "@/lib/expert-demo-token";

/** HttpOnly cookie holding the demo access token (replace with real session / JWT cookie). */
export const EXPERT_ACCESS_TOKEN_COOKIE = "coinzy_expert_access";

export async function getExpertAccessPayload(): Promise<DemoAccessPayload | null> {
  const jar = await cookies();
  return verifyDemoAccessToken(jar.get(EXPERT_ACCESS_TOKEN_COOKIE)?.value);
}

export async function hasExpertAccessSession(): Promise<boolean> {
  return (await getExpertAccessPayload()) !== null;
}
