import { ExpertHistoryPageClient } from "@/components/expert/ExpertHistoryPageClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "History",
};

export default function ExpertHistoryPage() {
  return (
    <Suspense fallback={null}>
      <ExpertHistoryPageClient />
    </Suspense>
  );
}
