import { ExpertDraftsPageClient } from "@/components/expert/ExpertDraftsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drafts",
};

export default function ExpertDraftsPage() {
  return <ExpertDraftsPageClient />;
}
