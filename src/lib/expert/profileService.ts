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
    status: expert.status ?? "active",
    isAvailableForRequests: expert.isAvailableForRequests !== false,
    activeCommittedRequestCount: expert.activeCommittedRequestCount ?? 0,
    maxActiveWorkload: expert.maxActiveWorkload ?? 0,
    lastAssignedAt: expert.lastAssignedAt ?? null,
    stats: {
      activeCases: expert.activeCommittedRequestCount ?? 0,
      newRequests: 0,
      completed: expert.stats?.completedCount ?? 0,
      totalEarningsInr: 0,
      avgCompletionHours: expert.stats?.avgCompletionHoursLast5 ?? null,
    },
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
