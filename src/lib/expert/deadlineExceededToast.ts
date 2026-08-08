import { DEADLINE_EXCEEDED_TOAST_KEY } from "@/lib/expert/constants";
import { formatQueueRequestIdLabel } from "@/lib/expert/format";

export type DeadlineExceededToastPayload = {
  displayIds: string[];
};

/** In-memory copy so Strict Mode remounts still show the toast after storage is cleared. */
let activeToastMessage: string | null = null;

function normalizeDisplayId(raw: string): string {
  return raw.trim();
}

function uniqueDisplayIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = normalizeDisplayId(raw);
    if (!id) continue;
    // Dedupe by the human label so "16" and "00016" count as one request.
    const key = formatQueueRequestIdLabel(id).toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}

function parsePayload(raw: string | null): DeadlineExceededToastPayload | null {
  if (!raw) return null;

  // Legacy boolean flag — cannot build a correct message without IDs.
  if (raw === "1") return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const displayIds = (parsed as { displayIds?: unknown }).displayIds;
    if (!Array.isArray(displayIds)) return null;
    const ids = uniqueDisplayIds(
      displayIds.filter((id): id is string => typeof id === "string"),
    );
    if (ids.length === 0) return null;
    return { displayIds: ids };
  } catch {
    return null;
  }
}

/** Message for the deadline-exceeded info toast, or null when there is nothing to show. */
export function formatDeadlineExceededToastMessage(
  displayIds: string[],
): string | null {
  const ids = uniqueDisplayIds(displayIds);
  if (ids.length === 0) return null;

  if (ids.length === 1) {
    const label = formatQueueRequestIdLabel(ids[0]!);
    return `Evaluation ${label} expired and has been moved to History.`;
  }

  return `${ids.length} evaluation requests expired and have been moved to History.`;
}

/** Append a display id to the pending toast payload (deduped). */
export function queueDeadlineExceededToast(displayId: string): void {
  if (typeof window === "undefined") return;
  const nextId = normalizeDisplayId(displayId);
  if (!nextId) return;

  try {
    const existing = parsePayload(
      window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY),
    );
    const displayIds = uniqueDisplayIds([
      ...(existing?.displayIds ?? []),
      nextId,
    ]);
    window.sessionStorage.setItem(
      DEADLINE_EXCEEDED_TOAST_KEY,
      JSON.stringify({ displayIds } satisfies DeadlineExceededToastPayload),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Read and clear the session payload, returning the toast message to show.
 * Clears sessionStorage immediately so refresh will not re-trigger.
 * Keeps an in-memory copy until {@link clearDeadlineExceededToastMessage} so
 * React Strict Mode remounts still receive the message.
 */
export function consumeDeadlineExceededToastMessage(): string | null {
  if (typeof window === "undefined") return activeToastMessage;

  try {
    const raw = window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY);
    if (raw != null) {
      window.sessionStorage.removeItem(DEADLINE_EXCEEDED_TOAST_KEY);
      const message = formatDeadlineExceededToastMessage(
        parsePayload(raw)?.displayIds ?? [],
      );
      if (message) {
        activeToastMessage = message;
      }
    }
  } catch {
    try {
      window.sessionStorage.removeItem(DEADLINE_EXCEEDED_TOAST_KEY);
    } catch {
      /* ignore */
    }
  }

  return activeToastMessage;
}

/** Drop the in-memory toast after it has been dismissed. */
export function clearDeadlineExceededToastMessage(): void {
  activeToastMessage = null;
}

/** Test helper — reset module state between cases. */
export function resetDeadlineExceededToastStateForTests(): void {
  activeToastMessage = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DEADLINE_EXCEEDED_TOAST_KEY);
  } catch {
    /* ignore */
  }
}
