// Animation presets and utilities
export {
    easing,
    duration,
    stagger,
    scrollTrigger,
    fadeUp,
    fadeIn,
    scaleIn,
    slideFromLeft,
    slideFromRight,
    popIn,
    hoverLift,
    hoverScale,
    iconWiggle,
    prefersReducedMotion,
    getAnimationDuration,
    createStagger,
} from './presets';

// GSAP animation hooks
export {
    useScrollFadeUp,
    useScrollStagger,
    useScrollScaleIn,
    useParallax,
    useScrollTimeline,
    useAnimatedCounter,
} from './use-gsap-animations';

// Article-specific animations
export { useArticleAnimations } from './use-article-animations';

// Global GSAP defaults initializer
export { initGsapDefaults } from './gsap-defaults';

// Drop-in client component for root layouts
export { GsapInit } from './gsap-init';
