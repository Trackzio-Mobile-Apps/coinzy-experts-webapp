import type { QueueItemStatus, QueueRowVariant } from "@/lib/expert/types";

export const QUEUE_VARIANT_STYLES: Record<
  QueueRowVariant,
  {
    accent: string;
    badge: string;
    badgeLabel: string;
    primaryButton: string;
  }
> = {
  pending_review: {
    accent: "border-l-expert-action-blue",
    badge:
      "bg-expert-badge-neutral text-expert-badge-neutral-text ring-expert-badge-neutral-ring",
    badgeLabel: "Pending Review",
    primaryButton:
      "bg-expert-action-blue hover:bg-expert-action-blue-hover",
  },
  in_progress: {
    accent: "border-l-expert-action-green",
    badge:
      "bg-expert-action-green-soft text-expert-action-green-text ring-expert-action-green-ring",
    badgeLabel: "In Progress",
    primaryButton:
      "bg-expert-action-green hover:bg-expert-action-green-hover",
  },
  time_extended: {
    accent: "border-l-expert-action-amber",
    badge:
      "bg-expert-action-amber-soft text-expert-action-amber-text ring-expert-action-amber-ring",
    badgeLabel: "Time Extended",
    primaryButton: "bg-primary hover:bg-primary-hover",
  },
};

export const QUEUE_EXPIRED_ROW_STYLES = {
  accent: "border-l-expert-status-expired-text",
  badge:
    "bg-expert-status-expired-bg text-expert-status-expired-text ring-expert-status-expired-text/30",
  badgeLabel: "Overdue",
  primaryButton: "bg-neutral-500 hover:bg-neutral-600",
  deadlineClass: "text-expert-status-expired-text",
};

export type QueueRowStyle = (typeof QUEUE_VARIANT_STYLES)[QueueRowVariant] & {
  deadlineClass: string;
};

export type QueueRowStyleInput = {
  variant: QueueRowVariant;
  deadlineExpired: boolean;
  status?: QueueItemStatus;
};

export function getQueueRowStyles(row: QueueRowStyleInput): QueueRowStyle {
  if (row.deadlineExpired) {
    return {
      ...QUEUE_EXPIRED_ROW_STYLES,
      badgeLabel:
        row.status === "pending_review" ? "Offer expired" : "Overdue",
    };
  }

  const base = QUEUE_VARIANT_STYLES[row.variant];
  return {
    ...base,
    deadlineClass: "text-text",
  };
}

export const queuePrimaryButtonClass =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors";

export const draftContinueButtonClass =
  "inline-flex min-w-[7.5rem] items-center justify-center rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors";

/** Draft rows always use amber accent + "Draft" badge; only the action button reflects expiry. */
export const DRAFT_ROW_STYLES = {
  accent: "border-l-expert-draft-accent",
  badge:
    "bg-expert-action-amber-soft text-expert-action-amber-text ring-expert-action-amber-ring",
  continueButton:
    "bg-expert-action-green hover:bg-expert-action-green-hover",
  continueButtonExpired: "bg-neutral-400 text-white",
};
