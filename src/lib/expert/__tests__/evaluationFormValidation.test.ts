import { createInitialEvaluationFormState } from "@/lib/expert/evaluationForm";
import {
  isEvaluationFormValid,
  validateEvaluationField,
  validateEvaluationForm,
} from "@/lib/expert/evaluationFormValidation";

describe("evaluationFormValidation", () => {
  it("requires mandatory fields", () => {
    const errors = validateEvaluationForm(createInitialEvaluationFormState());
    expect(errors.coinName).toMatch(/required/i);
    expect(isEvaluationFormValid(createInitialEvaluationFormState())).toBe(false);
  });

  it("validates year of minting", () => {
    expect(validateEvaluationField("yearOfMinting", "18", {})).toMatch(/year/i);
    expect(validateEvaluationField("yearOfMinting", "1850", {})).toBeNull();
    expect(
      validateEvaluationField("yearOfMinting", "1850-1860", {}),
    ).toBeNull();
  });

  it("validates optional weight when provided", () => {
    expect(validateEvaluationField("weight", "abc", {})).toMatch(/valid number/i);
    expect(validateEvaluationField("weight", "12.5", {})).toBeNull();
    expect(validateEvaluationField("weight", "", {})).toBeNull();
  });

  it("requires max price to be greater than or equal to min price", () => {
    const form = {
      ...createInitialEvaluationFormState(),
      estimatedPriceMin: "100",
      estimatedPriceMax: "50",
    };

    expect(validateEvaluationField("estimatedPriceMax", "50", form)).toMatch(
      /greater than or equal/i,
    );
  });
});
