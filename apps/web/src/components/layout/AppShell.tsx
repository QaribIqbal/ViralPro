import type { PropsWithChildren } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NeuralBackdrop } from "@/components/ui/AiVisuals";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] lg:flex">
      <NeuralBackdrop />
      <Sidebar />
      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
}
