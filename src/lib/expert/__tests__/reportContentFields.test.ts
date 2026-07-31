import { describe, expect, it } from "vitest";
import {
  contentFieldsToFormState,
  formToContentFields,
  resolveReportCoinTitle,
} from "@/lib/expert/reportContentFields";
import {
  completeEvaluationForm,
  sampleContentFields,
} from "@/lib/expert/__tests__/fixtures";

describe("reportContentFields", () => {
  describe("formToContentFields", () => {
    it("maps flat form to nested API contentFields", () => {
      const fields = formToContentFields(completeEvaluationForm());
      expect(fields.generalInfo.coinName).toBe("Quarter Rupee Travancore");
      expect(fields.physicalSpecs.material).toBe("Silver");
      expect(fields.valueAndRarity.estimatedPriceRange).toBe(
        "₹5,000 – ₹15,000",
      );
      expect(fields.expertAssessment.recommendation).toBe("Hold");
    });
  });

  describe("contentFieldsToFormState", () => {
    it("maps nested contentFields back to flat form", () => {
      const form = contentFieldsToFormState(sampleContentFields);
      expect(form.coinName).toBe("Quarter Rupee Travancore");
      expect(form.estimatedPriceMin).toBe("₹5,000");
      expect(form.estimatedPriceMax).toBe("₹15,000");
    });

    it("reads legacy flat content when contentFields missing", () => {
      const form = contentFieldsToFormState(undefined, {
        nameDesignation: "Legacy Coin",
        material: "Gold",
      });
      expect(form.coinName).toBe("Legacy Coin");
      expect(form.material).toBe("Gold");
    });
  });

  describe("resolveReportCoinTitle", () => {
    it("prefers form coin name", () => {
      expect(
        resolveReportCoinTitle(
          { coinName: "From Form" },
          "Fallback",
        ),
      ).toBe("From Form");
    });

    it("falls back when form empty", () => {
      expect(resolveReportCoinTitle({}, "Fallback Title")).toBe(
        "Fallback Title",
      );
    });
  });
});
