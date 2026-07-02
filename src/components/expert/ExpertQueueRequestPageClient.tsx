"use client";

import { ExpertEvaluationRequestView } from "@/components/expert/ExpertEvaluationRequestView";
import { acceptOffer } from "@/lib/expert/offersService";
import { buildEvaluationDetail } from "@/lib/expert/requestMappers";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { formatRequestId } from "@/lib/expert/format";
import type { EvaluationRequestDetail } from "@/lib/expert/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ExpertQueueRequestPageClientProps = {
  requestId: string;
};

export function ExpertQueueRequestPageClient({
  requestId,
}: ExpertQueueRequestPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId") ?? undefined;
  const { offers, requests, acceptedRequests, isLoading, refresh } =
    useExpertPanelData();
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const request = useMemo(
    () =>
      requests.find((r) => r._id === requestId) ??
      acceptedRequests.find((r) => r._id === requestId) ??
      offers.find((o) => o.request._id === requestId)?.request,
    [requests, acceptedRequests, offers, requestId],
  );

  const matchedOffer = useMemo(
    () =>
      offers.find(
        (o) =>
          o._id === offerId ||
          o.request._id === requestId,
      ),
    [offers, offerId, requestId],
  );

  const detail = useMemo<EvaluationRequestDetail | null>(() => {
    if (!request) return null;
    return buildEvaluationDetail({
      request,
      offerId: matchedOffer?._id,
      unavailable: false,
    });
  }, [request, matchedOffer]);

  useEffect(() => {
    if (!matchedOffer) return;
    if (request?.status === "accepted" || request?.status === "completed") {
      return;
    }
    if (request?.status !== "offered") return;
    let cancelled = false;

    void (async () => {
      setAccepting(true);
      setAcceptError(null);
      try {
        await acceptOffer(matchedOffer._id);
        if (!cancelled) await refresh();
      } catch (err) {
        if (!cancelled) {
          setAcceptError(
            err instanceof Error ? err.message : "Unable to accept offer.",
          );
        }
      } finally {
        if (!cancelled) setAccepting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchedOffer?._id, request?.status, refresh]);

  if (isLoading || accepting) {
    return (
      <p className="text-sm text-text-muted">
        {accepting ? "Accepting request…" : "Loading request…"}
      </p>
    );
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

  if (acceptError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-semibold text-red-900">{acceptError}</p>
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
