import type { DraftListItem } from "@/lib/expert/types";
import { formatDeadlineRemaining, formatRequestId } from "@/lib/expert/format";
import { ExpertEmptyState } from "@/components/expert/ExpertEmptyState";
import { ExpertDraftsListSkeleton } from "@/components/expert/ExpertSkeleton";
import Link from "next/link";

type ExpertDraftsPageBodyProps = {
  items: DraftListItem[];
  isLoading?: boolean;
};

function DraftsScrollIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static empty-state asset from /public
    <img
      src="/expert-drafts-scroll.png"
      alt=""
      width={60}
      height={60}
      className="h-11 w-11 object-contain xl:h-16 xl:w-16"
    />
  );
}

export function ExpertDraftsPageBody({
  items,
  isLoading = false,
}: ExpertDraftsPageBodyProps) {
  const showEmpty = !isLoading && items.length === 0;
  const count = items.length;

  return (
    <div>
      <div className="mb-4 xl:mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-text xl:text-3xl">
          Drafts
        </h2>
        <p className="mt-1 text-xs text-text-muted xl:text-base">
          Evaluations you&apos;ve started but not yet submitted
        </p>
      </div>

      <div
        className={`rounded-xl border border-border/70 bg-surface shadow-sm xl:rounded-2xl ${
          showEmpty || isLoading ? "p-0" : "p-5 sm:p-6"
        }`}
      >
        {isLoading ? (
          <div className="p-5 sm:p-6">
            <ExpertDraftsListSkeleton />
          </div>
        ) : showEmpty ? (
          <ExpertEmptyState
            icon={<DraftsScrollIcon />}
            title="Drafts Page"
            description="This page will show incompleted evaluations"
          />
        ) : (
          <>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {count} {count === 1 ? "draft" : "drafts"} in progress
            </p>

            <ul className="space-y-4">
              {items.map((row) => (
                <li key={row.id}>
                  <article className="rounded-xl border border-border/80 border-l-4 border-l-expert-action-amber bg-surface p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-sm text-text-muted">
                            {row.submittedDisplay}
                          </p>
                          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                            <span className="inline-flex rounded-full bg-expert-action-amber-soft px-2.5 py-0.5 text-xs font-semibold text-expert-action-amber-text ring-1 ring-expert-action-amber-ring">
                              Draft
                            </span>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                              Deadline{" "}
                              <span className="text-text">
                                {(() => {
                                  const label = formatDeadlineRemaining(
                                    row.deadlineAt,
                                  );
                                  if (label !== "—") return label;
                                  return `${row.deadlineDays} ${row.deadlineDays === 1 ? "day" : "days"}`;
                                })()}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-base font-semibold text-text">
                          REQ-ID {formatRequestId(row.id)}
                        </p>
                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-text-muted">
                              Form progress
                            </span>
                            <span className="text-xs font-semibold tabular-nums text-text">
                              {row.progressPercent}% complete
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-input-bg">
                            <div
                              className="h-full rounded-full bg-primary transition-[width]"
                              style={{ width: `${row.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 sm:items-end sm:pt-8">
                        <Link
                          href={`/expert/queue/${row.id}`}
                          className="inline-flex w-full items-center justify-center rounded-lg bg-expert-action-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-expert-action-green-hover sm:w-auto"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
