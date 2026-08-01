"use client";

import { ExpertAvailabilityPromptGate } from "@/components/expert/ExpertAvailabilityPromptGate";
import { ExpertProfileInitializer } from "@/components/expert/ExpertProfileInitializer";
import { ExpertPanelDataProvider } from "@/lib/expert/expertPanelDataStore";
import { ExpertSocketProvider } from "@/lib/expert/expertSocketProvider";
import { ExpertProfileProvider } from "@/lib/expert/expertProfileStore";
import type { ReactNode } from "react";

export function ExpertPanelProviders({ children }: { children: ReactNode }) {
  return (
    <ExpertProfileProvider>
      <ExpertPanelDataProvider>
        <ExpertSocketProvider>
          <ExpertProfileInitializer />
          <ExpertAvailabilityPromptGate />
          {children}
        </ExpertSocketProvider>
      </ExpertPanelDataProvider>
    </ExpertProfileProvider>
  );
}
