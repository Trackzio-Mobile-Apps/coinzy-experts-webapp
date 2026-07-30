"use client";

import { ExpertAvailabilityPromptModal } from "@/components/expert/ExpertAvailabilityPromptModal";
import {
  AVAILABILITY_PROMPT_DISMISSED_KEY,
  AVAILABILITY_PROMPT_KEY,
} from "@/lib/expert/constants";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import {
  ExpertProfileError,
  updateMyAvailability,
} from "@/lib/expert/profileService";
import { useCallback, useEffect, useState } from "react";

/**
 * After login, if the expert is unavailable, prompt them to turn availability on.
 * Mount inside the expert panel layout (with `ExpertProfileProvider`).
 */
export function ExpertAvailabilityPromptGate() {
  const { profile, hydrateProfile } = useExpertProfile();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!profile || profile.isAvailableForRequests) return;
    if (sessionStorage.getItem(AVAILABILITY_PROMPT_DISMISSED_KEY) === "1") {
      return;
    }
    if (sessionStorage.getItem(AVAILABILITY_PROMPT_KEY) !== "1") return;

    setOpen(true);
    sessionStorage.removeItem(AVAILABILITY_PROMPT_KEY);
  }, [profile]);

  const handleStayUnavailable = useCallback(() => {
    try {
      sessionStorage.setItem(AVAILABILITY_PROMPT_DISMISSED_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  }, []);

  const handleMakeAvailable = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const updated = await updateMyAvailability(true);
      hydrateProfile(updated);
      try {
        sessionStorage.removeItem(AVAILABILITY_PROMPT_DISMISSED_KEY);
      } catch {
        // ignore
      }
      setOpen(false);
    } catch (err) {
      if (err instanceof ExpertProfileError && err.code === "unauthorized") {
        return;
      }
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to update availability. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [hydrateProfile, isSaving]);

  return (
    <ExpertAvailabilityPromptModal
      open={open}
      isSaving={isSaving}
      onStayUnavailable={handleStayUnavailable}
      onMakeAvailable={() => void handleMakeAvailable()}
    />
  );
}
