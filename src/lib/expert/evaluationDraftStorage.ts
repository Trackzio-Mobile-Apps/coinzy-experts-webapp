import type { EvaluationFormState } from "@/lib/expert/types";

const DRAFT_PREFIX = "coinzy_eval_draft_";

export function loadEvaluationDraft(requestId: string): EvaluationFormState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${requestId}`);
    if (!raw) return null;
    return JSON.parse(raw) as EvaluationFormState;
  } catch {
    return null;
  }
}

export function saveEvaluationDraft(
  requestId: string,
  form: EvaluationFormState,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${requestId}`, JSON.stringify(form));
  } catch {
    // ignore storage errors
  }
}

export function clearEvaluationDraft(requestId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${DRAFT_PREFIX}${requestId}`);
}
