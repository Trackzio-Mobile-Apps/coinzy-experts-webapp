"use client";

import { useEffect } from "react";

type ExpertLogoutConfirmModalProps = {
  open: boolean;
  isLoggingOut?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function LogoutIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 17H6.5A1.5 1.5 0 0 1 5 15.5v-7A1.5 1.5 0 0 1 6.5 7H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 15.5 17.5 12 14 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExpertLogoutConfirmModal({
  open,
  isLoggingOut = false,
  onCancel,
  onConfirm,
}: ExpertLogoutConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoggingOut) onCancel();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoggingOut, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-logout-title"
      onClick={() => {
        if (!isLoggingOut) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-[28rem] rounded-2xl bg-surface px-6 pb-6 pt-5 shadow-2xl sm:px-8 sm:pb-8 sm:pt-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoggingOut}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-black/5 hover:text-text disabled:opacity-50"
          aria-label="Close"
        >
          <span className="text-xl leading-none" aria-hidden>
            ×
          </span>
        </button>

        <div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
            <LogoutIcon />
          </div>
        </div>

        <h2
          id="expert-logout-title"
          className="mt-5 text-center text-xl font-semibold tracking-tight text-text"
        >
          Logout Confirmation
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-text-muted">
          Are you sure you want to log out of your expert account?
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoggingOut}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-black/[0.03] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-70"
          >
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
