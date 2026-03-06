'use client';

/**
 * Drop-in client component that initializes GSAP defaults.
 * Include once in each app's root layout: <GsapInit />
 *
 * Sets clearProps: "transform" as the global default for all tweens,
 * preventing residual inline transforms from breaking CSS stacking contexts.
 */

import { initGsapDefaults } from './gsap-defaults';

initGsapDefaults();

export function GsapInit() {
    return null;
}
