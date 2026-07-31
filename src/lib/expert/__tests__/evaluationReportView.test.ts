import { describe, expect, it } from "vitest";
import {
  buildEvaluationReportDisplay,
  formatReportSubmittedAt,
  groupReportMedia,
} from "@/lib/expert/evaluationReportView";
import { sampleBackendReport } from "@/lib/expert/__tests__/fixtures";

describe("evaluationReportView", () => {
  describe("buildEvaluationReportDisplay", () => {
    it("builds sections from report contentFields", () => {
      const display = buildEvaluationReportDisplay(sampleBackendReport);
      expect(display.reportId).toBe(sampleBackendReport._id);
      expect(display.coinTitle).toBe("Quarter Rupee Travancore");
      expect(display.sections.length).toBeGreaterThan(0);

      const general = display.sections.find(
        (s) => s.title === "General Information",
      );
      expect(general?.fields.find((f) => f.label === "Coin Name")?.value).toBe(
        "Quarter Rupee Travancore",
      );

      const market = display.sections.find(
        (s) => s.title === "Market value and rarity",
      );
      expect(
        market?.fields.find((f) => f.label.includes("Estimated Price"))?.value,
      ).toContain("₹5,000");
    });
  });

  describe("groupReportMedia", () => {
    it("groups media by label", () => {
      const groups = groupReportMedia([
        { kind: "image", src: "a.jpg", alt: "A", group: "Obverse" },
        { kind: "image", src: "b.jpg", alt: "B", group: "Obverse" },
        { kind: "image", src: "c.jpg", alt: "C", group: "Reverse" },
      ]);
      expect(groups).toHaveLength(2);
      expect(groups.find(([label]) => label === "Obverse")?.[1]).toHaveLength(2);
    });
  });

  describe("formatReportSubmittedAt", () => {
    it("returns dash for missing date", () => {
      expect(formatReportSubmittedAt(null)).toBe("—");
    });

    it("formats valid ISO date", () => {
      expect(formatReportSubmittedAt("2026-06-24T12:00:00.000Z")).not.toBe("—");
    });
  });
});
