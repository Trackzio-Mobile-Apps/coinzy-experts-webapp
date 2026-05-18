import type { ExpertDashboardStats } from "@/data/expert-panel.mock";
import { formatInr } from "@/data/expert-panel.mock";

type ExpertDashboardHeaderProps = {
  greeting: string;
  stats: ExpertDashboardStats;
};

export function ExpertDashboardHeader({
  greeting,
  stats,
}: ExpertDashboardHeaderProps) {
  const s = stats;

  return (
    <header className="border-b border-border/60 bg-expert-dashboard-canvas px-6 pb-6 pt-8 lg:px-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Here&apos;s your evaluation activity at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-primary/15 bg-primary/[0.07] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Active tasks
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-text">
            {s.activeCases}
          </p>
          <p className="mt-1 text-sm text-text-muted">Pending your review</p>
        </div>
        <StatCard label="New requests" value={s.newRequests} hint="This month" />
        <StatCard label="Completed" value={s.completed} hint="This month" />
        <StatCard
          label="Total earnings"
          value={formatInr(s.totalEarningsInr)}
          hint="This month"
        />
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-text">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}
