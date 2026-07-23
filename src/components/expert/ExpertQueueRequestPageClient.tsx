"use client";

import { ExpertEvaluationRequestView } from "@/components/expert/ExpertEvaluationRequestView";
import { ExpertRequestDetailSkeleton } from "@/components/expert/ExpertSkeleton";
import {
  acceptOffer,
  ExpertOffersError,
  skipOffer,
} from "@/lib/expert/offersService";
import { clearEvaluationDraft } from "@/lib/expert/evaluationDraftStorage";
import { buildEvaluationDetail } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { formatRequestId, normalizeMongoId } from "@/lib/expert/format";
import type { EvaluationRequestDetail } from "@/lib/expert/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type ExpertQueueRequestPageClientProps = {
  requestId: string;
};

export function ExpertQueueRequestPageClient({
  requestId,
}: ExpertQueueRequestPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawOfferId = searchParams.get("offerId");
  const offerId =
    rawOfferId && rawOfferId !== "[object Object]"
      ? normalizeMongoId(rawOfferId)
      : undefined;
  const { offers, requests, acceptedRequests, isLoading, refresh } =
    useExpertPanelData();
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);

  const request = useMemo(
    () =>
      requests.find((r) => normalizeMongoId(r._id) === requestId) ??
      acceptedRequests.find((r) => normalizeMongoId(r._id) === requestId) ??
      offers.find((o) => normalizeMongoId(o.request._id) === requestId)?.request,
    [requests, acceptedRequests, offers, requestId],
  );

  const matchedOffer = useMemo(() => {
    const byOfferId = offerId
      ? offers.find((o) => normalizeMongoId(o._id) === offerId)
      : undefined;
    if (byOfferId) return byOfferId;
    return offers.find(
      (o) => normalizeMongoId(o.request._id) === requestId,
    );
  }, [offers, offerId, requestId]);

  const matchedOfferId = matchedOffer
    ? normalizeMongoId(matchedOffer._id)
    : undefined;
  // Prefer live offer match; keep URL offerId after accept so reassign can still call skip.
  const actionOfferId = matchedOfferId ?? offerId;

  const detail = useMemo<EvaluationRequestDetail | null>(() => {
    if (!request) return null;

    const isOffered = request.status === "offered";
    const lostOffer =
      isOffered && !actionOfferId && !justAccepted;

    return buildEvaluationDetail({
      request,
      offerId: actionOfferId,
      unavailable: unavailable || lostOffer,
    });
  }, [request, actionOfferId, unavailable, justAccepted]);

  const handleAccept = useCallback(async () => {
    if (!actionOfferId || accepting) return;

    setAccepting(true);
    setAcceptError(null);
    setReassignError(null);
    try {
      console.log("[expert] accepting offer", {
        offerId: actionOfferId,
        requestId,
      });
      await acceptOffer(actionOfferId);
      setJustAccepted(true);
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to accept offer.";
      const status = err instanceof ExpertOffersError ? err.status : 0;
      if (status === 409 || /already|unavailable|expired|not found/i.test(message)) {
        setUnavailable(true);
      }
      setAcceptError(message);
    } finally {
      setAccepting(false);
    }
  }, [actionOfferId, accepting, requestId, refresh]);

  const handleReassign = useCallback(async () => {
    if (!actionOfferId || reassigning) return;

    const confirmed = window.confirm(
      "Reassign this request? It will be skipped and returned to the offer pool.",
    );
    if (!confirmed) return;

    setReassigning(true);
    setReassignError(null);
    try {
      console.log("[expert] skipping/reassigning offer", {
        offerId: actionOfferId,
        requestId,
      });
      await skipOffer(actionOfferId);
      clearEvaluationDraft(requestId);
      await refresh();
      router.push("/expert/queue");
    } catch (err) {
      const status = err instanceof ExpertOffersError ? err.status : 0;
      const message =
        err instanceof Error ? err.message : "Unable to reassign offer.";
      if (status === 409) {
        setReassignError(
          "This offer can only be skipped before you accept it. Post-accept reassignment is not available on the API yet.",
        );
      } else {
        setReassignError(message);
      }
    } finally {
      setReassigning(false);
    }
  }, [actionOfferId, reassigning, requestId, refresh, router]);

  if (isLoading) {
    return <ExpertRequestDetailSkeleton />;
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-border/80 bg-surface p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-text">Request not found</p>
        <p className="mt-2 text-sm text-text-muted">
          This request is no longer in your queue.
        </p>
        <button
          type="button"
          onClick={() => router.push("/expert/queue")}
          className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to queue
        </button>
      </div>
    );
  }

  return (
    <ExpertEvaluationRequestView
      detail={detail}
      accepting={accepting}
      acceptError={acceptError}
      reassigning={reassigning}
      reassignError={reassignError}
      showAcceptedToast={justAccepted}
      onAccept={handleAccept}
      onReassign={handleReassign}
      onDismissToast={() => setJustAccepted(false)}
      onSubmitted={async () => {
        await refresh();
        router.push("/expert/history");
      }}
    />
  );
}

export function queueRequestTitle(requestId: string): string {
  return `REQ-${formatRequestId(requestId)}`;
}
