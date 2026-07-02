"use client";

import { ExpertPanelShell } from "@/components/expert/ExpertPanelShell";
import { useExpertPanelData } from "@/lib/expert/expertPanelDataStore";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import type { ReactNode } from "react";

type ExpertPanelChromeProps = {
  children: ReactNode;
};

function profileInitials(firstName: string, lastName: string, initials?: string) {
  if (initials?.trim()) return initials.trim().toUpperCase();
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

export function ExpertPanelChrome({ children }: ExpertPanelChromeProps) {
  const { profile } = useExpertProfile();
  const { navCounts } = useExpertPanelData();

  if (!profile) return null;

  return (
    <ExpertPanelShell
      expertId={profile.id}
      user={{
        firstName: profile.firstName,
        lastName: profile.lastName,
        initials: profileInitials(
          profile.firstName,
          profile.lastName,
          profile.initials,
        ),
      }}
      navCounts={navCounts}
      status={profile.status}
    >
      {children}
    </ExpertPanelShell>
  );
}
