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
  isAvailable: boolean;
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
    tagline:
      "Specializing in British India and ancient Indian coinages with 12+ years of Numismatic experience.",
    age: "",
    country: "",
    professionalBio: "",
    summaryTags: ["Ancient Coins", "British India", "Mughal Empire"],
    expertiseCategories: [...EXPERTISE_OPTIONS],
    isAvailable: true,
    earnings: {
      totalInr: 0,
      pendingInr: 0,
      pendingReviewCount: 0,
      thisMonthInr: 0,
      thisMonthCompleted: 0,
      memberSinceLabel: "Since Jan 2026",
    },
  };
}

export function loadExtendedProfile(expertId: string): ExpertExtendedProfile {
  if (typeof window === "undefined") return defaultExtendedProfile();

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${expertId}`);
    if (!raw) return defaultExtendedProfile();
    const parsed = JSON.parse(raw) as Partial<ExpertExtendedProfile>;
    return {
      ...defaultExtendedProfile(),
      ...parsed,
      earnings: {
        ...defaultExtendedProfile().earnings,
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

export const DEMO_REVIEWS: ExpertReview[] = [
  {
    id: "1",
    reviewerName: "Rajesh M.",
    dateLabel: "Apr 18, 2026",
    requestId: "REQ-00814",
    coinName: "Roman Denarius Vespasian",
    rating: 5,
    comment:
      "Incredibly detailed report. The provenance section was especially helpful for my insurance claim.",
  },
  {
    id: "2",
    reviewerName: "Priya S.",
    dateLabel: "Apr 12, 2026",
    requestId: "REQ-00791",
    coinName: "Mughal Silver Rupee",
    rating: 5,
    comment:
      "Fast turnaround and very thorough. Identified a subtle die variety I had missed entirely.",
  },
  {
    id: "3",
    reviewerName: "David L.",
    dateLabel: "Apr 5, 2026",
    requestId: "REQ-00762",
    coinName: "East India Company 1/4 Anna",
    rating: 5,
    comment:
      "Professional and knowledgeable. The valuation range was well justified with comparables.",
  },
  {
    id: "4",
    reviewerName: "Ananya R.",
    dateLabel: "Mar 28, 2026",
    requestId: "REQ-00740",
    coinName: "Gupta Gold Dinar",
    rating: 4,
    comment:
      "Excellent authentication work. Would have loved a bit more detail on the mint location.",
  },
  {
    id: "5",
    reviewerName: "Michael T.",
    dateLabel: "Mar 20, 2026",
    requestId: "REQ-00718",
    coinName: "Victoria Empress Rupee",
    rating: 5,
    comment:
      "Clear, honest assessment. Saved me from a costly purchase of a cleaned coin.",
  },
];

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
