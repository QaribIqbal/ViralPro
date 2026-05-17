import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { BulkGenerateStudio } from "@/components/viralpro/BulkGenerateStudio";

export default function BulkGeneratePage() {
  return (
    <AppShell>
      <Topbar
        title="Bulk Content Generation"
        subtitle="Generate up to 50 articles at once with dynamic parallel processing"
      />
      <BulkGenerateStudio />
    </AppShell>
  );
}
