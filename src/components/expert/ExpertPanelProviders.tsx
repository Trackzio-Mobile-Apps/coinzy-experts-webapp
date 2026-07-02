"use client";

import { ExpertProfileInitializer } from "@/components/expert/ExpertProfileInitializer";
import { ExpertPanelDataProvider } from "@/lib/expert/expertPanelDataStore";
import { ExpertProfileProvider } from "@/lib/expert/expertProfileStore";
import type { ReactNode } from "react";

export function ExpertPanelProviders({ children }: { children: ReactNode }) {
  return (
    <ExpertProfileProvider>
      <ExpertPanelDataProvider>
        <ExpertProfileInitializer />
        {children}
      </ExpertPanelDataProvider>
    </ExpertProfileProvider>
  );
}
