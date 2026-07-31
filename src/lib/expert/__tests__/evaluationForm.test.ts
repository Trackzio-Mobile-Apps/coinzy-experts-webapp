import { describe, expect, it } from "vitest";
import {
  areRequiredFieldsComplete,
  createInitialEvaluationFormState,
  evaluateFormProgress,
  formatEstimatedPriceRange,
  getMissingRequiredFields,
  getSectionStepState,
  normalizeEvaluationFormState,
  splitEstimatedPriceRange,
} from "@/lib/expert/evaluationForm";
import { completeEvaluationForm } from "@/lib/expert/__tests__/fixtures";

describe("evaluationForm", () => {
  describe("createInitialEvaluationFormState", () => {
    it("initializes all keys as empty strings", () => {
      const form = createInitialEvaluationFormState();
      expect(form.coinName).toBe("");
      expect(form.recommendation).toBe("");
    });
  });

  describe("normalizeEvaluationFormState", () => {
    it("maps legacy keys to current API keys", () => {
      const form = normalizeEvaluationFormState({
        nameDesignation: "Legacy Coin",
        currency: "INR 1",
        estimatedValueMinUsd: "100",
        estimatedValueMaxUsd: "200",
      });
      expect(form.coinName).toBe("Legacy Coin");
      expect(form.currencyAndDenomination).toBe("INR 1");
      expect(form.estimatedPriceMin).toBe("100");
      expect(form.estimatedPriceMax).toBe("200");
    });

    it("splits combined estimated price range", () => {
      const form = normalizeEvaluationFormState({
        estimatedPriceRange: "₹5,000 – ₹15,000",
      });
      expect(form.estimatedPriceMin).toBe("₹5,000");
      expect(form.estimatedPriceMax).toBe("₹15,000");
    });
  });

  describe("formatEstimatedPriceRange / splitEstimatedPriceRange", () => {
    it("round-trips min and max", () => {
      const range = formatEstimatedPriceRange("₹5,000", "₹15,000");
      expect(range).toBe("₹5,000 – ₹15,000");
      expect(splitEstimatedPriceRange(range)).toEqual({
        min: "₹5,000",
        max: "₹15,000",
      });
    });

    it("returns single value when only min provided", () => {
      expect(formatEstimatedPriceRange("₹5,000", "")).toBe("₹5,000");
    });
  });

  describe("evaluateFormProgress", () => {
    it("reports 0% for empty form", () => {
      expect(evaluateFormProgress(createInitialEvaluationFormState())).toEqual({
        percent: 0,
        filled: 0,
        total: 16,
      });
    });

    it("reports 100% when all required fields filled", () => {
      const progress = evaluateFormProgress(completeEvaluationForm());
      expect(progress.percent).toBe(100);
      expect(progress.filled).toBe(16);
    });
  });

  describe("getMissingRequiredFields", () => {
    it("lists labels for empty required fields", () => {
      const missing = getMissingRequiredFields(createInitialEvaluationFormState());
      expect(missing).toContain("Coin Name");
      expect(missing).toContain("Recommendation");
    });

    it("returns empty when form complete", () => {
      expect(getMissingRequiredFields(completeEvaluationForm())).toEqual([]);
      expect(areRequiredFieldsComplete(completeEvaluationForm())).toBe(true);
    });
  });

  describe("getSectionStepState", () => {
    it("marks general section complete when required fields filled", () => {
      const form = completeEvaluationForm();
      expect(getSectionStepState(form, "general")).toBe("complete");
    });

    it("marks section pending when empty", () => {
      expect(getSectionStepState(createInitialEvaluationFormState(), "general")).toBe(
        "pending",
      );
    });
  });
});
