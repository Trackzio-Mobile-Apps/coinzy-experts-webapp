export type ExpertStats = {
  activeCases: number;
  newRequests: number;
  completed: number;
  totalEarningsInr: number;
  avgCompletionHours?: number | null;
};

export type ExpertStatus =
  | "active"
  | "inactive"
  | "available"
  | "unavailable"
  | string;

/** Source of truth from `GET /experts/me`. */
export type ExpertProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials?: string;
  status: ExpertStatus;
  activeCommittedRequestCount: number;
  maxActiveWorkload: number;
  lastAssignedAt: string | null;
  stats: ExpertStats;
};

/** Alias for profile data returned after login. */
export type Expert = ExpertProfile;

export type ExpertLoginResult = {
  token: string;
  expert: ExpertProfile;
};

export type ExpertLoginApiData = {
  token: string;
};

/** Raw expert object from the backend API. */
export type BackendExpert = {
  _id: string;
  name?: string;
  email: string;
  status?: string;
  maxActiveWorkload?: number;
  activeCommittedRequestCount?: number;
  lastAssignedAt?: string | null;
  stats?: {
    completedCount?: number;
    missedDeadlineCount?: number;
    avgCompletionHoursLast5?: number | null;
  };
};

export type ExpertMeApiData = {
  expert: BackendExpert;
};

export type RequestStatus =
  | "created"
  | "allocating"
  | "offered"
  | "accepted"
  | "report_submitted"
  | "completed"
  | "deadline_missed"
  | "retry_pending"
  | "refund_processing"
  | "refund_pending"
  | "refunded"
  | "expired"
  | "cancelled"
  | string;

export type BackendRequest = {
  _id: string;
  userId?: string;
  country?: string;
  payload?: Record<string, unknown>;
  status: RequestStatus;
  deadlineAt?: string | null;
  ttlExpiresAt?: string | null;
  acceptedAt?: string | null;
  submittedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendOffer = {
  _id: string;
  round?: number;
  status?: string;
  expiresAt?: string | null;
  offeredAt?: string | null;
  request: BackendRequest;
};

export type BackendReport = {
  _id: string;
  requestId: string;
  expertId?: string;
  userId?: string;
  content: unknown;
  attachments?: unknown[];
  status?: string;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ExpertOffersApiData = {
  offers: BackendOffer[];
};

export type ExpertRequestsApiData = {
  requests: BackendRequest[];
};

export type ExpertReportApiData = {
  report: BackendReport;
};

export type ExpertNavCounts = {
  queue: number;
  drafts: number;
};

export type QueueItemStatus = "in_progress" | "pending_review";

export type QueueListItem = {
  id: string;
  offerId?: string;
  submittedDisplay: string;
  status: QueueItemStatus;
  deadlineDays: number;
  coinName: string;
};

export type DraftListItem = {
  id: string;
  submittedDisplay: string;
  deadlineDays: number;
  progressPercent: number;
};

export type HistoryRowStatus = "draft" | "new" | "completed" | "missed";

export type HistoryAction = "resume" | "evaluate" | "view_report" | "none";

export type HistoryRow = {
  requestId: string;
  reportId?: string;
  coinName: string;
  type: string;
  dateDisplay: string;
  valueInr: number | null;
  status: HistoryRowStatus;
  action: HistoryAction;
};

export type HistorySummaryStats = {
  totalCompleted: number;
  avgTurnaround: string;
  totalEarnedInr: number | null;
  earnedThisMonthInr: number | null;
};

export type RequestMediaItem =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; poster: string; alt: string };

export type EvaluationRequestDetail = {
  requestId: string;
  offerId?: string;
  unavailable: boolean;
  canSubmit: boolean;
  deadlineDays: number;
  submittedDisplay: string;
  userNotes: string;
  coinName: string;
  media: RequestMediaItem[];
};

export type EvaluationFormFieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
  inputMode?: "decimal" | "numeric" | "text";
};

export type EvaluationFormSectionDef = {
  id: string;
  stepLabel: string;
  title: string;
  fields: readonly EvaluationFormFieldDef[];
};

export type EvaluationFormState = Record<string, string>;

export type ExpertUserSummary = {
  firstName: string;
  lastName: string;
  initials: string;
};

export type ExpertDashboardStats = {
  activeCases: number;
  newRequests: number;
  completed: number;
  totalEarningsInr: number;
  avgTurnaround?: string;
};
