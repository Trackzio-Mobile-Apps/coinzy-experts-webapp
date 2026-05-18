import { ExpertDashboardHeader } from "@/components/expert/ExpertDashboardHeader";
import { ExpertQueuePageBody } from "@/components/expert/ExpertQueuePageBody";
import {
  getExpertGreeting,
  MOCK_DASHBOARD_STATS,
  MOCK_EXPERT_USER,
  MOCK_QUEUE_REQUESTS,
  QUEUE_PAGE_SIZE,
} from "@/data/expert-panel.mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Queue",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ExpertQueuePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = parseInt(String(sp.page ?? "1"), 10);
  const totalItems = MOCK_QUEUE_REQUESTS.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / QUEUE_PAGE_SIZE));
  const page = Number.isFinite(raw)
    ? Math.min(Math.max(1, raw), totalPages)
    : 1;

  const start = (page - 1) * QUEUE_PAGE_SIZE;
  const slice = MOCK_QUEUE_REQUESTS.slice(start, start + QUEUE_PAGE_SIZE);

  return (
    <>
      <ExpertDashboardHeader
        greeting={getExpertGreeting(MOCK_EXPERT_USER.firstName)}
        stats={MOCK_DASHBOARD_STATS}
      />
      <div className="pt-4">
        <ExpertQueuePageBody items={slice} page={page} totalItems={totalItems} />
      </div>
    </>
  );
}
