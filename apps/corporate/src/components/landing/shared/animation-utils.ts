/**
 * Animation utilities and presets for consistent animations across landing page
 *
 * Style: Medium Impact
 * - Noticeable reveals that catch attention without overwhelming
 * - Playful micro-interactions
 * - Balanced timing - feels premium but not over-the-top
 */

// =============================================================================
// EASING PRESETS
// =============================================================================

export const easing = {
  /** Smooth deceleration - good for entrances */
  smooth: 'power2.out',
  /** Slight overshoot - good for poppy reveals */
  bounce: 'back.out(1.4)',
  /** Gentle bounce for playful elements */
  softBounce: 'back.out(1.2)',
  /** Linear - for scrubbed scroll animations */
  linear: 'none',
  /** Strong deceleration - for impactful landings */
  strong: 'power3.out',
  /** Elastic - for attention-grabbing micro-interactions */
  elastic: 'elastic.out(1, 0.5)',
} as const;

// =============================================================================
// DURATION PRESETS
// =============================================================================

export const duration = {
  /** Quick micro-interactions (hover states, toggles) */
  fast: 0.3,
  /** Standard element animations */
  normal: 0.6,
  /** Slower reveals for emphasis */
  slow: 0.9,
  /** Extended animations for hero/major sections */
  hero: 1.2,
  /** Counter animations */
  counter: 1.5,
} as const;

// =============================================================================
// STAGGER PRESETS
// =============================================================================

export const stagger = {
  /** Tight stagger for list items */
  tight: 0.08,
  /** Normal stagger for cards/features */
  normal: 0.12,
  /** Loose stagger for major sections */
  loose: 0.2,
  /** Wide stagger for dramatic effect */
  dramatic: 0.3,
} as const;

// =============================================================================
// SCROLL TRIGGER PRESETS
// =============================================================================

export const scrollTrigger = {
  /** Standard - triggers when element is 80% up the viewport */
  standard: {
    start: 'top 80%',
    toggleActions: 'play none none none' as const,
  },
  /** Early - triggers when element first enters viewport */
  early: {
    start: 'top 95%',
    toggleActions: 'play none none none' as const,
  },
  /** Center - triggers when element is centered */
  center: {
    start: 'top center',
    toggleActions: 'play none none none' as const,
  },
  /** Reversible - plays forward and backward on scroll */
  reversible: {
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play reverse play reverse' as const,
  },
} as const;

// =============================================================================
// ANIMATION PRESETS (for gsap.fromTo)
// =============================================================================

export const fadeUp = {
  from: { opacity: 0, y: 40 },
  to: { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
} as const;

export const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1, duration: duration.normal, ease: easing.smooth },
} as const;

export const scaleIn = {
  from: { opacity: 0, scale: 0.9 },
  to: { opacity: 1, scale: 1, duration: duration.normal, ease: easing.bounce },
} as const;

export const slideFromLeft = {
  from: { opacity: 0, x: -50 },
  to: { opacity: 1, x: 0, duration: duration.normal, ease: easing.smooth },
} as const;

export const slideFromRight = {
  from: { opacity: 0, x: 50 },
  to: { opacity: 1, x: 0, duration: duration.normal, ease: easing.smooth },
} as const;

export const popIn = {
  from: { opacity: 0, scale: 0 },
  to: { opacity: 1, scale: 1, duration: duration.fast, ease: easing.bounce },
} as const;

// =============================================================================
// HOVER ANIMATION CONFIGS
// =============================================================================

export const hoverLift = {
  y: -4,
  duration: duration.fast,
  ease: easing.smooth,
} as const;

export const hoverScale = {
  scale: 1.02,
  duration: duration.fast,
  ease: easing.smooth,
} as const;

export const iconWiggle = {
  keyframes: [
    { rotation: 0 },
    { rotation: -10 },
    { rotation: 10 },
    { rotation: -5 },
    { rotation: 0 },
  ],
  duration: 0.5,
  ease: easing.smooth,
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on reduced motion preference
 * Returns 0 if user prefers reduced motion
 */
export function getAnimationDuration(baseDuration: number): number {
  return prefersReducedMotion() ? 0 : baseDuration;
}

/**
 * Create a stagger config that respects reduced motion
 */
export function createStagger(baseStagger: number): number | object {
  if (prefersReducedMotion()) {
    return 0;
  }
  return baseStagger;
}
