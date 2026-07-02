import type { SelectHTMLAttributes } from "react";

export type SelectGroupProps = {
  label: string;
  id: string;
  error?: string;
  labelUppercase?: boolean;
  inputTone?: "muted" | "surface";
  className?: string;
  selectClassName?: string;
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className">;

const selectShellClass =
  "w-full rounded-lg border border-border px-3.5 py-2.5 text-sm text-text outline-none transition-[box-shadow,border-color] focus:border-primary focus:ring-2 focus:ring-primary/20";

export function SelectGroup({
  label,
  id,
  error,
  labelUppercase = false,
  inputTone = "muted",
  className = "",
  selectClassName = "",
  placeholder,
  children,
  ...selectProps
}: SelectGroupProps) {
  const bgClass = inputTone === "surface" ? "bg-surface" : "bg-input-bg";
  const mergedSelectClass = selectClassName
    ? `${selectShellClass} ${bgClass} ${selectClassName}`
    : `${selectShellClass} ${bgClass}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className={
          labelUppercase
            ? "text-xs font-semibold uppercase tracking-[0.1em] text-text"
            : "text-sm font-medium text-text-muted"
        }
      >
        {label}
      </label>
      <select id={id} className={mergedSelectClass} {...selectProps}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
