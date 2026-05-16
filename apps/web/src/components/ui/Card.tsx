import type { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`vp-glass-panel vp-card-hover rounded-3xl ${className}`}>
      {children}
    </div>
  );
}
