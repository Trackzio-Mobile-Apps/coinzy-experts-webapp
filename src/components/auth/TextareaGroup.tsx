import type { TextareaHTMLAttributes } from "react";

const textareaBaseClass =
  "w-full min-h-[120px] resize-y rounded-lg border border-border bg-input-bg px-3.5 py-2.5 text-sm text-text outline-none transition-[box-shadow,border-color] placeholder:text-text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export type TextareaGroupProps = {
  label: string;
  id: string;
  error?: string;
  className?: string;
  textareaClassName?: string;
  /** Override default muted label style (e.g. section-style caps). */
  labelClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

/**
 * Label + styled textarea (bios, notes) matching auth inputs.
 */
export function TextareaGroup({
  label,
  id,
  error,
  className = "",
  textareaClassName = "",
  labelClassName = "text-sm font-medium text-text-muted",
  ...textareaProps
}: TextareaGroupProps) {
  const mergedClass = textareaClassName
    ? `${textareaBaseClass} ${textareaClassName}`
    : textareaBaseClass;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <textarea id={id} className={mergedClass} {...textareaProps} />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
