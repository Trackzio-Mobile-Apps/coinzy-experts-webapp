import { ExpertAuthGuard } from "@/components/expert/ExpertAuthGuard";
import { ExpertPanelChrome } from "@/components/expert/ExpertPanelChrome";
import { ExpertPanelProviders } from "@/components/expert/ExpertPanelProviders";

export default function ExpertPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ExpertPanelProviders>
      <ExpertAuthGuard>
        <ExpertPanelChrome>{children}</ExpertPanelChrome>
      </ExpertAuthGuard>
    </ExpertPanelProviders>
  );
}
