import type { Variants, Transition } from 'motion/react'

// === TRANSITIONS ===

export const springSnap: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
}

export const springPop: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
}

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
}

export const easeOut: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
}

export const easeOutSlow: Transition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1],
}

// === ENTRANCE VARIANTS ===

/** Fade in and slide up — main scroll entrance */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSnap,
  },
}

/** Fade in and slide up with slower ease — for hero text */
export const fadeInUpSlow: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOutSlow,
  },
}

/** Fade in from left */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSnap,
  },
}

/** Fade in from right */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSnap,
  },
}

/** Simple fade in */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

/** Scale up from slightly smaller */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnap,
  },
}

// === STAGGER CONTAINERS ===

/** Parent container that staggers children — default speed */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

/** Stagger container — slower for consulting */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

/** Stagger container — faster for marketing */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

/** Child item used inside stagger containers */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSnap,
  },
}

// === HOVER / TAP VARIANTS ===

/** Card hover — lifts up slightly with spring */
export const hoverLift = {
  whileHover: { y: -6, scale: 1.02, transition: springPop },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}

/** Button hover — subtle scale */
export const hoverScale = {
  whileHover: { scale: 1.03, transition: springPop },
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
}

/** Marketing glow hover — for cards with glow effect */
export const hoverGlow = {
  whileHover: {
    y: -6,
    scale: 1.02,
    boxShadow: '0 0 30px rgba(180, 144, 240, 0.15)',
    transition: springPop,
  },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}

// === HERO SPECIFIC ===

/** Hero headline entrance — dramatic slow reveal */
export const heroHeadline: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

/** Hero subtitle — follows headline with delay */
export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

/** Hero CTA buttons — follow subtitle with delay */
export const heroCTA: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}
