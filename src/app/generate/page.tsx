import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Workspace } from "@/components/viralpro/Workspace";

export default function GeneratePage() {
  return (
    <AppShell>
      <Topbar title="Generate" subtitle="Prompt-driven workspace" />
      <Workspace />
    </AppShell>
  );
}
