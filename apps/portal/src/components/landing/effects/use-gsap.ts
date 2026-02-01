'use client';

import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Ensure plugins are registered
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealOptions {
  /** Animation start position relative to viewport (default: 'top 80%') */
  start?: string;
  /** Animation end position (default: 'bottom 20%') */
  end?: string;
  /** Only animate once (default: true) */
  once?: boolean;
  /** Stagger delay for child elements (default: 0.1) */
  stagger?: number;
  /** Animation duration (default: 0.6) */
  duration?: number;
  /** Y offset for fade-up effect (default: 40) */
  yOffset?: number;
  /** Delay before animation starts (default: 0) */
  delay?: number;
}

/**
 * Hook for scroll-triggered fade-up animations
 * Automatically triggers when element enters viewport
 */
export function useScrollFadeUp<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  const {
    start = 'top 80%',
    once = true,
    duration = 0.6,
    yOffset = 40,
    delay = 0,
  } = options;

  useGSAP(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        y: yOffset,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }
    );
  }, { scope: ref });

  return ref;
}

/**
 * Hook for scroll-triggered staggered animations on children
 * Each child element animates in sequence
 */
export function useScrollStagger<T extends HTMLElement = HTMLDivElement>(
  childSelector: string,
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  const {
    start = 'top 80%',
    once = true,
    stagger = 0.1,
    duration = 0.5,
    yOffset = 30,
    delay = 0,
  } = options;

  useGSAP(() => {
    if (!ref.current) return;

    const children = ref.current.querySelectorAll(childSelector);
    if (children.length === 0) return;

    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: yOffset,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }
    );
  }, { scope: ref });

  return ref;
}

/**
 * Hook for scroll-triggered scale-in animations
 */
export function useScrollScaleIn<T extends HTMLElement = HTMLDivElement>(
  options: Omit<ScrollRevealOptions, 'yOffset'> & { scale?: number } = {}
) {
  const ref = useRef<T>(null);

  const {
    start = 'top 80%',
    once = true,
    duration = 0.5,
    scale = 0.9,
    delay = 0,
  } = options;

  useGSAP(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        scale,
      },
      {
        opacity: 1,
        scale: 1,
        duration,
        delay,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }
    );
  }, { scope: ref });

  return ref;
}

/**
 * Hook for scroll-linked parallax effect
 * Element moves slower/faster than scroll speed
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.5 // 0 = no movement, 1 = normal scroll, >1 = faster
) {
  const ref = useRef<T>(null);

  useGSAP(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, { scope: ref });

  return ref;
}

/**
 * Hook for creating a GSAP timeline with scroll trigger
 * Returns refs and timeline builder for complex animations
 */
export function useScrollTimeline<T extends HTMLElement = HTMLDivElement>(
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
  } = {}
) {
  const containerRef = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const {
    start = 'top top',
    end = 'bottom top',
    scrub = false,
    pin = false,
  } = options;

  const buildTimeline = useCallback((builder: (tl: gsap.core.Timeline) => void) => {
    if (!containerRef.current) return;

    // Kill existing timeline if any
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start,
        end,
        scrub,
        pin,
      },
    });

    builder(timelineRef.current);
  }, [start, end, scrub, pin]);

  return { ref: containerRef, buildTimeline };
}

/**
 * Hook for animating a counter from 0 to target value
 */
export function useAnimatedCounter(
  targetValue: number,
  options: {
    duration?: number;
    start?: string;
    once?: boolean;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
) {
  const ref = useRef<HTMLSpanElement>(null);

  const {
    duration = 1.5,
    start = 'top 80%',
    once = true,
    prefix = '',
    suffix = '',
    decimals = 0,
  } = options;

  useGSAP(() => {
    if (!ref.current) return;

    const obj = { value: 0 };

    gsap.to(obj, {
      value: targetValue,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ref.current,
        start,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
      },
      onUpdate: () => {
        if (ref.current) {
          const formatted = decimals > 0
            ? obj.value.toFixed(decimals)
            : Math.floor(obj.value).toLocaleString();
          ref.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });
  }, { dependencies: [targetValue] });

  return ref;
}
