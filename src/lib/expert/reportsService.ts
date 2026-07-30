import { apiClient } from "@/lib/expert/apiClient";
import {
  evaluateFormProgress,
  normalizeEvaluationFormState,
  createInitialEvaluationFormState,
} from "@/lib/expert/evaluationForm";
import { normalizeMongoId } from "@/lib/expert/format";
import {
  contentFieldsToFormState,
  formToContentFields,
} from "@/lib/expert/reportContentFields";
import type {
  BackendReport,
  BackendRequest,
  EvaluationFormState,
  ExpertReportApiData,
  ExpertReportsListApiData,
  ReportContentFields,
  RequestMediaItem,
} from "@/lib/expert/types";

const REPORT_BY_REQUEST_KEY = "coinzy_report_by_request";

function draftCoinName(
  form: EvaluationFormState | undefined,
  fallback?: string,
): string {
  const fromForm = form?.coinName?.trim() ?? "";
  const fromFallback = fallback?.trim() ?? "";
  return fromForm || fromFallback || "Untitled draft";
}

function minimalDraftContentFields(
  coinName: string,
): Partial<ReportContentFields> {
  return {
    generalInfo: {
      coinName,
      currencyAndDenomination: "",
      issuer: "",
      period: "",
      rulerOrGovt: "",
      yearOfMinting: "",
      mintLocation: "",
    },
  };
}

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
  contentFields: Partial<ReportContentFields>;
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
    const raw = localStorage.getItem(REPORT_BY_REQUEST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[normalizedRequestId] = normalizedReportId;
    localStorage.setItem(REPORT_BY_REQUEST_KEY, JSON.stringify(map));
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
    const raw = localStorage.getItem(REPORT_BY_REQUEST_KEY);
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
    const raw = localStorage.getItem(REPORT_BY_REQUEST_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, string>;
    delete map[normalizedRequestId];
    localStorage.setItem(REPORT_BY_REQUEST_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Map API report into the evaluation form shape (prefers `contentFields`). */
export function reportToFormState(report: BackendReport): EvaluationFormState {
  return normalizeEvaluationFormState(
    contentFieldsToFormState(report.contentFields, report.content),
  );
}

/** @deprecated Use `reportToFormState` — kept for callers passing raw content only. */
export function reportContentToFormState(
  content: unknown,
  contentFields?: ReportContentFields | null,
): EvaluationFormState {
  return normalizeEvaluationFormState(
    contentFieldsToFormState(contentFields, content),
  );
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

  const { status, envelope } = await apiClient.post<ReportMutationApiData>(
    "/experts/reports",
    {
      requestId: normalizedRequestId,
      contentFields: options.contentFields,
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
  if (options.contentFields !== undefined) {
    body.contentFields = options.contentFields;
  }
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
  form: EvaluationFormState;
  coinName?: string;
  attachments?: ReportAttachment[];
}): Promise<BackendReport> {
  const attachments = opts.attachments ?? [];
  const hasFormContent = evaluateFormProgress(opts.form).filled > 0;
  const contentFields = hasFormContent
    ? formToContentFields(opts.form)
    : minimalDraftContentFields(
        draftCoinName(opts.form, opts.coinName),
      );

  if (opts.reportId) {
    const data = await updateReport(opts.reportId, {
      requestId: opts.requestId,
      contentFields,
      attachments,
      isDraft: true,
    });
    return data.report;
  }

  try {
    const data = await createReport(opts.requestId, {
      contentFields,
      attachments,
      isDraft: true,
    });
    return data.report;
  } catch (err) {
    if (err instanceof ExpertReportsError && err.status === 409) {
      const storedReportId = getStoredReportIdForRequest(opts.requestId);
      if (storedReportId) {
        const data = await updateReport(storedReportId, {
          requestId: opts.requestId,
          contentFields,
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
 * Ensure a server draft exists for an accepted request.
 * Creates via POST when no report id is stored; otherwise GET/PUT.
 */
export async function ensureDraftReport(opts: {
  requestId: string;
  reportId?: string | null;
  form?: EvaluationFormState;
  coinName?: string;
  attachments?: ReportAttachment[];
}): Promise<BackendReport> {
  const storedReportId =
    opts.reportId ?? getStoredReportIdForRequest(opts.requestId);

  if (storedReportId) {
    try {
      const existing = await getReport(storedReportId);
      rememberFromReport(opts.requestId, existing);
      if (!isDraftReport(existing)) return existing;

      const form = opts.form ?? reportToFormState(existing);
      if (opts.form && evaluateFormProgress(opts.form).filled > 0) {
        return saveDraftReport({
          requestId: opts.requestId,
          reportId: storedReportId,
          form: opts.form,
          coinName: opts.coinName,
          attachments: opts.attachments,
        });
      }
      return existing;
    } catch (err) {
      if (err instanceof ExpertReportsError && err.status === 404) {
        clearStoredReportIdForRequest(opts.requestId);
      } else {
        throw err;
      }
    }
  }

  const form = opts.form ?? createInitialEvaluationFormState();
  return saveDraftReport({
    requestId: opts.requestId,
    form,
    coinName: opts.coinName,
    attachments: opts.attachments,
  });
}

/**
 * Final submit: completes the request. Always sends `isDraft: false`.
 * Uses PUT when a draft id exists, otherwise POST.
 */
export async function submitReport(
  requestId: string,
  options: {
    form: EvaluationFormState;
    attachments?: ReportAttachment[];
    reportId?: string | null;
  },
) {
  const attachments = options.attachments ?? [];
  const contentFields = formToContentFields(options.form);

  const reportId =
    options.reportId ?? getStoredReportIdForRequest(requestId);

  if (reportId) {
    try {
      return await updateReport(reportId, {
        requestId,
        contentFields,
        attachments,
        isDraft: false,
      });
    } catch (err) {
      if (!(err instanceof ExpertReportsError && err.status === 404)) {
        throw err;
      }
    }
  }

  return createReport(requestId, {
    contentFields,
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

/** Read a report id from request payloads when the API embeds one. */
export function extractReportIdFromRequest(
  request: Pick<BackendRequest, "reportId" | "report">,
): string | null {
  const direct = normalizeMongoId(request.reportId);
  if (direct) return direct;

  const embedded = request.report;
  if (typeof embedded === "string") {
    return normalizeMongoId(embedded) || null;
  }
  if (embedded && typeof embedded === "object") {
    return normalizeMongoId(embedded._id) || null;
  }

  return null;
}

async function fetchReportByRequestIdFromApi(
  requestId: string,
): Promise<BackendReport | null> {
  const byRequestPaths = [
    `/experts/reports/by-request/${encodeURIComponent(requestId)}`,
    `/experts/me/reports/by-request/${encodeURIComponent(requestId)}`,
  ];

  for (const path of byRequestPaths) {
    const { status, envelope } = await apiClient.get<ExpertReportApiData>(
      path,
      { skipAuthHandling: true },
    );
    if (status === 404) continue;
    if (!envelope.error && envelope.data?.report) {
      return envelope.data.report;
    }
  }

  const listPaths = [
    `/experts/me/reports?requestId=${encodeURIComponent(requestId)}`,
    "/experts/me/reports",
  ];

  for (const path of listPaths) {
    const { status, envelope } = await apiClient.get<ExpertReportsListApiData>(
      path,
      { skipAuthHandling: true },
    );
    if (status === 404) continue;

    const reports = envelope.data?.reports;
    if (!reports?.length) continue;

    const match = reports.find(
      (report) => normalizeMongoId(report.requestId) === requestId,
    );
    if (match) return match;
  }

  return null;
}

/**
 * Load a report for an accepted/completed request.
 * Uses local storage, embedded request fields, then API fallbacks.
 */
export async function getReportForRequest(
  requestId: string,
  requestHint?: Pick<BackendRequest, "reportId" | "report">,
): Promise<BackendReport | null> {
  const normalizedRequestId = normalizeMongoId(requestId);
  if (!normalizedRequestId) return null;

  const candidateIds = [
    getStoredReportIdForRequest(normalizedRequestId),
    requestHint ? extractReportIdFromRequest(requestHint) : null,
  ].filter((id): id is string => Boolean(id));

  for (const reportId of candidateIds) {
    try {
      const report = await getReport(reportId);
      rememberFromReport(normalizedRequestId, report);
      return report;
    } catch (err) {
      if (err instanceof ExpertReportsError && err.status === 404) {
        clearStoredReportIdForRequest(normalizedRequestId);
        continue;
      }
      throw err;
    }
  }

  const fromApi = await fetchReportByRequestIdFromApi(normalizedRequestId);
  if (fromApi) {
    rememberFromReport(normalizedRequestId, fromApi);
    return fromApi;
  }

  return null;
}

export async function resolveReport(
  reportId?: string | null,
  requestId?: string | null,
  requestHint?: Pick<BackendRequest, "reportId" | "report">,
) {
  const normalizedReportId = reportId ? normalizeMongoId(reportId) : "";
  const normalizedRequestId = requestId ? normalizeMongoId(requestId) : "";

  if (normalizedReportId) {
    try {
      return await getReport(normalizedReportId);
    } catch (err) {
      if (
        !(err instanceof ExpertReportsError && err.status === 404) ||
        !normalizedRequestId
      ) {
        throw err;
      }
    }
  }

  if (normalizedRequestId) {
    const report = await getReportForRequest(normalizedRequestId, requestHint);
    if (report) return report;
  }

  throw new ExpertReportsError(
    normalizedReportId || normalizedRequestId
      ? "Unable to load report for this evaluation."
      : "Report reference is missing.",
    400,
  );
}

/** Progress % from a server report. */
export function reportProgressPercent(report: BackendReport): number {
  const form = reportToFormState(report);
  return evaluateFormProgress(form).percent;
}

export { formToContentFields } from "@/lib/expert/reportContentFields";
