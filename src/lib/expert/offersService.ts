import { apiClient } from "@/lib/expert/apiClient";
import { normalizeMongoId } from "@/lib/expert/format";
import type { BackendOffer, BackendRequest } from "@/lib/expert/types";

type AcceptOfferApiData = {
  request: BackendRequest;
  offer: BackendOffer;
};

export class ExpertOffersError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ExpertOffersError";
  }
}

export async function acceptOffer(offerId: string) {
  const normalizedId = normalizeMongoId(offerId);
  if (!normalizedId) {
    throw new ExpertOffersError("Invalid offer id.", 400);
  }

  const { status, envelope } = await apiClient.post<AcceptOfferApiData>(
    `/experts/offers/${encodeURIComponent(normalizedId)}/accept`,
    undefined,
    { skipAuthHandling: true },
  );

  if (envelope.error || !envelope.data?.request) {
    throw new ExpertOffersError(
      envelope.message || "Unable to accept offer.",
      status,
    );
  }

  return envelope.data;
}

export async function skipOffer(offerId: string) {
  const normalizedId = normalizeMongoId(offerId);
  if (!normalizedId) {
    throw new ExpertOffersError("Invalid offer id.", 400);
  }

  const { status, envelope } = await apiClient.post<{ offer: BackendOffer }>(
    `/experts/offers/${encodeURIComponent(normalizedId)}/skip`,
    undefined,
    { skipAuthHandling: true },
  );

  if (envelope.error) {
    throw new ExpertOffersError(
      envelope.message || "Unable to skip offer.",
      status,
    );
  }

  return envelope.data?.offer ?? null;
}
