import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { ContentLibraryClient } from "./ContentLibraryClient";

export default function ContentPage() {
  return (
    <AppShell>
      <Topbar
        title="Content"
        subtitle="Review, edit, save, and export generated articles"
      />
      <ContentLibraryClient />
    </AppShell>
  );
}
