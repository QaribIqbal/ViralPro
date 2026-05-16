import type { Variants } from "framer-motion";

export const motionDurations = {
  instant: 0.16,
  fast: 0.22,
  base: 0.34,
  slow: 0.52,
};

export const motionEase = [0.16, 1, 0.3, 1] as const;

export const spring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
} as const;

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionDurations.base, ease: motionEase },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(6px)",
    transition: { duration: motionDurations.fast, ease: motionEase },
  },
};

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.slow, ease: motionEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
};

export const panelReveal: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { duration: motionDurations.fast, ease: motionEase },
  },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: motionDurations.fast } },
  exit: { opacity: 0, transition: { duration: motionDurations.fast } },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.96, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: spring,
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.97,
    filter: "blur(6px)",
    transition: { duration: motionDurations.fast, ease: motionEase },
  },
};
