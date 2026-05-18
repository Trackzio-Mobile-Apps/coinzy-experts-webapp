import { ExpertDashboardHeader } from "@/components/expert/ExpertDashboardHeader";
import { ExpertDraftsPageBody } from "@/components/expert/ExpertDraftsPageBody";
import {
  getExpertGreeting,
  MOCK_DASHBOARD_STATS,
  MOCK_EXPERT_USER,
  MOCK_DRAFT_ITEMS,
} from "@/data/expert-panel.mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drafts",
};

export default function ExpertDraftsPage() {
  return (
    <>
      <ExpertDashboardHeader
        greeting={getExpertGreeting(MOCK_EXPERT_USER.firstName)}
        stats={MOCK_DASHBOARD_STATS}
      />
      <div className="pt-4">
        <ExpertDraftsPageBody items={MOCK_DRAFT_ITEMS} />
      </div>
    </>
  );
}
