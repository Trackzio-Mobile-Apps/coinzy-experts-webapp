"use client";

import { ExpertToast } from "@/components/expert/ExpertToast";
import {
  clearDeadlineExceededToastMessage,
  consumeDeadlineExceededToastMessage,
} from "@/lib/expert/deadlineExceededToast";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Consumes the deadline-exceeded session payload after leaving a request
 * detail page (e.g. Go Back → Drafts) and shows a one-shot info toast.
 */
export function ExpertDeadlineExceededToastGate() {
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Keep the payload until the expert leaves the request detail screen.
    if (/^\/expert\/queue\/[^/]+\/?$/.test(pathname)) return;

    const next = consumeDeadlineExceededToastMessage();
    if (!next) return;

    setMessage(next);
  }, [pathname]);

  const onClose = useCallback(() => {
    clearDeadlineExceededToastMessage();
    setMessage(null);
  }, []);

  return (
    <ExpertToast
      open={Boolean(message)}
      message={message ?? ""}
      variant="info"
      onClose={onClose}
    />
  );
}
