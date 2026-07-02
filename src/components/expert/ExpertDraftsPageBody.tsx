import type { DraftListItem } from "@/lib/expert/types";
import { formatRequestId } from "@/lib/expert/format";
import Link from "next/link";

type ExpertDraftsPageBodyProps = {
  items: DraftListItem[];
  isLoading?: boolean;
};

export function ExpertDraftsPageBody({
  items,
  isLoading = false,
}: ExpertDraftsPageBodyProps) {
  const showEmpty = !isLoading && items.length === 0;
  const count = items.length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-text">Drafts</h2>
        <p className="mt-1 text-sm text-text-muted">
          Accepted evaluations saved locally until you submit a report
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading drafts…</p>
      ) : showEmpty ? (
        <div className="flex justify-center px-2">
          <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-surface px-8 py-16 text-center shadow-sm sm:px-12 sm:py-20">
            <p className="text-lg font-semibold text-text">No drafts yet</p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Accept a request from your queue to start an evaluation. Progress is
              saved in your browser until you submit.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {count} {count === 1 ? "draft" : "drafts"} in progress
          </p>

          <ul className="space-y-4">
            {items.map((row) => (
              <li key={row.id}>
                <article className="rounded-xl border border-border/80 border-l-4 border-l-expert-draft-accent bg-surface p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm text-text-muted">
                          {row.submittedDisplay}
                        </p>
                        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-400/40">
                            Draft
                          </span>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                            Deadline{" "}
                            <span className="text-text">
                              {row.deadlineDays}{" "}
                              {row.deadlineDays === 1 ? "day" : "days"}
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
                        className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
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
  );
}
