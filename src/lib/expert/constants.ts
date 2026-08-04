export const QUEUE_PAGE_SIZE = 5;
export const HISTORY_PAGE_SIZE = 5;
/** How often the queue home page polls for new offers (ms). */
export const QUEUE_POLL_INTERVAL_MS = 30_000;
/** Session flag: show "Evaluation time exceeded…" info toast once. */
export const DEADLINE_EXCEEDED_TOAST_KEY = "coinzy.expert.deadlineExceededToast";
/** Set after login — triggers the soonest due-soon evaluation reminder. */
export const EVALUATION_DUE_SOON_PROMPT_KEY =
  "coinzy.expert.showEvaluationDueSoonPrompt";
/** Set after login when expert is unavailable — triggers availability prompt. */
export const AVAILABILITY_PROMPT_KEY = "coinzy.expert.showAvailabilityPrompt";
/** Set when expert dismisses the availability prompt for this session. */
export const AVAILABILITY_PROMPT_DISMISSED_KEY =
  "coinzy.expert.availabilityPromptDismissed";
/** Reminder window: show due-soon popup only when ≤ this many hours remain. */
export const EVALUATION_DUE_SOON_HOURS = 24;
