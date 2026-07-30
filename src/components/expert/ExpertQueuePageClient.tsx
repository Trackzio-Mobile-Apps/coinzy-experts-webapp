"use client";

import { ExpertDashboardSection } from "@/components/expert/ExpertDashboardSection";
import { ExpertQueuePageBody } from "@/components/expert/ExpertQueuePageBody";
import { ExpertToast } from "@/components/expert/ExpertToast";
import { QUEUE_PAGE_SIZE } from "@/lib/expert/constants";
import { buildQueueList } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useExpertQueuePolling } from "@/lib/expert/useExpertQueuePolling";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function ExpertQueuePageClient() {
  const searchParams = useSearchParams();
  const { offers, acceptedRequests, isLoading, error } = useExpertPanelData();
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showNewRequestToast, setShowNewRequestToast] = useState(false);
  const [newRequestCount, setNewRequestCount] = useState(0);

  const handleNewOffers = useCallback((count: number) => {
    setNewRequestCount(count);
    setShowNewRequestToast(true);
  }, []);

  useExpertQueuePolling({
    enabled: !isLoading && !error,
    onNewOffers: handleNewOffers,
  });

  useEffect(() => {
    if (
      window.sessionStorage.getItem("coinzy_expert_login_success") !== "1"
    ) {
      return;
    }
    window.sessionStorage.removeItem("coinzy_expert_login_success");
    const showTimer = window.setTimeout(() => {
      setShowLoginToast(true);
    }, 0);
    return () => window.clearTimeout(showTimer);
  }, []);

  const closeLoginToast = useCallback(() => setShowLoginToast(false), []);
  const closeNewRequestToast = useCallback(
    () => setShowNewRequestToast(false),
    [],
  );

  const newRequestMessage =
    newRequestCount === 1
      ? "1 new request in your queue"
      : `${newRequestCount} new requests in your queue`;

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
      <ExpertToast
        open={showLoginToast}
        message="Login successful"
        onClose={closeLoginToast}
      />
      <ExpertToast
        open={showNewRequestToast}
        title="New request"
        message={newRequestMessage}
        variant="info"
        onClose={closeNewRequestToast}
      />
    </ExpertDashboardSection>
  );
}
