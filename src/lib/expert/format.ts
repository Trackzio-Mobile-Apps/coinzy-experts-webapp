export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normalize MongoDB ids that may arrive as a string, `$oid`, or BSON buffer object.
 */
export function normalizeMongoId(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.$oid === "string" && record.$oid.trim()) {
      return record.$oid.trim();
    }
    if (typeof record.toHexString === "function") {
      try {
        const hex = (record.toHexString as () => string)();
        if (typeof hex === "string" && hex.trim()) return hex.trim();
      } catch {
        // ignore
      }
    }
    if (record.buffer && typeof record.buffer === "object") {
      const bytes = Object.values(record.buffer as Record<string, number>);
      if (
        bytes.length > 0 &&
        bytes.every((b) => typeof b === "number" && b >= 0 && b <= 255)
      ) {
        return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
  }
  return "";
}

export function getExpertGreeting(firstName: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${firstName} 👋`;
  if (h < 17) return `Good afternoon, ${firstName} 👋`;
  return `Good evening, ${firstName} 👋`;
}

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/**
 * Normalize API / Mongo date values to an ISO string.
 * Handles ISO strings, epoch ms, Date, and extended JSON `{ $date: ... }`.
 */
export function normalizeIsoDate(value: unknown): string | null {
  if (value == null || value === "") return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("$date" in record) {
      return normalizeIsoDate(record.$date);
    }
    if (typeof record.$numberLong === "string") {
      const asNumber = Number(record.$numberLong);
      return Number.isFinite(asNumber) ? normalizeIsoDate(asNumber) : null;
    }
  }

  return null;
}

function parseDate(value: unknown): Date | null {
  const iso = normalizeIsoDate(value);
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Whole days remaining until the deadline (local calendar dates).
 * Editing `deadlineAt`'s date changes this immediately; same-day time-only
 * edits still show 0/1 day and should use {@link formatDeadlineRemaining}.
 */
export function daysUntil(isoDate: unknown): number {
  const target = parseDate(isoDate);
  if (!target) return 0;

  const now = new Date();
  const startUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const endUtc = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.max(0, Math.round((endUtc - startUtc) / MS_PER_DAY));
}

/** Precise remaining label driven by actual `deadlineAt` (hours + days). */
export function formatDeadlineRemaining(isoDate: unknown): string {
  const target = parseDate(isoDate);
  if (!target) return "—";

  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "Overdue";

  const totalHours = Math.max(1, Math.ceil(diffMs / MS_PER_HOUR));
  if (totalHours < 24) {
    return totalHours === 1 ? "1 hour" : `${totalHours} hours`;
  }

  const days = Math.floor(diffMs / MS_PER_DAY);
  // Edge case: 23h–24h remaining ceil to 24 hours but floor-days is still 0.
  if (days <= 0) return "1 day";

  const remHours = Math.floor((diffMs - days * MS_PER_DAY) / MS_PER_HOUR);
  if (remHours <= 0) {
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  return `${days}d ${remHours}h`;
}

/** True when `deadlineAt` is in the past (submission no longer allowed). */
export function isDeadlineExceeded(isoDate: unknown): boolean {
  const target = parseDate(isoDate);
  if (!target) return false;
  return target.getTime() <= Date.now();
}

export function formatSubmitted(isoDate: unknown): string {
  const date = parseDate(isoDate);
  if (!date) return "Submitted: —";
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `Submitted: ${formatted}`;
}

export function formatReceivedOn(isoDate: unknown): string {
  const date = parseDate(isoDate);
  if (!date) return "Received on —";
  const dayPart = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `Received on ${dayPart} • ${timePart}`;
}

export function formatDeadlineDate(isoDate: unknown): string {
  const date = parseDate(isoDate);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDeadlineDue(isoDate: unknown): string {
  const formatted = formatDeadlineDate(isoDate);
  return formatted === "—" ? "Due: —" : `Due: ${formatted}`;
}

export function formatShortDate(isoDate: unknown): string {
  const date = parseDate(isoDate);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatAvgTurnaround(hours: number | null | undefined): string {
  if (hours == null || Number.isNaN(hours)) return "—";
  if (hours < 24) return `${Math.round(hours)} hrs`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

export function formatRequestId(id: string): string {
  if (!id) return "—";
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

export type HistoryPeriodFilter = "all" | "month" | "quarter";

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

export function parseHistoryReportRequestParam(
  raw: string | string[] | undefined,
): string | null {
  return parseHistoryReportParam(raw);
}

export function buildExpertHistoryHref(opts: {
  page?: number;
  period?: HistoryPeriodFilter;
  report?: string | null;
  reportRequest?: string | null;
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
  if (opts.reportRequest) {
    p.set("reportRequest", opts.reportRequest);
  }
  const q = p.toString();
  return q ? `/expert/history?${q}` : "/expert/history";
}

export function isWithinHistoryPeriod(
  isoDate: string | null | undefined,
  period: HistoryPeriodFilter,
): boolean {
  if (period === "all") return true;
  if (!isoDate) return false;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (period === "month") return diffDays <= 31;
  return diffDays <= 92;
}
