import { describe, expect, it } from "vitest";
import { formatQueueRequestIdLabel } from "@/lib/expert/format";
import { mapOfferToQueueItem } from "@/lib/expert/requestMappers";
import type { BackendOffer } from "@/lib/expert/types";

describe("formatQueueRequestIdLabel", () => {
  it("formats numeric display ids as REQ-ID with zero padding", () => {
    expect(formatQueueRequestIdLabel("16")).toBe("REQ-ID 00016");
    expect(formatQueueRequestIdLabel("00016")).toBe("REQ-ID 00016");
  });

  it("preserves EV- evaluation ids from the API", () => {
    expect(formatQueueRequestIdLabel("EV-KUBGCWV5")).toBe("EV-KUBGCWV5");
    expect(formatQueueRequestIdLabel("ev-kubgcwv5")).toBe("EV-KUBGCWV5");
  });

  it("maps REQ- prefixed ids to REQ-ID labels", () => {
    expect(formatQueueRequestIdLabel("REQ-00016")).toBe("REQ-ID 00016");
  });

  it("does not mangle alphanumeric ids into random digit tails", () => {
    expect(formatQueueRequestIdLabel("EV-KUBGCWV5")).not.toBe("REQ-ID GCWV5");
  });
});

describe("resolveDisplayId via mapOfferToQueueItem", () => {
  it("reads displayId from alternate API field names", () => {
    const offer = {
      _id: "offer1",
      request: {
        _id: "req1",
        display_id: "EV-TEST1234",
        status: "offered",
      },
    } as unknown as BackendOffer;

    expect(mapOfferToQueueItem(offer).displayId).toBe("EV-TEST1234");
  });

  it("coerces numeric displayId values", () => {
    const offer = {
      _id: "offer1",
      request: {
        _id: "req1",
        displayId: 16,
        status: "offered",
      },
    } as unknown as BackendOffer;

    expect(mapOfferToQueueItem(offer).displayId).toBe("16");
    expect(formatQueueRequestIdLabel(mapOfferToQueueItem(offer).displayId)).toBe(
      "REQ-ID 00016",
    );
  });
});
