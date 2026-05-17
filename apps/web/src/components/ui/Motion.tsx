"use client";

import { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  pageVariants,
  panelReveal,
  sectionVariants,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";

export function PageTransition({ children }: PropsWithChildren) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "initial"}
      animate="animate"
      exit={reduceMotion ? undefined : "exit"}
      variants={pageVariants}
      style={{ willChange: reduceMotion ? undefined : "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={sectionVariants}
      style={{ willChange: reduceMotion ? undefined : "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div 
      className={className} 
      variants={staggerItem}
      whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      style={{ willChange: reduceMotion ? undefined : "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedPanel({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      exit="exit"
      variants={panelReveal}
      style={{ willChange: reduceMotion ? undefined : "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
