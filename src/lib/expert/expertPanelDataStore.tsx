"use client";

import { normalizeMongoId } from "@/lib/expert/format";
import { buildQueueList } from "@/lib/expert/requestMappers";
import {
  getAcceptedRequests,
  getExpertOffers,
  getExpertRequests,
} from "@/lib/expert/requestsService";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import type {
  BackendOffer,
  BackendRequest,
  ExpertNavCounts,
} from "@/lib/expert/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type RefreshOptions = {
  /** When true, keep showing current data without a loading flash. */
  silent?: boolean;
};

type ExpertPanelDataContextValue = {
  offers: BackendOffer[];
  requests: BackendRequest[];
  acceptedRequests: BackendRequest[];
  isLoading: boolean;
  error: string | null;
  navCounts: ExpertNavCounts;
  refresh: (options?: RefreshOptions) => Promise<void>;
  /** Immediately reflect an accepted offer in queue / Active cases / tab badges. */
  applyAcceptedRequest: (request: BackendRequest, offerId?: string) => void;
  /** Remove a request from active work after report submit. */
  removeAcceptedRequest: (requestId: string) => void;
};

const ExpertPanelDataContext =
  createContext<ExpertPanelDataContextValue | null>(null);

export function ExpertPanelDataProvider({ children }: { children: ReactNode }) {
  const { refreshProfile, hydrateProfile, profile } = useExpertProfile();
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const [offers, setOffers] = useState<BackendOffer[]>([]);
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<BackendRequest[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  /** Bumps when local drafts change so Drafts tab badge can recompute. */
  const [draftTick, setDraftTick] = useState(0);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith("coinzy_eval_draft_")) {
        setDraftTick((value) => value + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const syncProfileActiveCount = useCallback(
    (activeCount: number) => {
      const current = profileRef.current;
      if (!current) return;
      if (current.activeCommittedRequestCount === activeCount) return;
      hydrateProfile({
        ...current,
        activeCommittedRequestCount: activeCount,
        stats: {
          ...current.stats,
          activeCases: activeCount,
        },
      });
    },
    [hydrateProfile],
  );

  const refresh = useCallback(
    async (options?: RefreshOptions) => {
      const silent = Boolean(options?.silent);

      if (refreshInFlightRef.current) {
        await refreshInFlightRef.current;
        return;
      }

      const run = (async () => {
        if (!silent) setIsLoading(true);
        if (!silent) setError(null);
        try {
          const [nextOffers, nextRequests, nextAccepted] = await Promise.all([
            getExpertOffers(),
            getExpertRequests(),
            getAcceptedRequests(),
          ]);
          console.log("[expert] GET /experts/me/offers", nextOffers);
          console.log("[expert] GET /experts/me/requests", nextRequests);
          console.log(
            "[expert] GET /experts/me/requests?status=accepted",
            nextAccepted,
          );

          // Some backends omit accepted rows from ?status=accepted while still
          // returning them on the unfiltered list — merge both sources.
          const acceptedById = new Map<string, BackendRequest>();
          for (const request of nextAccepted) {
            const id = normalizeMongoId(request._id);
            if (id) acceptedById.set(id, request);
          }
          for (const request of nextRequests) {
            if (request.status !== "accepted") continue;
            const id = normalizeMongoId(request._id);
            if (id && !acceptedById.has(id)) {
              acceptedById.set(id, request);
            }
          }
          const mergedAccepted = Array.from(acceptedById.values());

          setOffers(nextOffers);
          setRequests(nextRequests);
          setAcceptedRequests(mergedAccepted);
          syncProfileActiveCount(mergedAccepted.length);
          setError(null);
          // Keep profile stats (completed, etc.) in sync with the server.
          void refreshProfile({ silent: true });
        } catch (err) {
          // Keep existing queue data on silent poll failures.
          if (!silent) {
            setError(
              err instanceof Error ? err.message : "Unable to load panel data.",
            );
          }
        } finally {
          if (!silent) setIsLoading(false);
        }
      })();

      refreshInFlightRef.current = run;
      try {
        await run;
      } finally {
        refreshInFlightRef.current = null;
      }
    },
    [refreshProfile, syncProfileActiveCount],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyAcceptedRequest = useCallback(
    (request: BackendRequest, offerId?: string) => {
      const requestId = normalizeMongoId(request._id);
      const normalizedOfferId = offerId ? normalizeMongoId(offerId) : "";

      setOffers((prev) =>
        prev.filter((offer) => {
          if (
            normalizedOfferId &&
            normalizeMongoId(offer._id) === normalizedOfferId
          ) {
            return false;
          }
          return normalizeMongoId(offer.request._id) !== requestId;
        }),
      );

      setAcceptedRequests((prev) => {
        const without = prev.filter(
          (item) => normalizeMongoId(item._id) !== requestId,
        );
        const next = [...without, { ...request, status: "accepted" }];
        syncProfileActiveCount(next.length);
        return next;
      });

      setRequests((prev) => {
        const without = prev.filter(
          (item) => normalizeMongoId(item._id) !== requestId,
        );
        return [...without, { ...request, status: "accepted" }];
      });

      setDraftTick((value) => value + 1);
    },
    [syncProfileActiveCount],
  );

  const removeAcceptedRequest = useCallback(
    (requestId: string) => {
      const normalized = normalizeMongoId(requestId);
      setAcceptedRequests((prev) => {
        const next = prev.filter(
          (item) => normalizeMongoId(item._id) !== normalized,
        );
        syncProfileActiveCount(next.length);
        return next;
      });
      setDraftTick((value) => value + 1);
    },
    [syncProfileActiveCount],
  );

  const navCounts = useMemo<ExpertNavCounts>(() => {
    const queue = buildQueueList(offers, acceptedRequests).length;
    // All accepted (in-progress) requests are drafts — including 0% ones that
    // History already labels as drafted after accept.
    void draftTick;
    const drafts = acceptedRequests.length;
    return { queue, drafts };
  }, [offers, acceptedRequests, draftTick]);

  const value = useMemo(
    () => ({
      offers,
      requests,
      acceptedRequests,
      isLoading,
      error,
      navCounts,
      refresh,
      applyAcceptedRequest,
      removeAcceptedRequest,
    }),
    [
      offers,
      requests,
      acceptedRequests,
      isLoading,
      error,
      navCounts,
      refresh,
      applyAcceptedRequest,
      removeAcceptedRequest,
    ],
  );

  return (
    <ExpertPanelDataContext.Provider value={value}>
      {children}
    </ExpertPanelDataContext.Provider>
  );
}

export function useExpertPanelData(): ExpertPanelDataContextValue {
  const ctx = useContext(ExpertPanelDataContext);
  if (!ctx) {
    throw new Error(
      "useExpertPanelData must be used within ExpertPanelDataProvider",
    );
  }
  return ctx;
}

/** Call after saving a local evaluation draft so Drafts tab badges update. */
export function bumpExpertDraftNavCount(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "coinzy_eval_draft_nav",
    }),
  );
}
