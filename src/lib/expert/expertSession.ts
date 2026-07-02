import type { ExpertProfile } from "@/lib/expert/types";

const EXPERT_PROFILE_STORAGE_KEY = "coinzy_expert_profile";

let memoryProfile: ExpertProfile | null = null;

export function getStoredExpertProfile(): ExpertProfile | null {
  if (memoryProfile) return memoryProfile;

  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(EXPERT_PROFILE_STORAGE_KEY);
  if (!raw) return null;

  try {
    memoryProfile = JSON.parse(raw) as ExpertProfile;
    return memoryProfile;
  } catch {
    sessionStorage.removeItem(EXPERT_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function setStoredExpertProfile(
  profile: ExpertProfile,
  options?: { persist?: boolean },
): void {
  memoryProfile = profile;

  if (typeof window === "undefined") return;

  if (options?.persist !== false) {
    sessionStorage.setItem(EXPERT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export function clearStoredExpertProfile(): void {
  memoryProfile = null;

  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EXPERT_PROFILE_STORAGE_KEY);
}
