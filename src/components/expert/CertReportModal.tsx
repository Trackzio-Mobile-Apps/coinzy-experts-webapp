"use client";

import {
  buildCertReportDownloadHtml,
  certReportDownloadFilename,
  getCertReportForRequest,
} from "@/data/cert-report.mock";
import {
  buildExpertHistoryHref,
  type HistoryPeriodFilter,
} from "@/data/expert-panel.mock";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

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
  const report = getCertReportForRequest(reportId);

  const close = useCallback(() => {
    router.replace(buildExpertHistoryHref({ page, period }));
  }, [router, page, period]);

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

  function downloadHtmlReport() {
    const html = buildCertReportDownloadHtml(report);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = certReportDownloadFilename(report);
    a.rel = "noopener";
    a.click();
    URL.revokeObjectURL(url);
  }

  const certTitle = `CERT VERIFICATION #${report.certificationNo}`;

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
        className="relative z-[101] flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10"
      >
        <div className="flex shrink-0 items-center justify-end gap-2 border-b border-border/80 bg-surface px-3 py-2.5 sm:px-4">
          <div className="mr-auto hidden items-center gap-2 text-xs text-text-muted sm:flex">
            <span className="rounded border border-border px-2 py-1 font-mono">
              −
            </span>
            <span>100%</span>
            <span className="rounded border border-border px-2 py-1 font-mono">
              +
            </span>
            <span className="rounded border border-border px-2 py-1">⤢</span>
          </div>
          <button
            type="button"
            onClick={downloadHtmlReport}
            className="rounded-lg border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover sm:px-4 sm:text-sm"
          >
            Download report
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

        <div className="overflow-y-auto px-5 pb-8 pt-6 sm:px-8">
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
                {(
                  [
                    ["PCGS #", report.pcgsNo],
                    ["Date, Mintmark", report.dateMintmark],
                    ["Denomination", report.denomination],
                    ["Region", report.region],
                    ["Grade", report.grade],
                    ["Pedigree", report.pedigree],
                    ["Mintage", report.mintage],
                    ["Holder Type", report.holderType],
                    ["Population", report.population],
                    ["Pop Higher", report.popHigher],
                    ["PCGS Price Guide™ Value", report.priceGuideValue],
                  ] as const
                ).map(([label, value], i) => (
                  <tr
                    key={label}
                    className={i % 2 === 0 ? "bg-zinc-50/90" : "bg-white"}
                  >
                    <th
                      scope="row"
                      className="w-[40%] border-b border-border/70 px-4 py-2.5 font-semibold text-text sm:px-5"
                    >
                      {label}
                    </th>
                    <td className="border-b border-border/70 px-4 py-2.5 text-text sm:px-5">
                      {["Grade", "Population", "Pop Higher"].includes(label) ||
                      label.startsWith("PCGS Price Guide") ? (
                        <button
                          type="button"
                          className="text-left text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:text-blue-800"
                        >
                          {value}
                        </button>
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            Request {report.requestId} · Demo view only. Not affiliated with
            PCGS.
          </p>
          <p className="mt-1 text-center text-[11px] text-text-muted">
            Download opens an HTML file you can print to PDF from your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
