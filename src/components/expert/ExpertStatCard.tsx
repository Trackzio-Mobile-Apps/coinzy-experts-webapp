import type { ReactNode } from "react";

type ExpertStatCardProps = {
  label: string;
  value: ReactNode;
  hint: string;
  highlighted?: boolean;
};

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
          ? "flex min-h-28 flex-col justify-between rounded-xl border border-primary/10 bg-[#9b6566] px-5 py-4 text-white shadow-sm xl:min-h-[9.5rem] xl:px-6 xl:py-5"
          : "flex min-h-28 flex-col justify-between rounded-xl border border-border/80 bg-surface px-5 py-4 shadow-sm xl:min-h-[9.5rem] xl:px-6 xl:py-5"
      }
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          highlighted ? "text-white/80" : "text-text-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-3xl font-semibold leading-none tabular-nums xl:text-4xl ${
          highlighted ? "text-white" : "text-text"
        }`}
      >
        {value}
      </p>
      <p
        className={`text-xs xl:text-sm ${
          highlighted ? "text-white/75" : "text-text-muted"
        }`}
      >
        {hint}
      </p>
    </article>
  );
}
