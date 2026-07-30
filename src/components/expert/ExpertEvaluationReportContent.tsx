import {
  formatReportSubmittedAt,
  type EvaluationReportDisplay,
} from "@/lib/expert/evaluationReportView";

type ExpertEvaluationReportContentProps = {
  report: EvaluationReportDisplay;
};

export function ExpertEvaluationReportContent({
  report,
}: ExpertEvaluationReportContentProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-border/70 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Coinzy Expert Evaluation Report
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text">
          {report.coinTitle}
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Request ID
            </dt>
            <dd className="mt-0.5 font-medium text-text">
              {report.requestDisplayId ?? report.requestId}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Submitted
            </dt>
            <dd className="mt-0.5 font-medium text-text">
              {formatReportSubmittedAt(report.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Status
            </dt>
            <dd className="mt-0.5 capitalize font-medium text-text">
              {report.status}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Report ID
            </dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-text-muted">
              {report.reportId}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-8 space-y-8">
        {report.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-base font-semibold text-text">{section.title}</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-border/80 bg-surface">
              <dl>
                {section.fields.map((field, index) => (
                  <div
                    key={field.label}
                    className={`grid gap-1 border-b border-border/60 px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4 sm:px-5 ${
                      index % 2 === 0 ? "bg-input-bg/20" : "bg-surface"
                    }`}
                  >
                    <dt className="text-sm font-semibold text-text">
                      {field.label}
                    </dt>
                    <dd className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
