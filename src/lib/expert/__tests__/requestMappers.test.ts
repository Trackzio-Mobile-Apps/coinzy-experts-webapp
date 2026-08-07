import {
  buildQueueList,
  isAcceptedRequestEligibleForQueue,
  isOfferEligibleForQueue,
  parseRequestPayload,
} from "@/lib/expert/requestMappers";
import type { BackendOffer, BackendRequest } from "@/lib/expert/types";

describe("buildQueueList deadline filtering", () => {
  const nowMs = Date.parse("2026-08-06T12:00:00.000Z");

  it("removes offers whose deadline has passed", () => {
    const offer = {
      _id: "offer1",
      expiresAt: "2026-08-05T12:00:00.000Z",
      request: {
        _id: "req1",
        displayId: "16",
        status: "offered",
        deadlineAt: "2026-08-10T12:00:00.000Z",
      },
    } as unknown as BackendOffer;

    expect(isOfferEligibleForQueue(offer, nowMs)).toBe(false);
    expect(buildQueueList([offer], [], nowMs)).toHaveLength(0);
  });

  it("removes accepted requests whose deadline has passed", () => {
    const request = {
      _id: "req1",
      displayId: "16",
      status: "accepted",
      deadlineAt: "2026-08-06T11:59:59.999Z",
    } as unknown as BackendRequest;

    expect(isAcceptedRequestEligibleForQueue(request, nowMs)).toBe(false);
    expect(buildQueueList([], [request], nowMs)).toHaveLength(0);
  });

  it("keeps accepted requests in queue as in progress until deadlineAt passes", () => {
    const request = {
      _id: "req1",
      displayId: "16",
      status: "accepted",
      deadlineAt: "2026-08-08T12:00:00.000Z",
      firstAcceptanceWindowEndsAt: "2026-08-05T12:00:00.000Z",
    } as unknown as BackendRequest;

    expect(isAcceptedRequestEligibleForQueue(request, nowMs)).toBe(true);
    const items = buildQueueList([], [request], nowMs);
    expect(items).toHaveLength(1);
    expect(items[0]?.variant).toBe("in_progress");
  });

  it("keeps active offers and accepted requests with future deadlines", () => {
    const offer = {
      _id: "offer1",
      expiresAt: "2026-08-10T12:00:00.000Z",
      request: {
        _id: "req1",
        displayId: "16",
        status: "offered",
        deadlineAt: "2026-08-10T12:00:00.000Z",
      },
    } as unknown as BackendOffer;
    const request = {
      _id: "req2",
      displayId: "17",
      status: "accepted",
      deadlineAt: "2026-08-10T12:00:00.000Z",
    } as unknown as BackendRequest;

    expect(buildQueueList([offer], [request], nowMs)).toHaveLength(2);
  });
});

describe("parseRequestPayload video posters", () => {
  it("does not reuse the first coin image as a blank video poster", () => {
    const { media } = parseRequestPayload({
      coinName: "Test coin",
      media: {
        obverse: ["https://cdn.example.com/obverse.jpg"],
        video: ["https://cdn.example.com/blank.mp4"],
      },
    });

    const video = media.find((item) => item.kind === "video");
    expect(video?.kind).toBe("video");
    expect(video?.poster).toBe("");
  });

  it("uses an explicit video poster from the payload", () => {
    const { media } = parseRequestPayload({
      coinName: "Test coin",
      media: {
        obverse: ["https://cdn.example.com/obverse.jpg"],
        video: [
          {
            src: "https://cdn.example.com/coin.mp4",
            poster: "https://cdn.example.com/video-frame.jpg",
          },
        ],
      },
    });

    const video = media.find((item) => item.kind === "video");
    expect(video?.kind).toBe("video");
    expect(video?.poster).toBe("https://cdn.example.com/video-frame.jpg");
  });
});
