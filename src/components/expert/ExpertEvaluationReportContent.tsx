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
      </header>

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
