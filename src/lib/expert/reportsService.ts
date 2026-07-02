import { apiClient } from "@/lib/expert/apiClient";
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
    const raw = sessionStorage.getItem(REPORT_BY_REQUEST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[requestId] = reportId;
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
    const raw = sessionStorage.getItem(REPORT_BY_REQUEST_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[requestId] ?? null;
  } catch {
    return null;
  }
}

type SubmitReportApiData = {
  report: BackendReport;
  request: BackendRequest;
};

export async function submitReport(requestId: string, content: unknown) {
  const { status, envelope } = await apiClient.post<SubmitReportApiData>(
    "/reports",
    { requestId, content, attachments: [] },
    { skipAuthHandling: true },
  );

  if (envelope.error || !envelope.data?.report) {
    throw new ExpertReportsError(
      envelope.message || "Unable to submit report.",
      status,
    );
  }

  rememberReportForRequest(requestId, envelope.data.report._id);
  return envelope.data;
}

export async function getReport(reportId: string) {
  const { status, envelope } = await apiClient.get<ExpertReportApiData>(
    `/reports/${reportId}`,
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
