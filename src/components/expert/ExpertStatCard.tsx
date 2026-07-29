import type { ReactNode } from "react";

type ExpertStatCardProps = {
  label: string;
  value: ReactNode;
  hint: string;
  highlighted?: boolean;
};

/** Figma: 249×116, label / value / hint stacked with space-between */
export function ExpertStatCard({
  label,
  value,
  hint,
  highlighted = false,
}: ExpertStatCardProps) {
  return (
    <article
      className={
        highlighted
          ? "flex h-[116px] w-full flex-col justify-between rounded-xl border border-primary/10 bg-[#9b6566] px-5 py-4 text-white shadow-sm sm:w-[249px] sm:shrink-0"
          : "flex h-[116px] w-full flex-col justify-between rounded-xl border border-border bg-surface px-5 py-4 shadow-sm sm:w-[249px] sm:shrink-0"
      }
    >
      <p
        className={`text-[11px] font-medium uppercase tracking-[0.06em] ${
          highlighted ? "text-white/80" : "text-text-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`truncate text-[30px] font-semibold leading-none tracking-tight tabular-nums ${
          highlighted ? "text-white" : "text-text"
        }`}
      >
        {value}
      </p>
      <p
        className={`truncate text-xs leading-4 ${
          highlighted ? "text-white/75" : "text-text-muted"
        }`}
      >
        {hint}
      </p>
    </article>
  );
}
