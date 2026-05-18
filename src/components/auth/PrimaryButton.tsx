import type { ButtonHTMLAttributes, ReactNode } from "react";

export type PrimaryButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Full-width maroon CTA used across auth flows.
 */
export function PrimaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover active:bg-primary-active disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
