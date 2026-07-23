import type { ExpertDashboardStats } from "@/lib/expert/types";
import { formatInr } from "@/lib/expert/format";
import {
  ExpertStatCardsSkeleton,
  SkeletonBone,
} from "@/components/expert/ExpertSkeleton";
import { ExpertStatCard } from "@/components/expert/ExpertStatCard";

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
    <header className="bg-expert-dashboard-canvas pb-6 pt-1 xl:pb-8">
      <div className="mb-3 xl:mb-4">
        {isLoading ? (
          <>
            <SkeletonBone className="h-7 w-56" />
            <SkeletonBone className="mt-2 h-4 w-72" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-[1.7rem] xl:text-4xl">
              {greeting}
            </h1>
            <p className="mt-1 text-xs text-text-muted xl:text-base">
              Here&apos;s your evaluation activity at a glance
            </p>
          </>
        )}
      </div>

      {isLoading ? (
        <ExpertStatCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          <ExpertStatCard
            highlighted
            label="Active cases"
            value={s.activeCases}
            hint="Pending your review"
          />
          <ExpertStatCard
            label="New requests"
            value={s.newRequests}
            hint="This month"
          />
          <ExpertStatCard
            label="Completed"
            value={s.completed}
            hint="All time"
          />
          <ExpertStatCard
            label="Total earnings"
            value={formatInr(s.totalEarningsInr)}
            hint="All time"
          />
        </div>
      )}
    </header>
  );
}

// Keep formatInr exported for history/profile consumers
export { formatInr };
