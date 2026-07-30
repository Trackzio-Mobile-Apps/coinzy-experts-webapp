import { EXPERT_JWT_COOKIE } from "@/lib/expert/expertCookie";
import {
  expertIdFromJwt,
  normalizeReportMapEntry,
} from "@/lib/expert/expertJwt";
import {
  loadExpertReportMap,
  mergeExpertReportMap,
} from "@/lib/expert/reportMapStore.server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function expertIdFromSession(): Promise<string | null> {
  const jar = await cookies();
  return expertIdFromJwt(jar.get(EXPERT_JWT_COOKIE)?.value);
}

export async function GET() {
  const expertId = await expertIdFromSession();
  if (!expertId) {
    return NextResponse.json(
      { error: true, message: "Expert session required." },
      { status: 401 },
    );
  }

  const map = await loadExpertReportMap(expertId);
  return NextResponse.json({ map });
}

export async function POST(request: Request) {
  const expertId = await expertIdFromSession();
  if (!expertId) {
    return NextResponse.json(
      { error: true, message: "Expert session required." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: true, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const incoming: Record<string, string> = {};

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;

    const single = normalizeReportMapEntry(record.requestId, record.reportId);
    if (single) incoming[single.requestId] = single.reportId;

    const map = record.map;
    if (map && typeof map === "object" && !Array.isArray(map)) {
      for (const [key, value] of Object.entries(map)) {
        const entry = normalizeReportMapEntry(key, value);
        if (entry) incoming[entry.requestId] = entry.reportId;
      }
    }
  }

  if (!Object.keys(incoming).length) {
    return NextResponse.json(
      { error: true, message: "requestId and reportId are required." },
      { status: 400 },
    );
  }

  const map = await mergeExpertReportMap(expertId, incoming);
  return NextResponse.json({ ok: true, map });
}
