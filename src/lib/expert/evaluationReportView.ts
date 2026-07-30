import {
  EVALUATION_FORM_SECTIONS,
  formatEstimatedPriceRange,
  normalizeEvaluationFormState,
} from "@/lib/expert/evaluationForm";
import {
  asDisplayString,
  normalizeIsoDate,
  normalizeMongoId,
} from "@/lib/expert/format";
import { contentFieldsToFormState } from "@/lib/expert/reportContentFields";
import { mediaFromReportSources } from "@/lib/expert/requestMappers";
import type {
  BackendReport,
  EvaluationFormState,
  RequestMediaItem,
} from "@/lib/expert/types";

export const EVALUATION_REPORT_BRAND = "Coinzy AI";
export const EVALUATION_REPORT_SUBTITLE = "Expert Evaluation Report";

export type EvaluationReportFieldRow = {
  label: string;
  value: string;
};

export type EvaluationReportSection = {
  title: string;
  fields: EvaluationReportFieldRow[];
};

export type EvaluationReportDisplay = {
  reportId: string;
  requestId: string;
  requestDisplayId: string | null;
  coinTitle: string;
  status: string;
  submittedAt: string | null;
  media: RequestMediaItem[];
  sections: EvaluationReportSection[];
};

export function groupReportMedia(
  media: RequestMediaItem[],
): [string, RequestMediaItem[]][] {
  const groups = new Map<string, RequestMediaItem[]>();
  for (const item of media) {
    const label = item.group?.trim() || "Other";
    const bucket = groups.get(label);
    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(label, [item]);
    }
  }
  return Array.from(groups.entries());
}

function displayValue(value: unknown): string {
  const text = asDisplayString(value);
  return text || "—";
}

function buildMarketSection(form: EvaluationFormState): EvaluationReportSection {
  const priceRange =
    formatEstimatedPriceRange(
      form.estimatedPriceMin ?? "",
      form.estimatedPriceMax ?? "",
    ) || "";

  return {
    title: "Market value and rarity",
    fields: [
      { label: "Rarity", value: displayValue(form.rarity) },
      {
        label: "Estimated Price Range (min and max)",
        value: displayValue(priceRange),
      },
    ],
  };
}

/** Read-only report sections from API `contentFields`. */
export function buildEvaluationReportDisplay(
  report: BackendReport,
  options?: { requestPayload?: unknown },
): EvaluationReportDisplay {
  const form = normalizeEvaluationFormState(
    contentFieldsToFormState(report.contentFields, report.content),
  );
  const coinTitle =
    asDisplayString(report.coinTitle) ||
    asDisplayString(form.coinName) ||
    "Coin Evaluation";

  const sections: EvaluationReportSection[] = EVALUATION_FORM_SECTIONS.map(
    (section) => {
      if (section.id === "market") {
        return buildMarketSection(form);
      }

      return {
        title: section.title,
        fields: section.fields.map((field) => ({
          label: field.label,
          value: displayValue(form[field.key]),
        })),
      };
    },
  );

  return {
    reportId: normalizeMongoId(report._id) || asDisplayString(report._id),
    requestId:
      normalizeMongoId(report.requestId) || asDisplayString(report.requestId),
    requestDisplayId: asDisplayString(report.requestDisplayId) || null,
    coinTitle,
    status: asDisplayString(report.status) || "—",
    submittedAt: normalizeIsoDate(report.submittedAt),
    media: mediaFromReportSources(
      coinTitle,
      report.attachments,
      options?.requestPayload,
    ),
    sections,
  };
}

export function formatReportSubmittedAt(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
