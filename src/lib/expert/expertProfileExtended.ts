export type ExpertEarningsSummary = {
  totalInr: number;
  pendingInr: number;
  pendingReviewCount: number;
  thisMonthInr: number;
  thisMonthCompleted: number;
  memberSinceLabel: string;
};

export type ExpertExtendedProfile = {
  tagline: string;
  age: string;
  country: string;
  professionalBio: string;
  summaryTags: string[];
  expertiseCategories: string[];
  earnings: ExpertEarningsSummary;
};

export type ExpertReview = {
  id: string;
  reviewerName: string;
  dateLabel: string;
  requestId: string;
  coinName: string;
  rating: number;
  comment: string;
};

const STORAGE_PREFIX = "coinzy_expert_extended_profile_";

export const EXPERTISE_OPTIONS = [
  "Ancient Coins",
  "Indian Pottery",
  "British India",
  "Mughal Empire",
  "Colonial Era",
  "Artefacts",
] as const;

function defaultExtendedProfile(): ExpertExtendedProfile {
  return {
    tagline: "",
    age: "",
    country: "",
    professionalBio: "",
    summaryTags: [],
    expertiseCategories: [],
    earnings: {
      totalInr: 0,
      pendingInr: 0,
      pendingReviewCount: 0,
      thisMonthInr: 0,
      thisMonthCompleted: 0,
      memberSinceLabel: "",
    },
  };
}

export function loadExtendedProfile(expertId: string): ExpertExtendedProfile {
  if (typeof window === "undefined") return defaultExtendedProfile();

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${expertId}`);
    if (!raw) return defaultExtendedProfile();
    const parsed = JSON.parse(raw) as Partial<ExpertExtendedProfile>;
    const defaults = defaultExtendedProfile();
    return {
      ...defaults,
      ...parsed,
      summaryTags: Array.isArray(parsed.summaryTags)
        ? parsed.summaryTags
        : defaults.summaryTags,
      expertiseCategories: Array.isArray(parsed.expertiseCategories)
        ? parsed.expertiseCategories
        : defaults.expertiseCategories,
      earnings: {
        ...defaults.earnings,
        ...parsed.earnings,
      },
    };
  } catch {
    return defaultExtendedProfile();
  }
}

export function saveExtendedProfile(
  expertId: string,
  profile: ExpertExtendedProfile,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${expertId}`, JSON.stringify(profile));
}

export function getReviewSummary(reviews: ExpertReview[]) {
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
