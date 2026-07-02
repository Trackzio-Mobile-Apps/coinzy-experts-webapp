import type { ExpertDashboardStats } from "@/lib/expert/types";
import { formatInr } from "@/lib/expert/format";

type ExpertDashboardHeaderProps = {
  greeting: string;
  stats: ExpertDashboardStats;
  isLoading?: boolean;
};

export function ExpertDashboardHeader({
  greeting,
  stats,
  isLoading = false,
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
            {isLoading ? "—" : s.activeCases}
          </p>
          <p className="mt-1 text-sm text-text-muted">Pending your review</p>
        </div>
        <StatCard
          label="New offers"
          value={isLoading ? "—" : s.newRequests}
          hint="In your queue"
        />
        <StatCard
          label="Completed"
          value={isLoading ? "—" : s.completed}
          hint="All time"
        />
        <StatCard
          label="Avg turnaround"
          value={isLoading ? "—" : (s.avgTurnaround ?? "—")}
          hint="Last 5 evaluations"
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

// Keep formatInr exported for history/profile consumers
export { formatInr };
