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
  const {
    offers,
    acceptedRequests,
    isLoading: panelLoading,
  } = useExpertPanelData();

  if (!profile) return null;

  const greeting = getExpertGreeting(profile.firstName);

  return (
    <>
      <ExpertDashboardHeader
        greeting={greeting}
        stats={{
          // Live from accepted requests once panel data is available.
          activeCases:
            panelLoading && acceptedRequests.length === 0
              ? profile.activeCommittedRequestCount
              : acceptedRequests.length,
          newRequests: offers.length,
          completed: profile.stats.completed,
          avgTurnaround: formatAvgTurnaround(profile.stats.avgCompletionHours),
        }}
        isLoading={panelLoading}
      />
      <div>{children}</div>
    </>
  );
}
