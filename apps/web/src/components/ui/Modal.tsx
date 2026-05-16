"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: "danger" | "info";
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer,
  variant = "info"
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${variant === 'danger' ? 'text-rose-500' : 'text-[var(--text)]'}`}>
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {description && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>

        <div className="mb-8 text-[var(--text)]">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
