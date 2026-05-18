import { ExpertPanelShell } from "@/components/expert/ExpertPanelShell";
import { getExpertNavCounts, MOCK_EXPERT_USER } from "@/data/expert-panel.mock";
import { hasExpertAccessSession } from "@/lib/expert-session";
import { redirect } from "next/navigation";

export default async function ExpertPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await hasExpertAccessSession())) {
    redirect("/expert/login");
  }

  return (
    <ExpertPanelShell
      user={MOCK_EXPERT_USER}
      navCounts={getExpertNavCounts()}
    >
      {children}
    </ExpertPanelShell>
  );
}
