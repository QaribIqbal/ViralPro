"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { marketingNav } from "@/lib/marketing-data";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function MarketingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6 sm:px-6 lg:px-8 pointer-events-none">
      <motion.div 
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(10, 13, 20, 0.75)" : "rgba(10, 13, 20, 0)",
          borderColor: scrolled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0)",
          paddingTop: scrolled ? "10px" : "14px",
          paddingBottom: scrolled ? "10px" : "14px",
          backdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
          boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,0.5)" : "0 0px 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-5xl items-center justify-between rounded-full border px-3 pointer-events-auto"
      >
        <Link href="/" className="flex items-center gap-3 pl-3">
          <motion.span 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          >
            V
          </motion.span>
          <span className="text-[15px] font-semibold tracking-tight text-white">ViralPro</span>
        </Link>

        <nav className="hidden items-center md:flex">
          {marketingNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-5 py-2 text-[13px] font-medium tracking-wide transition-colors ${
                  active 
                    ? "text-white" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.div 
                    layoutId="navbar-active-bg"
                    className="absolute inset-0 -z-10 rounded-full bg-white/10 shadow-inner"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 pr-1">
          <Link href="/sign-in" className="hidden sm:block">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full px-5 py-2 text-[13px] font-semibold tracking-wide text-slate-300 transition-colors hover:text-white"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/sign-up">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-white px-6 py-2 text-[13px] font-bold tracking-wide text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Start Trial
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </header>
  );
}
