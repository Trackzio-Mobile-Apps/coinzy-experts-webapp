import { ExpertQueueRequestPageClient } from "@/components/expert/ExpertQueueRequestPageClient";
import { ExpertRequestDetailSkeleton } from "@/components/expert/ExpertSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ reqId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reqId } = await params;
  return {
    title: `Request ${reqId.slice(-8).toUpperCase()}`,
    description: "Coin identification and evaluation request",
  };
}

export default async function ExpertQueueRequestPage({ params }: PageProps) {
  const { reqId } = await params;

  return (
    <Suspense fallback={<ExpertRequestDetailSkeleton />}>
      <ExpertQueueRequestPageClient requestId={reqId} />
    </Suspense>
  );
}
