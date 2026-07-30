export const QUEUE_PAGE_SIZE = 5;
export const HISTORY_PAGE_SIZE = 5;
/** Session flag: show "Evaluation time exceeded…" info toast once. */
export const DEADLINE_EXCEEDED_TOAST_KEY = "coinzy.expert.deadlineExceededToast";
/** Set after login when expert is unavailable — triggers availability prompt. */
export const AVAILABILITY_PROMPT_KEY = "coinzy.expert.showAvailabilityPrompt";
/** Set when expert dismisses the availability prompt for this session. */
export const AVAILABILITY_PROMPT_DISMISSED_KEY =
  "coinzy.expert.availabilityPromptDismissed";
