import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractReportIdFromRequest,
  getReport,
  getReportForRequest,
  getStoredReportIdForRequest,
  isDraftReport,
  rememberReportForRequest,
  resetServerReportMapCache,
  resolveReport,
} from "@/lib/expert/reportsService";
import {
  REPORT_ID,
  REQUEST_ID,
  sampleAcceptedRequest,
  sampleBackendReport,
  sampleCompletedRequest,
} from "@/lib/expert/__tests__/fixtures";

vi.mock("@/lib/expert/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import { apiClient } from "@/lib/expert/apiClient";

describe("reportsService", () => {
  beforeEach(() => {
    localStorage.clear();
    resetServerReportMapCache();
    vi.mocked(apiClient.get).mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ map: {} }), { status: 200 }),
      ),
    );
  });

  describe("isDraftReport", () => {
    it("uses isDraft flag when present", () => {
      expect(isDraftReport({ ...sampleBackendReport, isDraft: true })).toBe(
        true,
      );
      expect(isDraftReport({ ...sampleBackendReport, isDraft: false })).toBe(
        false,
      );
    });

    it("falls back to status draft", () => {
      expect(
        isDraftReport({ ...sampleBackendReport, isDraft: undefined, status: "draft" }),
      ).toBe(true);
    });
  });

  describe("extractReportIdFromRequest", () => {
    it("reads reportId from GET /experts/me/requests shape", () => {
      expect(extractReportIdFromRequest(sampleCompletedRequest)).toBe(REPORT_ID);
    });

    it("reads embedded report object id", () => {
      expect(
        extractReportIdFromRequest({
          ...sampleCompletedRequest,
          reportId: null,
          report: { ...sampleBackendReport },
        }),
      ).toBe(REPORT_ID);
    });
  });

  describe("rememberReportForRequest / getStoredReportIdForRequest", () => {
    it("stores mapping in localStorage", () => {
      rememberReportForRequest(REQUEST_ID, REPORT_ID);
      expect(getStoredReportIdForRequest(REQUEST_ID)).toBe(REPORT_ID);
    });
  });

  describe("getReport", () => {
    it("calls GET /experts/reports/:id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        envelope: { error: false, message: "", data: { report: sampleBackendReport } },
      });

      const report = await getReport(REPORT_ID);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/experts/reports/${REPORT_ID}`,
        { skipAuthHandling: true },
      );
      expect(report._id).toBe(REPORT_ID);
    });
  });

  describe("getReportForRequest", () => {
    it("prefers reportId from request list over local storage", async () => {
      rememberReportForRequest(REQUEST_ID, "stale-report-id");
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        envelope: { error: false, message: "", data: { report: sampleBackendReport } },
      });

      const report = await getReportForRequest(REQUEST_ID, sampleCompletedRequest);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/experts/reports/${REPORT_ID}`,
        { skipAuthHandling: true },
      );
      expect(report?._id).toBe(REPORT_ID);
    });

    it("falls back to stored report id for accepted drafts", async () => {
      const draftId = "draft-report-id";
      rememberReportForRequest(REQUEST_ID, draftId);
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        envelope: {
          error: false,
          message: "",
          data: {
            report: { ...sampleBackendReport, _id: draftId, isDraft: true, status: "draft" },
          },
        },
      });

      const report = await getReportForRequest(
        REQUEST_ID,
        { ...sampleAcceptedRequest, reportId: null, report: null },
      );
      expect(report?._id).toBe(draftId);
    });
  });

  describe("resolveReport", () => {
    it("loads by URL report id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        envelope: { error: false, message: "", data: { report: sampleBackendReport } },
      });

      const report = await resolveReport(REPORT_ID, REQUEST_ID);
      expect(report._id).toBe(REPORT_ID);
    });

    it("uses request.reportId when URL report id missing", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        envelope: { error: false, message: "", data: { report: sampleBackendReport } },
      });

      const report = await resolveReport(null, REQUEST_ID, sampleCompletedRequest);
      expect(report._id).toBe(REPORT_ID);
    });

    it("throws when no report reference exists", async () => {
      await expect(resolveReport(null, null, undefined)).rejects.toThrow(
        "Report reference is missing.",
      );
    });
  });
});
