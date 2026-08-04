import {
  daysUntil,
  formatShortDate,
  formatSubmitted,
  isDeadlineExceeded,
  normalizeIsoDate,
  normalizeMongoId,
  type HistoryPeriodFilter,
} from "@/lib/expert/format";
import { extractReportIdFromRequest } from "@/lib/expert/reportsService";
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
  QueueRowVariant,
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
  edge: "Rim/Edge",
  rim: "Rim/Edge",
  "rim/edge": "Rim/Edge",
  "rim-edge": "Rim/Edge",
  damage: "Rim/Edge",
  tear: "Rim/Edge",
  "damage/tear": "Rim/Edge",
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

function readVideoPoster(entry: Record<string, unknown>): string {
  const candidate = asString(
    entry.poster ?? entry.thumbnail ?? entry.thumbnailUrl ?? entry.preview,
    "",
  );
  if (!candidate || isVideoUrl(candidate)) return "";
  return candidate;
}

function applyVideoEntryMetadata(
  item: RequestMediaItem | undefined,
  entry: Record<string, unknown>,
): void {
  if (!item || item.kind !== "video") return;

  const poster = readVideoPoster(entry);
  if (poster) item.poster = poster;

  if (
    typeof entry.duration === "string" ||
    typeof entry.duration === "number"
  ) {
    item.duration = String(entry.duration);
  }
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
        applyVideoEntryMetadata(media[media.length - 1], entry);
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
      applyVideoEntryMetadata(media[media.length - 1], entry);
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

const QUEUE_THUMBNAIL_GROUP_ORDER = ["Obverse", "Reverse", "Rim/Edge"] as const;

function firstImageUrlInGroup(
  media: RequestMediaItem[],
  group: string,
): string | null {
  for (const item of media) {
    if (item.kind !== "image") continue;
    if (item.group?.trim() !== group) continue;
    const src = item.src.trim();
    if (src) return src;
  }
  return null;
}

/** Up to two queue thumbnail URLs — obverse, reverse, then edge, then any remaining images. */
export function pickQueueThumbnailUrls(
  payload: unknown,
  limit = 2,
): string[] {
  if (limit <= 0) return [];

  try {
    const { media } = parseRequestPayload(payload);
    const urls: string[] = [];
    const seen = new Set<string>();

    const push = (url: string | null | undefined) => {
      const trimmed = url?.trim() ?? "";
      if (!trimmed || seen.has(trimmed) || urls.length >= limit) return;
      seen.add(trimmed);
      urls.push(trimmed);
    };

    for (const group of QUEUE_THUMBNAIL_GROUP_ORDER) {
      push(firstImageUrlInGroup(media, group));
    }

    for (const item of media) {
      if (item.kind === "image") push(item.src);
      if (urls.length >= limit) break;
    }

    return urls;
  } catch {
    return [];
  }
}

function resolveCoinName(request: BackendRequest): string {
  const fromTitle =
    typeof request.coinTitle === "string" ? request.coinTitle.trim() : "";
  if (fromTitle) return fromTitle;
  return parseRequestPayload(request.payload).coinName;
}

function readDisplayIdField(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return "";
}

function resolveDisplayId(request: BackendRequest): string {
  const record = request as Record<string, unknown>;
  for (const key of [
    "displayId",
    "display_id",
    "requestDisplayId",
    "request_display_id",
  ]) {
    const value = readDisplayIdField(record[key]);
    if (value) return value;
  }

  const id = normalizeMongoId(request._id);
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

function resolveHistoryRequestLabel(request: BackendRequest): string {
  const displayId = resolveDisplayId(request);
  if (/^REQ-ID\s+/i.test(displayId)) {
    return displayId.replace(/^REQ-ID\s+/i, "REQ-ID ").toUpperCase();
  }
  if (/^(REQ|EV)[-_]/i.test(displayId)) {
    return displayId.toUpperCase().replace("_", "-");
  }
  if (/^\d+$/.test(displayId)) {
    return `REQ-${displayId.padStart(5, "0")}`;
  }
  const digits = displayId.replace(/\D/g, "");
  if (digits) {
    const tail = digits.slice(-5).padStart(5, "0");
    return `REQ-${tail}`;
  }
  return displayId.toUpperCase();
}

function isRequestTimeExtended(request: BackendRequest): boolean {
  const deadlineIso = normalizeIsoDate(request.deadlineAt);
  const windowIso = normalizeIsoDate(request.firstAcceptanceWindowEndsAt);
  if (!deadlineIso || !windowIso) return false;

  const now = Date.now();
  const deadlineMs = new Date(deadlineIso).getTime();
  const windowMs = new Date(windowIso).getTime();

  // Past the first acceptance window, but a later deadline is still active.
  return windowMs < now && deadlineMs > now && deadlineMs > windowMs;
}

function resolveQueueRowVariant(
  request: BackendRequest,
  status: QueueItemStatus,
): QueueRowVariant {
  if (status === "pending_review") return "pending_review";
  if (isDeadlineExceeded(request.deadlineAt)) return "in_progress";
  if (isRequestTimeExtended(request)) return "time_extended";
  return "in_progress";
}

export function mapOfferToQueueItem(offer: BackendOffer): QueueListItem {
  const request = offer.request;
  const deadlineAt = normalizeIsoDate(
    request.deadlineAt ?? offer.expiresAt,
  );
  const status: QueueItemStatus = "pending_review";
  return {
    id: normalizeMongoId(request._id),
    displayId: resolveDisplayId(request),
    offerId: normalizeMongoId(offer._id),
    submittedDisplay: formatSubmitted(request.createdAt),
    status,
    variant: resolveQueueRowVariant(request, status),
    deadlineDays: daysUntil(deadlineAt),
    deadlineAt,
    deadlineExpired: isDeadlineExceeded(deadlineAt),
    coinName: resolveCoinName(request),
    thumbnailUrls: pickQueueThumbnailUrls(request.payload),
  };
}

export function mapAcceptedRequestToQueueItem(
  request: BackendRequest,
): QueueListItem {
  const deadlineAt = normalizeIsoDate(request.deadlineAt);
  const status: QueueItemStatus = "in_progress";
  return {
    id: normalizeMongoId(request._id),
    displayId: resolveDisplayId(request),
    submittedDisplay: formatSubmitted(request.acceptedAt ?? request.createdAt),
    status,
    variant: resolveQueueRowVariant(request, status),
    deadlineDays: daysUntil(deadlineAt),
    deadlineAt,
    deadlineExpired: isDeadlineExceeded(deadlineAt),
    coinName: resolveCoinName(request),
    thumbnailUrls: pickQueueThumbnailUrls(request.payload),
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
    deadlineExpired: isDeadlineExceeded(deadlineAt),
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
  /** Override when accept/create already returned a report id. */
  reportId?: string | null;
}): EvaluationRequestDetail {
  const parsed = parseRequestPayload(opts.request.payload);
  const unavailable = Boolean(opts.unavailable);
  // Show Accept while still offered and we have an offer id (Jul 24 behavior).
  const needsAccept =
    !unavailable &&
    opts.request.status === "offered" &&
    Boolean(opts.offerId);
  const status = opts.request.status;
  const deadlineAt = normalizeIsoDate(opts.request.deadlineAt);
  const deadlineExceededByStatus =
    status === "deadline_missed" || status === "expired";
  const deadlineExceeded =
    deadlineExceededByStatus || isDeadlineExceeded(deadlineAt);
  const canSubmit =
    opts.request.status === "accepted" && !unavailable && !deadlineExceeded;
  const reportId =
    (opts.reportId ? normalizeMongoId(opts.reportId) : null) ||
    extractReportIdFromRequest(opts.request) ||
    undefined;

  return {
    requestId: normalizeMongoId(opts.request._id),
    displayId: resolveDisplayId(opts.request),
    reportId,
    offerId: opts.offerId ? normalizeMongoId(opts.offerId) : undefined,
    needsAccept,
    unavailable,
    canSubmit,
    deadlineExceeded,
    deadlineDays: daysUntil(deadlineAt),
    deadlineAt,
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
