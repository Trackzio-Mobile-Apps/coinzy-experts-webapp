import { MOCK_QUEUE_REQUESTS } from "@/data/expert-panel.mock";

/** Demo: this queue id shows the “taken by another expert” screen. */
const MOCK_UNAVAILABLE_REQ_IDS = new Set<string>(["00010"]);

export type RequestMediaItem =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; poster: string; alt: string };

export type EvaluationRequestDetail = {
  reqId: string;
  unavailable: boolean;
  deadlineDays: number;
  submittedDisplay: string;
  userNotes: string;
  media: RequestMediaItem[];
};

export type EvaluationFormFieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
  inputMode?: "decimal" | "numeric" | "text";
};

export type EvaluationFormSectionDef = {
  id: string;
  stepLabel: string;
  title: string;
  fields: readonly EvaluationFormFieldDef[];
};

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

export type EvaluationFormState = Record<string, string>;

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

const DEMO_USER_NOTES =
  "Family heirloom; stored in a cloth pouch for decades. Please assess whether cleaning would help or hurt value. Obverse has a small rim nick at 2 o'clock.";

function defaultMedia(): RequestMediaItem[] {
  return [
    {
      kind: "image",
      src: "https://picsum.photos/seed/coinzy-obv/480/480",
      alt: "Coin obverse",
    },
    {
      kind: "image",
      src: "https://picsum.photos/seed/coinzy-rev/480/480",
      alt: "Coin reverse",
    },
    {
      kind: "image",
      src: "https://picsum.photos/seed/coinzy-edge/480/480",
      alt: "Edge detail",
    },
    {
      kind: "video",
      poster: "https://picsum.photos/seed/coinzy-video/480/480",
      alt: "User-submitted rotation video",
    },
    {
      kind: "image",
      src: "https://picsum.photos/seed/coinzy-macro/480/480",
      alt: "Macro surface",
    },
    {
      kind: "image",
      src: "https://picsum.photos/seed/coinzy-scale/480/480",
      alt: "Scale reference",
    },
  ];
}

export function getMockEvaluationRequestDetail(
  reqId: string,
): EvaluationRequestDetail | null {
  const row = MOCK_QUEUE_REQUESTS.find((r) => r.reqId === reqId);
  if (!row) return null;

  return {
    reqId: row.reqId,
    unavailable: MOCK_UNAVAILABLE_REQ_IDS.has(row.reqId),
    deadlineDays: row.deadlineDays,
    submittedDisplay: row.submittedDisplay,
    userNotes: DEMO_USER_NOTES,
    media: defaultMedia(),
  };
}
