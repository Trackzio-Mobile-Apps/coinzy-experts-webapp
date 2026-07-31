import { describe, expect, it } from "vitest";
import {
  asDisplayString,
  buildExpertHistoryHref,
  formatAvgTurnaround,
  formatRequestId,
  isWithinHistoryPeriod,
  normalizeIsoDate,
  normalizeMongoId,
  parseHistoryPeriod,
  parseHistoryReportParam,
} from "@/lib/expert/format";

describe("format utilities", () => {
  describe("normalizeMongoId", () => {
    it("trims string ids", () => {
      expect(normalizeMongoId("  abc123  ")).toBe("abc123");
    });

    it("reads extended JSON $oid", () => {
      expect(normalizeMongoId({ $oid: "507f1f77bcf86cd799439077" })).toBe(
        "507f1f77bcf86cd799439077",
      );
    });

    it("returns empty string for invalid values", () => {
      expect(normalizeMongoId(null)).toBe("");
      expect(normalizeMongoId("")).toBe("");
    });
  });

  describe("asDisplayString", () => {
    it("coerces numbers and booleans", () => {
      expect(asDisplayString(42)).toBe("42");
      expect(asDisplayString(true)).toBe("Yes");
      expect(asDisplayString(false)).toBe("No");
    });
  });

  describe("normalizeIsoDate", () => {
    it("parses ISO strings", () => {
      expect(normalizeIsoDate("2026-06-24T12:00:00.000Z")).toBe(
        "2026-06-24T12:00:00.000Z",
      );
    });

    it("parses extended JSON $date", () => {
      expect(normalizeIsoDate({ $date: "2026-06-24T12:00:00.000Z" })).toBe(
        "2026-06-24T12:00:00.000Z",
      );
    });

    it("returns null for invalid input", () => {
      expect(normalizeIsoDate("not-a-date")).toBeNull();
    });
  });

  describe("formatAvgTurnaround", () => {
    it("formats hours under one day", () => {
      expect(formatAvgTurnaround(5.4)).toBe("5 hrs");
    });

    it("formats days", () => {
      expect(formatAvgTurnaround(48)).toBe("2 Days");
    });

    it("returns dash for missing data", () => {
      expect(formatAvgTurnaround(null)).toBe("—");
    });
  });

  describe("formatRequestId", () => {
    it("shows last 8 chars uppercase", () => {
      expect(formatRequestId("507f1f77bcf86cd799439077")).toBe("99439077");
    });
  });

  describe("history URL helpers", () => {
    it("parseHistoryPeriod defaults to all", () => {
      expect(parseHistoryPeriod(undefined)).toBe("all");
      expect(parseHistoryPeriod("month")).toBe("month");
    });

    it("parseHistoryReportParam trims and rejects empty", () => {
      expect(parseHistoryReportParam("  report-id  ")).toBe("report-id");
      expect(parseHistoryReportParam("   ")).toBeNull();
    });

    it("buildExpertHistoryHref includes report and request params", () => {
      expect(
        buildExpertHistoryHref({
          page: 2,
          period: "month",
          report: "rep1",
          reportRequest: "req1",
        }),
      ).toBe("/expert/history?page=2&period=month&report=rep1&reportRequest=req1");
    });
  });

  describe("isWithinHistoryPeriod", () => {
    it("always true for all", () => {
      expect(isWithinHistoryPeriod("2020-01-01T00:00:00.000Z", "all")).toBe(
        true,
      );
    });

    it("false when date missing for filtered period", () => {
      expect(isWithinHistoryPeriod(null, "month")).toBe(false);
    });
  });
});
