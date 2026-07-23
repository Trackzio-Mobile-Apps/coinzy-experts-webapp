import type { QueueListItem } from "@/lib/expert/types";
import { QUEUE_PAGE_SIZE } from "@/lib/expert/constants";
import { formatDeadlineRemaining, formatRequestId } from "@/lib/expert/format";
import { ExpertEmptyState } from "@/components/expert/ExpertEmptyState";
import { ExpertQueueListSkeleton } from "@/components/expert/ExpertSkeleton";
import Link from "next/link";

type ExpertQueuePageBodyProps = {
  items: QueueListItem[];
  page: number;
  totalItems: number;
  isLoading?: boolean;
};

function CoinPair({ label }: { label: string }) {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 text-[10px] font-bold text-white shadow-sm"
      aria-hidden
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

function EmptyQueueIcon() {
  return (
    <svg
      width="44"
      height="44"
      className="h-full w-full"
      viewBox="0 0 58 58"
      fill="none"
      aria-hidden
    >
      <path
        d="M19 13.5c0-3 4.5-5.5 10-5.5s10 2.5 10 5.5v30.8c0 3.1-4.5 5.7-10 5.7s-10-2.6-10-5.7V13.5Z"
        fill="#C9A77A"
      />
      <ellipse cx="29" cy="13.5" rx="10" ry="5.5" fill="#E4C89E" />
      <path
        d="M21.5 18.5h15M21.5 23h15M21.5 27.5h15M21.5 32h15M21.5 36.5h15M21.5 41h15"
        stroke="#92704A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <ellipse cx="29" cy="44.3" rx="10" ry="5.7" fill="#B88C5B" />
    </svg>
  );
}

export function ExpertQueuePageBody({
  items,
  page,
  totalItems,
  isLoading = false,
}: ExpertQueuePageBodyProps) {
  const showEmpty = !isLoading && totalItems === 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / QUEUE_PAGE_SIZE));
  const from = totalItems === 0 ? 0 : (page - 1) * QUEUE_PAGE_SIZE + 1;
  const to = Math.min(page * QUEUE_PAGE_SIZE, totalItems);

  return (
    <div>
      <div className="mb-4 xl:mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-text xl:text-3xl">
          Evaluation queue
        </h2>
        <p className="mt-1 text-xs text-text-muted xl:text-base">
          All pending evaluation requests
        </p>
      </div>

      <div
        className={`rounded-xl border border-border/70 bg-surface shadow-sm xl:rounded-2xl ${
          showEmpty ? "p-0" : "p-5 sm:p-6"
        }`}
      >
        {isLoading ? (
          <ExpertQueueListSkeleton />
        ) : showEmpty ? (
          <ExpertEmptyState
            icon={<EmptyQueueIcon />}
            title="Your queue is empty"
            description="This page will show all your new and in progress requests"
          />
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((row) => (
                <li key={row.id}>
                  <article
                    className={`flex flex-col gap-4 rounded-xl border border-border/80 bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                      row.status === "in_progress"
                        ? "border-l-4 border-l-expert-action-green pl-3 sm:pl-4"
                        : "border-l-4 border-l-expert-action-blue pl-3 sm:pl-4"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 gap-4">
                      <CoinPair label={row.coinName} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text">
                          {row.coinName}
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          {row.submittedDisplay}
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-text">
                          REQ-ID {formatRequestId(row.id)}
                        </p>
                        <div className="mt-2">
                          {row.status === "in_progress" ? (
                            <span className="inline-flex rounded-full bg-expert-action-green-soft px-2.5 py-0.5 text-xs font-semibold text-expert-action-green-text ring-1 ring-expert-action-green-ring">
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-expert-badge-neutral px-2.5 py-0.5 text-xs font-semibold text-expert-badge-neutral-text ring-1 ring-expert-badge-neutral-ring">
                              Pending Review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                      <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        Deadline{" "}
                        <span className="text-text">
                          {(() => {
                            const label = formatDeadlineRemaining(row.deadlineAt);
                            if (label !== "—") return label;
                            return `${row.deadlineDays} ${row.deadlineDays === 1 ? "day" : "days"}`;
                          })()}
                        </span>
                      </p>
                      {row.status === "in_progress" ? (
                        <Link
                          href={`/expert/queue/${row.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-expert-action-green px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-expert-action-green-hover"
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link
                          href={`/expert/queue/${row.id}?offerId=${encodeURIComponent(row.offerId ?? "")}`}
                          className="inline-flex items-center justify-center rounded-lg bg-expert-action-blue px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-expert-action-blue-hover"
                        >
                          View Request
                        </Link>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            <footer className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-muted">
                Showing {from} to {to} of {totalItems} requests
              </p>
              <QueuePagination page={page} totalPages={totalPages} />
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function QueuePagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label="Queue pagination"
    >
      {page <= 1 ? (
        <span className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted/50">
          Previous
        </span>
      ) : (
        <Link
          href={`/expert/queue?page=${page - 1}`}
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
            href={`/expert/queue?page=${p}`}
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
          href={`/expert/queue?page=${page + 1}`}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-input-bg"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
