import { describe, expect, it } from "vitest";
import {
  decodeJwtPayload,
  expertIdFromJwt,
  mergeReportMaps,
  normalizeReportMapEntry,
  reportMappingFromMutationResponse,
} from "@/lib/expert/expertJwt";

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

describe("expertJwt", () => {
  describe("decodeJwtPayload", () => {
    it("decodes a JWT payload", () => {
      const token = makeJwt({ expertId: "exp-123", sub: "ignored-if-expertId" });
      expect(decodeJwtPayload(token)).toMatchObject({ expertId: "exp-123" });
    });

    it("returns null for malformed token", () => {
      expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    });
  });

  describe("expertIdFromJwt", () => {
    it("prefers expertId claim", () => {
      const token = makeJwt({ expertId: "507f1f77bcf86cd799439031" });
      expect(expertIdFromJwt(token)).toBe("507f1f77bcf86cd799439031");
    });

    it("falls back to sub", () => {
      const token = makeJwt({ sub: "507f1f77bcf86cd799439031" });
      expect(expertIdFromJwt(token)).toBe("507f1f77bcf86cd799439031");
    });
  });

  describe("normalizeReportMapEntry", () => {
    it("returns trimmed ids", () => {
      expect(
        normalizeReportMapEntry(" req1 ", " rep1 "),
      ).toEqual({ requestId: "req1", reportId: "rep1" });
    });

    it("returns null when either id missing", () => {
      expect(normalizeReportMapEntry("", "rep1")).toBeNull();
    });
  });

  describe("mergeReportMaps", () => {
    it("merges and trims to max entries", () => {
      const existing = { a: "1", b: "2" };
      const incoming = { c: "3" };
      expect(mergeReportMaps(existing, incoming, 2)).toEqual({ b: "2", c: "3" });
    });
  });

  describe("reportMappingFromMutationResponse", () => {
    it("extracts mapping from POST/PUT report response", () => {
      const mapping = reportMappingFromMutationResponse({
        error: false,
        data: {
          report: {
            _id: "507f1f77bcf86cd799439099",
            requestId: "507f1f77bcf86cd799439077",
          },
        },
      });
      expect(mapping).toEqual({
        requestId: "507f1f77bcf86cd799439077",
        reportId: "507f1f77bcf86cd799439099",
      });
    });

    it("reads request._id when report.requestId absent", () => {
      const mapping = reportMappingFromMutationResponse({
        data: {
          report: { _id: "rep1" },
          request: { _id: "req1" },
        },
      });
      expect(mapping).toEqual({ requestId: "req1", reportId: "rep1" });
    });
  });
});
