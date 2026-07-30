/** Decode a JWT payload without verification (used only to key server-side storage). */
export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const segment = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = segment + "=".repeat((4 - (segment.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Resolve expert Mongo id from an expert JWT payload. */
export function expertIdFromJwt(token: string | undefined | null): string | null {
  if (!token?.trim()) return null;
  const payload = decodeJwtPayload(token.trim());
  if (!payload) return null;

  for (const key of ["expertId", "id", "sub", "_id"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function normalizeReportMapEntry(
  requestId: unknown,
  reportId: unknown,
): { requestId: string; reportId: string } | null {
  const req =
    typeof requestId === "string" && requestId.trim() ? requestId.trim() : "";
  const rep =
    typeof reportId === "string" && reportId.trim() ? reportId.trim() : "";
  if (!req || !rep) return null;
  return { requestId: req, reportId: rep };
}

export function mergeReportMaps(
  existing: Record<string, string>,
  incoming: Record<string, string>,
  maxEntries = 120,
): Record<string, string> {
  const merged = { ...existing, ...incoming };
  const entries = Object.entries(merged);
  if (entries.length <= maxEntries) return merged;
  return Object.fromEntries(entries.slice(-maxEntries));
}

export function reportMappingFromMutationResponse(
  body: unknown,
): { requestId: string; reportId: string } | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as Record<string, unknown>).data;
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const report = record.report;
  if (!report || typeof report !== "object") return null;

  const reportRecord = report as Record<string, unknown>;
  const requestFromPayload = record.request;
  const requestId =
    reportRecord.requestId ??
    (requestFromPayload &&
    typeof requestFromPayload === "object" &&
    "_id" in requestFromPayload
      ? (requestFromPayload as Record<string, unknown>)._id
      : undefined);

  return normalizeReportMapEntry(requestId, reportRecord._id);
}
