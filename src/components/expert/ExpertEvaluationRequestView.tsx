"use client";

import type { EvaluationFormState } from "@/lib/expert/types";
import {
  areRequiredFieldsComplete,
  createInitialEvaluationFormState,
  evaluateFormProgress,
  EVALUATION_FORM_SECTIONS,
  getSectionProgress,
  getSectionStepState,
  normalizeEvaluationFormState,
  type SectionStepState,
} from "@/lib/expert/evaluationForm";
import {
  isEvaluationFormValid,
  validateEvaluationField,
  validateEvaluationForm,
} from "@/lib/expert/evaluationFormValidation";
import {
  clearEvaluationDraft,
  loadEvaluationDraft,
  saveEvaluationDraft,
} from "@/lib/expert/evaluationDraftStorage";
import { formatDeadlineDue, formatDeadlineRemaining, formatReceivedOn, isDeadlineExceeded, normalizeMongoId } from "@/lib/expert/format";
import { DEADLINE_EXCEEDED_TOAST_KEY } from "@/lib/expert/constants";
import {
  ensureDraftReport,
  getReportForRequest,
  getStoredReportIdForRequest,
  isDraftReport,
  mediaToReportAttachments,
  reportToFormState,
  saveDraftReport,
  submitReport,
} from "@/lib/expert/reportsService";
import type { EvaluationRequestDetail, RequestMediaItem } from "@/lib/expert/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EvaluationMediaLightbox } from "./EvaluationMediaLightbox";
import { ExpandMediaGalleryIcon } from "./ExpandMediaGalleryIcon";
import { MediaGroupScroller } from "./MediaGroupScroller";
import { ExpertDeadlineExceededModal } from "./ExpertDeadlineExceededModal";

type ExpertEvaluationRequestViewProps = {
  detail: EvaluationRequestDetail;
  accepting?: boolean;
  acceptError?: string | null;
  showAcceptedToast?: boolean;
  reassigning?: boolean;
  reassignError?: string | null;
  onAccept?: () => void | Promise<void>;
  onReassign?: () => void | Promise<void>;
  onDismissToast?: () => void;
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
  required = false,
  description,
  error,
}: {
  label: string;
  id: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  description?: string;
  error?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? (
          <span className="text-expert-error" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="ml-1 font-normal normal-case tracking-normal text-text-muted">
            (optional)
          </span>
        )}
      </label>
      {description ? (
        <p className="text-xs leading-relaxed text-text-muted">{description}</p>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-expert-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function stepCircleClass(state: SectionStepState): string {
  switch (state) {
    case "complete":
      return "bg-expert-action-green text-white shadow-sm";
    case "in_progress":
      return "border-2 border-expert-action-green bg-expert-action-green-soft text-expert-action-green-text";
    default:
      return "border border-border bg-input-bg text-text-muted";
  }
}

function EvaluationProgressStepper({ form }: { form: EvaluationFormState }) {
  const { percent } = useMemo(() => evaluateFormProgress(form), [form]);

  return (
    <div className="shrink-0 rounded-xl border border-border/70 bg-surface p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text">
          Form progress
        </p>
        <p className="text-sm font-semibold tabular-nums text-text">
          {percent}% complete
        </p>
      </div>
      <div
        className="flex overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {EVALUATION_FORM_SECTIONS.map((sec, i) => {
          const state = getSectionStepState(form, sec.id);
          return (
            <div
              key={sec.id}
              role="listitem"
              className="relative flex min-w-[5.5rem] flex-1 flex-col items-center gap-1.5 text-center sm:min-w-[6.5rem]"
            >
              {i > 0 ? (
                <span className="absolute right-1/2 top-4 h-px w-full -translate-y-1/2 bg-border" />
              ) : null}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${stepCircleClass(state)}`}
                aria-label={
                  state === "complete"
                    ? `${sec.stepLabel} complete`
                    : state === "in_progress"
                      ? `${sec.stepLabel} in progress`
                      : `${sec.stepLabel} pending`
                }
              >
                {state === "complete" ? "✓" : i + 1}
              </span>
              <span
                className={`max-w-[6.5rem] text-[10px] font-semibold uppercase leading-tight tracking-wide sm:text-[11px] ${
                  state === "pending"
                    ? "text-text-muted"
                    : "text-expert-action-green-text"
                }`}
              >
                {sec.stepLabel}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg bg-input-bg/70 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text">
          Unable to complete this request?
        </p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          After accepting this request, please reassign it within the first 8
          hours if you&apos;re unable to complete it.
        </p>
      </div>
    </div>
  );
}

function groupMedia(media: RequestMediaItem[]) {
  const groups = new Map<string, Array<{ item: RequestMediaItem; index: number }>>();
  media.forEach((item, index) => {
    const key =
      item.group?.trim() ||
      (item.kind === "video" ? "Videos" : "Images");
    const list = groups.get(key) ?? [];
    list.push({ item, index });
    groups.set(key, list);
  });
  return Array.from(groups.entries());
}

function MediaAndNotes({
  detail,
  onOpen,
}: {
  detail: EvaluationRequestDetail;
  onOpen: (index: number) => void;
}) {
  const grouped = useMemo(() => groupMedia(detail.media), [detail.media]);

  return (
    <aside className="flex w-full min-w-0 max-w-full flex-col gap-4 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain">
      <section className="w-full min-w-0 shrink-0 rounded-xl border border-border/70 bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className={`${labelClass} min-w-0 flex-1 leading-snug`}>
            Coin images & videos
          </h2>
          {detail.media.length > 0 ? (
            <button
              type="button"
              onClick={() => onOpen(0)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-input-bg hover:text-text"
              aria-label="Expand media gallery"
              title="Open gallery"
            >
              <ExpandMediaGalleryIcon className="h-[1.125rem] w-[1.125rem]" />
            </button>
          ) : null}
        </div>

        {detail.media.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-input-bg/40 px-4 py-8 text-center text-sm text-text-muted">
            No media attached to this request.
          </p>
        ) : (
          <div className="space-y-4">
            {grouped.map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 text-xs font-medium text-text-muted">
                  {group}{" "}
                  <span className="text-text-muted/80">({items.length})</span>
                </p>
                <MediaGroupScroller items={items} onOpen={onOpen} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="shrink-0 rounded-xl border border-border/70 bg-surface px-4 py-3.5 shadow-sm">
        <h2 className={labelClass}>User&apos;s notes</h2>
        <p className="mt-2 text-sm leading-relaxed text-text">
          {detail.userNotes}
        </p>
      </section>
    </aside>
  );
}

function RequestBreadcrumb({ displayId }: { displayId: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted"
    >
      <Link
        href="/expert/queue"
        className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-text"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Queue
      </Link>
      <span aria-hidden className="text-border">
        &gt;
      </span>
      <span className="font-mono font-semibold text-text">
        REQ-ID {displayId}
      </span>
    </nav>
  );
}

function DeadlineBadge({
  days,
  deadlineAt,
}: {
  days: number;
  deadlineAt: string | null;
}) {
  const remaining = formatDeadlineRemaining(deadlineAt);

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-input-bg/40 px-3.5 py-2.5">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2" />
          <path d="M9 2h6" />
        </svg>
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          Deadline
        </p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-text">
          {remaining === "—"
            ? `${days} ${days === 1 ? "day" : "days"}`
            : remaining}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {formatDeadlineDue(deadlineAt)}
        </p>
      </div>
    </div>
  );
}

function RequestHeader({
  detail,
  formId,
  showSubmit,
  showSubmitButton,
  submitDisabled,
  showDeadlineCard = true,
  reassigning = false,
  reassignDisabled = false,
  onReassign,
}: {
  detail: EvaluationRequestDetail;
  formId: string;
  showSubmit: boolean;
  showSubmitButton: boolean;
  submitDisabled: boolean;
  showDeadlineCard?: boolean;
  reassigning?: boolean;
  reassignDisabled?: boolean;
  onReassign?: () => void | Promise<void>;
}) {
  const reassignBlocked = reassignDisabled || reassigning || !onReassign;

  return (
    <header className="mb-4 shrink-0">
      <div className="mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <RequestBreadcrumb displayId={detail.displayId} />
        {showSubmit ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="text-xs font-medium text-text-muted">
              ✓ Auto save on
            </span>
            <button
              type="button"
              disabled={reassignBlocked}
              title={
                reassignBlocked && !reassigning
                  ? "Offer id missing — open this request from the queue"
                  : "Decline this offer and return it to the pool"
              }
              onClick={() => void onReassign?.()}
              className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reassigning ? "Reassigning…" : "Reassign"}
            </button>
            {showSubmitButton ? (
              <button
                type="submit"
                form={formId}
                disabled={submitDisabled}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit report →
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-surface px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 font-mono text-xs text-text-muted">
            REQ-ID {detail.displayId}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-text sm:text-[1.35rem]">
            Coin identification & evaluation request
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            {formatReceivedOn(detail.receivedAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {showDeadlineCard ? (
            <DeadlineBadge
              days={detail.deadlineDays}
              deadlineAt={detail.deadlineAt}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

function AcceptPanel({
  accepting,
  acceptDisabled,
  acceptError,
  reassigning = false,
  reassignDisabled = false,
  reassignError,
  onAccept,
  onReassign,
}: {
  accepting: boolean;
  acceptDisabled: boolean;
  acceptError?: string | null;
  reassigning?: boolean;
  reassignDisabled?: boolean;
  reassignError?: string | null;
  onAccept?: () => void | Promise<void>;
  onReassign?: () => void | Promise<void>;
}) {
  const disabled = acceptDisabled || accepting || reassigning || !onAccept;
  const skipDisabled =
    reassignDisabled || reassigning || accepting || !onReassign;

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/70 bg-surface px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-text">
          Ready to evaluate?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Begin the evaluation to access the form, review the images, and
          complete the report.
        </p>
        {acceptError ? (
          <p className="mt-3 max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {acceptError}
          </p>
        ) : null}
        {reassignError ? (
          <p className="mt-3 max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {reassignError}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onReassign?.()}
          disabled={skipDisabled}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reassigning ? "Skipping…" : "Skip / Reassign"}
        </button>
        <button
          type="button"
          onClick={() => void onAccept?.()}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg border border-primary bg-transparent px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:opacity-60"
        >
          {accepting
            ? "Accepting…"
            : acceptDisabled
              ? "Accepted"
              : "Accept request"}
        </button>
      </div>
    </div>
  );
}

function RequestPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  );
}

function AcceptedToast({ onDismiss }: { onDismiss?: () => void }) {
  useEffect(() => {
    if (!onDismiss) return;
    const timer = window.setTimeout(onDismiss, 3500);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface px-4 py-3 text-sm font-medium text-text shadow-lg sm:inset-x-auto sm:right-6 sm:left-auto"
    >
      <span>Evaluation request was accepted successfully.</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-text-muted transition-colors hover:text-text"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ExpertEvaluationRequestView({
  detail,
  accepting = false,
  acceptError = null,
  showAcceptedToast = false,
  reassigning = false,
  reassignError = null,
  onAccept,
  onReassign,
  onDismissToast,
  onSubmitted,
}: ExpertEvaluationRequestViewProps) {
  const router = useRouter();
  const formId = "expert-evaluation-form";
  const [form, setForm] = useState<EvaluationFormState>(() => {
    const local = loadEvaluationDraft(detail.requestId);
    return normalizeEvaluationFormState(
      local ?? createInitialEvaluationFormState(),
    );
  });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftReportId, setDraftReportId] = useState<string | null>(() =>
    getStoredReportIdForRequest(detail.requestId),
  );
  const [draftSaveState, setDraftSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [hydrated, setHydrated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAllFieldErrors, setShowAllFieldErrors] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const reassignDisabled = !detail.offerId || !onReassign;
  const draftReportIdRef = useRef(draftReportId);
  const saveGenerationRef = useRef(0);
  const formRef = useRef(form);
  const submittedRef = useRef(false);

  const deadlineExceeded = isDeadlineExceeded(detail.deadlineAt);
  // Re-check when the clock crosses the deadline while the page is open.
  useEffect(() => {
    if (!detail.deadlineAt || deadlineExceeded) return;
    const target = new Date(detail.deadlineAt).getTime();
    if (Number.isNaN(target)) return;
    const delay = Math.max(0, target - Date.now()) + 250;
    const timer = window.setTimeout(() => setNowMs(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [detail.deadlineAt, deadlineExceeded, nowMs]);

  const requiredFieldsComplete = areRequiredFieldsComplete(form);
  const formIsValid = useMemo(() => isEvaluationFormValid(form), [form]);
  const submitBlocked =
    !detail.canSubmit ||
    submitting ||
    isDeadlineExceeded(detail.deadlineAt) ||
    !requiredFieldsComplete ||
    !formIsValid;
  const showSubmitButton = detail.canSubmit;

  useEffect(() => {
    draftReportIdRef.current = draftReportId;
  }, [draftReportId]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Hydrate from server draft when available (preferred over local-only).
  useEffect(() => {
    if (!detail.canSubmit) {
      setHydrated(true);
      return;
    }

    let cancelled = false;
    setHydrated(false);

    void (async () => {
      try {
        const report = await getReportForRequest(detail.requestId);
        if (cancelled) return;
        if (report && isDraftReport(report)) {
          const serverForm = reportToFormState(report);
          const localForm = loadEvaluationDraft(detail.requestId);
          const serverFilled = evaluateFormProgress(serverForm).filled;
          const localFilled = localForm
            ? evaluateFormProgress(localForm).filled
            : 0;
          // Prefer whichever side has more filled fields.
          const nextForm = normalizeEvaluationFormState(
            localFilled > serverFilled && localForm ? localForm : serverForm,
          );
          setForm(nextForm);
          saveEvaluationDraft(detail.requestId, nextForm);
          setDraftReportId(normalizeMongoId(report._id) || null);
        } else if (report) {
          // Already submitted — keep local empty; submit will 409 if retried.
          setDraftReportId(normalizeMongoId(report._id) || null);
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[expert] draft hydrate failed", err);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [detail.canSubmit, detail.requestId]);

  // Local autosave always; server draft when at least one field is filled.
  useEffect(() => {
    if (!detail.canSubmit || !hydrated || submittedRef.current) return;

    saveEvaluationDraft(detail.requestId, form);

    const { filled } = evaluateFormProgress(form);
    if (filled === 0) return;

    const generation = ++saveGenerationRef.current;
    setDraftSaveState("saving");

    const timer = window.setTimeout(() => {
      void (async () => {
        if (submittedRef.current) return;
        try {
          const report = await saveDraftReport({
            requestId: detail.requestId,
            reportId: draftReportIdRef.current,
            form,
            coinName: detail.coinName,
            attachments: mediaToReportAttachments(detail.media),
          });
          if (generation !== saveGenerationRef.current || submittedRef.current) {
            return;
          }
          const id = normalizeMongoId(report._id);
          if (id) {
            draftReportIdRef.current = id;
            setDraftReportId(id);
          }
          setDraftSaveState("saved");
        } catch (err) {
          if (generation !== saveGenerationRef.current) return;
          setDraftSaveState("error");
          if (process.env.NODE_ENV !== "production") {
            console.warn("[expert] draft autosave failed", err);
          }
        }
      })();
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    detail.requestId,
    detail.canSubmit,
    detail.coinName,
    detail.media,
    form,
    hydrated,
  ]);

  // Flush draft on leave / tab hide so closing without submit still marks draft.
  useEffect(() => {
    if (!detail.canSubmit) return;

    const flushDraft = () => {
      if (submittedRef.current) return;
      const current = formRef.current;
      saveEvaluationDraft(detail.requestId, current);
      void ensureDraftReport({
        requestId: detail.requestId,
        reportId: draftReportIdRef.current,
        form: current,
        coinName: detail.coinName,
        attachments: mediaToReportAttachments(detail.media),
      })
        .then((report) => {
          if (submittedRef.current) return;
          const id = normalizeMongoId(report._id);
          if (id) {
            draftReportIdRef.current = id;
            setDraftReportId(id);
          }
        })
        .catch(() => {
          // best-effort flush
        });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushDraft();
    };

    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", onVisibility);
      flushDraft();
    };
  }, [detail.canSubmit, detail.requestId, detail.coinName, detail.media]);

  const setField = (key: string, value: string) => {
    setForm((prev) => {
      const nextForm = { ...prev, [key]: value };
      if (
        showAllFieldErrors ||
        fieldErrors[key] ||
        (key === "estimatedPriceMin" &&
          ((nextForm.estimatedPriceMax ?? "").trim().length > 0 ||
            Boolean(fieldErrors.estimatedPriceMax)))
      ) {
        const keysToValidate =
          key === "estimatedPriceMin"
            ? ([key, "estimatedPriceMax"] as const)
            : ([key] as const);
        setFieldErrors((current) => {
          const next = { ...current };
          for (const fieldKey of keysToValidate) {
            const error = validateEvaluationField(
              fieldKey,
              nextForm[fieldKey] ?? "",
              nextForm,
            );
            if (error) next[fieldKey] = error;
            else delete next[fieldKey];
          }
          return next;
        });
      }
      return nextForm;
    });
  };

  const handleFieldBlur = (key: string) => {
    const keysToValidate =
      key === "estimatedPriceMin"
        ? ([key, "estimatedPriceMax"] as const)
        : ([key] as const);
    setFieldErrors((current) => {
      const next = { ...current };
      for (const fieldKey of keysToValidate) {
        const error = validateEvaluationField(
          fieldKey,
          form[fieldKey] ?? "",
          form,
        );
        if (error) next[fieldKey] = error;
        else delete next[fieldKey];
      }
      return next;
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail.canSubmit) return;
    if (isDeadlineExceeded(detail.deadlineAt)) {
      setSubmitError(
        "The allocated time for this evaluation has expired. This request can no longer be submitted.",
      );
      return;
    }

    const errors = validateEvaluationForm(form);
    if (Object.keys(errors).length > 0) {
      setShowAllFieldErrors(true);
      setFieldErrors(errors);
      setSubmitError("Please fix the highlighted fields before submitting.");
      const firstInvalidKey = EVALUATION_FORM_SECTIONS.flatMap((section) =>
        section.fields.map((field) => field.key),
      ).find((key) => errors[key]);
      if (firstInvalidKey) {
        document
          .getElementById(
            `${EVALUATION_FORM_SECTIONS.find((section) =>
              section.fields.some((field) => field.key === firstInvalidKey),
            )?.id}-${firstInvalidKey}`,
          )
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setShowAllFieldErrors(false);
    setFieldErrors({});
    setSubmitting(true);
    setSubmitError(null);
    // Prevent a stale autosave from racing the final submit.
    saveGenerationRef.current += 1;
    submittedRef.current = true;
    try {
      await submitReport(detail.requestId, {
        form,
        attachments: mediaToReportAttachments(detail.media),
        reportId: draftReportIdRef.current,
      });
      clearEvaluationDraft(detail.requestId);
      await onSubmitted?.();
    } catch (err) {
      submittedRef.current = false;
      setSubmitError(
        err instanceof Error ? err.message : "Unable to submit report.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (detail.unavailable) {
    return (
      <RequestPageFrame>
        <RequestHeader
          detail={detail}
          formId={formId}
          showSubmit={false}
          showSubmitButton={false}
          submitDisabled
        />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-5 pb-2 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start lg:gap-5">
            <MediaAndNotes detail={detail} onOpen={setLightbox} />
            <div className="rounded-xl border border-border/70 bg-surface p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-text">
                    Ready to evaluate?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    Begin the evaluation to access the form, review the images,
                    and complete the report.
                  </p>
                </div>
                <Link
                  href="/expert/queue"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Back to Queue
                </Link>
              </div>

              <div
                role="status"
                className="mt-4 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-800 text-xs font-bold"
                  aria-hidden
                >
                  i
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Request unavailable</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                    Another expert has already accepted this request. Please
                    return to the queue to pick a different one.
                  </p>
                </div>
              </div>
            </div>
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
      </RequestPageFrame>
    );
  }

  // Pre-accept: review media first, then accept.
  if (detail.needsAccept) {
    return (
      <RequestPageFrame>
        <RequestHeader
          detail={detail}
          formId={formId}
          showSubmit={false}
          showSubmitButton={false}
          submitDisabled
        />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-5 pb-2 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start lg:gap-5">
            <MediaAndNotes detail={detail} onOpen={setLightbox} />
            <AcceptPanel
              accepting={accepting}
              acceptDisabled={false}
              acceptError={acceptError}
              reassigning={reassigning}
              reassignDisabled={reassignDisabled}
              reassignError={reassignError}
              onAccept={onAccept}
              onReassign={onReassign}
            />
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
      </RequestPageFrame>
    );
  }

  // Accepted / in progress — evaluation form.
  return (
    <>
      <RequestPageFrame>
        <RequestHeader
          detail={detail}
          formId={formId}
          showSubmit
          showSubmitButton={showSubmitButton}
          submitDisabled={submitBlocked}
          reassigning={reassigning}
          reassignDisabled={reassignDisabled}
          onReassign={onReassign}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
          <MediaAndNotes detail={detail} onOpen={setLightbox} />

          <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-visible lg:overflow-y-auto lg:overscroll-contain lg:pe-1">
            <EvaluationProgressStepper form={form} />

            {reassignError ? (
              <p className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {reassignError}
              </p>
            ) : null}

            {submitError ? (
              <p className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {submitError}
              </p>
            ) : null}

            <div className="min-w-0 flex-1 rounded-xl border border-border/70 bg-surface shadow-sm">
              <form
                id={formId}
                className="flex flex-col"
                onSubmit={handleSubmit}
              >
                <div className="shrink-0 border-b border-border/60 px-4 py-4 sm:px-5">
                  <h2 className="text-xl font-semibold tracking-tight text-text">
                    Evaluation form
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Fields marked with * are mandatory. Optional fields can be
                    left blank.
                  </p>
                </div>

                <div className="space-y-6 px-4 py-5 sm:space-y-8 sm:px-5">
                  {EVALUATION_FORM_SECTIONS.map((section, si) => {
                    const sectionState = getSectionStepState(form, section.id);
                    const { filled, total } = getSectionProgress(
                      form,
                      section.id,
                    );

                    return (
                      <section
                        key={section.id}
                        className="rounded-xl border border-border/70 bg-input-bg/20 p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-semibold text-text">
                            <span
                              className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                                sectionState === "complete"
                                  ? "bg-expert-action-green text-white"
                                  : sectionState === "in_progress"
                                    ? "border border-expert-action-green bg-expert-action-green-soft text-expert-action-green-text"
                                    : "bg-primary/10 text-primary"
                              }`}
                            >
                              {sectionState === "complete" ? "✓" : si + 1}
                            </span>
                            {section.title}
                          </h3>
                          <span
                            className={`text-xs font-medium ${
                              sectionState === "complete"
                                ? "text-expert-action-green-text"
                                : "text-text-muted"
                            }`}
                          >
                            {sectionState === "complete"
                              ? "Completed"
                              : sectionState === "in_progress"
                                ? `${filled} of ${total} required filled`
                                : "Not started"}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {section.fields.map((field) => {
                            const id = `${section.id}-${field.key}`;
                            const isRequired = Boolean(field.required);
                            const fieldError = fieldErrors[field.key];
                            const invalidClass = fieldError
                              ? "border-expert-error focus:border-expert-error focus:ring-expert-error/20"
                              : "";
                            return (
                              <FieldBlock
                                key={field.key}
                                label={field.label}
                                id={id}
                                required={isRequired}
                                description={field.description}
                                error={fieldError}
                                className={
                                  field.multiline ? "sm:col-span-2" : undefined
                                }
                              >
                                {field.multiline ? (
                                  <textarea
                                    id={id}
                                    name={field.key}
                                    rows={4}
                                    required={isRequired}
                                    aria-required={isRequired}
                                    aria-invalid={Boolean(fieldError)}
                                    value={form[field.key] ?? ""}
                                    onChange={(e) =>
                                      setField(field.key, e.target.value)
                                    }
                                    onBlur={() => handleFieldBlur(field.key)}
                                    className={`${inputClass} min-h-[6rem] resize-y ${invalidClass}`}
                                    placeholder={field.description ?? "—"}
                                  />
                                ) : (
                                  <input
                                    id={id}
                                    name={field.key}
                                    type="text"
                                    required={isRequired}
                                    aria-required={isRequired}
                                    aria-invalid={Boolean(fieldError)}
                                    inputMode={field.inputMode ?? "text"}
                                    value={form[field.key] ?? ""}
                                    onChange={(e) =>
                                      setField(field.key, e.target.value)
                                    }
                                    onBlur={() => handleFieldBlur(field.key)}
                                    className={`${inputClass} ${invalidClass}`}
                                    placeholder={field.description ?? "—"}
                                  />
                                )}
                              </FieldBlock>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>

                <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between gap-4 border-t border-border/70 bg-surface/95 px-4 py-3 backdrop-blur-sm sm:px-5">
                  <span className="text-xs font-medium text-text-muted">
                    {draftSaveState === "saving"
                      ? "Saving draft…"
                      : draftSaveState === "error"
                        ? "Draft save failed — will retry"
                        : draftSaveState === "saved" ||
                            evaluateFormProgress(form).filled > 0
                          ? "✓ Draft saved"
                          : "✓ Auto save on"}
                  </span>
                  {showSubmitButton ? (
                    <button
                      type="submit"
                      disabled={submitBlocked}
                      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting…" : "Submit report →"}
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </div>
      </RequestPageFrame>

      <ExpertDeadlineExceededModal
        open={deadlineExceeded}
        onGoBack={() => {
          try {
            sessionStorage.setItem(DEADLINE_EXCEEDED_TOAST_KEY, "1");
          } catch {
            /* ignore */
          }
          router.push("/expert/drafts");
        }}
      />

      {showAcceptedToast ? <AcceptedToast onDismiss={onDismissToast} /> : null}

      {lightbox != null ? (
        <EvaluationMediaLightbox
          items={detail.media}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      ) : null}
    </>
  );
}
