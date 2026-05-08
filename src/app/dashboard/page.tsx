import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { appService } from "@/server/services/app-service";

export default function DashboardPage() {
  const { metrics } = appService.getDashboard();

  return (
    <AppShell>
      <Topbar title="Dashboard" subtitle="Performance overview" />
      <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="p-5">
            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{metric.value}</p>
            <p className="mt-1 text-xs text-emerald-500">{metric.change}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
