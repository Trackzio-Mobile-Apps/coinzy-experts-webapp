import { CertReportModal } from "@/components/expert/CertReportModal";
import { HISTORY_PAGE_SIZE } from "@/lib/expert/constants";
import {
  buildExpertHistoryHref,
  formatInr,
  type HistoryPeriodFilter,
} from "@/lib/expert/format";
import type { HistoryRow, HistorySummaryStats } from "@/lib/expert/types";
import Link from "next/link";

type ExpertHistoryPageBodyProps = {
  summary: HistorySummaryStats;
  items: HistoryRow[];
  page: number;
  totalItems: number;
  period: HistoryPeriodFilter;
  activeReportId: string | null;
  isLoading?: boolean;
};

export function ExpertHistoryPageBody({
  summary,
  items,
  page,
  totalItems,
  period,
  activeReportId,
  isLoading = false,
}: ExpertHistoryPageBodyProps) {
  const showEmpty = !isLoading && totalItems === 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / HISTORY_PAGE_SIZE));
  const pageSize = HISTORY_PAGE_SIZE;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div>
      <header className="border-b border-border/60 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Evaluation history
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Complete record of all your evaluation activity
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-surface px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Total completed
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-text">
              {summary.totalCompleted}
            </p>
            <p className="mt-1 text-sm text-text-muted">Since Jan 2023</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Avg turnaround
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-text">
              {summary.avgTurnaround}
            </p>
            <p className="mt-1 text-sm text-text-muted">Last 30 days</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Total earned
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-text">
              {summary.totalEarnedInr == null
                ? "—"
                : formatInr(summary.totalEarnedInr)}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              This month:{" "}
              {summary.earnedThisMonthInr == null
                ? "—"
                : formatInr(summary.earnedThisMonthInr)}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading history…</p>
        ) : showEmpty ? (
          <div className="flex justify-center px-2">
            <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-surface px-8 py-16 text-center shadow-sm sm:px-12 sm:py-20">
              <p className="text-lg font-semibold text-text">Evaluation history</p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                This page will show completed evaluations.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-surface shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <h2 className="text-sm font-semibold text-text">
                Total evaluations
              </h2>
              <nav
                className="flex flex-wrap items-center gap-2"
                aria-label="Date range"
              >
                {(
                  [
                    { id: "all" as const, label: "All time" },
                    { id: "month" as const, label: "This month" },
                    { id: "quarter" as const, label: "Last 3 months" },
                  ] as const
                ).map((tab) => {
                  const active = period === tab.id;
                  return (
                    <Link
                      key={tab.id}
                      href={buildExpertHistoryHref({ page: 1, period: tab.id })}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-white shadow-sm"
                          : "text-text-muted hover:bg-input-bg hover:text-text"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-input-bg/40 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-3 sm:px-6">Request ID</th>
                    <th className="px-4 py-3 sm:px-6">Coin</th>
                    <th className="px-4 py-3 sm:px-6">Type</th>
                    <th className="px-4 py-3 sm:px-6">Date</th>
                    <th className="px-4 py-3 sm:px-6">Value (INR)</th>
                    <th className="px-4 py-3 sm:px-6">Status</th>
                    <th className="px-4 py-3 text-right sm:px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr
                      key={row.requestId}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-text sm:px-6">
                        {row.requestId.slice(-8).toUpperCase()}
                      </td>
                      <td className="max-w-[10rem] px-4 py-3 text-text sm:max-w-[11rem] sm:px-6">
                        <span className="block truncate" title={row.coinName}>
                          {row.coinName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted sm:px-6">
                        {row.type}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-muted sm:px-6">
                        {row.dateDisplay}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-text sm:px-6">
                        {row.valueInr == null ? "—" : formatInr(row.valueInr)}
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right sm:px-6">
                        <ActionButton
                          action={row.action}
                          requestId={row.requestId}
                          reportId={row.reportId}
                          page={page}
                          period={period}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-text-muted">
                Showing {from} to {to} of {totalItems} results
              </p>
              <HistoryPagination
                page={page}
                totalPages={totalPages}
                period={period}
              />
            </footer>
          </div>
        )}
      </div>

      {activeReportId ? (
        <CertReportModal
          reportId={activeReportId}
          page={page}
          period={period}
        />
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: HistoryRow["status"] }) {
  if (status === "missed") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-red-600/20">
        Missed
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-300/80">
        Draft
      </span>
    );
  }
  if (status === "new") {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-400/50">
        New
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/25">
      Completed
    </span>
  );
}

function ActionButton({
  action,
  requestId,
  reportId,
  page,
  period,
}: {
  action: HistoryRow["action"];
  requestId: string;
  reportId?: string;
  page: number;
  period: HistoryPeriodFilter;
}) {
  if (action === "resume") {
    return (
      <Link
        href={`/expert/queue/${requestId}`}
        className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Resume
      </Link>
    );
  }
  if (action === "evaluate") {
    return (
      <Link
        href={`/expert/queue/${requestId}`}
        className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Evaluate
      </Link>
    );
  }
  if (action === "view_report" && reportId) {
    return (
      <Link
        href={buildExpertHistoryHref({ page, period, report: reportId })}
        scroll={false}
        className="inline-flex rounded-lg border border-primary bg-transparent px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.06]"
      >
        View report
      </Link>
    );
  }
  return <span className="text-xs text-text-muted">—</span>;
}

function HistoryPagination({
  page,
  totalPages,
  period,
}: {
  page: number;
  totalPages: number;
  period: HistoryPeriodFilter;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label="History pagination"
    >
      {page <= 1 ? (
        <span className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted/50">
          Previous
        </span>
      ) : (
        <Link
          href={buildExpertHistoryHref({ page: page - 1, period })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-input-bg"
        >
          Previous
        </Link>
      )}

      {pages.map((p) =>
        p === page ? (
          <span
            key={p}
            className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-2 text-sm font-semibold text-white"
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildExpertHistoryHref({ page: p, period })}
            className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-2 text-sm font-medium text-text transition-colors hover:bg-input-bg"
          >
            {p}
          </Link>
        ),
      )}

      {page >= totalPages ? (
        <span className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted/50">
          Next
        </span>
      ) : (
        <Link
          href={buildExpertHistoryHref({ page: page + 1, period })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-input-bg"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
