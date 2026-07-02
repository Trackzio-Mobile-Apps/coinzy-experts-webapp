export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getExpertGreeting(firstName: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${firstName} 👋`;
  if (h < 17) return `Good afternoon, ${firstName} 👋`;
  return `Good evening, ${firstName} 👋`;
}

export function daysUntil(isoDate: string | null | undefined): number {
  if (!isoDate) return 0;
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return 0;
  const diffMs = target - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatSubmitted(isoDate: string | null | undefined): string {
  if (!isoDate) return "Submitted: —";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Submitted: —";
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `Submitted: ${formatted}`;
}

export function formatShortDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatAvgTurnaround(hours: number | null | undefined): string {
  if (hours == null || Number.isNaN(hours)) return "—";
  if (hours < 24) return `${Math.round(hours)} hrs`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
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
