import {
  ExpertHistoryTableSkeleton,
  ExpertStatCardsSkeleton,
} from "@/components/expert/ExpertSkeleton";
import { ExpertEmptyState } from "@/components/expert/ExpertEmptyState";
import { HISTORY_PAGE_SIZE } from "@/lib/expert/constants";
import {
  buildExpertHistoryHref,
  formatInr,
  type HistoryPeriodFilter,
} from "@/lib/expert/format";
import type { HistoryRow, HistorySummaryStats } from "@/lib/expert/types";
import Link from "next/link";
import { CertReportModal } from "@/components/expert/CertReportModal";

type ExpertHistoryPageBodyProps = {
  summary: HistorySummaryStats;
  items: HistoryRow[];
  page: number;
  totalItems: number;
  allTimeCount: number;
  period: HistoryPeriodFilter;
  activeReportId: string | null;
  activeReportRequestId: string | null;
  isLoading?: boolean;
};

const PERIOD_TABS = [
  { id: "all" as const, label: "All time" },
  { id: "month" as const, label: "This month" },
  { id: "quarter" as const, label: "Last 3 months" },
] as const;

/** Outline actions (Resume / View report) — maroon border + text */
const outlineActionClass =
  "inline-flex h-8 items-center justify-center rounded-lg border border-primary bg-surface px-3.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.04]";

/** Primary action (Evaluate) */
const solidActionClass =
  "inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover";

function HistoryScrollIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static empty-state asset from /public
    <img
      src="/expert-drafts-scroll.png"
      alt=""
      width={60}
      height={60}
      className="h-12 w-12 object-contain"
    />
  );
}

function formatHistoryValue(valueInr: number | null): string {
  if (valueInr == null) return "—";
  return formatInr(valueInr).replace(/\u00a0/g, " ");
}

export function ExpertHistoryPageBody({
  summary,
  items,
  page,
  totalItems,
  allTimeCount,
  period,
  activeReportId,
  activeReportRequestId,
  isLoading = false,
}: ExpertHistoryPageBodyProps) {
  const showFullEmpty = !isLoading && allTimeCount === 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / HISTORY_PAGE_SIZE));
  const pageSize = HISTORY_PAGE_SIZE;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[30px] font-semibold leading-9 tracking-tight text-text">
            Evaluation history
          </h1>
          <p className="text-sm leading-5 text-text-muted">
            Complete record of all your evaluation activity
          </p>
        </div>

        {isLoading ? (
          <ExpertStatCardsSkeleton count={3} columns={3} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total completed"
              value={String(summary.totalCompleted)}
              hint="Since Jan 2026"
            />
            <SummaryCard
              label="Avg turnaround"
              value={summary.avgTurnaround}
              hint="Last 30 days"
            />
            <SummaryCard
              label="Total earned"
              value={
                summary.totalEarnedInr == null
                  ? "—"
                  : formatHistoryValue(summary.totalEarnedInr)
              }
              hint={
                summary.earnedThisMonthInr == null
                  ? "This month: —"
                  : `This month: ${formatHistoryValue(summary.earnedThisMonthInr)}`
              }
            />
          </div>
        )}
      </header>

      {isLoading ? (
        <ExpertHistoryTableSkeleton />
      ) : showFullEmpty ? (
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <ExpertEmptyState
            icon={<HistoryScrollIcon />}
            title="Evaluation history"
            description="This page will show evaluations history"
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              {totalItems} total evaluation{totalItems === 1 ? "" : "s"}
            </p>
            <nav
              className="flex flex-wrap items-center gap-6"
              aria-label="Date range"
            >
              {PERIOD_TABS.map((tab) => {
                const active = period === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={buildExpertHistoryHref({ page: 1, period: tab.id })}
                    className={`text-sm transition-colors ${
                      active
                        ? "font-semibold text-text"
                        : "font-normal text-text-muted hover:text-text"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile list */}
          <div className="flex flex-col gap-3 p-4 md:hidden">
            {items.length === 0 ? (
              <p className="py-12 text-center text-sm text-text-muted">
                No evaluations in this period.
              </p>
            ) : (
              items.map((row) => (
                <article
                  key={`m-${row.requestId}-${row.status}-${row.dateDisplay}`}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text">
                        {row.requestLabel}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-text">
                        {row.coinName}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {row.type} · {row.dateDisplay}
                      </p>
                    </div>
                    <StatusPill status={row.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <p className="text-sm font-medium tabular-nums text-text">
                      {formatHistoryValue(row.valueInr)}
                    </p>
                    <ActionButton
                      action={row.action}
                      requestId={row.requestId}
                      reportId={row.reportId}
                      offerId={row.offerId}
                      page={page}
                      period={period}
                    />
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[26%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Request ID
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Coin
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Value given
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-text-muted"
                    >
                      No evaluations in this period.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr
                      key={`${row.requestId}-${row.status}-${row.dateDisplay}`}
                      className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-[#fafafa]"
                    >
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-text-muted">
                        {row.requestLabel}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="block truncate text-sm font-semibold text-text"
                          title={row.coinName}
                        >
                          {row.coinName}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-text-muted">
                        {row.type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-text-muted">
                        {row.dateDisplay}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm tabular-nums text-text">
                        {formatHistoryValue(row.valueInr)}
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ActionButton
                          action={row.action}
                          requestId={row.requestId}
                          reportId={row.reportId}
                          offerId={row.offerId}
                          page={page}
                          period={period}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Showing {from} to {to} of {totalItems} results
            </p>
            <HistoryPagination
              page={page}
              totalPages={totalPages}
              period={period}
            />
          </footer>
        </section>
      )}

      {activeReportId || activeReportRequestId ? (
        <CertReportModal
          reportId={activeReportId}
          reportRequestId={activeReportRequestId}
          page={page}
          period={period}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-[30px] font-semibold leading-9 tracking-tight text-text">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}

function StatusPill({ status }: { status: HistoryRow["status"] }) {
  if (status === "missed") {
    return (
      <span className="inline-flex rounded-full bg-expert-error-soft px-3 py-1 text-xs font-medium text-expert-error">
        Missed
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex rounded-full bg-expert-status-draft-bg px-3 py-1 text-xs font-medium text-expert-status-draft-text">
        Draft
      </span>
    );
  }
  if (status === "new") {
    return (
      <span className="inline-flex rounded-full bg-expert-status-new-bg px-3 py-1 text-xs font-medium text-expert-status-new-text">
        New
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-expert-status-done-bg px-3 py-1 text-xs font-medium text-expert-status-done-text">
      Completed
    </span>
  );
}

function ActionButton({
  action,
  requestId,
  reportId,
  offerId,
  page,
  period,
}: {
  action: HistoryRow["action"];
  requestId: string;
  reportId?: string;
  offerId?: string;
  page: number;
  period: HistoryPeriodFilter;
}) {
  if (action === "resume") {
    return (
      <Link href={`/expert/queue/${requestId}`} className={outlineActionClass}>
        Resume
      </Link>
    );
  }
  if (action === "evaluate") {
    const href = offerId
      ? `/expert/queue/${requestId}?offerId=${encodeURIComponent(offerId)}`
      : `/expert/queue/${requestId}`;
    return (
      <Link href={href} className={solidActionClass}>
        Evaluate
      </Link>
    );
  }
  if (action === "view_report") {
    return (
      <Link
        href={buildExpertHistoryHref({
          page,
          period,
          report: reportId ?? null,
          reportRequest: reportId ? null : requestId,
        })}
        scroll={false}
        className={outlineActionClass}
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
  const navBtnClass =
    "inline-flex h-8 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-input-bg";
  const navBtnDisabledClass =
    "inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium text-text-muted/50";

  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label="History pagination"
    >
      {page <= 1 ? (
        <span className={navBtnDisabledClass}>&lt; Previous</span>
      ) : (
        <Link
          href={buildExpertHistoryHref({ page: page - 1, period })}
          className={navBtnClass}
        >
          &lt; Previous
        </Link>
      )}

      {pages.map((p) =>
        p === page ? (
          <span
            key={p}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2 text-sm font-semibold text-white"
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildExpertHistoryHref({ page: p, period })}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium text-text-muted transition-colors hover:bg-input-bg hover:text-text"
          >
            {p}
          </Link>
        ),
      )}

      {page >= totalPages ? (
        <span className={navBtnDisabledClass}>Next &gt;</span>
      ) : (
        <Link
          href={buildExpertHistoryHref({ page: page + 1, period })}
          className={navBtnClass}
        >
          Next &gt;
        </Link>
      )}
    </nav>
  );
}
