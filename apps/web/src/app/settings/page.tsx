import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { appService } from "@/server/services/app-service";

export default function SettingsPage() {
  const settings = appService.getSettings();

  return (
    <AppShell>
      <Topbar title="Settings" subtitle="Configure your integrations and workspace settings" />
      <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
        <Card className="p-5">
          <h2 className="text-sm text-[var(--text-muted)]">Active API Keys</h2>
          <p className="mt-2 text-3xl font-semibold">{settings.apiKeysConfigured}</p>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm text-[var(--text-muted)]">WordPress Status</h2>
          <p className="mt-2 text-3xl font-semibold">{settings.wordpressConnected ? "Connected" : "Not Connected"}</p>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm text-[var(--text-muted)]">Indexed Sitemaps</h2>
          <p className="mt-2 text-3xl font-semibold">{settings.sitemapCount}</p>
        </Card>
      </div>
    </AppShell>
  );
}
