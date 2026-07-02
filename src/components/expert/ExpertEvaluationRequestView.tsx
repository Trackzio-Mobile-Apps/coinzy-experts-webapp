"use client";

import type { EvaluationFormState } from "@/lib/expert/types";
import {
  createInitialEvaluationFormState,
  evaluateFormProgress,
  EVALUATION_FORM_SECTIONS,
  isSectionComplete,
} from "@/lib/expert/evaluationForm";
import {
  clearEvaluationDraft,
  loadEvaluationDraft,
  saveEvaluationDraft,
} from "@/lib/expert/evaluationDraftStorage";
import { formatRequestId } from "@/lib/expert/format";
import { submitReport } from "@/lib/expert/reportsService";
import type { EvaluationRequestDetail } from "@/lib/expert/types";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { EvaluationMediaLightbox } from "./EvaluationMediaLightbox";

type ExpertEvaluationRequestViewProps = {
  detail: EvaluationRequestDetail;
  onSubmitted?: () => void | Promise<void>;
};

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-[box-shadow,border-color] placeholder:text-text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.1em] text-text";

function FieldBlock({
  label,
  id,
  children,
  className = "",
}: {
  label: string;
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

function EvaluationProgressStepper({ form }: { form: EvaluationFormState }) {
  const { percent } = useMemo(() => evaluateFormProgress(form), [form]);

  return (
    <div className="mb-8 rounded-2xl border border-border/80 bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Form progress
        </p>
        <p className="text-sm font-semibold tabular-nums text-text">
          {percent}% complete
        </p>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-input-bg">
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {EVALUATION_FORM_SECTIONS.map((sec, i) => {
          const done = isSectionComplete(form, sec.id);
          return (
            <div
              key={sec.id}
              role="listitem"
              className="flex min-w-[5.5rem] flex-col items-center gap-1.5 text-center sm:min-w-[6.5rem]"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-border bg-input-bg text-text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="max-w-[6.5rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-text-muted sm:text-[11px]">
                {sec.stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MediaAndNotes({
  detail,
  onOpen,
}: {
  detail: EvaluationRequestDetail;
  onOpen: (index: number) => void;
}) {
  return (
    <aside className="space-y-6 self-start lg:sticky lg:top-6">
      <section className="rounded-2xl border border-border/80 bg-surface p-4 shadow-sm sm:p-5">
        <h2 className={labelClass}>Coin images & videos</h2>
        {detail.media.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">
            No media attached to this request.
          </p>
        ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {detail.media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpen(i)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/80 bg-input-bg text-left shadow-sm outline-none ring-primary/0 transition-[box-shadow,ring-color] focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.src}
                  alt={m.alt}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.poster}
                    alt={m.alt}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-sm text-white shadow-lg">
                      ▶
                    </span>
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
        )}
      </section>

      <section className="rounded-2xl border border-border/80 bg-surface p-4 shadow-sm sm:p-5">
        <h2 className={labelClass}>User&apos;s notes</h2>
        <p className="mt-3 text-sm leading-relaxed text-text">
          {detail.userNotes}
        </p>
      </section>
    </aside>
  );
}

function RequestHeader({
  detail,
  formId,
}: {
  detail: EvaluationRequestDetail;
  formId: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-muted">
          Evaluation request page
        </p>
        <h1 className="mt-1 text-xl font-semibold capitalize tracking-tight text-text sm:text-2xl">
          Coin identification & evaluation request
        </h1>
        <p className="mt-2 font-mono text-sm font-semibold text-text">
          REQ-ID {formatRequestId(detail.requestId)}
        </p>
        <p className="mt-1 text-sm font-medium text-text">{detail.coinName}</p>
        <p className="mt-1 text-sm text-text-muted">{detail.submittedDisplay}</p>
        <p className="mt-3">
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950 ring-1 ring-amber-700/20">
            {detail.deadlineDays}{" "}
            {detail.deadlineDays === 1 ? "day" : "days"} remaining
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
        <button
          type="button"
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text shadow-sm transition-colors hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-50"
          disabled
          title="Demo only"
        >
          Reassign
        </button>
        <button
          type="submit"
          form={formId}
          className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover lg:inline-flex"
        >
          Submit report
        </button>
      </div>
    </header>
  );
}

export function ExpertEvaluationRequestView({
  detail,
  onSubmitted,
}: ExpertEvaluationRequestViewProps) {
  const formId = "expert-evaluation-form";
  const [form, setForm] = useState<EvaluationFormState>(() => {
    return (
      loadEvaluationDraft(detail.requestId) ??
      createInitialEvaluationFormState()
    );
  });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    saveEvaluationDraft(detail.requestId, form);
  }, [detail.requestId, form]);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail.canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitReport(detail.requestId, form);
      clearEvaluationDraft(detail.requestId);
      await onSubmitted?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to submit report.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (detail.unavailable) {
    return (
      <div>
        <header className="mb-6 border-b border-border/70 pb-6">
          <p className="text-xs font-medium text-text-muted">
            Evaluation request page
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text sm:text-2xl">
            Coin identification & evaluation request
          </h1>
          <p className="mt-2 font-mono text-sm text-text">
            REQ-ID {formatRequestId(detail.requestId)}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <MediaAndNotes detail={detail} onOpen={setLightbox} />
          <div className="flex flex-col justify-center rounded-2xl border border-border/80 bg-surface p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-text">Request unavailable</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">
              Another expert has already accepted this request. Please return to
              the queue to pick a different one.
            </p>
            <Link
              href="/expert/queue"
              className="mt-8 inline-flex items-center justify-center self-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Back to queue
            </Link>
          </div>
        </div>

        {lightbox != null ? (
          <EvaluationMediaLightbox
            items={detail.media}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onIndexChange={setLightbox}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="pb-28 lg:pb-10">
      <RequestHeader detail={detail} formId={formId} />

      <EvaluationProgressStepper form={form} />

      {submitError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start xl:grid-cols-[minmax(0,24rem)_1fr]">
        <MediaAndNotes detail={detail} onOpen={setLightbox} />

        <form id={formId} className="min-w-0" onSubmit={handleSubmit}>
          <div className="space-y-10">
            {EVALUATION_FORM_SECTIONS.map((section, si) => (
              <section
                key={section.id}
                className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-base font-semibold text-text">
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {si + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {section.fields.map((field) => {
                    const id = `${section.id}-${field.key}`;
                    return (
                      <FieldBlock
                        key={field.key}
                        label={field.label}
                        id={id}
                        className={field.multiline ? "sm:col-span-2" : undefined}
                      >
                        {field.multiline ? (
                          <textarea
                            id={id}
                            name={field.key}
                            rows={4}
                            value={form[field.key] ?? ""}
                            onChange={(e) =>
                              setField(field.key, e.target.value)
                            }
                            className={`${inputClass} min-h-[6rem] resize-y`}
                            placeholder="—"
                          />
                        ) : (
                          <input
                            id={id}
                            name={field.key}
                            type="text"
                            inputMode={field.inputMode ?? "text"}
                            value={form[field.key] ?? ""}
                            onChange={(e) =>
                              setField(field.key, e.target.value)
                            }
                            className={inputClass}
                            placeholder="—"
                          />
                        )}
                      </FieldBlock>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 hidden justify-end border-t border-border/60 pt-6 lg:flex">
            <button
              type="submit"
              disabled={!detail.canSubmit || submitting}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-surface/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden">
        <button
          type="submit"
          form={formId}
          disabled={!detail.canSubmit || submitting}
          className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </div>

      {lightbox != null ? (
        <EvaluationMediaLightbox
          items={detail.media}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      ) : null}
    </div>
  );
}
