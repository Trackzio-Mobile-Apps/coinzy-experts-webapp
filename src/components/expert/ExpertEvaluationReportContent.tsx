import {
  EVALUATION_REPORT_BRAND,
  EVALUATION_REPORT_SUBTITLE,
  formatReportSubmittedAt,
  groupReportMedia,
  type EvaluationReportDisplay,
} from "@/lib/expert/evaluationReportView";
import type { RequestMediaItem } from "@/lib/expert/types";

type ExpertEvaluationReportContentProps = {
  report: EvaluationReportDisplay;
};

function ReportMediaTile({ item }: { item: RequestMediaItem }) {
  if (item.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded remote media URL
      <img
        src={item.src}
        alt={item.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <>
      {item.poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- video poster from user upload
        <img
          src={item.poster}
          alt={item.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-neutral-900 text-[10px] font-semibold text-white">
          Video
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[10px] text-white shadow">
          ▶
        </span>
      </span>
    </>
  );
}

export function ExpertEvaluationReportContent({
  report,
}: ExpertEvaluationReportContentProps) {
  const mediaGroups = groupReportMedia(report.media);

  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-border/70 pb-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset from /public */}
          <img
            src="/coinzy-logo.png"
            alt={EVALUATION_REPORT_BRAND}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl bg-black object-cover ring-1 ring-black/10"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-text">
              {EVALUATION_REPORT_BRAND}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              {EVALUATION_REPORT_SUBTITLE}
            </p>
          </div>
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-text">
          {report.coinTitle}
        </h2>
      </header>

      {report.media.length > 0 ? (
        <section className="mt-8">
          <h3 className="text-base font-semibold text-text">
            Coin images &amp; videos
          </h3>
          <div className="mt-3 space-y-4">
            {mediaGroups.map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 text-xs font-medium text-text-muted">
                  {group}{" "}
                  <span className="text-text-muted/80">({items.length})</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <div
                      key={`${group}-${index}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-input-bg shadow-sm sm:h-24 sm:w-24"
                    >
                      <ReportMediaTile item={item} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 space-y-8">
        {report.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-base font-semibold text-text">{section.title}</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-border/80 bg-surface">
              <table className="w-full text-left text-sm">
                <tbody>
                  {section.fields.map((field, index) => (
                    <tr
                      key={field.label}
                      className={
                        index % 2 === 0 ? "bg-input-bg/20" : "bg-surface"
                      }
                    >
                      <th
                        scope="row"
                        className="w-[38%] border-b border-border/60 px-4 py-3 align-top font-semibold text-text sm:px-5"
                      >
                        {field.label}
                      </th>
                      <td className="border-b border-border/60 px-4 py-3 align-top whitespace-pre-wrap leading-relaxed text-text-muted sm:px-5">
                        {field.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-text-muted">
        Request {report.requestDisplayId ?? report.requestId} · Submitted{" "}
        {formatReportSubmittedAt(report.submittedAt)}
      </p>
    </article>
  );
}
