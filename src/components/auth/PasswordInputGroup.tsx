"use client";

import { useState, type InputHTMLAttributes } from "react";

export type PasswordInputGroupProps = {
  label: string;
  id: string;
  error?: string;
  labelEmphasis?: boolean;
  inputTone?: "muted" | "surface";
  className?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "className">;

const inputShellClass =
  "w-full rounded-lg border border-input-border bg-input-bg py-2.5 pl-3.5 pr-11 text-sm text-text outline-none transition-[box-shadow,border-color] placeholder:text-text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

function EyeToggleIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a14.8 14.8 0 0 1-2.16 3.19" />
        <path d="M6.61 6.61A14.8 14.8 0 0 0 4 12s3 7 10 7a10.94 10.94 0 0 0 2.12-.27" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PasswordInputGroup({
  label,
  id,
  error,
  labelEmphasis = false,
  inputTone = "muted",
  className = "",
  inputClassName = "",
  ...inputProps
}: PasswordInputGroupProps) {
  const [visible, setVisible] = useState(false);
  const bgClass = inputTone === "surface" ? "bg-surface" : "bg-input-bg";
  const mergedInputClass = inputClassName
    ? `${inputShellClass} ${bgClass} ${inputClassName}`
    : `${inputShellClass} ${bgClass}`;

  const labelClass = labelEmphasis
    ? "text-sm font-semibold text-text"
    : "text-sm font-medium text-text-muted";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={mergedInputClass}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <EyeToggleIcon visible={visible} />
        </button>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
