import { ExpertQueuePageClient } from "@/components/expert/ExpertQueuePageClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Queue",
};

export default function ExpertQueuePage() {
  return (
    <Suspense fallback={null}>
      <ExpertQueuePageClient />
    </Suspense>
  );
}
