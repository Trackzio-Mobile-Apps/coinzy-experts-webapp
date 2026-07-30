import {
  daysUntil,
  formatShortDate,
  formatSubmitted,
  normalizeIsoDate,
  normalizeMongoId,
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

const MEDIA_GROUP_LABELS: Record<string, string> = {
  obverse: "Obverse",
  reverse: "Reverse",
  edge: "Damage/Tear",
  damage: "Damage/Tear",
  tear: "Damage/Tear",
  video: "Videos",
  videos: "Videos",
};

function mediaGroupLabel(key: string): string {
  const normalized = key.trim().toLowerCase();
  return MEDIA_GROUP_LABELS[normalized] ?? key.trim();
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

function pushMediaUrl(
  media: RequestMediaItem[],
  url: string,
  opts: { alt: string; group?: string; forceVideo?: boolean },
) {
  const src = url.trim();
  if (!src) return;
  const isVideo = opts.forceVideo || isVideoUrl(src);
  if (isVideo) {
    media.push({
      kind: "video",
      src,
      poster: "",
      alt: opts.alt,
      group: opts.group,
    });
  } else {
    media.push({
      kind: "image",
      src,
      alt: opts.alt,
      group: opts.group,
    });
  }
}

function parseMediaList(
  rawMedia: unknown,
  coinName: string,
): RequestMediaItem[] {
  const media: RequestMediaItem[] = [];

  // Live API: { obverse: string[], reverse: string[], edge: string[], video: string }
  if (rawMedia && typeof rawMedia === "object" && !Array.isArray(rawMedia)) {
    const groups = rawMedia as Record<string, unknown>;
    for (const [key, value] of Object.entries(groups)) {
      const group = mediaGroupLabel(key);
      const forceVideo = key.toLowerCase().includes("video");
      if (typeof value === "string") {
        pushMediaUrl(media, value, { alt: coinName, group, forceVideo });
        continue;
      }
      if (!Array.isArray(value)) continue;
      for (const item of value) {
        if (typeof item === "string") {
          pushMediaUrl(media, item, { alt: coinName, group, forceVideo });
          continue;
        }
        const entry = asRecord(item);
        const src = asString(entry.src ?? entry.url ?? entry.poster, "");
        if (!src) continue;
        pushMediaUrl(media, src, {
          alt: asString(entry.alt ?? entry.label, coinName),
          group,
          forceVideo:
            forceVideo ||
            entry.kind === "video" ||
            entry.type === "video",
        });
      }
    }

    // Prefer a still image as video poster when the API only sends an mp4 URL.
    const firstImage = media.find((m) => m.kind === "image");
    if (firstImage?.kind === "image") {
      for (const item of media) {
        if (item.kind === "video" && !item.poster) {
          item.poster = firstImage.src;
        }
      }
    }
    return media;
  }

  if (Array.isArray(rawMedia)) {
    for (const item of rawMedia) {
      if (typeof item === "string") {
        pushMediaUrl(media, item, { alt: coinName });
        continue;
      }
      const entry = asRecord(item);
      const src = asString(entry.src ?? entry.url ?? entry.poster, "");
      if (!src) continue;
      const alt = asString(entry.alt ?? entry.label, coinName);
      const groupRaw = asString(
        entry.group ?? entry.category ?? entry.label ?? entry.side,
        "",
      );
      const group =
        groupRaw && groupRaw !== "—" ? mediaGroupLabel(groupRaw) : undefined;
      const forceVideo = entry.kind === "video" || entry.type === "video";
      pushMediaUrl(media, src, { alt, group, forceVideo });
      if (forceVideo && media.length > 0) {
        const last = media[media.length - 1];
        if (last?.kind === "video") {
          last.duration =
            typeof entry.duration === "string" ||
            typeof entry.duration === "number"
              ? String(entry.duration)
              : undefined;
          const poster = asString(entry.poster, "");
          if (poster) last.poster = poster;
        }
      }
    }
  }

  const firstImage = media.find((m) => m.kind === "image");
  if (firstImage?.kind === "image") {
    for (const item of media) {
      if (item.kind === "video" && !item.poster) {
        item.poster = firstImage.src;
      }
    }
  }

  return media;
}

/** Media from report attachments and/or the original request payload. */
export function mediaFromReportSources(
  coinName: string,
  attachments: unknown[] | undefined,
  requestPayload?: unknown,
): RequestMediaItem[] {
  if (attachments?.length) {
    const fromAttachments = parseMediaList(attachments, coinName);
    if (fromAttachments.length > 0) return fromAttachments;
  }
  if (requestPayload) {
    return parseRequestPayload(requestPayload).media;
  }
  return [];
}

export function parseRequestPayload(payload: unknown) {
  const data = asRecord(payload);
  const coinName = asString(
    data.coinName ?? data.name ?? data.title ?? data.coinTitle,
    "Evaluation request",
  );
  const type = asString(
    data.type ?? data.material ?? data.category ?? data.shape,
    "—",
  );
  const userNotes = asString(
    data.notes ?? data.userNotes ?? data.description ?? data.userNote,
    "No notes provided.",
  );
  const valueInr = asNumber(data.valueInr ?? data.estimatedValueInr);
  const media = parseMediaList(
    data.media ?? data.images ?? data.attachments,
    coinName,
  );

  return { coinName, type, userNotes, valueInr, media };
}

function resolveCoinName(request: BackendRequest): string {
  const fromTitle =
    typeof request.coinTitle === "string" ? request.coinTitle.trim() : "";
  if (fromTitle) return fromTitle;
  return parseRequestPayload(request.payload).coinName;
}

function resolveDisplayId(request: BackendRequest): string {
  const displayId =
    typeof request.displayId === "string" ? request.displayId.trim() : "";
  if (displayId) return displayId;
  const id = normalizeMongoId(request._id);
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

function resolveHistoryRequestLabel(request: BackendRequest): string {
  const displayId = resolveDisplayId(request);
  if (/^(REQ|EV)[-_]/i.test(displayId)) {
    return displayId.toUpperCase().replace("_", "-");
  }
  const digits = displayId.replace(/\D/g, "");
  const tail = (digits || displayId).slice(-5).padStart(5, "0").toUpperCase();
  return `REQ-${tail}`;
}

export function mapOfferToQueueItem(offer: BackendOffer): QueueListItem {
  const request = offer.request;
  const deadlineAt = normalizeIsoDate(
    request.deadlineAt ?? offer.expiresAt,
  );
  return {
    id: normalizeMongoId(request._id),
    displayId: resolveDisplayId(request),
    offerId: normalizeMongoId(offer._id),
    submittedDisplay: formatSubmitted(request.createdAt),
    status: "pending_review",
    deadlineDays: daysUntil(deadlineAt),
    deadlineAt,
    coinName: resolveCoinName(request),
  };
}

export function mapAcceptedRequestToQueueItem(
  request: BackendRequest,
): QueueListItem {
  const deadlineAt = normalizeIsoDate(request.deadlineAt);
  return {
    id: normalizeMongoId(request._id),
    displayId: resolveDisplayId(request),
    submittedDisplay: formatSubmitted(request.acceptedAt ?? request.createdAt),
    status: "in_progress",
    deadlineDays: daysUntil(deadlineAt),
    deadlineAt,
    coinName: resolveCoinName(request),
  };
}

export function mapRequestToDraftItem(
  request: BackendRequest,
  progressPercent: number,
): DraftListItem {
  const deadlineAt = normalizeIsoDate(request.deadlineAt);
  return {
    id: normalizeMongoId(request._id),
    displayId: resolveDisplayId(request),
    submittedDisplay: formatSubmitted(request.acceptedAt ?? request.createdAt),
    deadlineDays: daysUntil(deadlineAt),
    deadlineAt,
    progressPercent,
  };
}

function historyStatusForRequest(status: string): HistoryRowStatus {
  if (status === "completed" || status === "report_submitted") return "completed";
  if (
    status === "deadline_missed" ||
    status === "expired" ||
    status === "cancelled"
  ) {
    return "missed";
  }
  if (status === "accepted") return "draft";
  if (status === "offered") return "new";
  return "new";
}

function historyActionForRequest(status: string): HistoryAction {
  if (status === "completed" || status === "report_submitted") {
    return "view_report";
  }
  if (status === "accepted") return "resume";
  if (status === "offered") return "evaluate";
  if (
    status === "deadline_missed" ||
    status === "expired" ||
    status === "cancelled"
  ) {
    return "view_details";
  }
  return "none";
}

export function mapRequestToHistoryRow(
  request: BackendRequest,
  opts?: { reportId?: string; offerId?: string },
): HistoryRow {
  const parsed = parseRequestPayload(request.payload);
  const status = historyStatusForRequest(request.status);
  return {
    requestId: normalizeMongoId(request._id),
    requestLabel: resolveHistoryRequestLabel(request),
    reportId: opts?.reportId ? normalizeMongoId(opts.reportId) : undefined,
    offerId: opts?.offerId ? normalizeMongoId(opts.offerId) : undefined,
    coinName: resolveCoinName(request),
    type: parsed.type,
    dateDisplay: formatShortDate(
      request.completedAt ?? request.submittedAt ?? request.createdAt,
    ),
    valueInr: parsed.valueInr,
    status,
    action: historyActionForRequest(request.status),
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
  const requestById = new Map(
    requests.map((r) => [normalizeMongoId(r._id), r]),
  );
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
  const unavailable = Boolean(opts.unavailable);
  // Show Accept while still offered and we have an offer id (Jul 24 behavior).
  const needsAccept =
    !unavailable &&
    opts.request.status === "offered" &&
    Boolean(opts.offerId);
  const canSubmit = opts.request.status === "accepted" && !unavailable;

  return {
    requestId: normalizeMongoId(opts.request._id),
    displayId: resolveDisplayId(opts.request),
    offerId: opts.offerId ? normalizeMongoId(opts.offerId) : undefined,
    needsAccept,
    unavailable,
    canSubmit,
    deadlineDays: daysUntil(opts.request.deadlineAt),
    deadlineAt: normalizeIsoDate(opts.request.deadlineAt),
    receivedAt: normalizeIsoDate(opts.request.createdAt),
    submittedDisplay: formatSubmitted(
      opts.request.acceptedAt ?? opts.request.createdAt,
    ),
    userNotes: parsed.userNotes,
    coinName: resolveCoinName(opts.request),
    media: parsed.media,
  };
}

export function queueStatusLabel(status: QueueItemStatus): string {
  return status === "in_progress" ? "In progress" : "Pending review";
}
