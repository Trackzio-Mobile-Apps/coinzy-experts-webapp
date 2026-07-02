import type {
  EvaluationFormSectionDef,
  EvaluationFormState,
} from "@/lib/expert/types";

export const EVALUATION_FORM_SECTIONS: EvaluationFormSectionDef[] = [
  {
    id: "general",
    stepLabel: "General",
    title: "General information",
    fields: [
      { key: "nameDesignation", label: "Name designation" },
      { key: "issuer", label: "Issuer" },
      { key: "periodReign", label: "Period / reign" },
      { key: "yearOfMinting", label: "Year of minting" },
      { key: "currency", label: "Currency" },
      { key: "mintStation", label: "Mint station" },
    ],
  },
  {
    id: "physical",
    stepLabel: "Physical",
    title: "Physical specifications",
    fields: [
      { key: "material", label: "Material" },
      { key: "shape", label: "Shape" },
      { key: "weightG", label: "Weight (g)", inputMode: "decimal" },
      { key: "diameterMm", label: "Diameter (mm)", inputMode: "decimal" },
      { key: "thicknessMm", label: "Thickness (mm)", inputMode: "decimal" },
      { key: "edgeType", label: "Edge type" },
      { key: "orientation", label: "Orientation" },
    ],
  },
  {
    id: "design",
    stepLabel: "Design",
    title: "Design details",
    fields: [
      { key: "obverseDescription", label: "Obverse description", multiline: true },
      { key: "reverseDescription", label: "Reverse description", multiline: true },
      {
        key: "historicalSignificance",
        label: "Historical significance",
        multiline: true,
      },
    ],
  },
  {
    id: "market",
    stepLabel: "Market",
    title: "Market value & rarity",
    fields: [
      {
        key: "estimatedValueMinUsd",
        label: "Estimated value — min ($)",
        inputMode: "decimal",
      },
      {
        key: "estimatedValueMaxUsd",
        label: "Estimated value — max ($)",
        inputMode: "decimal",
      },
      {
        key: "averageMarketValueUsd",
        label: "Average market value (USD, if known)",
        inputMode: "decimal",
      },
      { key: "rarityIndex", label: "Rarity index" },
      { key: "rarity", label: "Rarity" },
      { key: "circulation", label: "Circulation" },
    ],
  },
  {
    id: "assessment",
    stepLabel: "Assessment",
    title: "Expert assessment",
    fields: [
      { key: "authenticity", label: "Authenticity" },
      { key: "conditionGrade", label: "Condition grade (e.g. MS-63, AU-50)" },
      {
        key: "overallGradingFeatures",
        label: "Overall grading features",
        multiline: true,
      },
      {
        key: "marketDemandPotential",
        label: "Market demand / potential (1–5)",
        inputMode: "numeric",
      },
      { key: "expertSealSignOff", label: "Expert seal / sign-off" },
      {
        key: "expertNotesRecommendations",
        label: "Expert notes & recommendations",
        multiline: true,
      },
    ],
  },
];

const FORM_KEYS: string[] = EVALUATION_FORM_SECTIONS.flatMap((s) =>
  s.fields.map((f) => f.key),
);

export function createInitialEvaluationFormState(): EvaluationFormState {
  const next: EvaluationFormState = {};
  for (const k of FORM_KEYS) next[k] = "";
  return next;
}

export function evaluateFormProgress(form: EvaluationFormState): {
  percent: number;
  filled: number;
  total: number;
} {
  const total = FORM_KEYS.length;
  if (!total) return { percent: 0, filled: 0, total: 0 };
  const filled = FORM_KEYS.filter((k) => (form[k] ?? "").trim().length > 0)
    .length;
  return {
    percent: Math.round((filled / total) * 100),
    filled,
    total,
  };
}

export function isSectionComplete(
  form: EvaluationFormState,
  sectionId: string,
): boolean {
  const sec = EVALUATION_FORM_SECTIONS.find((s) => s.id === sectionId);
  if (!sec) return false;
  return sec.fields.every((f) => (form[f.key] ?? "").trim().length > 0);
}
