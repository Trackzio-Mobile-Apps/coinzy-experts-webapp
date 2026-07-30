import type {
  EvaluationFormState,
  ReportContentFields,
} from "@/lib/expert/types";

function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function section(
  source: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return source && typeof source === "object" && !Array.isArray(source)
    ? source
    : {};
}

/** Flat form state → nested API `contentFields`. */
export function formToContentFields(
  form: EvaluationFormState,
): ReportContentFields {
  return {
    generalInfo: {
      coinName: str(form.coinName),
      currencyAndDenomination: str(form.currencyAndDenomination),
      issuer: str(form.issuer),
      period: str(form.period),
      rulerOrGovt: str(form.rulerOrGovt),
      yearOfMinting: str(form.yearOfMinting),
      mintLocation: str(form.mintLocation),
    },
    physicalSpecs: {
      material: str(form.material),
      weight: str(form.weight),
      dominantColor: str(form.dominantColor),
      mintingMethod: str(form.mintingMethod),
    },
    designDetails: {
      obverseDescription: str(form.obverseDescription),
      reverseDescription: str(form.reverseDescription),
      history: str(form.history),
    },
    valueAndRarity: {
      rarity: str(form.rarity),
      estimatedPriceRange: str(form.estimatedPriceRange),
    },
    expertAssessment: {
      authenticity: str(form.authenticity),
      conditionOrGrade: str(form.conditionOrGrade),
      errorsOrSpecialFeatures: str(form.errorsOrSpecialFeatures),
      recommendation: str(form.recommendation),
    },
  };
}

/** Nested API `contentFields` (or legacy flat `content`) → flat form state. */
export function contentFieldsToFormState(
  contentFields: ReportContentFields | null | undefined,
  legacyContent?: unknown,
): EvaluationFormState {
  const cf = contentFields ?? emptyContentFields();
  const general = section(cf.generalInfo as unknown as Record<string, unknown>);
  const physical = section(
    cf.physicalSpecs as unknown as Record<string, unknown>,
  );
  const design = section(cf.designDetails as unknown as Record<string, unknown>);
  const value = section(cf.valueAndRarity as unknown as Record<string, unknown>);
  const assessment = section(
    cf.expertAssessment as unknown as Record<string, unknown>,
  );

  const legacy =
    legacyContent && typeof legacyContent === "object" && !Array.isArray(legacyContent)
      ? (legacyContent as Record<string, unknown>)
      : {};

  const pick = (
    nested: Record<string, unknown>,
    nestedKey: string,
    ...legacyKeys: string[]
  ): string => {
    const fromNested = str(nested[nestedKey]);
    if (fromNested) return fromNested;
    for (const key of legacyKeys) {
      const fromLegacy = str(legacy[key]);
      if (fromLegacy) return fromLegacy;
    }
    return "";
  };

  const min = str(legacy.estimatedValueMinUsd);
  const max = str(legacy.estimatedValueMaxUsd);
  const legacyRange =
    min && max ? `${min} – ${max}` : min || max || str(legacy.estimatedPriceRange);

  return {
    coinName: pick(general, "coinName", "nameDesignation", "coinName"),
    currencyAndDenomination: pick(
      general,
      "currencyAndDenomination",
      "currency",
    ),
    issuer: pick(general, "issuer", "issuer"),
    period: pick(general, "period", "period", "periodReign"),
    rulerOrGovt: pick(general, "rulerOrGovt", "rulerGovt", "periodReign"),
    yearOfMinting: pick(general, "yearOfMinting", "yearOfMinting"),
    mintLocation: pick(general, "mintLocation", "mintStation", "mintLocation"),
    material: pick(physical, "material", "material"),
    weight: pick(physical, "weight", "weightG", "weight"),
    dominantColor: pick(physical, "dominantColor", "dominantColor"),
    mintingMethod: pick(physical, "mintingMethod", "mintingMethod"),
    obverseDescription: pick(
      design,
      "obverseDescription",
      "obverseDescription",
    ),
    reverseDescription: pick(
      design,
      "reverseDescription",
      "reverseDescription",
    ),
    history: pick(design, "history", "historicalSignificance", "history"),
    rarity: pick(value, "rarity", "rarity"),
    estimatedPriceRange: pick(
      value,
      "estimatedPriceRange",
      "estimatedPriceRange",
    ) || legacyRange,
    authenticity: pick(assessment, "authenticity", "authenticity"),
    conditionOrGrade: pick(
      assessment,
      "conditionOrGrade",
      "conditionGrade",
      "conditionOrGrade",
    ),
    errorsOrSpecialFeatures: pick(
      assessment,
      "errorsOrSpecialFeatures",
      "overallGradingFeatures",
      "errorsOrSpecialFeatures",
    ),
    recommendation: pick(
      assessment,
      "recommendation",
      "expertNotesRecommendations",
      "recommendation",
    ),
  };
}

export function emptyContentFields(): ReportContentFields {
  return {
    generalInfo: {
      coinName: "",
      currencyAndDenomination: "",
      issuer: "",
      period: "",
      rulerOrGovt: "",
      yearOfMinting: "",
      mintLocation: "",
    },
    physicalSpecs: {
      material: "",
      weight: "",
      dominantColor: "",
      mintingMethod: "",
    },
    designDetails: {
      obverseDescription: "",
      reverseDescription: "",
      history: "",
    },
    valueAndRarity: {
      rarity: "",
      estimatedPriceRange: "",
    },
    expertAssessment: {
      authenticity: "",
      conditionOrGrade: "",
      errorsOrSpecialFeatures: "",
      recommendation: "",
    },
  };
}

export function resolveReportCoinTitle(
  form: EvaluationFormState,
  fallbackCoinName?: string,
): string {
  const fromForm = str(form.coinName).trim();
  const fromCoin = fallbackCoinName?.trim() ?? "";
  return fromForm || fromCoin || "Coin Evaluation";
}
