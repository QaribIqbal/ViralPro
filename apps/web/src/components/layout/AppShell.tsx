"use client";

import { useState, useEffect, type PropsWithChildren } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NeuralBackdrop } from "@/components/ui/AiVisuals";

export function AppShell({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) {
    // Avoid Layout Shift (CLS) during loading by rendering structural containers,
    // but exclude native buttons, selects, and form elements to guarantee clean hydration.
    return (
      <div className="relative min-h-screen min-h-[100dvh] overflow-x-hidden bg-transparent lg:flex">
        <NeuralBackdrop />
        <aside className="relative z-20 m-3 flex w-[calc(100%_-_1.5rem)] max-w-[calc(100vw_-_1.5rem)] flex-col overflow-hidden rounded-3xl border border-[var(--border)] p-4 vp-glass-panel lg:m-4 lg:h-[calc(100vh-2rem)] lg:w-64 lg:p-5 lg:sticky lg:top-4" />
        <div className="relative z-10 min-w-0 flex-1 lg:pl-1" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-x-hidden bg-transparent lg:flex">
      <NeuralBackdrop />
      <Sidebar />
      <div className="relative z-10 min-w-0 flex-1 lg:pl-1">
        <div className="mx-auto w-full max-w-[1700px]">{children}</div>
      </div>
    </div>
  );
}
