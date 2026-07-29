"use client";

import { ExpertDraftsPageBody } from "@/components/expert/ExpertDraftsPageBody";
import { evaluateFormProgress } from "@/lib/expert/evaluationForm";
import { loadEvaluationDraft } from "@/lib/expert/evaluationDraftStorage";
import { normalizeMongoId } from "@/lib/expert/format";
import { mapRequestToDraftItem } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import {
  getReportByRequestId,
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
        const rows = await Promise.all(
          acceptedRequests.map(async (request) => {
            const requestId = normalizeMongoId(request._id);
            const local = loadEvaluationDraft(requestId);
            const localProgress = local
              ? evaluateFormProgress(local).percent
              : 0;

            try {
              const report = await getReportByRequestId(requestId);
              // Submitted reports belong in History, not Drafts.
              if (report && !isDraftReport(report)) return null;

              const serverProgress = report ? reportProgressPercent(report) : 0;
              const progress = Math.max(serverProgress, localProgress);
              // Show every accepted (in-progress) request, even at 0% — History
              // already labels these as drafts after accept.
              return mapRequestToDraftItem(request, progress);
            } catch {
              // No server report yet — still an accepted draft.
              return mapRequestToDraftItem(request, localProgress);
            }
          }),
        );

        if (!cancelled) {
          setItems(rows.filter((row): row is DraftListItem => row != null));
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
