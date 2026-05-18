import { ExpertEvaluationRequestView } from "@/components/expert/ExpertEvaluationRequestView";
import { getMockEvaluationRequestDetail } from "@/data/expert-evaluation-request.mock";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ reqId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { reqId } = await params;
  const detail = getMockEvaluationRequestDetail(reqId);
  if (!detail) return { title: "Request" };
  return {
    title: `REQ-${detail.reqId}`,
    description: "Coin identification and evaluation request",
  };
}

export default async function ExpertQueueRequestPage({ params }: PageProps) {
  const { reqId } = await params;
  const detail = getMockEvaluationRequestDetail(reqId);
  if (!detail) notFound();

  return <ExpertEvaluationRequestView detail={detail} />;
}
