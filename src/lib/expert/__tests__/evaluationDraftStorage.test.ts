import { beforeEach, describe, expect, it } from "vitest";
import {
  clearEvaluationDraft,
  loadEvaluationDraft,
  saveEvaluationDraft,
} from "@/lib/expert/evaluationDraftStorage";
import { completeEvaluationForm } from "@/lib/expert/__tests__/fixtures";

const REQUEST_ID = "507f1f77bcf86cd799439077";

describe("evaluationDraftStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no draft saved", () => {
    expect(loadEvaluationDraft(REQUEST_ID)).toBeNull();
  });

  it("persists and loads draft form state", () => {
    const form = completeEvaluationForm();
    saveEvaluationDraft(REQUEST_ID, form);
    expect(loadEvaluationDraft(REQUEST_ID)).toEqual(form);
  });

  it("clears draft from storage", () => {
    saveEvaluationDraft(REQUEST_ID, completeEvaluationForm());
    clearEvaluationDraft(REQUEST_ID);
    expect(loadEvaluationDraft(REQUEST_ID)).toBeNull();
  });
});
