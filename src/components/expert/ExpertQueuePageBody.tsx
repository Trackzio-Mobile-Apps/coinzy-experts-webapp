import type { QueueListItem } from "@/lib/expert/types";
import { QUEUE_PAGE_SIZE } from "@/lib/expert/constants";
import {
  formatQueueDeadlineLabel,
  formatQueueRequestIdLabel,
} from "@/lib/expert/format";
import {
  getQueueRowStyles,
  queuePrimaryButtonClass,
} from "@/lib/expert/queueRowStyles";
import { ExpertEmptyState } from "@/components/expert/ExpertEmptyState";
import { ExpertScrollIllustration } from "@/components/expert/ExpertScrollIllustration";
import { ExpertQueueListSkeleton } from "@/components/expert/ExpertSkeleton";
import { QueueCoinPreview } from "@/components/expert/QueueCoinPreview";
import Link from "next/link";

type ExpertQueuePageBodyProps = {
  items: QueueListItem[];
  page: number;
  totalItems: number;
  isLoading?: boolean;
  skippingOfferId?: string | null;
  onSkipOffer?: (offerId: string, requestId: string) => void | Promise<void>;
};

const skipButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-semibold text-text transition-colors hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-60";

const actionRowClass = "flex flex-wrap items-center justify-end gap-2";

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ExpertQueuePageBody({
  items,
  page,
  totalItems,
  isLoading = false,
  skippingOfferId = null,
  onSkipOffer,
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
            icon={<ExpertScrollIllustration />}
            title="Your queue is empty"
            description="This page will show all your new and in progress requests"
          />
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((row) => {
                const styles = getQueueRowStyles(row);

                return (
                  <li key={row.id}>
                    <article
                      className={`flex flex-col gap-4 rounded-xl border border-border/80 bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 border-l-4 pl-3 sm:pl-4 ${styles.accent}`}
                    >
                      <div className="flex min-w-0 flex-1 gap-4">
                        <QueueCoinPreview
                          coinName={row.coinName}
                          thumbnailUrls={row.thumbnailUrls}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-sm text-text-muted">
                            <ClockIcon className="shrink-0 text-text-muted/80" />
                            {row.submittedDisplay}
                          </p>
                          <p className="mt-1.5 text-base font-bold tracking-tight text-text">
                            {formatQueueRequestIdLabel(row.displayId)}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles.badge}`}
                            >
                              {styles.badgeLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                        <div className="text-right">
                          <p className="flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                            <ClockIcon className="shrink-0 text-text-muted/80" />
                            Deadline
                          </p>
                          <p
                            className={`mt-0.5 text-lg font-bold tabular-nums ${styles.deadlineClass}`}
                          >
                            {formatQueueDeadlineLabel(
                              row.deadlineAt,
                              row.deadlineDays,
                            )}
                          </p>
                        </div>

                        {row.variant === "pending_review" ? (
                          <div className={actionRowClass}>
                            <button
                              type="button"
                              disabled={
                                !row.offerId ||
                                !onSkipOffer ||
                                skippingOfferId === row.offerId
                              }
                              onClick={() =>
                                void onSkipOffer?.(row.offerId ?? "", row.id)
                              }
                              className={skipButtonClass}
                            >
                              {skippingOfferId === row.offerId
                                ? "Skipping…"
                                : "Skip / Reassign"}
                            </button>
                            <Link
                              href={`/expert/queue/${row.id}?offerId=${encodeURIComponent(row.offerId ?? "")}`}
                              className={`${queuePrimaryButtonClass} ${styles.primaryButton}`}
                            >
                              View Request
                            </Link>
                          </div>
                        ) : (
                          <div className={actionRowClass}>
                            <Link
                              href={`/expert/queue/${row.id}`}
                              className={`${queuePrimaryButtonClass} ${styles.primaryButton}`}
                            >
                              Continue
                            </Link>
                          </div>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
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
