import { ExpertHistoryPageBody } from "@/components/expert/ExpertHistoryPageBody";
import {
  HISTORY_PAGE_SIZE,
  MOCK_HISTORY_PREVIEW_EMPTY,
  MOCK_HISTORY_ROWS,
  filterHistoryRows,
  getHistorySummaryStats,
  parseHistoryPeriod,
  parseHistoryReportParam,
} from "@/data/expert-panel.mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
};

type PageProps = {
  searchParams: Promise<{ page?: string; period?: string; report?: string }>;
};

export default async function ExpertHistoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const period = parseHistoryPeriod(sp.period);
  const rawPage = parseInt(String(sp.page ?? "1"), 10);

  const filtered = MOCK_HISTORY_PREVIEW_EMPTY
    ? []
    : filterHistoryRows(MOCK_HISTORY_ROWS, period);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / HISTORY_PAGE_SIZE));
  const page = Number.isFinite(rawPage)
    ? Math.min(Math.max(1, rawPage), totalPages)
    : 1;

  const start = (page - 1) * HISTORY_PAGE_SIZE;
  const slice = filtered.slice(start, start + HISTORY_PAGE_SIZE);

  const activeReportId = parseHistoryReportParam(sp.report);

  return (
    <ExpertHistoryPageBody
      summary={getHistorySummaryStats()}
      items={slice}
      page={page}
      totalItems={totalItems}
      period={period}
      previewEmpty={MOCK_HISTORY_PREVIEW_EMPTY}
      activeReportId={activeReportId}
    />
  );
}
