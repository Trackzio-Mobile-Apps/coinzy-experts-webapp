"use client";

import { useEffect } from "react";

type ExpertDeadlineExceededModalProps = {
  open: boolean;
  onGoBack: () => void;
};

function WarningIcon() {
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-full bg-expert-error text-white shadow-sm"
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 9v4.5M12 16.5h.01"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M10.3 4.8 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.8a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ExpertDeadlineExceededModal({
  open,
  onGoBack,
}: ExpertDeadlineExceededModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-deadline-exceeded-title"
      aria-describedby="expert-deadline-exceeded-desc"
    >
      <div className="relative w-full max-w-[26rem] rounded-2xl bg-surface px-8 py-10 text-center shadow-2xl">
        <div className="flex justify-center">
          <WarningIcon />
        </div>
        <h2
          id="expert-deadline-exceeded-title"
          className="mt-5 text-xl font-semibold tracking-tight text-text"
        >
          Evaluation Deadline Exceeded
        </h2>
        <p
          id="expert-deadline-exceeded-desc"
          className="mt-3 text-sm leading-relaxed text-text-muted"
        >
          The allocated time for this evaluation has expired. This request can
          no longer be submitted.
        </p>
        <button
          type="button"
          onClick={onGoBack}
          className="mt-8 w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
