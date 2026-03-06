'use client';

/**
 * Global GSAP defaults initializer.
 *
 * Sets `clearProps: "transform"` as the default for all tweens,
 * preventing residual inline transforms from creating CSS stacking
 * contexts that break sticky/fixed positioning and z-order.
 *
 * Call once in each app's root layout or provider.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;

export function initGsapDefaults() {
  if (typeof window === 'undefined') return;
  if (initialized) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ clearProps: 'transform' });

  initialized = true;
}
