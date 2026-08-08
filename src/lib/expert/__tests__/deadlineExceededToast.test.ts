import { describe, expect, it, beforeEach } from "vitest";
import { DEADLINE_EXCEEDED_TOAST_KEY } from "@/lib/expert/constants";
import {
  clearDeadlineExceededToastMessage,
  consumeDeadlineExceededToastMessage,
  formatDeadlineExceededToastMessage,
  queueDeadlineExceededToast,
  resetDeadlineExceededToastStateForTests,
} from "@/lib/expert/deadlineExceededToast";

describe("formatDeadlineExceededToastMessage", () => {
  it("formats a single expired request with REQ-ID label", () => {
    expect(formatDeadlineExceededToastMessage(["16"])).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
    expect(formatDeadlineExceededToastMessage(["00016"])).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
    expect(formatDeadlineExceededToastMessage(["REQ-ID 00016"])).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
  });

  it("formats multiple expired requests with a count", () => {
    expect(formatDeadlineExceededToastMessage(["16", "17", "18"])).toBe(
      "3 evaluation requests expired and have been moved to History.",
    );
  });

  it("dedupes display ids before formatting", () => {
    expect(formatDeadlineExceededToastMessage(["16", "16", "00016"])).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
  });

  it("returns null for empty input", () => {
    expect(formatDeadlineExceededToastMessage([])).toBeNull();
    expect(formatDeadlineExceededToastMessage(["", "  "])).toBeNull();
  });
});

describe("deadlineExceededToast sessionStorage flow", () => {
  beforeEach(() => {
    resetDeadlineExceededToastStateForTests();
  });

  it("queues a single display id and consumes the correct message once", () => {
    queueDeadlineExceededToast("16");

    const raw = window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY);
    expect(raw).toBe(JSON.stringify({ displayIds: ["16"] }));

    expect(consumeDeadlineExceededToastMessage()).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
    expect(window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY)).toBeNull();
  });

  it("does not show the toast again after refresh (storage already consumed)", () => {
    queueDeadlineExceededToast("16");
    expect(consumeDeadlineExceededToastMessage()).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
    clearDeadlineExceededToastMessage();

    expect(window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY)).toBeNull();
    expect(consumeDeadlineExceededToastMessage()).toBeNull();
  });

  it("aggregates multiple queued display ids into a count message", () => {
    queueDeadlineExceededToast("16");
    queueDeadlineExceededToast("17");
    queueDeadlineExceededToast("18");

    expect(consumeDeadlineExceededToastMessage()).toBe(
      "3 evaluation requests expired and have been moved to History.",
    );
    expect(window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY)).toBeNull();
  });

  it("dedupes when the same display id is queued twice", () => {
    queueDeadlineExceededToast("16");
    queueDeadlineExceededToast("16");

    expect(consumeDeadlineExceededToastMessage()).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
  });

  it("clears legacy boolean flag without showing a toast", () => {
    window.sessionStorage.setItem(DEADLINE_EXCEEDED_TOAST_KEY, "1");
    expect(consumeDeadlineExceededToastMessage()).toBeNull();
    expect(window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY)).toBeNull();
  });

  it("keeps an in-memory message until acknowledged (Strict Mode remount)", () => {
    queueDeadlineExceededToast("16");
    const first = consumeDeadlineExceededToastMessage();
    const second = consumeDeadlineExceededToastMessage();

    expect(first).toBe(
      "Evaluation REQ-ID 00016 expired and has been moved to History.",
    );
    expect(second).toBe(first);
    expect(window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY)).toBeNull();

    clearDeadlineExceededToastMessage();
    expect(consumeDeadlineExceededToastMessage()).toBeNull();
  });

  it("does not queue empty display ids", () => {
    queueDeadlineExceededToast("   ");
    expect(window.sessionStorage.getItem(DEADLINE_EXCEEDED_TOAST_KEY)).toBeNull();
    expect(consumeDeadlineExceededToastMessage()).toBeNull();
  });
});
