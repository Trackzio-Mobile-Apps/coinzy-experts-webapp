/**
 * Demo access token — same *shape* as a future JWT (header.payload.sig),
 * without cryptographic signing. Replace `verifyDemoAccessToken` with real
 * JWT / session validation when the API is integrated.
 */

export const DEMO_TOKEN_SIG = "mock_hs256_placeholder";

export type DemoAccessPayload = {
  typ: "coinzy_demo_access";
  email: string;
  iat: number;
  exp: number;
};

function utf8ToB64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) {
    bin += String.fromCharCode(b);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToUtf8(segment: string): string {
  const padLen = (4 - (segment.length % 4)) % 4;
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLen);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Issues `cz.<base64url(payload)>.<sig>` — swap for real access_token string from API. */
export function issueDemoAccessToken(email: string): string {
  const now = Date.now();
  const payload: DemoAccessPayload = {
    typ: "coinzy_demo_access",
    email: email.toLowerCase(),
    iat: now,
    exp: now + 7 * 24 * 60 * 60 * 1000,
  };
  const body = utf8ToB64Url(JSON.stringify(payload));
  return `cz.${body}.${DEMO_TOKEN_SIG}`;
}

/** Returns parsed payload if token is valid and not expired; otherwise null. */
export function verifyDemoAccessToken(
  token: string | undefined | null,
): DemoAccessPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [prefix, body, sig] = parts;
  if (prefix !== "cz" || !body || sig !== DEMO_TOKEN_SIG) return null;
  try {
    const parsed = JSON.parse(b64UrlToUtf8(body)) as DemoAccessPayload;
    if (parsed.typ !== "coinzy_demo_access") return null;
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) return null;
    if (typeof parsed.email !== "string" || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}
