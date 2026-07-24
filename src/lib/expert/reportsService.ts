import { apiClient } from "@/lib/expert/apiClient";
import {
  createInitialEvaluationFormState,
  evaluateFormProgress,
} from "@/lib/expert/evaluationForm";
import { normalizeMongoId } from "@/lib/expert/format";
import type {
  BackendReport,
  BackendRequest,
  EvaluationFormState,
  ExpertReportApiData,
  RequestMediaItem,
} from "@/lib/expert/types";

const REPORT_BY_REQUEST_KEY = "coinzy_report_by_request";

export class ExpertReportsError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ExpertReportsError";
  }
}

/** Attachment shape stored on the report (URL references to request media). */
export type ReportAttachment = {
  url: string;
  kind: "image" | "video";
  group?: string;
  alt?: string;
  poster?: string;
};

export type ReportWritePayload = {
  coinTitle: string;
  content: unknown;
  attachments?: ReportAttachment[];
  isDraft: boolean;
};

type ReportMutationApiData = {
  report: BackendReport;
  request?: BackendRequest;
};

/**
 * Build report attachments from the request's image/video URLs.
 * Backend accepts Mixed[] — we send structured URL objects.
 */
export function mediaToReportAttachments(
  media: RequestMediaItem[],
): ReportAttachment[] {
  const attachments: ReportAttachment[] = [];

  for (const item of media) {
    const url = typeof item.src === "string" ? item.src.trim() : "";
    if (!url) continue;

    if (item.kind === "video") {
      attachments.push({
        url,
        kind: "video",
        ...(item.group ? { group: item.group } : {}),
        ...(item.alt ? { alt: item.alt } : {}),
        ...(item.poster?.trim() ? { poster: item.poster.trim() } : {}),
      });
      continue;
    }

    attachments.push({
      url,
      kind: "image",
      ...(item.group ? { group: item.group } : {}),
      ...(item.alt ? { alt: item.alt } : {}),
    });
  }

  return attachments;
}

export function rememberReportForRequest(
  requestId: string,
  reportId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const normalizedRequestId = normalizeMongoId(requestId);
    const normalizedReportId = normalizeMongoId(reportId);
    if (!normalizedRequestId || !normalizedReportId) return;
    const raw = sessionStorage.getItem(REPORT_BY_REQUEST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[normalizedRequestId] = normalizedReportId;
    sessionStorage.setItem(REPORT_BY_REQUEST_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function getStoredReportIdForRequest(
  requestId: string,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const normalizedRequestId = normalizeMongoId(requestId);
    const raw = sessionStorage.getItem(REPORT_BY_REQUEST_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[normalizedRequestId] ?? null;
  } catch {
    return null;
  }
}

export function clearStoredReportIdForRequest(requestId: string): void {
  if (typeof window === "undefined") return;
  try {
    const normalizedRequestId = normalizeMongoId(requestId);
    if (!normalizedRequestId) return;
    const raw = sessionStorage.getItem(REPORT_BY_REQUEST_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, string>;
    delete map[normalizedRequestId];
    sessionStorage.setItem(REPORT_BY_REQUEST_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Map API report content into the evaluation form shape. */
export function reportContentToFormState(
  content: unknown,
): EvaluationFormState {
  const base = createInitialEvaluationFormState();
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return base;
  }
  const record = content as Record<string, unknown>;
  for (const key of Object.keys(base)) {
    const value = record[key];
    if (typeof value === "string") base[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) {
      base[key] = String(value);
    }
  }
  return base;
}

export function resolveReportCoinTitle(
  form: EvaluationFormState,
  fallbackCoinName?: string,
): string {
  const fromForm =
    typeof form.nameDesignation === "string"
      ? form.nameDesignation.trim()
      : "";
  const fromCoin = fallbackCoinName?.trim() ?? "";
  return fromForm || fromCoin || "Coin Evaluation";
}

export function isDraftReport(report: BackendReport | null | undefined): boolean {
  if (!report) return false;
  if (report.isDraft === true) return true;
  if (report.isDraft === false) return false;
  return report.status === "draft";
}

function rememberFromReport(requestId: string, report: BackendReport) {
  rememberReportForRequest(requestId, normalizeMongoId(report._id));
}

/**
 * Create a report. Defaults to draft unless `isDraft: false`.
 * `POST /experts/reports`
 */
export async function createReport(
  requestId: string,
  options: ReportWritePayload,
) {
  const normalizedRequestId = normalizeMongoId(requestId);
  if (!normalizedRequestId) {
    throw new ExpertReportsError("Invalid request id.", 400);
  }

  const coinTitle = options.coinTitle.trim();
  if (!coinTitle) {
    throw new ExpertReportsError("Coin title is required.", 400);
  }

  const { status, envelope } = await apiClient.post<ReportMutationApiData>(
    "/experts/reports",
    {
      requestId: normalizedRequestId,
      coinTitle,
      content: options.content,
      attachments: options.attachments ?? [],
      isDraft: options.isDraft,
    },
    { skipAuthHandling: true },
  );

  if (envelope.error || !envelope.data?.report) {
    throw new ExpertReportsError(
      envelope.message ||
        (options.isDraft
          ? "Unable to save draft."
          : "Unable to submit report."),
      status,
    );
  }

  rememberFromReport(normalizedRequestId, envelope.data.report);
  return envelope.data;
}

/**
 * Update an expert-owned draft. Set `isDraft: false` to submit.
 * `PUT /experts/reports/:id`
 */
export async function updateReport(
  reportId: string,
  options: Partial<ReportWritePayload> & { requestId?: string },
) {
  const normalizedReportId = normalizeMongoId(reportId);
  if (!normalizedReportId) {
    throw new ExpertReportsError("Invalid report id.", 400);
  }

  const body: Record<string, unknown> = {};
  if (options.coinTitle !== undefined) {
    const coinTitle = options.coinTitle.trim();
    if (!coinTitle) {
      throw new ExpertReportsError("Coin title is required.", 400);
    }
    body.coinTitle = coinTitle;
  }
  if (options.content !== undefined) body.content = options.content;
  if (options.attachments !== undefined) {
    body.attachments = options.attachments;
  }
  if (options.isDraft !== undefined) body.isDraft = options.isDraft;

  const { status, envelope } = await apiClient.put<ReportMutationApiData>(
    `/experts/reports/${encodeURIComponent(normalizedReportId)}`,
    body,
    { skipAuthHandling: true },
  );

  if (envelope.error || !envelope.data?.report) {
    throw new ExpertReportsError(
      envelope.message || "Unable to update report.",
      status,
    );
  }

  if (options.requestId) {
    rememberFromReport(options.requestId, envelope.data.report);
  }

  return envelope.data;
}

/**
 * Save/update a server draft for an accepted request.
 * Creates via POST when no draft id yet; otherwise PUT.
 */
export async function saveDraftReport(opts: {
  requestId: string;
  reportId?: string | null;
  coinTitle: string;
  content: unknown;
  attachments?: ReportAttachment[];
}): Promise<BackendReport> {
  const attachments = opts.attachments ?? [];
  const coinTitle = opts.coinTitle.trim() || "Coin Evaluation";

  if (opts.reportId) {
    const data = await updateReport(opts.reportId, {
      requestId: opts.requestId,
      coinTitle,
      content: opts.content,
      attachments,
      isDraft: true,
    });
    return data.report;
  }

  try {
    const data = await createReport(opts.requestId, {
      coinTitle,
      content: opts.content,
      attachments,
      isDraft: true,
    });
    return data.report;
  } catch (err) {
    // Draft may already exist on the server — resume via lookup + PUT.
    if (err instanceof ExpertReportsError && err.status === 409) {
      const existing = await getReportByRequestId(opts.requestId);
      if (existing && isDraftReport(existing)) {
        const data = await updateReport(existing._id, {
          requestId: opts.requestId,
          coinTitle,
          content: opts.content,
          attachments,
          isDraft: true,
        });
        return data.report;
      }
    }
    throw err;
  }
}

/**
 * Final submit: completes the request. Always sends `isDraft: false`.
 * Uses PUT when a draft id exists, otherwise POST.
 */
export async function submitReport(
  requestId: string,
  options: {
    coinTitle: string;
    content: unknown;
    attachments?: ReportAttachment[];
    reportId?: string | null;
  },
) {
  const attachments = options.attachments ?? [];
  const coinTitle = options.coinTitle.trim();
  if (!coinTitle) {
    throw new ExpertReportsError("Coin title is required.", 400);
  }

  const reportId =
    options.reportId ?? getStoredReportIdForRequest(requestId);

  if (reportId) {
    try {
      return await updateReport(reportId, {
        requestId,
        coinTitle,
        content: options.content,
        attachments,
        isDraft: false,
      });
    } catch (err) {
      // If draft id is stale, fall through to create submit.
      if (!(err instanceof ExpertReportsError && err.status === 404)) {
        throw err;
      }
    }
  }

  return createReport(requestId, {
    coinTitle,
    content: options.content,
    attachments,
    isDraft: false,
  });
}

export async function getReport(reportId: string) {
  const normalizedReportId = normalizeMongoId(reportId);
  if (!normalizedReportId) {
    throw new ExpertReportsError("Invalid report id.", 400);
  }

  const { status, envelope } = await apiClient.get<ExpertReportApiData>(
    `/experts/reports/${encodeURIComponent(normalizedReportId)}`,
    { skipAuthHandling: true },
  );

  if (envelope.error || !envelope.data?.report) {
    throw new ExpertReportsError(
      envelope.message || "Unable to load report.",
      status,
    );
  }

  return envelope.data.report;
}

/**
 * Load the expert's report for a request.
 * Tries `GET /experts/reports/by-request/:requestId`, then session-stored id.
 */
export async function getReportByRequestId(requestId: string) {
  const normalizedRequestId = normalizeMongoId(requestId);
  if (!normalizedRequestId) {
    throw new ExpertReportsError("Invalid request id.", 400);
  }

  const { status, envelope } = await apiClient.get<ExpertReportApiData>(
    `/experts/reports/by-request/${encodeURIComponent(normalizedRequestId)}`,
    { skipAuthHandling: true },
  );

  if (!envelope.error && envelope.data?.report) {
    rememberFromReport(normalizedRequestId, envelope.data.report);
    return envelope.data.report;
  }

  if (status !== 404) {
    const storedReportId = getStoredReportIdForRequest(normalizedRequestId);
    if (storedReportId) {
      return getReport(storedReportId);
    }
    throw new ExpertReportsError(
      envelope.message || "Unable to load report.",
      status,
    );
  }

  const storedReportId = getStoredReportIdForRequest(normalizedRequestId);
  if (storedReportId) {
    try {
      return await getReport(storedReportId);
    } catch {
      clearStoredReportIdForRequest(normalizedRequestId);
    }
  }

  throw new ExpertReportsError("Report not found for this request.", 404);
}

export async function resolveReport(
  reportId?: string | null,
  requestId?: string | null,
) {
  if (reportId) return getReport(reportId);
  if (requestId) return getReportByRequestId(requestId);
  throw new ExpertReportsError("Report reference is missing.", 400);
}

/** Progress % from a server report's content object. */
export function reportProgressPercent(report: BackendReport): number {
  const form = reportContentToFormState(report.content);
  return evaluateFormProgress(form).percent;
}
