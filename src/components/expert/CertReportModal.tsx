"use client";

import {
  downloadCertReportHtml,
  mapReportToCertView,
  printCertReportPdf,
  type CertReport,
} from "@/lib/expert/certReport";
import { ExpertReportModalSkeleton } from "@/components/expert/ExpertSkeleton";
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

const CERT_TABLE_ROWS = [
  ["PCGS #", "pcgsNo"],
  ["Date, Mintmark", "dateMintmark"],
  ["Denomination", "denomination"],
  ["Region", "region"],
  ["Grade", "grade"],
  ["Pedigree", "pedigree"],
  ["Mintage", "mintage"],
  ["Holder Type", "holderType"],
  ["Population", "population"],
  ["Pop Higher", "popHigher"],
  ["PCGS Price Guide™ Value", "priceGuideValue"],
] as const;

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;

export function CertReportModal({
  reportId,
  reportRequestId = null,
  page,
  period,
}: CertReportModalProps) {
  const router = useRouter();
  const [report, setReport] = useState<CertReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        setReport(mapReportToCertView(backendReport));
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

  function handleDownload() {
    if (!report) return;
    downloadCertReportHtml(report);
  }

  function handlePrintPdf() {
    if (!report) return;
    printCertReportPdf(report);
  }

  function zoomOut() {
    setZoom((current) => Math.max(ZOOM_MIN, current - ZOOM_STEP));
  }

  function zoomIn() {
    setZoom((current) => Math.min(ZOOM_MAX, current + ZOOM_STEP));
  }

  function toggleFullscreen() {
    setIsFullscreen((current) => !current);
  }

  const certTitle = report
    ? `CERT VERIFICATION #${report.certificationNo}`
    : "CERT VERIFICATION";

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

      <div
        className={`relative z-[101] flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/10 ${
          isFullscreen
            ? "fixed inset-0 z-[102] h-screen max-h-screen w-screen max-w-none rounded-none"
            : "max-h-[min(92vh,880px)] w-full max-w-2xl rounded-xl"
        }`}
      >
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/80 bg-surface px-3 py-2.5 sm:px-4">
          <div
            className="mr-auto flex items-center gap-1.5 text-xs text-text-muted"
            role="toolbar"
            aria-label="Report zoom"
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN || loading}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-border bg-surface px-2 font-mono text-sm transition-colors hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[3.25rem] text-center font-medium tabular-nums text-text">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX || loading}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-border bg-surface px-2 font-mono text-sm transition-colors hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-border bg-surface px-2 transition-colors hover:bg-input-bg"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              ⤢
            </button>
          </div>
          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={!report || loading}
            className="rounded-lg border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            Save as PDF
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!report || loading}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition-colors hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            Download HTML
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

        <div className="min-h-0 flex-1 overflow-auto px-5 pb-8 pt-6 sm:px-8">
          {loading ? (
            <ExpertReportModalSkeleton />
          ) : error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : report ? (
            <div
              className="mx-auto origin-top transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom / 100})`,
                width: `${(100 / zoom) * 100}%`,
              }}
            >
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <div
                  className="h-28 w-28 shrink-0 rounded-full border-4 border-white bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-md ring-1 ring-black/10"
                  aria-hidden
                />
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs font-bold tracking-wide text-blue-900">
                    PCGS
                  </p>
                  <p className="mt-1 font-mono text-sm text-text-muted">
                    Certificate No. {report.certificationNo}
                  </p>
                </div>
                <div
                  className="h-28 w-28 shrink-0 rounded-full border-4 border-white bg-gradient-to-br from-amber-100 via-amber-400 to-amber-800 shadow-md ring-1 ring-black/10"
                  aria-hidden
                />
              </div>

              <p className="mt-4 text-center text-xs text-blue-600">
                (Click image to enlarge)
              </p>

              <h2
                id="cert-report-title"
                className="mt-6 text-center text-lg font-bold uppercase tracking-[0.12em] text-text sm:text-xl"
              >
                {certTitle}
              </h2>

              <p className="mt-3 text-center text-sm font-semibold text-text">
                PCGS Coin Information
              </p>
              <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-text-muted">
                According to the PCGS Certification Database, the requested
                certification number is defined as the following:
              </p>

              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {CERT_TABLE_ROWS.map(([label, key], index) => {
                      const value = report[key];
                      return (
                        <tr
                          key={label}
                          className={index % 2 === 0 ? "bg-zinc-50/90" : "bg-white"}
                        >
                          <th
                            scope="row"
                            className="w-[40%] border-b border-border/70 px-4 py-2.5 font-semibold text-text sm:px-5"
                          >
                            {label}
                          </th>
                          <td className="border-b border-border/70 px-4 py-2.5 text-text sm:px-5">
                            {["Grade", "Population", "Pop Higher"].includes(
                              label,
                            ) || label.startsWith("PCGS Price Guide") ? (
                              <span className="text-blue-600 underline decoration-blue-600/40 underline-offset-2">
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-center text-xs text-text-muted">
                Request {report.requestId}
              </p>
              <p className="mt-1 text-center text-[11px] text-text-muted">
                Use Save as PDF to open the print dialog, or Download HTML for an
                offline file you can open later.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
