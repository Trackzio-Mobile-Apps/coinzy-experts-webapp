/**
 * Expert panel — mock data & demo login credentials.
 *
 * Queue / drafts / stats / user: edit here until APIs exist.
 *
 * Drafts: `MOCK_DRAFT_ITEMS`, `MOCK_DRAFTS_PREVIEW_EMPTY`; sidebar counts via `getExpertNavCounts()`.
 *
 * History: `MOCK_HISTORY_ROWS`, `MOCK_HISTORY_PREVIEW_EMPTY`, period filter in `filterHistoryRows`.
 *
 * Auth: credentials are checked in `src/app/api/expert/login/route.ts`.
 * Successful login sets HttpOnly cookie `coinzy_expert_access` with a
 * dummy token (`cz.<base64url(json)>.mock_hs256_placeholder`) issued in
 * `src/lib/expert-demo-token.ts`. Swap that route for your token endpoint later.
 */

/** Set to `true` to preview the empty queue UI (ignores list length). */
export const MOCK_QUEUE_PREVIEW_EMPTY = false;

/** Items per page on the evaluation queue (matches pagination UI). */
export const QUEUE_PAGE_SIZE = 5;

/** Demo login — replace with real auth; cookie session checks this pair only. */
export const DEMO_EXPERT_LOGIN = {
  email: "expert@coinzy.test",
  password: "demo",
} as const;

export type ExpertUserSummary = {
  firstName: string;
  lastName: string;
  initials: string;
};

export const MOCK_EXPERT_USER: ExpertUserSummary = {
  firstName: "Arjun",
  lastName: "Kumar",
  initials: "AK",
};

/** Set to `true` to preview an empty drafts list (sidebar drafts badge becomes 0). */
export const MOCK_DRAFTS_PREVIEW_EMPTY = false;

export type DraftItem = {
  reqId: string;
  submittedDisplay: string;
  deadlineDays: number;
  /** 0–100 */
  progressPercent: number;
};

export const MOCK_DRAFT_ITEMS: DraftItem[] = [
  {
    reqId: "00016",
    submittedDisplay: "Submitted: Apr 21, 2024 at 3:15 AM",
    deadlineDays: 3,
    progressPercent: 40,
  },
  {
    reqId: "00015",
    submittedDisplay: "Submitted: Apr 20, 2024 at 6:40 PM",
    deadlineDays: 5,
    progressPercent: 72,
  },
  {
    reqId: "00014",
    submittedDisplay: "Submitted: Apr 19, 2024 at 11:02 AM",
    deadlineDays: 1,
    progressPercent: 18,
  },
];

export type ExpertNavCounts = {
  queue: number;
  drafts: number;
};

/** Queue nav badge (static until queue API drives it). */
export const MOCK_NAV_QUEUE_BADGE = 1;

/** Sidebar badge counts; drafts count follows draft list unless preview-empty. */
export function getExpertNavCounts(): ExpertNavCounts {
  return {
    queue: MOCK_NAV_QUEUE_BADGE,
    drafts: MOCK_DRAFTS_PREVIEW_EMPTY ? 0 : MOCK_DRAFT_ITEMS.length,
  };
}

export type ExpertDashboardStats = {
  activeCases: number;
  newRequests: number;
  completed: number;
  totalEarningsInr: number;
};

export const MOCK_DASHBOARD_STATS: ExpertDashboardStats = {
  activeCases: 5,
  newRequests: 47,
  completed: 47,
  /** INR amount (number); formatted in the UI. */
  totalEarningsInr: 23_500,
} as const;

export type QueueItemStatus = "in_progress" | "pending_review";

export type QueueItem = {
  reqId: string;
  submittedDisplay: string;
  status: QueueItemStatus;
  deadlineDays: number;
};

/**
 * Dummy queue rows — length drives “Showing x to y of z”.
 * Edit freely while designing; API can return the same shape later.
 */
export const MOCK_QUEUE_REQUESTS: QueueItem[] = [
  {
    reqId: "00016",
    submittedDisplay: "Submitted: April 21, 2024 at 3:15 AM",
    status: "in_progress",
    deadlineDays: 3,
  },
  {
    reqId: "00015",
    submittedDisplay: "Submitted: April 20, 2024 at 6:40 PM",
    status: "pending_review",
    deadlineDays: 5,
  },
  {
    reqId: "00014",
    submittedDisplay: "Submitted: April 19, 2024 at 11:02 AM",
    status: "in_progress",
    deadlineDays: 1,
  },
  {
    reqId: "00013",
    submittedDisplay: "Submitted: April 18, 2024 at 9:30 PM",
    status: "pending_review",
    deadlineDays: 4,
  },
  {
    reqId: "00012",
    submittedDisplay: "Submitted: April 17, 2024 at 2:00 PM",
    status: "pending_review",
    deadlineDays: 2,
  },
  {
    reqId: "00011",
    submittedDisplay: "Submitted: April 16, 2024 at 8:15 AM",
    status: "in_progress",
    deadlineDays: 6,
  },
  {
    reqId: "00010",
    submittedDisplay: "Submitted: April 15, 2024 at 4:45 PM",
    status: "pending_review",
    deadlineDays: 7,
  },
];

/** History: empty table + zeroed summary when `true`. */
export const MOCK_HISTORY_PREVIEW_EMPTY = false;

export const HISTORY_PAGE_SIZE = 5;

export type HistoryPeriodFilter = "all" | "month" | "quarter";

export type HistoryRowStatus = "draft" | "new" | "completed";

export type HistoryAction = "resume" | "evaluate" | "view_report";

export type HistoryRow = {
  requestId: string;
  coinName: string;
  type: string;
  dateDisplay: string;
  valueInr: number | null;
  status: HistoryRowStatus;
  action: HistoryAction;
  /** Dummy: which period filter tabs include this row. */
  periodTags: HistoryPeriodFilter[];
};

export const MOCK_HISTORY_ROWS: HistoryRow[] = [
  {
    requestId: "REQ-00530",
    coinName: "Travancore Quarter Rupee",
    type: "Silver - Square",
    dateDisplay: "Apr 21",
    valueInr: null,
    status: "draft",
    action: "resume",
    periodTags: ["all", "month", "quarter"],
  },
  {
    requestId: "REQ-00521",
    coinName: "2 Annas George V",
    type: "Silver",
    dateDisplay: "Apr 21",
    valueInr: null,
    status: "new",
    action: "evaluate",
    periodTags: ["all", "month", "quarter"],
  },
  {
    requestId: "REQ-00515",
    coinName: "Mughal Empire Gold Mohur",
    type: "Gold - Round",
    dateDisplay: "Apr 20",
    valueInr: null,
    status: "draft",
    action: "resume",
    periodTags: ["all", "month", "quarter"],
  },
  {
    requestId: "REQ-00510",
    coinName: "Roman Denarius Vespasian",
    type: "Silver",
    dateDisplay: "Apr 18",
    valueInr: 2000,
    status: "completed",
    action: "view_report",
    periodTags: ["all", "month", "quarter"],
  },
  {
    requestId: "REQ-00000",
    coinName: "BC Half Anna 1845",
    type: "Copper",
    dateDisplay: "Apr 14",
    valueInr: 1500,
    status: "completed",
    action: "view_report",
    periodTags: ["all", "month", "quarter"],
  },
  {
    requestId: "REQ-00488",
    coinName: "Mysore Pagoda",
    type: "Gold",
    dateDisplay: "Apr 12",
    valueInr: 3200,
    status: "completed",
    action: "view_report",
    periodTags: ["all", "quarter"],
  },
  {
    requestId: "REQ-00472",
    coinName: "Victoria Empress Rupee",
    type: "Silver",
    dateDisplay: "Apr 10",
    valueInr: null,
    status: "new",
    action: "evaluate",
    periodTags: ["all", "quarter"],
  },
  {
    requestId: "REQ-00455",
    coinName: "Sikh Empire Nanakshahi",
    type: "Silver",
    dateDisplay: "Apr 8",
    valueInr: null,
    status: "draft",
    action: "resume",
    periodTags: ["all", "quarter"],
  },
  {
    requestId: "REQ-00440",
    coinName: "Hyderabad State Anna",
    type: "Copper",
    dateDisplay: "Mar 28",
    valueInr: 800,
    status: "completed",
    action: "view_report",
    periodTags: ["all"],
  },
  {
    requestId: "REQ-00421",
    coinName: "Dutch India Duit",
    type: "Copper",
    dateDisplay: "Mar 22",
    valueInr: null,
    status: "new",
    action: "evaluate",
    periodTags: ["all"],
  },
  {
    requestId: "REQ-00405",
    coinName: "French Indian Rupee",
    type: "Silver",
    dateDisplay: "Mar 15",
    valueInr: 1200,
    status: "completed",
    action: "view_report",
    periodTags: ["all"],
  },
  {
    requestId: "REQ-00390",
    coinName: "Portuguese Rupia",
    type: "Silver",
    dateDisplay: "Mar 2",
    valueInr: null,
    status: "draft",
    action: "resume",
    periodTags: ["all"],
  },
];

export function filterHistoryRows(
  rows: HistoryRow[],
  period: HistoryPeriodFilter,
): HistoryRow[] {
  return rows.filter((r) => r.periodTags.includes(period));
}

export type HistorySummaryStats = {
  totalCompleted: number;
  avgTurnaround: string;
  totalEarnedInr: number;
  earnedThisMonthInr: number;
};

export const MOCK_HISTORY_SUMMARY_EMPTY: HistorySummaryStats = {
  totalCompleted: 0,
  avgTurnaround: "—",
  totalEarnedInr: 0,
  earnedThisMonthInr: 0,
};

export const MOCK_HISTORY_SUMMARY_FULL: HistorySummaryStats = {
  totalCompleted: 47,
  avgTurnaround: "4 days",
  totalEarnedInr: 23_500,
  earnedThisMonthInr: 5_000,
};

export function getHistorySummaryStats(): HistorySummaryStats {
  return MOCK_HISTORY_PREVIEW_EMPTY
    ? MOCK_HISTORY_SUMMARY_EMPTY
    : MOCK_HISTORY_SUMMARY_FULL;
}

export function parseHistoryPeriod(
  raw: string | string[] | undefined,
): HistoryPeriodFilter {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "month" || v === "quarter") return v;
  return "all";
}

export function parseHistoryReportParam(
  raw: string | string[] | undefined,
): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

export function buildExpertHistoryHref(opts: {
  page?: number;
  period?: HistoryPeriodFilter;
  report?: string | null;
}): string {
  const p = new URLSearchParams();
  if (opts.page != null && opts.page > 1) {
    p.set("page", String(opts.page));
  }
  if (opts.period && opts.period !== "all") {
    p.set("period", opts.period);
  }
  if (opts.report) {
    p.set("report", opts.report);
  }
  const q = p.toString();
  return q ? `/expert/history?${q}` : "/expert/history";
}

export function getExpertGreeting(firstName: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${firstName} 👋`;
  if (h < 17) return `Good afternoon, ${firstName} 👋`;
  return `Good evening, ${firstName} 👋`;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
