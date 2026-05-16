import type { PropsWithChildren } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NeuralBackdrop } from "@/components/ui/AiVisuals";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-transparent lg:flex">
      <NeuralBackdrop />
      <Sidebar />
      <div className="relative z-10 flex-1 lg:pl-1">
        <div className="mx-auto w-full max-w-[1700px]">{children}</div>
      </div>
    </div>
  );
}
