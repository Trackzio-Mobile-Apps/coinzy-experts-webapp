"use client";

import { ExpertEvaluationRequestView } from "@/components/expert/ExpertEvaluationRequestView";
import { ExpertRequestDetailSkeleton } from "@/components/expert/ExpertSkeleton";
import { SUBMIT_SUCCESS_TOAST_KEY } from "@/lib/expert/constants";
import {
  acceptOffer,
  ExpertOffersError,
  skipOffer,
} from "@/lib/expert/offersService";
import { clearEvaluationDraft } from "@/lib/expert/evaluationDraftStorage";
import { buildEvaluationDetail } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import { formatRequestId, normalizeMongoId } from "@/lib/expert/format";
import {
  getAcceptedRequests,
  getExpertRequests,
} from "@/lib/expert/requestsService";
import type {
  BackendRequest,
  EvaluationRequestDetail,
} from "@/lib/expert/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

async function findOwnedRequestForExpert(
  id: string,
): Promise<BackendRequest | null> {
  const normalized = normalizeMongoId(id);
  if (!normalized) return null;
  try {
    const [accepted, all] = await Promise.all([
      getAcceptedRequests(),
      getExpertRequests(),
    ]);
    // Prefer explicit accepted, but any row in /me/requests for this id is ours.
    return (
      accepted.find((r) => normalizeMongoId(r._id) === normalized) ??
      all.find((r) => normalizeMongoId(r._id) === normalized) ??
      null
    );
  } catch {
    return null;
  }
}

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
  const { offers, requests, acceptedRequests, isLoading, refresh, applyAcceptedRequest, removeAcceptedRequest } =
    useExpertPanelData();
  const { refreshProfile, hydrateProfile, profile } = useExpertProfile();
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [reassignError, setReassignError] = useState<string | null>(null);
  /** Only set after Accept fails because another expert took the request. */
  const [unavailable, setUnavailable] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);
  // Keep the request visible even if a background queue refresh drops the offer.
  const requestSnapshotRef = useRef<BackendRequest | null>(null);
  const offerIdSnapshotRef = useRef<string | undefined>(offerId);

  const liveRequest = useMemo(
    () =>
      requests.find((r) => normalizeMongoId(r._id) === requestId) ??
      acceptedRequests.find((r) => normalizeMongoId(r._id) === requestId) ??
      offers.find((o) => normalizeMongoId(o.request._id) === requestId)?.request,
    [requests, acceptedRequests, offers, requestId],
  );

  useEffect(() => {
    if (liveRequest) {
      requestSnapshotRef.current = liveRequest;
    }
  }, [liveRequest]);

  const request = liveRequest ?? requestSnapshotRef.current;

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

  useEffect(() => {
    if (matchedOfferId) {
      offerIdSnapshotRef.current = matchedOfferId;
    } else if (offerId) {
      offerIdSnapshotRef.current = offerId;
    }
  }, [matchedOfferId, offerId]);

  // Prefer live offer match; keep URL / snapshotted offerId after list refresh
  // or accept so Accept / reassign can still call the API.
  const actionOfferId =
    matchedOfferId ?? offerIdSnapshotRef.current ?? offerId;

  const detail = useMemo<EvaluationRequestDetail | null>(() => {
    if (!request) return null;

    const requestForView =
      justAccepted && request.status === "offered"
        ? { ...request, status: "accepted" as const }
        : request;

    return buildEvaluationDetail({
      request: requestForView,
      offerId: actionOfferId,
      // Never mark unavailable from a missing offer in the list — only after
      // the user attempts Accept and the API says it was taken.
      unavailable,
    });
  }, [request, actionOfferId, unavailable, justAccepted]);

  const markTakenByAnotherExpert = useCallback(() => {
    setUnavailable(true);
    setAcceptError(null);
  }, []);

  const recoverAsAccepted = useCallback(
    (owned: BackendRequest) => {
      applyAcceptedRequest({ ...owned, status: "accepted" });
      setJustAccepted(true);
      setUnavailable(false);
      setAcceptError(null);
      void refreshProfile({ silent: true });
      void refresh({ silent: true });
    },
    [applyAcceptedRequest, refresh, refreshProfile],
  );

  const handleAccept = useCallback(async () => {
    if (accepting) return;

    setAccepting(true);
    setAcceptError(null);
    setReassignError(null);
    let offerToAccept = actionOfferId;
    try {
      // If the local offer list went stale, refresh once then retry lookup.
      if (!offerToAccept) {
        await refresh({ silent: true });
        offerToAccept = offerIdSnapshotRef.current ?? offerId;
      }

      if (!offerToAccept) {
        const owned = await findOwnedRequestForExpert(requestId);
        if (owned) {
          recoverAsAccepted(owned);
          return;
        }
        const local = requestSnapshotRef.current;
        if (local) {
          recoverAsAccepted(local);
          return;
        }
        markTakenByAnotherExpert();
        return;
      }

      console.log("[expert] accepting offer", {
        offerId: offerToAccept,
        requestId,
      });
      const accepted = await acceptOffer(offerToAccept);
      recoverAsAccepted(accepted.request);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to accept offer.";
      const status = err instanceof ExpertOffersError ? err.status : 0;
      console.warn("[expert] accept failed", { status, message, requestId });

      const looksAlreadyAccepted =
        status === 409 ||
        /already|assigned|taken|unavailable|expired|not found/i.test(message);

      if (looksAlreadyAccepted) {
        // Backend often returns 409 "already accepted by expert" for *this*
        // expert, while /me/requests may lag or omit the row. Recover from
        // owned lists first, then from the offer/request we already have.
        const owned = await findOwnedRequestForExpert(requestId);
        if (owned) {
          recoverAsAccepted(owned);
          return;
        }

        const offerIdNorm = offerToAccept
          ? normalizeMongoId(offerToAccept)
          : "";
        const fromOffer = offers.find(
          (o) =>
            (offerIdNorm && normalizeMongoId(o._id) === offerIdNorm) ||
            normalizeMongoId(o.request._id) === requestId,
        )?.request;
        const local = fromOffer ?? requestSnapshotRef.current;
        if (local) {
          console.log(
            "[expert] recovering accept from local request snapshot after 409",
            { requestId, status: local.status },
          );
          recoverAsAccepted(local);
          return;
        }

        markTakenByAnotherExpert();
        void refresh({ silent: true });
        return;
      }
      setAcceptError(message);
    } finally {
      setAccepting(false);
    }
  }, [
    actionOfferId,
    accepting,
    offerId,
    requestId,
    offers,
    refresh,
    recoverAsAccepted,
    markTakenByAnotherExpert,
  ]);

  // If the request is already accepted for this expert, open the evaluation form.
  useEffect(() => {
    if (!request || request.status !== "accepted") return;
    setJustAccepted(true);
    setUnavailable(false);
  }, [request]);

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
      await refresh({ silent: true });
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

  if (isLoading && !request) {
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
        removeAcceptedRequest(requestId);
        if (profile) {
          hydrateProfile({
            ...profile,
            activeCommittedRequestCount: Math.max(
              0,
              profile.activeCommittedRequestCount - 1,
            ),
            stats: {
              ...profile.stats,
              activeCases: Math.max(0, profile.stats.activeCases - 1),
              completed: profile.stats.completed + 1,
            },
          });
        }
        void refreshProfile({ silent: true });
        await refresh({ silent: true });
        try {
          sessionStorage.setItem(SUBMIT_SUCCESS_TOAST_KEY, "1");
        } catch {
          /* ignore */
        }
        router.push("/expert/queue");
      }}
    />
  );
}

export function queueRequestTitle(requestId: string): string {
  return `REQ-${formatRequestId(requestId)}`;
}
