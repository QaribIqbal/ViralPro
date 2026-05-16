import type { PropsWithChildren } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--bg)] lg:flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
