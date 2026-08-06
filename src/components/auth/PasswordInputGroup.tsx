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
  "w-full rounded-lg border-0 py-2.5 pl-3.5 pr-11 text-sm text-text outline-none ring-0 transition-[box-shadow,ring-color] placeholder:text-text-muted/70 focus:ring-2 focus:ring-primary/20";

const iconClass = "size-5 shrink-0";

/** Open eye — password is currently visible. */
function EyeIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

/** Slashed eye — password is currently hidden. */
function EyeSlashIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65a3 3 0 1 0-4.243-4.243m4.242 4.242 9.88-9.88" />
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
  const [passwordVisible, setPasswordVisible] = useState(false);
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
          type={passwordVisible ? "text" : "password"}
          className={mergedInputClass}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setPasswordVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
        >
          {passwordVisible ? <EyeIcon /> : <EyeSlashIcon />}
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
