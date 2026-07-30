"use client";

import { ExpertEvaluationReportContent } from "@/components/expert/ExpertEvaluationReportContent";
import { ExpertReportModalSkeleton } from "@/components/expert/ExpertSkeleton";
import {
  buildEvaluationReportDisplay,
  type EvaluationReportDisplay,
} from "@/lib/expert/evaluationReportView";
import { downloadEvaluationReportPdf } from "@/lib/expert/evaluationReportExport";
import { buildExpertHistoryHref, type HistoryPeriodFilter } from "@/lib/expert/format";
import { resolveReport } from "@/lib/expert/reportsService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CertReportModalProps = {
  reportId: string | null;
  reportRequestId?: string | null;
  page: number;
  period: HistoryPeriodFilter;
};

export function CertReportModal({
  reportId,
  reportRequestId = null,
  page,
  period,
}: CertReportModalProps) {
  const router = useRouter();
  const [report, setReport] = useState<EvaluationReportDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const close = useCallback(() => {
    router.replace(buildExpertHistoryHref({ page, period }));
  }, [router, page, period]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const backendReport = await resolveReport(reportId, reportRequestId);
        if (cancelled) return;
        setReport(buildEvaluationReportDisplay(backendReport));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load report. Open this evaluation from the device where you submitted it, or contact support.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId, reportRequestId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  async function handleDownloadPdf() {
    if (!report || downloadingPdf) return;

    setDownloadingPdf(true);
    try {
      await downloadEvaluationReportPdf(report);
    } catch {
      window.alert("Unable to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/80 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-report-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-[100] cursor-default bg-transparent"
        aria-label="Close report"
        onClick={close}
      />

      <div className="relative z-[101] flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-surface shadow-2xl ring-1 ring-black/10">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/80 bg-surface px-4 py-3">
          <h2
            id="evaluation-report-title"
            className="mr-auto text-sm font-semibold text-text"
          >
            Evaluation report
          </h2>
          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={!report || loading || downloadingPdf}
            className="rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingPdf ? "Generating PDF…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-input-bg hover:text-text"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 sm:py-8">
          {loading ? (
            <ExpertReportModalSkeleton />
          ) : error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : report ? (
            <ExpertEvaluationReportContent report={report} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
