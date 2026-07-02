"use client";

import { buildExpertHistoryHref, type HistoryPeriodFilter } from "@/lib/expert/format";
import { getReport } from "@/lib/expert/reportsService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CertReportModalProps = {
  reportId: string;
  page: number;
  period: HistoryPeriodFilter;
};

export function CertReportModal({
  reportId,
  page,
  period,
}: CertReportModalProps) {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const close = useCallback(() => {
    router.replace(buildExpertHistoryHref({ page, period }));
  }, [router, page, period]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const report = await getReport(reportId);
        if (cancelled) return;
        const text =
          typeof report.content === "string"
            ? report.content
            : JSON.stringify(report.content, null, 2);
        setContent(text);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load report.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/80 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-report-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-[100] cursor-default bg-transparent"
        aria-label="Close report"
        onClick={close}
      />

      <div className="relative z-[101] flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-4 py-3 sm:px-5">
          <h2 id="cert-report-title" className="text-sm font-semibold text-text">
            Evaluation report
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-input-bg"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-text-muted">Loading report…</p>
          ) : error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
