"use client";

import { hasExpertSession } from "@/lib/expert/apiClient";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function ExpertAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isInitialized, isLoading } = useExpertProfile();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      const authenticated = await hasExpertSession();
      if (!authenticated) {
        router.replace("/expert/login");
        setHasSession(false);
        return;
      }
      setHasSession(true);
    })();
  }, [router]);

  if (hasSession === null || !hasSession) {
    return null;
  }

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-expert-dashboard-canvas">
        <p className="text-sm text-text-muted">Loading your session…</p>
      </div>
    );
  }

  return children;
}
