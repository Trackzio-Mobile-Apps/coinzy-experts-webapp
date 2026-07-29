"use client";

import { ExpertAvailabilityPromptModal } from "@/components/expert/ExpertAvailabilityPromptModal";
import { ExpertDashboardSection } from "@/components/expert/ExpertDashboardSection";
import { ExpertQueuePageBody } from "@/components/expert/ExpertQueuePageBody";
import { ExpertToast } from "@/components/expert/ExpertToast";
import {
  QUEUE_AUTO_REFRESH_MS,
  QUEUE_PAGE_SIZE,
  SUBMIT_SUCCESS_TOAST_KEY,
} from "@/lib/expert/constants";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import {
  ExpertProfileError,
  updateMyAvailability,
} from "@/lib/expert/profileService";
import { buildQueueList } from "@/lib/expert/requestMappers";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function ExpertQueuePageClient() {
  const searchParams = useSearchParams();
  const { offers, acceptedRequests, isLoading, error, refresh } =
    useExpertPanelData();
  const { profile, isInitialized, hydrateProfile } = useExpertProfile();
  const [showNewRequestsToast, setShowNewRequestsToast] = useState(false);
  const [newRequestCount, setNewRequestCount] = useState(0);
  const [showSubmitSuccessToast, setShowSubmitSuccessToast] = useState(false);
  const [showAvailabilityPrompt, setShowAvailabilityPrompt] = useState(false);
  const [isMakingAvailable, setIsMakingAvailable] = useState(false);
  const shouldCheckAvailabilityAfterLogin = useRef(false);
  const pendingLoginToast = useRef(false);

  useEffect(() => {
    if (
      window.sessionStorage.getItem("coinzy_expert_login_success") !== "1"
    ) {
      return;
    }
    window.sessionStorage.removeItem("coinzy_expert_login_success");
    shouldCheckAvailabilityAfterLogin.current = true;
    pendingLoginToast.current = true;
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SUBMIT_SUCCESS_TOAST_KEY) === "1") {
        sessionStorage.removeItem(SUBMIT_SUCCESS_TOAST_KEY);
        setShowSubmitSuccessToast(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Show new-request count once queue data is ready after login.
  useEffect(() => {
    if (!pendingLoginToast.current || isLoading) return;
    pendingLoginToast.current = false;
    const count = offers.length;
    if (count <= 0) return;
    setNewRequestCount(count);
    setShowNewRequestsToast(true);
  }, [isLoading, offers.length]);

  useEffect(() => {
    if (!shouldCheckAvailabilityAfterLogin.current) return;
    if (!isInitialized || !profile) return;

    shouldCheckAvailabilityAfterLogin.current = false;
    if (!profile.isAvailableForRequests) {
      setShowAvailabilityPrompt(true);
    }
  }, [isInitialized, profile]);

  // Keep the home queue fresh while this page is open / visible.
  useEffect(() => {
    const silentRefresh = () => {
      if (document.visibilityState === "hidden") return;
      void refresh({ silent: true });
    };

    const intervalId = window.setInterval(
      silentRefresh,
      QUEUE_AUTO_REFRESH_MS,
    );

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refresh]);

  const closeNewRequestsToast = useCallback(
    () => setShowNewRequestsToast(false),
    [],
  );

  const closeSubmitSuccessToast = useCallback(
    () => setShowSubmitSuccessToast(false),
    [],
  );

  const dismissAvailabilityPrompt = useCallback(() => {
    if (isMakingAvailable) return;
    setShowAvailabilityPrompt(false);
  }, [isMakingAvailable]);

  const makeAvailable = useCallback(async () => {
    if (isMakingAvailable) return;
    setIsMakingAvailable(true);
    try {
      const updated = await updateMyAvailability(true);
      hydrateProfile(updated);
      setShowAvailabilityPrompt(false);
    } catch (err) {
      if (err instanceof ExpertProfileError && err.code === "unauthorized") {
        setShowAvailabilityPrompt(false);
        return;
      }
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to update availability. Please try again.",
      );
    } finally {
      setIsMakingAvailable(false);
    }
  }, [hydrateProfile, isMakingAvailable]);

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

  const newRequestsMessage =
    newRequestCount === 1
      ? "1 new evaluation request received"
      : `${newRequestCount} new evaluation requests received`;

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
        open={showNewRequestsToast}
        variant="info"
        message={newRequestsMessage}
        onClose={closeNewRequestsToast}
        durationMs={5200}
      />
      <ExpertToast
        open={showSubmitSuccessToast}
        variant="success"
        message="Evaluation submitted successfully"
        onClose={closeSubmitSuccessToast}
        durationMs={4500}
      />
      <ExpertAvailabilityPromptModal
        open={showAvailabilityPrompt}
        isSaving={isMakingAvailable}
        onStayUnavailable={dismissAvailabilityPrompt}
        onMakeAvailable={() => {
          void makeAvailable();
        }}
      />
    </ExpertDashboardSection>
  );
}
