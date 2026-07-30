import { apiClient } from "@/lib/expert/apiClient";
import { normalizeMongoId } from "@/lib/expert/format";
import type {
  BackendExpert,
  ExpertMeApiData,
  ExpertProfile,
} from "@/lib/expert/types";

export type ExpertProfileErrorCode =
  | "unauthorized"
  | "inactive"
  | "not_implemented"
  | "request_failed";

export class ExpertProfileError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: ExpertProfileErrorCode,
  ) {
    super(message);
    this.name = "ExpertProfileError";
  }
}

const INACTIVE_ACCOUNT_MESSAGE = "Expert account is not active";

export type ExpertProfileUpdatePayload = {
  name: string;
  supportedCountries: string[];
  oneLineDescription?: string | null;
  profilePicture?: string | null;
};

export function buildExpertFullName(
  firstName: string,
  lastName: string,
): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

function splitExpertName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

function mapBackendExpertToProfile(expert: BackendExpert): ExpertProfile {
  const { firstName, lastName } = splitExpertName(expert.name ?? "");

  return {
    id: normalizeMongoId(expert._id),
    email: expert.email,
    firstName,
    lastName,
    isInternal: expert.isInternal,
    status: expert.status ?? "active",
    supportedCountries: Array.isArray(expert.supportedCountries)
      ? expert.supportedCountries.filter(
          (code): code is string =>
            typeof code === "string" && code.trim().length > 0,
        )
      : [],
    isAvailableForRequests: expert.isAvailableForRequests !== false,
    activeCommittedRequestCount: expert.activeCommittedRequestCount ?? 0,
    lastAssignedAt: expert.lastAssignedAt ?? null,
    profilePicture: expert.profilePicture ?? null,
    oneLineDescription: expert.oneLineDescription ?? null,
    stats: {
      activeCases: expert.activeCommittedRequestCount ?? 0,
      newRequests: 0,
      completed: expert.stats?.completedCount ?? 0,
      totalEarningsInr: 0,
      missedDeadlineCount: expert.stats?.missedDeadlineCount ?? 0,
      avgCompletionHours: expert.stats?.avgCompletionHoursLast5 ?? null,
    },
    createdAt: expert.createdAt,
    updatedAt: expert.updatedAt,
  };
}

/**
 * Load the authenticated expert profile from `GET /experts/me`.
 * All workload, stats, and status fields come from this endpoint only.
 */
export async function getMyProfile(): Promise<ExpertProfile> {
  const { status, envelope } = await apiClient.get<ExpertMeApiData>(
    "/experts/me",
    {
      skipAuthHandling: true,
    },
  );

  console.log("[expert] GET /experts/me response", {
    status,
    error: envelope.error,
    message: envelope.message,
    data: envelope.data,
  });

  if (status === 401) {
    throw new ExpertProfileError(
      envelope.message || "Session expired. Please sign in again.",
      401,
      "unauthorized",
    );
  }

  if (status === 403) {
    throw new ExpertProfileError(
      envelope.message || INACTIVE_ACCOUNT_MESSAGE,
      403,
      "inactive",
    );
  }

  if (envelope.error || !envelope.data?.expert) {
    throw new ExpertProfileError(
      envelope.message || "Unable to load expert profile.",
      status,
      "request_failed",
    );
  }

  return mapBackendExpertToProfile(envelope.data.expert);
}

/**
 * Update expert profile on the server (`PATCH /experts/me`).
 * Persists name and supportedCountries (country codes).
 * Returns 501 until the backend implements this route.
 */
export async function updateMyProfile(
  payload: ExpertProfileUpdatePayload,
): Promise<ExpertProfile> {
  const { status, envelope } = await apiClient.patch<ExpertMeApiData>(
    "/experts/me",
    payload,
    { skipAuthHandling: true },
  );

  console.log("[expert] PATCH /experts/me response", {
    status,
    error: envelope.error,
    message: envelope.message,
    data: envelope.data,
  });

  if (status === 401) {
    throw new ExpertProfileError(
      envelope.message || "Session expired. Please sign in again.",
      401,
      "unauthorized",
    );
  }

  if (status === 403) {
    throw new ExpertProfileError(
      envelope.message || INACTIVE_ACCOUNT_MESSAGE,
      403,
      "inactive",
    );
  }

  if (status === 501) {
    throw new ExpertProfileError(
      envelope.message ||
        "Profile update is not available on the server yet. Your changes were saved on this device only.",
      501,
      "not_implemented",
    );
  }

  if (envelope.error || !envelope.data?.expert) {
    throw new ExpertProfileError(
      envelope.message || "Unable to update profile.",
      status,
      "request_failed",
    );
  }

  return mapBackendExpertToProfile(envelope.data.expert);
}

/**
 * Update whether this expert should be considered for future request allocation.
 * Does not affect existing open offers or already accepted work.
 */
export async function updateMyAvailability(
  isAvailableForRequests: boolean,
): Promise<ExpertProfile> {
  const { status, envelope } = await apiClient.put<ExpertMeApiData>(
    "/experts/me/availability",
    { isAvailableForRequests },
  );

  if (status === 401) {
    throw new ExpertProfileError(
      envelope.message || "Session expired. Please sign in again.",
      401,
      "unauthorized",
    );
  }

  if (status === 403) {
    throw new ExpertProfileError(
      envelope.message || INACTIVE_ACCOUNT_MESSAGE,
      403,
      "inactive",
    );
  }

  if (envelope.error || !envelope.data?.expert) {
    throw new ExpertProfileError(
      envelope.message || "Unable to update availability.",
      status,
      "request_failed",
    );
  }

  return mapBackendExpertToProfile(envelope.data.expert);
}
