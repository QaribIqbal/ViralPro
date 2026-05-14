import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { ImageStudio } from "@/components/viralpro/ImageStudio";

export default function ImagesPage() {
  return (
    <AppShell>
      <Topbar title="Images" subtitle="Generate and manage visuals" />
      <ImageStudio />
    </AppShell>
  );
}
