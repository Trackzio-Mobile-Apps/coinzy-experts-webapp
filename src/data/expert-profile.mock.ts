/**
 * Expert “My profile” screen — replace with API when ready.
 */

export type ExpertProfileStats = {
  totalEarningsInr: number;
  pendingEarningsInr: number;
  pendingHint: string;
  thisMonthInr: number;
  thisMonthCompleted: number;
  pastMonthInr: number;
  pastMonthCompleted: number;
};

export type ExpertReview = {
  author: string;
  dateLabel: string;
  regId: string;
  coinTitle: string;
  rating: number;
  comment: string;
};

export const EXPERT_PROFILE_STATS: ExpertProfileStats = {
  totalEarningsInr: 44_200,
  pendingEarningsInr: 4200,
  pendingHint: "7 evaluations in system",
  thisMonthInr: 5600,
  thisMonthCompleted: 12,
  pastMonthInr: 5600,
  pastMonthCompleted: 13,
};

export const EXPERT_PROFILE_DISPLAY = {
  fullName: "Arjun Kumar",
  initials: "AK",
  headlineTags: ["Ancient Coins", "British India", "Mughal Empire"] as const,
  tagline:
    "Specializing in British India and ancient Indian coinages with 12+ years of numismatic experience.",
};

export const EXPERT_PROFILE_FORM_DEFAULT = {
  firstName: "Arjun",
  lastName: "Kumar",
  age: 35,
  country: "Bahrain",
  bioPublic: `I am a professional numismatist accredited by leading institutions, with a focus on authentication, grading, and historical valuation of coins from the Indian subcontinent and colonial eras. I combine archival research with hands-on inspection to deliver clear, evidence-backed evaluations for collectors and marketplaces.`,
};

/** Categories shown on profile; edit mode can toggle these + add from allOptions. */
export const EXPERT_PROFILE_EXPERTISE_SELECTED = [
  "Ancient Coins",
  "Indian Pottery",
  "British India",
  "Mughal Empire",
  "Gold Artifacts",
  "Artifacts",
] as const;

export const EXPERT_PROFILE_EXPERTISE_ALL_OPTIONS = [
  "Ancient Coins",
  "British India",
  "Gold Coins",
  "Silver Coins",
  "Mughal Empire",
  "Medieval Coins",
  "Indian Princely Coins",
  "Colonial Era",
  "World Coins",
  "Modern Indian Coins",
  "Indian Pottery",
  "Gold Artifacts",
  "Artifacts",
  "Others",
] as const;

export const EXPERT_PROFILE_REVIEWS: ExpertReview[] = [
  {
    author: "Rajesh M.",
    dateLabel: "Apr 18, 2023",
    regId: "REG-00122",
    coinTitle: "Roman Denarius Vespasian",
    rating: 5,
    comment:
      "Exceptionally thorough evaluation. The expert explained wear patterns and mint marks clearly. I felt confident listing the coin after the report.",
  },
  {
    author: "Priya S.",
    dateLabel: "Apr 16, 2023",
    regId: "REG-00108",
    coinTitle: "Mysore Pagoda gold",
    rating: 5,
    comment:
      "Fast turnaround and very detailed notes on provenance. Would recommend to other collectors in our community.",
  },
  {
    author: "Vikram K.",
    dateLabel: "Apr 12, 2023",
    regId: "REG-00097",
    coinTitle: "Victoria Empress Rupee",
    rating: 5,
    comment:
      "Clear photos feedback and honest grading guidance. The valuation aligned closely with auction results I checked afterwards.",
  },
  {
    author: "Anita D.",
    dateLabel: "Apr 9, 2023",
    regId: "REG-00085",
    coinTitle: "Hyderabad State Anna",
    rating: 5,
    comment:
      "Professional tone and well-structured report. Helped me decide whether to conserve or sell.",
  },
  {
    author: "Mohammad A.",
    dateLabel: "Apr 5, 2023",
    regId: "REG-00071",
    coinTitle: "Dutch India Duit",
    rating: 5,
    comment:
      "Outstanding expertise on colonial issues. The historical context section was especially valuable.",
  },
];

export const EXPERT_PROFILE_RATING = {
  average: 4.8,
  reviewCount: 8,
} as const;
