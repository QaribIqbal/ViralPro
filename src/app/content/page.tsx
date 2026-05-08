import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { appService } from "@/server/services/app-service";

export default function ContentPage() {
  const { items } = appService.getContent();

  return (
    <AppShell>
      <Topbar title="Content" subtitle="Manage generated articles" />
      <div className="p-4 sm:p-6">
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)]">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 text-[var(--text)]">{item.title}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{item.keyword}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs text-indigo-500">{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{item.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
