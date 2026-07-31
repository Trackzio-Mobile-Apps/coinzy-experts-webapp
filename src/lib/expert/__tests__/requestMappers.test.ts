import { describe, expect, it } from "vitest";
import {
  buildEvaluationDetail,
  buildQueueList,
  mapRequestToHistoryRow,
  parseRequestPayload,
} from "@/lib/expert/requestMappers";
import {
  REPORT_ID,
  REQUEST_ID,
  sampleAcceptedRequest,
  sampleCompletedRequest,
} from "@/lib/expert/__tests__/fixtures";
import type { BackendOffer } from "@/lib/expert/types";

describe("requestMappers", () => {
  describe("parseRequestPayload", () => {
    it("extracts coin name, type, and grouped media", () => {
      const parsed = parseRequestPayload(sampleCompletedRequest.payload);
      expect(parsed.coinName).toBe("Quarter Rupee Travancore");
      expect(parsed.media).toHaveLength(2);
      expect(parsed.media[0]?.group).toBe("Obverse");
    });
  });

  describe("mapRequestToHistoryRow", () => {
    it("maps completed request to view_report action", () => {
      const row = mapRequestToHistoryRow(sampleCompletedRequest, {
        reportId: REPORT_ID,
      });
      expect(row.status).toBe("completed");
      expect(row.action).toBe("view_report");
      expect(row.reportId).toBe(REPORT_ID);
      expect(row.requestId).toBe(REQUEST_ID);
    });

    it("maps accepted request to draft/resume", () => {
      const row = mapRequestToHistoryRow(sampleAcceptedRequest);
      expect(row.status).toBe("draft");
      expect(row.action).toBe("resume");
    });

    it("maps missed deadline to view_details", () => {
      const row = mapRequestToHistoryRow({
        ...sampleCompletedRequest,
        status: "deadline_missed",
      });
      expect(row.status).toBe("missed");
      expect(row.action).toBe("view_details");
    });
  });

  describe("buildQueueList", () => {
    it("merges offers and accepted requests sorted by deadline", () => {
      const offer: BackendOffer = {
        _id: "offer1",
        request: {
          ...sampleAcceptedRequest,
          _id: "req-offer",
          status: "offered",
          deadlineAt: "2099-01-10T00:00:00.000Z",
        },
      };
      const accepted = {
        ...sampleAcceptedRequest,
        _id: "req-accepted",
        deadlineAt: "2099-01-05T00:00:00.000Z",
      };
      const list = buildQueueList([offer], [accepted]);
      expect(list).toHaveLength(2);
      expect(list[0]?.id).toBe("req-accepted");
      expect(list[1]?.status).toBe("pending_review");
    });
  });

  describe("buildEvaluationDetail", () => {
    it("requires accept for offered requests with offer id", () => {
      const detail = buildEvaluationDetail({
        request: { ...sampleAcceptedRequest, status: "offered" },
        offerId: "offer1",
      });
      expect(detail.needsAccept).toBe(true);
      expect(detail.canSubmit).toBe(false);
    });

    it("allows submit for accepted requests", () => {
      const detail = buildEvaluationDetail({ request: sampleAcceptedRequest });
      expect(detail.needsAccept).toBe(false);
      expect(detail.canSubmit).toBe(true);
    });
  });
});
