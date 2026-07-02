"use client";

import { ExpertDashboardSection } from "@/components/expert/ExpertDashboardSection";
import { ExpertQueuePageBody } from "@/components/expert/ExpertQueuePageBody";
import { QUEUE_PAGE_SIZE } from "@/lib/expert/constants";
import { buildQueueList } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function ExpertQueuePageClient() {
  const searchParams = useSearchParams();
  const { offers, acceptedRequests, isLoading, error } = useExpertPanelData();

  const allItems = useMemo(
    () => buildQueueList(offers, acceptedRequests),
    [offers, acceptedRequests],
  );

  const raw = parseInt(String(searchParams.get("page") ?? "1"), 10);
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / QUEUE_PAGE_SIZE));
  const page = Number.isFinite(raw)
    ? Math.min(Math.max(1, raw), totalPages)
    : 1;

  const start = (page - 1) * QUEUE_PAGE_SIZE;
  const slice = allItems.slice(start, start + QUEUE_PAGE_SIZE);

  return (
    <ExpertDashboardSection>
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <ExpertQueuePageBody
        items={slice}
        page={page}
        totalItems={totalItems}
        isLoading={isLoading}
      />
    </ExpertDashboardSection>
  );
}
