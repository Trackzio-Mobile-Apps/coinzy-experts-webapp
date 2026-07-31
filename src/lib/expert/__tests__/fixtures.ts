import type {
  BackendReport,
  BackendRequest,
  EvaluationFormState,
  ReportContentFields,
} from "@/lib/expert/types";

export const REQUEST_ID = "507f1f77bcf86cd799439077";
export const REPORT_ID = "507f1f77bcf86cd799439099";
export const EXPERT_ID = "507f1f77bcf86cd799439031";

export const sampleContentFields: ReportContentFields = {
  generalInfo: {
    coinName: "Quarter Rupee Travancore",
    currencyAndDenomination: "INR 0.25",
    issuer: "Travancore",
    period: "1800-1900",
    rulerOrGovt: "Travancore Kingdom",
    yearOfMinting: "1880",
    mintLocation: "Trivandrum",
  },
  physicalSpecs: {
    material: "Silver",
    weight: "2.8g",
    dominantColor: "Silver",
    mintingMethod: "Machine struck",
  },
  designDetails: {
    obverseDescription: "Conch shell motif",
    reverseDescription: "Tamil script legend",
    history: "Rare Travancore issue",
  },
  valueAndRarity: {
    rarity: "Scarce",
    estimatedPriceRange: "₹5,000 – ₹15,000",
  },
  expertAssessment: {
    authenticity: "Authentic",
    conditionOrGrade: "Very Fine",
    errorsOrSpecialFeatures: "Double strike on reverse",
    recommendation: "Hold",
  },
};

export const sampleBackendReport: BackendReport = {
  _id: REPORT_ID,
  requestId: REQUEST_ID,
  requestDisplayId: "EV-7K3P9Q2A",
  expertId: EXPERT_ID,
  userId: "507f1f77bcf86cd799439012",
  coinTitle: "Quarter Rupee Travancore",
  contentFields: sampleContentFields,
  attachments: [],
  isDraft: false,
  status: "submitted",
  submittedAt: "2026-06-24T12:00:00.000Z",
  createdAt: "2026-06-22T00:00:00.000Z",
  updatedAt: "2026-06-24T12:00:00.000Z",
};

export const sampleCompletedRequest: BackendRequest = {
  _id: REQUEST_ID,
  displayId: "EV-7K3P9Q2A",
  coinTitle: "Quarter Rupee Travancore",
  country: "IN",
  payload: {
    coinName: "Quarter Rupee Travancore",
    type: "Silver",
    media: {
      obverse: ["https://cdn.example/obverse.jpg"],
      reverse: ["https://cdn.example/reverse.jpg"],
    },
  },
  status: "completed",
  assignedExpertId: EXPERT_ID,
  reportId: REPORT_ID,
  deadlineAt: "2026-06-25T00:00:00.000Z",
  acceptedAt: "2026-06-22T00:15:00.000Z",
  submittedAt: "2026-06-24T12:00:00.000Z",
  completedAt: "2026-06-24T12:00:00.000Z",
  createdAt: "2026-06-22T00:00:00.000Z",
  updatedAt: "2026-06-24T12:00:00.000Z",
};

export const sampleAcceptedRequest: BackendRequest = {
  ...sampleCompletedRequest,
  status: "accepted",
  reportId: REPORT_ID,
  submittedAt: null,
  completedAt: null,
};

export function completeEvaluationForm(): EvaluationFormState {
  return {
    coinName: "Quarter Rupee Travancore",
    currencyAndDenomination: "INR 0.25",
    issuer: "Travancore",
    period: "1800-1900",
    rulerOrGovt: "Travancore Kingdom",
    yearOfMinting: "1880",
    mintLocation: "Trivandrum",
    material: "Silver",
    weight: "2.8g",
    dominantColor: "Silver",
    mintingMethod: "Machine struck",
    obverseDescription: "Conch shell motif",
    reverseDescription: "Tamil script legend",
    history: "Rare Travancore issue",
    rarity: "Scarce",
    estimatedPriceMin: "₹5,000",
    estimatedPriceMax: "₹15,000",
    authenticity: "Authentic",
    conditionOrGrade: "Very Fine",
    errorsOrSpecialFeatures: "Double strike on reverse",
    recommendation: "Hold",
  };
}
