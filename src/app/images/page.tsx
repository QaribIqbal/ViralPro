import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { appService } from "@/server/services/app-service";

export default function ImagesPage() {
  const { items } = appService.getImages();

  return (
    <AppShell>
      <Topbar title="Images" subtitle="Generated assets" />
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <Image src={item.url} alt={item.title} width={600} height={400} className="h-44 w-full object-cover" />
            <p className="p-3 text-sm text-[var(--text)]">{item.title}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
