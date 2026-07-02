import {
  daysUntil,
  formatShortDate,
  formatSubmitted,
  type HistoryPeriodFilter,
} from "@/lib/expert/format";
import type {
  BackendOffer,
  BackendRequest,
  DraftListItem,
  EvaluationRequestDetail,
  HistoryAction,
  HistoryRow,
  HistoryRowStatus,
  QueueListItem,
  QueueItemStatus,
  RequestMediaItem,
} from "@/lib/expert/types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "—"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function parseRequestPayload(payload: unknown) {
  const data = asRecord(payload);
  const coinName = asString(
    data.coinName ?? data.name ?? data.title,
    "Evaluation request",
  );
  const type = asString(
    data.type ?? data.material ?? data.category ?? data.shape,
    "—",
  );
  const userNotes = asString(
    data.notes ?? data.userNotes ?? data.description,
    "No notes provided.",
  );
  const valueInr = asNumber(data.valueInr ?? data.estimatedValueInr);

  const media: RequestMediaItem[] = [];
  const rawMedia = data.media ?? data.images ?? data.attachments;
  if (Array.isArray(rawMedia)) {
    for (const item of rawMedia) {
      const entry = asRecord(item);
      const src = asString(entry.src ?? entry.url ?? entry.poster, "");
      if (!src) continue;
      const alt = asString(entry.alt ?? entry.label, coinName);
      if (entry.kind === "video" || entry.type === "video") {
        media.push({ kind: "video", poster: src, alt });
      } else {
        media.push({ kind: "image", src, alt });
      }
    }
  }

  return { coinName, type, userNotes, valueInr, media };
}

export function mapOfferToQueueItem(offer: BackendOffer): QueueListItem {
  const request = offer.request;
  const parsed = parseRequestPayload(request.payload);
  return {
    id: request._id,
    offerId: offer._id,
    submittedDisplay: formatSubmitted(request.createdAt),
    status: "pending_review",
    deadlineDays: daysUntil(request.deadlineAt ?? offer.expiresAt),
    coinName: parsed.coinName,
  };
}

export function mapAcceptedRequestToQueueItem(
  request: BackendRequest,
): QueueListItem {
  const parsed = parseRequestPayload(request.payload);
  return {
    id: request._id,
    submittedDisplay: formatSubmitted(request.acceptedAt ?? request.createdAt),
    status: "in_progress",
    deadlineDays: daysUntil(request.deadlineAt),
    coinName: parsed.coinName,
  };
}

export function mapRequestToDraftItem(
  request: BackendRequest,
  progressPercent: number,
): DraftListItem {
  return {
    id: request._id,
    submittedDisplay: formatSubmitted(request.acceptedAt ?? request.createdAt),
    deadlineDays: daysUntil(request.deadlineAt),
    progressPercent,
  };
}

function historyStatusForRequest(status: string): HistoryRowStatus {
  if (status === "completed" || status === "report_submitted") return "completed";
  if (status === "deadline_missed") return "missed";
  if (status === "accepted") return "draft";
  if (status === "offered") return "new";
  return "new";
}

function historyActionForRequest(
  status: string,
  reportId?: string,
): HistoryAction {
  if ((status === "completed" || status === "report_submitted") && reportId) {
    return "view_report";
  }
  if (status === "accepted") return "resume";
  if (status === "offered") return "evaluate";
  return "none";
}

export function mapRequestToHistoryRow(
  request: BackendRequest,
  reportId?: string,
): HistoryRow {
  const parsed = parseRequestPayload(request.payload);
  const status = historyStatusForRequest(request.status);
  return {
    requestId: request._id,
    reportId,
    coinName: parsed.coinName,
    type: parsed.type,
    dateDisplay: formatShortDate(
      request.completedAt ?? request.submittedAt ?? request.createdAt,
    ),
    valueInr: parsed.valueInr,
    status,
    action: historyActionForRequest(request.status, reportId),
  };
}

export function buildQueueList(
  offers: BackendOffer[],
  accepted: BackendRequest[],
): QueueListItem[] {
  const offerItems = offers.map(mapOfferToQueueItem);
  const activeItems = accepted.map(mapAcceptedRequestToQueueItem);
  return [...offerItems, ...activeItems].sort(
    (a, b) => a.deadlineDays - b.deadlineDays,
  );
}

export function filterHistoryByPeriod(
  rows: HistoryRow[],
  requests: BackendRequest[],
  period: HistoryPeriodFilter,
): HistoryRow[] {
  if (period === "all") return rows;
  const requestById = new Map(requests.map((r) => [r._id, r]));
  return rows.filter((row) => {
    const request = requestById.get(row.requestId);
    const date =
      request?.completedAt ?? request?.submittedAt ?? request?.createdAt;
    if (!date) return false;
    const diffDays =
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    if (period === "month") return diffDays <= 31;
    return diffDays <= 92;
  });
}

export function buildEvaluationDetail(opts: {
  request: BackendRequest;
  offerId?: string;
  unavailable?: boolean;
}): EvaluationRequestDetail {
  const parsed = parseRequestPayload(opts.request.payload);
  const canSubmit = opts.request.status === "accepted" && !opts.unavailable;

  return {
    requestId: opts.request._id,
    offerId: opts.offerId,
    unavailable: Boolean(opts.unavailable),
    canSubmit,
    deadlineDays: daysUntil(opts.request.deadlineAt),
    submittedDisplay: formatSubmitted(
      opts.request.acceptedAt ?? opts.request.createdAt,
    ),
    userNotes: parsed.userNotes,
    coinName: parsed.coinName,
    media: parsed.media,
  };
}

export function queueStatusLabel(status: QueueItemStatus): string {
  return status === "in_progress" ? "In progress" : "Pending review";
}
