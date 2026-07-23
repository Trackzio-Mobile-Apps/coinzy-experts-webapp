"use client";

import { ExpertDashboardHeader } from "@/components/expert/ExpertDashboardHeader";
import { formatAvgTurnaround, getExpertGreeting } from "@/lib/expert/format";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import type { ReactNode } from "react";

type ExpertDashboardSectionProps = {
  children: ReactNode;
};

export function ExpertDashboardSection({ children }: ExpertDashboardSectionProps) {
  const { profile } = useExpertProfile();
  const { offers, isLoading: panelLoading } = useExpertPanelData();

  if (!profile) return null;

  const greeting = getExpertGreeting(profile.firstName);

  return (
    <>
      <ExpertDashboardHeader
        greeting={greeting}
        stats={{
          activeCases: profile.activeCommittedRequestCount,
          newRequests: offers.length,
          completed: profile.stats.completed,
          totalEarningsInr: profile.stats.totalEarningsInr,
          avgTurnaround: formatAvgTurnaround(profile.stats.avgCompletionHours),
        }}
        isLoading={panelLoading}
      />
      <div>{children}</div>
    </>
  );
}
