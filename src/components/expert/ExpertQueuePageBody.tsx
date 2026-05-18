import type { QueueItem } from "@/data/expert-panel.mock";
import {
  MOCK_QUEUE_PREVIEW_EMPTY,
  QUEUE_PAGE_SIZE,
} from "@/data/expert-panel.mock";
import Link from "next/link";

type ExpertQueuePageBodyProps = {
  items: QueueItem[];
  page: number;
  totalItems: number;
};

function CoinPair() {
  return (
    <div className="flex shrink-0 -space-x-2" aria-hidden>
      <div className="relative z-[1] h-14 w-14 rounded-full border-2 border-white bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 shadow-sm" />
      <div className="relative z-[2] h-14 w-14 rounded-full border-2 border-white bg-gradient-to-br from-stone-200 via-stone-600 to-stone-900 shadow-sm" />
    </div>
  );
}

export function ExpertQueuePageBody({
  items,
  page,
  totalItems,
}: ExpertQueuePageBodyProps) {
  const showEmpty = MOCK_QUEUE_PREVIEW_EMPTY || totalItems === 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / QUEUE_PAGE_SIZE));
  const from = totalItems === 0 ? 0 : (page - 1) * QUEUE_PAGE_SIZE + 1;
  const to = Math.min(page * QUEUE_PAGE_SIZE, totalItems);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-text">
          Evaluation queue
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          All pending evaluation requests
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <h3 className="text-sm font-semibold text-text">Priority queue</h3>

        {showEmpty ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-lg font-semibold text-text">Your queue is empty</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
              This page will show all your new and in progress requests
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-4">
              {items.map((row) => (
                <li key={row.reqId}>
                  <article
                    className={`flex flex-col gap-4 rounded-xl border border-border/80 bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                      row.status === "in_progress"
                        ? "border-l-4 border-l-expert-queue-accent-green pl-3 sm:pl-4"
                        : "border-l-4 border-l-expert-queue-accent-blue pl-3 sm:pl-4"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 gap-4">
                      <CoinPair />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-muted">
                          {row.submittedDisplay}
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-text">
                          REQ-ID {row.reqId}
                        </p>
                        <div className="mt-2">
                          {row.status === "in_progress" ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20">
                              In progress
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-300/80">
                              Pending review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                      <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        Deadline{" "}
                        <span className="text-text">
                          {row.deadlineDays}{" "}
                          {row.deadlineDays === 1 ? "day" : "days"}
                        </span>
                      </p>
                      {row.status === "in_progress" ? (
                        <Link
                          href={`/expert/queue/${row.reqId}`}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link
                          href={`/expert/queue/${row.reqId}`}
                          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
                        >
                          View request
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
