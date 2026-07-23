import { apiClient } from "@/lib/expert/apiClient";
import { normalizeMongoId } from "@/lib/expert/format";
import type {
  BackendReport,
  BackendRequest,
  ExpertReportApiData,
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

type SubmitReportApiData = {
  report: BackendReport;
  request: BackendRequest;
};

type SubmitReportOptions = {
  coinTitle: string;
  content: unknown;
  attachments?: unknown[];
};

/**
 * Submit evaluation report via `POST /experts/reports`.
 * `coinTitle` is required by the live API.
 */
export async function submitReport(
  requestId: string,
  options: SubmitReportOptions,
) {
  const normalizedRequestId = normalizeMongoId(requestId);
  if (!normalizedRequestId) {
    throw new ExpertReportsError("Invalid request id.", 400);
  }

  const coinTitle = options.coinTitle.trim();
  if (!coinTitle) {
    throw new ExpertReportsError("Coin title is required.", 400);
  }

  const { status, envelope } = await apiClient.post<SubmitReportApiData>(
    "/experts/reports",
    {
      requestId: normalizedRequestId,
      coinTitle,
      content: options.content,
      attachments: options.attachments ?? [],
    },
    { skipAuthHandling: true },
  );

  if (envelope.error || !envelope.data?.report) {
    throw new ExpertReportsError(
      envelope.message || "Unable to submit report.",
      status,
    );
  }

  rememberReportForRequest(
    normalizedRequestId,
    normalizeMongoId(envelope.data.report._id),
  );
  return envelope.data;
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

export async function getReportByRequestId(requestId: string) {
  const normalizedRequestId = normalizeMongoId(requestId);
  if (!normalizedRequestId) {
    throw new ExpertReportsError("Invalid request id.", 400);
  }

  const storedReportId = getStoredReportIdForRequest(normalizedRequestId);
  if (storedReportId) {
    return getReport(storedReportId);
  }

  throw new ExpertReportsError(
    "Report not found for this request. Open it from History after submit.",
    404,
  );
}

export async function resolveReport(
  reportId?: string | null,
  requestId?: string | null,
) {
  if (reportId) return getReport(reportId);
  if (requestId) return getReportByRequestId(requestId);
  throw new ExpertReportsError("Report reference is missing.", 400);
}
