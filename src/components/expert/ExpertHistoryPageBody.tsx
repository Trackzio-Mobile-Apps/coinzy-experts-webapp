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

/** Outline actions — Figma: hug width, 28px tall, 8px radius, 28px x-pad */
const outlineActionClass =
  "inline-flex h-7 w-fit items-center justify-center whitespace-nowrap rounded-lg border border-primary bg-white px-7 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.04]";

/** Primary action (Evaluate) */
const solidActionClass =
  "inline-flex h-7 w-fit items-center justify-center whitespace-nowrap rounded-lg bg-primary px-7 text-xs font-semibold text-white transition-colors hover:bg-primary-hover";

/** Status pills — Figma: 146×22, fixed width, centered label */
const statusPillClass =
  "inline-flex h-[22px] w-[146px] shrink-0 items-center justify-center rounded-full text-xs font-medium leading-none";

const thClass =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted";
const thCenterClass =
  "px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted";
const tdClass = "px-4 py-3.5 align-middle text-sm";
const tdCenterClass = "px-4 py-3.5 align-middle text-center text-sm";

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
          <ExpertStatCardsSkeleton count={3} columns={3} compact />
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap">
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              {totalItems} total evaluation{totalItems === 1 ? "" : "s"}
            </p>
            <nav
              className="flex flex-wrap items-center gap-5 sm:gap-6"
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

          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            {/* Mobile list */}
            <div className="flex flex-col gap-3 p-4 md:hidden">
              {items.length === 0 ? (
                <p className="py-12 text-center text-sm text-text-muted">
                  No evaluations in this period.
                </p>
              ) : (
                items.map((row) => (
                  <article
                    key={`m-${row.requestId}-${row.status}-${row.dateDisplay}-${row.action}`}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-text-muted">
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
              <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[20%]" />
                  <col className="w-[13%]" />
                  <col className="w-[9%]" />
                  <col className="w-[11%]" />
                  <col className="w-[168px]" />
                  <col className="w-[17%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={thClass}>
                      Request ID
                    </th>
                    <th scope="col" className={thClass}>
                      Coin
                    </th>
                    <th scope="col" className={thClass}>
                      Type
                    </th>
                    <th scope="col" className={thClass}>
                      Date
                    </th>
                    <th scope="col" className={thClass}>
                      Value given
                    </th>
                    <th scope="col" className={thCenterClass}>
                      Status
                    </th>
                    <th scope="col" className={thCenterClass}>
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
                        key={`${row.requestId}-${row.status}-${row.dateDisplay}-${row.action}`}
                        className="border-b border-border last:border-b-0"
                      >
                        <td
                          className={`${tdClass} whitespace-nowrap text-text-muted`}
                        >
                          {row.requestLabel}
                        </td>
                        <td className={tdClass}>
                          <span
                            className="block truncate font-semibold text-text"
                            title={row.coinName}
                          >
                            {row.coinName}
                          </span>
                        </td>
                        <td
                          className={`${tdClass} whitespace-nowrap text-text-muted`}
                        >
                          {row.type}
                        </td>
                        <td
                          className={`${tdClass} whitespace-nowrap text-text-muted`}
                        >
                          {row.dateDisplay}
                        </td>
                        <td
                          className={`${tdClass} whitespace-nowrap font-medium tabular-nums text-text`}
                        >
                          {formatHistoryValue(row.valueInr)}
                        </td>
                        <td className={tdCenterClass}>
                          <StatusPill status={row.status} />
                        </td>
                        <td className={tdCenterClass}>
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

            <footer className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
        </div>
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
    <article className="flex h-[116px] w-full flex-col justify-between rounded-xl border border-border bg-surface px-5 py-4 shadow-sm sm:w-[249px] sm:shrink-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
        {label}
      </p>
      <p className="truncate text-[30px] font-semibold leading-none tracking-tight tabular-nums text-text">
        {value}
      </p>
      <p className="truncate text-xs leading-4 text-text-muted">{hint}</p>
    </article>
  );
}

function StatusPill({ status }: { status: HistoryRow["status"] }) {
  if (status === "missed") {
    return (
      <span
        className={`${statusPillClass} bg-expert-status-expired-bg text-expert-status-expired-text`}
      >
        Expired
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span
        className={`${statusPillClass} bg-expert-status-draft-bg text-expert-status-draft-text`}
      >
        Draft
      </span>
    );
  }
  if (status === "new") {
    return (
      <span
        className={`${statusPillClass} bg-expert-status-new-bg text-expert-status-new-text`}
      >
        New
      </span>
    );
  }
  return (
    <span
      className={`${statusPillClass} bg-expert-status-done-bg text-expert-status-done-text`}
    >
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
  if (action === "view_details") {
    return (
      <Link href={`/expert/queue/${requestId}`} className={outlineActionClass}>
        View Details
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
  const safeTotal = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), safeTotal);
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);
  const navBtnClass =
    "inline-flex h-8 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-input-bg";
  const navBtnDisabledClass =
    "inline-flex h-8 cursor-not-allowed items-center rounded-lg border border-border px-3 text-sm font-medium text-text-muted/50";

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5"
      aria-label="History pagination"
    >
      {current <= 1 ? (
        <span className={navBtnDisabledClass}>&lt; Previous</span>
      ) : (
        <Link
          href={buildExpertHistoryHref({ page: current - 1, period })}
          className={navBtnClass}
        >
          &lt; Previous
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={`page-${p}-of-${safeTotal}`}
          href={buildExpertHistoryHref({ page: p, period })}
          aria-current={p === current ? "page" : undefined}
          className={
            p === current
              ? "inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-semibold text-white"
              : "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-input-bg hover:text-text"
          }
        >
          {p}
        </Link>
      ))}

      {current >= safeTotal ? (
        <span className={navBtnDisabledClass}>Next &gt;</span>
      ) : (
        <Link
          href={buildExpertHistoryHref({ page: current + 1, period })}
          className={navBtnClass}
        >
          Next &gt;
        </Link>
      )}
    </nav>
  );
}
