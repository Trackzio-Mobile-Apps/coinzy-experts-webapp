"use client";

import { ExpertDraftsPageBody } from "@/components/expert/ExpertDraftsPageBody";
import { evaluateFormProgress } from "@/lib/expert/evaluationForm";
import { loadEvaluationDraft } from "@/lib/expert/evaluationDraftStorage";
import { normalizeMongoId } from "@/lib/expert/format";
import {
  filterActiveAcceptedRequests,
  mapRequestToDraftItem,
} from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import {
  extractReportIdFromRequest,
  getReportForRequest,
  isDraftReport,
  reportProgressPercent,
} from "@/lib/expert/reportsService";
import type { DraftListItem } from "@/lib/expert/types";
import { useEffect, useState } from "react";

export function ExpertDraftsPageClient() {
  const { acceptedRequests, isLoading, error } = useExpertPanelData();
  const [items, setItems] = useState<DraftListItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoadingDrafts(true);
      try {
        const activeRequests = filterActiveAcceptedRequests(acceptedRequests);
        const rows = await Promise.all(
          activeRequests.map(async (request) => {
            const requestId = normalizeMongoId(request._id);
            const local = loadEvaluationDraft(requestId);
            const localProgress = local
              ? evaluateFormProgress(local).percent
              : 0;

            let progress = localProgress;
            const reportId = extractReportIdFromRequest(request);
            if (reportId) {
              const report = await getReportForRequest(requestId, { request });
              if (report && isDraftReport(report)) {
                progress = Math.max(progress, reportProgressPercent(report));
              }
            }

            return mapRequestToDraftItem(request, progress);
          }),
        );

        if (!cancelled) {
          setItems(rows);
        }
      } finally {
        if (!cancelled) setLoadingDrafts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [acceptedRequests]);

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <ExpertDraftsPageBody
        items={items}
        isLoading={isLoading || loadingDrafts}
      />
    </>
  );
}
