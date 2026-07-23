"use client";

import { ExpertDraftsPageBody } from "@/components/expert/ExpertDraftsPageBody";
import { evaluateFormProgress } from "@/lib/expert/evaluationForm";
import { loadEvaluationDraft } from "@/lib/expert/evaluationDraftStorage";
import { mapRequestToDraftItem } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useMemo } from "react";

export function ExpertDraftsPageClient() {
  const { acceptedRequests, isLoading, error } = useExpertPanelData();

  const items = useMemo(
    () =>
      acceptedRequests.map((request) => {
        const draft = loadEvaluationDraft(request._id);
        const progress = draft ? evaluateFormProgress(draft).percent : 0;
        return mapRequestToDraftItem(request, progress);
      }),
    [acceptedRequests],
  );

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <ExpertDraftsPageBody items={items} isLoading={isLoading} />
    </>
  );
}
