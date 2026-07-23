"use client";

import { useEffect } from "react";

type ExpertToastProps = {
  open: boolean;
  message: string;
  title?: string;
  variant?: "success" | "error";
  onClose: () => void;
  durationMs?: number;
};

function SuccessIcon() {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-expert-action-green text-[10px] text-expert-action-green-text"
      aria-hidden
    >
      ✓
    </span>
  );
}

function ErrorIcon() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-expert-error-soft text-expert-error"
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 5.2v3.2M8 11.2h.007"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M8.69 2.46 14.4 12.4a.8.8 0 0 1-.69 1.2H2.29a.8.8 0 0 1-.69-1.2L7.31 2.46a.8.8 0 0 1 1.38 0Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ExpertToast({
  open,
  message,
  title,
  variant = "success",
  onClose,
  durationMs = 3800,
}: ExpertToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onClose, open]);

  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-hidden={!open}
      className={`fixed z-[120] flex w-[min(20rem,calc(100vw-2rem))] items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-xl transition-[opacity,transform] duration-200 ease-out sm:w-[22rem] ${
        isError
          ? "right-4 top-20 border-expert-error/25 border-l-4 border-l-expert-error sm:right-6 sm:top-24"
          : "bottom-6 right-4 border-border/60 border-l-4 border-l-expert-action-green sm:bottom-8 sm:right-6"
      } ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {isError ? <ErrorIcon /> : <SuccessIcon />}
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="text-sm font-semibold text-text">{title}</p>
        ) : null}
        <p
          className={`text-sm ${
            title
              ? "mt-0.5 font-normal leading-relaxed text-text-muted"
              : "font-semibold text-text"
          }`}
        >
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-lg font-normal leading-none text-text-muted transition-colors hover:text-text"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
