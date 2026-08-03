"use client";

import { ExpertEvaluationRequestView } from "@/components/expert/ExpertEvaluationRequestView";
import { ExpertRequestDetailSkeleton } from "@/components/expert/ExpertSkeleton";
import {
  acceptOffer,
  ExpertOffersError,
  formatOfferErrorMessage,
  skipOffer,
} from "@/lib/expert/offersService";
import {
  clearEvaluationDraft,
  loadEvaluationDraftReportId,
  saveEvaluationDraftReportId,
} from "@/lib/expert/evaluationDraftStorage";
import { buildEvaluationDetail } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import {
  ensureDraftReport,
  extractReportIdFromRequest,
} from "@/lib/expert/reportsService";
import { formatRequestId, normalizeMongoId } from "@/lib/expert/format";
import type {
  BackendRequest,
  EvaluationRequestDetail,
} from "@/lib/expert/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  /** After a successful Accept — keeps the evaluation form open. */
  const [accepted, setAccepted] = useState(false);
  const [showAcceptedToast, setShowAcceptedToast] = useState(false);
  /** Report id from accept/create — list API often omits it until later. */
  const [knownReportId, setKnownReportId] = useState<string | null>(() =>
    loadEvaluationDraftReportId(requestId),
  );

  const requestFromStore = useMemo(
    () =>
      requests.find((r) => normalizeMongoId(r._id) === requestId) ??
      acceptedRequests.find((r) => normalizeMongoId(r._id) === requestId) ??
      offers.find((o) => normalizeMongoId(o.request._id) === requestId)?.request,
    [requests, acceptedRequests, offers, requestId],
  );

  // Keep the last known request so background refreshes cannot flash
  // "Request not found" while offers/accepted lists catch up after Accept.
  const [stickyRequest, setStickyRequest] = useState<BackendRequest | null>(
    null,
  );
  const storeRequestKey = requestFromStore
    ? `${normalizeMongoId(requestFromStore._id)}:${requestFromStore.status}`
    : "";
  const [seenStoreKey, setSeenStoreKey] = useState(storeRequestKey);
  if (storeRequestKey !== seenStoreKey) {
    setSeenStoreKey(storeRequestKey);
    if (requestFromStore) {
      setStickyRequest(requestFromStore);
    }
  } else if (
    accepted &&
    !requestFromStore &&
    stickyRequest &&
    stickyRequest.status !== "accepted"
  ) {
    setStickyRequest({ ...stickyRequest, status: "accepted" as const });
  }
  const request = requestFromStore ?? stickyRequest;

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

  useEffect(() => {
    const fromRequest = request
      ? extractReportIdFromRequest(request)
      : null;
    const fromLocal = loadEvaluationDraftReportId(requestId);
    const next = fromRequest || fromLocal;
    if (next) {
      setKnownReportId((prev) => prev || next);
      saveEvaluationDraftReportId(requestId, next);
    }
  }, [request, requestId]);

  const detail = useMemo<EvaluationRequestDetail | null>(() => {
    if (!request) return null;

    const isOffered = request.status === "offered";
    const lostOffer = isOffered && !actionOfferId && !accepted;

    // Once accepted on this screen, force accepted status so the form opens
    // even if refresh is still catching up.
    const requestForView =
      accepted || request.status === "accepted"
        ? { ...request, status: "accepted" as const }
        : request;

    return buildEvaluationDetail({
      request: requestForView,
      offerId: actionOfferId,
      unavailable: unavailable || lostOffer,
      reportId: knownReportId,
    });
  }, [request, actionOfferId, unavailable, accepted, knownReportId]);

  // Already accepted on the server → open evaluation form.
  useEffect(() => {
    if (request?.status === "accepted") {
      setAccepted(true);
      setUnavailable(false);
    }
  }, [request?.status]);

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
      setAccepted(true);
      setShowAcceptedToast(true);
      setUnavailable(false);
      const coinName =
        typeof request?.coinTitle === "string" && request.coinTitle.trim()
          ? request.coinTitle.trim()
          : undefined;
      try {
        const draft = await ensureDraftReport({
          requestId,
          reportId: knownReportId,
          coinName,
        });
        const reportId = normalizeMongoId(draft._id);
        if (reportId) {
          setKnownReportId(reportId);
          saveEvaluationDraftReportId(requestId, reportId);
        }
      } catch (draftErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[expert] initial draft create failed", draftErr);
        }
      }
      // Keep the evaluation form mounted — sync queue data in the background.
      await refresh({ silent: true });
    } catch (err) {
      const status = err instanceof ExpertOffersError ? err.status : 0;
      const rawMessage =
        err instanceof Error ? err.message : "Unable to accept offer.";

      // Offer may be stale while the request is already yours — recover after refresh.
      const refreshed = await refresh({ silent: true });
      const latestRequest =
        refreshed?.acceptedRequests.find(
          (r) => normalizeMongoId(r._id) === requestId,
        ) ??
        refreshed?.requests.find(
          (r) => normalizeMongoId(r._id) === requestId,
        );

      if (latestRequest?.status === "accepted") {
        setAccepted(true);
        setUnavailable(false);
        setAcceptError(null);
        const recoveredId = extractReportIdFromRequest(latestRequest);
        if (recoveredId) {
          setKnownReportId(recoveredId);
          saveEvaluationDraftReportId(requestId, recoveredId);
        }
        return;
      }

      const { message, markUnavailable } = formatOfferErrorMessage(
        rawMessage,
        status,
        "accept",
      );

      if (markUnavailable) {
        setUnavailable(true);
        setAcceptError(null);
      } else {
        setAcceptError(message);
      }
    } finally {
      setAccepting(false);
    }
  }, [actionOfferId, accepting, requestId, refresh, request, knownReportId]);

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
      setKnownReportId(null);
      await refresh();
      router.push("/expert/queue");
    } catch (err) {
      const status = err instanceof ExpertOffersError ? err.status : 0;
      const rawMessage =
        err instanceof Error ? err.message : "Unable to reassign offer.";
      const { message } = formatOfferErrorMessage(rawMessage, status, "skip");
      setReassignError(message);
    } finally {
      setReassigning(false);
    }
  }, [actionOfferId, reassigning, requestId, refresh, router]);

  // Only skeleton on first load — never unmount the form after it has opened.
  if (isLoading && !detail) {
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
      showAcceptedToast={showAcceptedToast}
      onAccept={handleAccept}
      onReassign={handleReassign}
      onDismissToast={() => setShowAcceptedToast(false)}
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
