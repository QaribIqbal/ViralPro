import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { GenerateArticleStudio } from "@/components/viralpro/GenerateArticleStudio";

export default function GeneratePage() {
  return (
    <AppShell>
      <Topbar title="Generate Content" subtitle="Advanced article generation workflow" />
      <GenerateArticleStudio />
    </AppShell>
  );
}
