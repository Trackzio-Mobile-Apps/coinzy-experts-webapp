export type ExpertStats = {
  activeCases: number;
  newRequests: number;
  completed: number;
  totalEarningsInr: number;
  missedDeadlineCount: number;
  avgCompletionHours?: number | null;
};

export type ExpertBackendStatus = "active" | "suspended" | "blocked";

export type ExpertStatus = ExpertBackendStatus | string;

/** Source of truth from `GET /experts/me`. */
export type ExpertProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials?: string;
  isInternal: boolean;
  status: ExpertStatus;
  /** ISO country codes; empty array = all countries on backend. */
  supportedCountries: string[];
  isAvailableForRequests: boolean;
  activeCommittedRequestCount: number;
  lastAssignedAt: string | null;
  profilePicture: string | null;
  oneLineDescription: string | null;
  stats: ExpertStats;
  createdAt?: string;
  updatedAt?: string;
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

/** Raw expert object from the backend API (`GET /experts/me`). */
export type BackendExpert = {
  _id: string;
  name: string;
  email: string;
  isInternal: boolean;
  isAvailableForRequests: boolean;
  supportedCountries: string[];
  status: ExpertBackendStatus;
  activeCommittedRequestCount: number;
  stats: {
    completedCount: number;
    missedDeadlineCount: number;
    avgCompletionHoursLast5: number | null;
  };
  lastAssignedAt: string | null;
  profilePicture: string | null;
  oneLineDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportStatus = "draft" | "submitted";

export type ReportGeneralInfo = {
  coinName: string;
  currencyAndDenomination: string;
  issuer: string;
  period: string;
  rulerOrGovt: string;
  yearOfMinting: string;
  mintLocation: string;
};

export type ReportPhysicalSpecs = {
  material: string;
  weight: string;
  dominantColor: string;
  mintingMethod: string;
};

export type ReportDesignDetails = {
  obverseDescription: string;
  reverseDescription: string;
  history: string;
};

export type ReportValueAndRarity = {
  rarity: string;
  estimatedPriceRange: string;
};

export type ReportExpertAssessment = {
  authenticity: string;
  conditionOrGrade: string;
  errorsOrSpecialFeatures: string;
  recommendation: string;
};

export type ReportContentFields = {
  generalInfo: ReportGeneralInfo;
  physicalSpecs: ReportPhysicalSpecs;
  designDetails: ReportDesignDetails;
  valueAndRarity: ReportValueAndRarity;
  expertAssessment: ReportExpertAssessment;
};

export type UpsertReportBody = {
  requestId?: string;
  contentFields?: Partial<ReportContentFields>;
  attachments?: unknown[];
  isDraft?: boolean;
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
  displayId?: string;
  coinTitle?: string | null;
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
  requestDisplayId: string | null;
  expertId: string;
  userId: string;
  coinTitle: string;
  /** Legacy flat content — prefer `contentFields`. */
  content?: Record<string, unknown>;
  contentFields?: ReportContentFields;
  attachments: unknown[];
  isDraft: boolean;
  status: ReportStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  /** Human-readable id shown in UI (API displayId when present). */
  displayId: string;
  offerId?: string;
  submittedDisplay: string;
  status: QueueItemStatus;
  deadlineDays: number;
  /** ISO deadline used for precise remaining-time labels. */
  deadlineAt?: string | null;
  coinName: string;
};

export type DraftListItem = {
  id: string;
  /** Human-readable id shown in UI (API displayId when present). */
  displayId: string;
  submittedDisplay: string;
  deadlineDays: number;
  /** ISO deadline used for precise remaining-time labels. */
  deadlineAt?: string | null;
  progressPercent: number;
};

export type HistoryRowStatus = "draft" | "new" | "completed" | "missed";

export type HistoryAction =
  | "resume"
  | "evaluate"
  | "view_report"
  | "view_details"
  | "none";

export type HistoryRow = {
  requestId: string;
  /** Shown in the table, e.g. REQ-00830 or API displayId. */
  requestLabel: string;
  reportId?: string;
  offerId?: string;
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
  | { kind: "image"; src: string; alt: string; group?: string }
  | {
      kind: "video";
      src: string;
      poster: string;
      alt: string;
      group?: string;
      duration?: string;
    };

export type EvaluationRequestDetail = {
  requestId: string;
  /** Human-readable id from API (`displayId`), e.g. EV-KUBGCWV5. */
  displayId: string;
  offerId?: string;
  /** Request is offered and waiting for this expert to accept. */
  needsAccept: boolean;
  unavailable: boolean;
  canSubmit: boolean;
  deadlineDays: number;
  deadlineAt: string | null;
  receivedAt: string | null;
  submittedDisplay: string;
  userNotes: string;
  coinName: string;
  media: RequestMediaItem[];
};

export type EvaluationFormFieldDef = {
  key: string;
  label: string;
  description?: string;
  multiline?: boolean;
  inputMode?: "decimal" | "numeric" | "text";
  /** When true, required for progress % and submit. Defaults to false. */
  required?: boolean;
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
  profilePicture?: string | null;
};

export type ExpertDashboardStats = {
  activeCases: number;
  newRequests: number;
  completed: number;
  avgTurnaround?: string;
};
