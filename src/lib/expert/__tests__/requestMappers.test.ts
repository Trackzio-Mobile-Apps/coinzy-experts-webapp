import { parseRequestPayload } from "@/lib/expert/requestMappers";

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
