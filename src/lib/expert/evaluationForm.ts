import type {
  EvaluationFormSectionDef,
  EvaluationFormState,
} from "@/lib/expert/types";

/**
 * Evaluation form aligned to the expert report field spec.
 * Progress + submit enforce `required: true` fields only (15 mandatory).
 */
export const EVALUATION_FORM_SECTIONS: EvaluationFormSectionDef[] = [
  {
    id: "general",
    stepLabel: "General",
    title: "General information",
    fields: [
      {
        key: "nameDesignation",
        label: "Coin Name",
        description: "What is the name of the coin?",
        required: true,
      },
      {
        key: "currency",
        label: "Currency and Denomination",
        description: "What is the currency type and denomination?",
        required: true,
      },
      {
        key: "issuer",
        label: "Issuer",
        description: "Which country issued the coin?",
        required: true,
      },
      {
        key: "period",
        label: "Period",
        description: "Which time period?",
        required: true,
      },
      {
        key: "rulerGovt",
        label: "Ruler/Govt",
        description: "Which ruler or government does it belong to?",
        required: true,
      },
      {
        key: "yearOfMinting",
        label: "Year of Minting",
        description: "When was the coin made?",
        required: true,
      },
      {
        key: "mintStation",
        label: "Mint Location",
        description: "Where was the coin minted?",
        required: true,
      },
    ],
  },
  {
    id: "physical",
    stepLabel: "Physical",
    title: "Physical specifications",
    fields: [
      {
        key: "material",
        label: "Material",
        description: "What metal is used – gold, silver, copper, etc.?",
        required: true,
      },
      {
        key: "weightG",
        label: "Weight",
        description: "What is the weight in grams?",
        inputMode: "decimal",
        required: false,
      },
      {
        key: "dominantColor",
        label: "Dominant Color",
        required: false,
      },
      {
        key: "mintingMethod",
        label: "Minting Method",
        description: "Hand struck or machine",
        required: false,
      },
    ],
  },
  {
    id: "design",
    stepLabel: "Design",
    title: "Design details",
    fields: [
      {
        key: "obverseDescription",
        label: "Front (Obverse) Description",
        description: "What is shown on the front side?",
        multiline: true,
        required: true,
      },
      {
        key: "reverseDescription",
        label: "Back (Reverse) Description",
        description: "What is shown on the back side?",
        multiline: true,
        required: true,
      },
      {
        key: "historicalSignificance",
        label: "History",
        description: "Any interesting facts about this coin",
        multiline: true,
        required: false,
      },
    ],
  },
  {
    id: "market",
    stepLabel: "Market",
    title: "Market value and rarity",
    fields: [
      {
        key: "rarity",
        label: "Rarity",
        description: "How rare is the coin?",
        required: true,
      },
      {
        key: "estimatedValueMinUsd",
        label: "Estimated Price Range (min)",
        description: "What is the current market value? (minimum)",
        inputMode: "decimal",
        required: true,
      },
      {
        key: "estimatedValueMaxUsd",
        label: "Estimated Price Range (max)",
        description: "What is the current market value? (maximum)",
        inputMode: "decimal",
        required: true,
      },
    ],
  },
  {
    id: "assessment",
    stepLabel: "Assessment",
    title: "Expert assessment",
    fields: [
      {
        key: "authenticity",
        label: "Authenticity",
        description: "Is the coin real, doubtful, or fake?",
        required: true,
      },
      {
        key: "conditionGrade",
        label: "Condition or approx grade range",
        description: "What is the condition/grade of the coin?",
        required: true,
      },
      {
        key: "overallGradingFeatures",
        label: "Errors / Special Features",
        description: "Any unique or rare features?",
        multiline: true,
        required: false,
      },
      {
        key: "expertNotesRecommendations",
        label: "Recommendation",
        description: "Should user sell or hold?",
        multiline: true,
        required: true,
      },
    ],
  },
];

const FORM_KEYS: string[] = EVALUATION_FORM_SECTIONS.flatMap((s) =>
  s.fields.map((f) => f.key),
);

const REQUIRED_KEYS: string[] = EVALUATION_FORM_SECTIONS.flatMap((s) =>
  s.fields.filter((f) => f.required).map((f) => f.key),
);

export function createInitialEvaluationFormState(): EvaluationFormState {
  const next: EvaluationFormState = {};
  for (const k of FORM_KEYS) next[k] = "";
  return next;
}

/** Migrate older drafts that used `periodReign` into `period`. */
export function normalizeEvaluationFormState(
  form: EvaluationFormState,
): EvaluationFormState {
  const next = { ...form };
  if (!(next.period ?? "").trim() && (next.periodReign ?? "").trim()) {
    next.period = next.periodReign;
  }
  return next;
}

export function evaluateFormProgress(form: EvaluationFormState): {
  percent: number;
  filled: number;
  total: number;
} {
  const total = REQUIRED_KEYS.length;
  if (!total) return { percent: 0, filled: 0, total: 0 };
  const filled = REQUIRED_KEYS.filter((k) => (form[k] ?? "").trim().length > 0)
    .length;
  return {
    percent: Math.round((filled / total) * 100),
    filled,
    total,
  };
}

export function getSectionProgress(
  form: EvaluationFormState,
  sectionId: string,
): { filled: number; total: number } {
  const sec = EVALUATION_FORM_SECTIONS.find((s) => s.id === sectionId);
  if (!sec) return { filled: 0, total: 0 };

  const requiredFields = sec.fields.filter((field) => field.required);
  // Sections with no required fields: treat optional fill as progress signal.
  const tracked = requiredFields.length > 0 ? requiredFields : sec.fields;
  const total = tracked.length;
  const filled = tracked.filter(
    (field) => (form[field.key] ?? "").trim().length > 0,
  ).length;

  return { filled, total };
}

export type SectionStepState = "complete" | "in_progress" | "pending";

export function getSectionStepState(
  form: EvaluationFormState,
  sectionId: string,
): SectionStepState {
  const sec = EVALUATION_FORM_SECTIONS.find((s) => s.id === sectionId);
  if (!sec) return "pending";

  const requiredFields = sec.fields.filter((field) => field.required);
  if (requiredFields.length === 0) {
    const anyFilled = sec.fields.some(
      (field) => (form[field.key] ?? "").trim().length > 0,
    );
    return anyFilled ? "complete" : "pending";
  }

  const filledRequired = requiredFields.filter(
    (field) => (form[field.key] ?? "").trim().length > 0,
  ).length;
  if (filledRequired === 0) return "pending";
  if (filledRequired === requiredFields.length) return "complete";
  return "in_progress";
}

export function isSectionComplete(
  form: EvaluationFormState,
  sectionId: string,
): boolean {
  return getSectionStepState(form, sectionId) === "complete";
}

export function getMissingRequiredFields(form: EvaluationFormState): string[] {
  return EVALUATION_FORM_SECTIONS.flatMap((section) =>
    section.fields
      .filter(
        (field) =>
          field.required && !(form[field.key] ?? "").trim().length,
      )
      .map((field) => field.label),
  );
}

export function areRequiredFieldsComplete(form: EvaluationFormState): boolean {
  return getMissingRequiredFields(form).length === 0;
}
