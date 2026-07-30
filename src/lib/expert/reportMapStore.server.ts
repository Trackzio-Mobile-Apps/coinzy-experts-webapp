import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { mergeReportMaps } from "@/lib/expert/expertJwt";

const MAX_ENTRIES = 120;
const LOCAL_STORE_DIR = path.join(process.cwd(), ".data", "expert-report-maps");
const NETLIFY_BLOB_STORE = "coinzy-expert-report-maps";

function sanitizeExpertId(expertId: string): string {
  return expertId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function readLocalMap(expertId: string): Promise<Record<string, string>> {
  const filePath = path.join(
    LOCAL_STORE_DIR,
    `${sanitizeExpertId(expertId)}.json`,
  );
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

async function writeLocalMap(
  expertId: string,
  map: Record<string, string>,
): Promise<void> {
  await mkdir(LOCAL_STORE_DIR, { recursive: true });
  const filePath = path.join(
    LOCAL_STORE_DIR,
    `${sanitizeExpertId(expertId)}.json`,
  );
  await writeFile(filePath, JSON.stringify(map), "utf8");
}

async function readNetlifyMap(
  expertId: string,
): Promise<Record<string, string> | null> {
  if (!process.env.NETLIFY) return null;

  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(NETLIFY_BLOB_STORE);
    const value = await store.get(sanitizeExpertId(expertId), { type: "json" });
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, string>;
  } catch {
    return null;
  }
}

async function writeNetlifyMap(
  expertId: string,
  map: Record<string, string>,
): Promise<boolean> {
  if (!process.env.NETLIFY) return false;

  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(NETLIFY_BLOB_STORE);
    await store.setJSON(sanitizeExpertId(expertId), map);
    return true;
  } catch {
    return false;
  }
}

/** Load requestId → reportId map for an expert (cross-device, server-side). */
export async function loadExpertReportMap(
  expertId: string,
): Promise<Record<string, string>> {
  const fromNetlify = await readNetlifyMap(expertId);
  if (fromNetlify) return fromNetlify;
  return readLocalMap(expertId);
}

/** Merge and persist requestId → reportId entries for an expert. */
export async function mergeExpertReportMap(
  expertId: string,
  incoming: Record<string, string>,
): Promise<Record<string, string>> {
  if (!Object.keys(incoming).length) {
    return loadExpertReportMap(expertId);
  }

  const existing = await loadExpertReportMap(expertId);
  const merged = mergeReportMaps(existing, incoming, MAX_ENTRIES);

  const wroteNetlify = await writeNetlifyMap(expertId, merged);
  if (!wroteNetlify) {
    await writeLocalMap(expertId, merged);
  }

  return merged;
}

export async function rememberExpertReportMapping(
  expertId: string,
  requestId: string,
  reportId: string,
): Promise<Record<string, string>> {
  return mergeExpertReportMap(expertId, { [requestId]: reportId });
}
