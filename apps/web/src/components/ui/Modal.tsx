"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { modalBackdrop, modalPanel } from "@/lib/motion";

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalBackdrop}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalPanel}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ai-accent)]/70 to-transparent" />
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${variant === 'danger' ? 'text-rose-500' : 'text-[var(--text)]'}`}>
                  {title}
                </h3>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onClose}
                  className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
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
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
