"use client";

import { normalizeMongoId } from "@/lib/expert/format";
import { buildQueueList } from "@/lib/expert/requestMappers";
import {
  hydrateServerReportMap,
  syncReportMappingsFromRequests,
} from "@/lib/expert/reportsService";
import {
  getAcceptedRequests,
  getExpertOffers,
  getExpertRequests,
} from "@/lib/expert/requestsService";
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
  useState,
  type ReactNode,
} from "react";

type ExpertPanelRefreshResult = {
  offers: BackendOffer[];
  requests: BackendRequest[];
  acceptedRequests: BackendRequest[];
};

type ExpertPanelRefreshScope = "all" | "offers" | "requests";

type ExpertPanelRefreshOptions = {
  /** Skip loading UI — for background polling on the queue home page. */
  silent?: boolean;
  /** Which REST resources to refetch. Defaults to all. */
  scope?: ExpertPanelRefreshScope;
};

type ExpertPanelDataContextValue = {
  offers: BackendOffer[];
  requests: BackendRequest[];
  acceptedRequests: BackendRequest[];
  isLoading: boolean;
  error: string | null;
  navCounts: ExpertNavCounts;
  refresh: (
    options?: ExpertPanelRefreshOptions,
  ) => Promise<ExpertPanelRefreshResult | null>;
};

const ExpertPanelDataContext =
  createContext<ExpertPanelDataContextValue | null>(null);

export function ExpertPanelDataProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<BackendOffer[]>([]);
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<BackendRequest[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: ExpertPanelRefreshOptions) => {
    const silent = options?.silent ?? false;
    const scope = options?.scope ?? "all";
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      let nextOffers: BackendOffer[] | undefined;
      let nextRequests: BackendRequest[] | undefined;
      let nextAccepted: BackendRequest[] | undefined;

      if (scope === "all" || scope === "requests") {
        await hydrateServerReportMap();
      }

      if (scope === "all" || scope === "offers") {
        nextOffers = await getExpertOffers();
        setOffers(nextOffers);
        console.log("[expert] GET /experts/me/offers", nextOffers);
      }

      if (scope === "all" || scope === "requests") {
        [nextRequests, nextAccepted] = await Promise.all([
          getExpertRequests(),
          getAcceptedRequests(),
        ]);
        syncReportMappingsFromRequests(nextRequests);
        syncReportMappingsFromRequests(nextAccepted);
        setRequests(nextRequests);
        setAcceptedRequests(nextAccepted);
        console.log("[expert] GET /experts/me/requests", nextRequests);
        console.log(
          "[expert] GET /experts/me/requests?status=accepted",
          nextAccepted,
        );
      }

      return {
        offers: nextOffers ?? [],
        requests: nextRequests ?? [],
        acceptedRequests: nextAccepted ?? [],
      };
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error ? err.message : "Unable to load panel data.",
        );
      }
      return null;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const navCounts = useMemo<ExpertNavCounts>(() => {
    const queue = buildQueueList(offers, acceptedRequests).length;
    // Count accepted requests that have local draft progress (server drafts
    // hydrate this on open; Drafts page also loads server drafts).
    const drafts = acceptedRequests.length;
    return { queue, drafts };
  }, [offers, acceptedRequests]);

  const value = useMemo(
    () => ({
      offers,
      requests,
      acceptedRequests,
      isLoading,
      error,
      navCounts,
      refresh,
    }),
    [
      offers,
      requests,
      acceptedRequests,
      isLoading,
      error,
      navCounts,
      refresh,
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
