import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { appService } from "@/server/services/app-service";

export default function BillingPage() {
  const billing = appService.getBilling();

  return (
    <AppShell>
      <Topbar title="Billing" subtitle="Manage your subscription, view usage, and track upcoming renewals" />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-[var(--text-muted)]">Current Plan</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{billing.plan}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-[var(--text-muted)]">Next Renewal</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{billing.renewalDate}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-[var(--text-muted)]">Plan Usage</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{billing.usage}</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
