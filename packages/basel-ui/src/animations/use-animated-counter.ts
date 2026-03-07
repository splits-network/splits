'use client';

import { useEffect, useRef } from 'react';

interface AnimatedCounterOptions {
    /** Animation duration in ms. Default: 1500 */
    duration?: number;
    /** Text prefix (e.g., '$'). Default: '' */
    prefix?: string;
    /** Text suffix (e.g., '%', '+'). Default: '' */
    suffix?: string;
    /** Decimal places. Default: 0 */
    decimals?: number;
    /** IntersectionObserver threshold. Default: 0.5 */
    threshold?: number;
}

/**
 * Lightweight animated counter hook using requestAnimationFrame.
 *
 * Counts from 0 to targetValue when element scrolls into view.
 * Replaces GSAP's useAnimatedCounter with zero dependencies.
 */
export function useAnimatedCounter(
    targetValue: number,
    options: AnimatedCounterOptions = {}
) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    const {
        duration = 1500,
        prefix = '',
        suffix = '',
        decimals = 0,
        threshold = 0.5,
    } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Show final value immediately for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const formatted = decimals > 0
                ? targetValue.toFixed(decimals)
                : Math.floor(targetValue).toLocaleString();
            el.textContent = `${prefix}${formatted}${suffix}`;
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;
                        observer.disconnect();
                        animateCount(el, targetValue, duration, prefix, suffix, decimals);
                    }
                });
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [targetValue, duration, prefix, suffix, decimals, threshold]);

    return ref;
}

function animateCount(
    el: HTMLElement,
    target: number,
    duration: number,
    prefix: string,
    suffix: string,
    decimals: number
) {
    const start = performance.now();

    function update(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out curve (matches power2.out feel)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        const formatted = decimals > 0
            ? current.toFixed(decimals)
            : Math.floor(current).toLocaleString();

        el.textContent = `${prefix}${formatted}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
