'use client';

import { useEffect, type RefObject } from 'react';

interface ScrollRevealOptions {
    /** IntersectionObserver threshold (0-1). Default: 0.15 */
    threshold?: number;
    /** CSS selector for elements to observe. Default: '.scroll-reveal' */
    selector?: string;
    /** Root margin for IntersectionObserver. Default: '0px 0px -10% 0px' */
    rootMargin?: string;
}

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 *
 * Adds `.animate` class to `.scroll-reveal` elements when they enter
 * the viewport, triggering CSS keyframe animations defined in animations.css.
 *
 * Handles two common patterns:
 * 1. Dynamically added elements (conditional renders after data loads)
 * 2. Deferred container refs (early returns before ref-bearing element mounts)
 */
export function useScrollReveal(
    containerRef: RefObject<HTMLElement | null>,
    options: ScrollRevealOptions = {}
) {
    const {
        threshold = 0.15,
        selector = '.scroll-reveal',
        rootMargin = '0px 0px -10% 0px',
    } = options;

    useEffect(() => {
        let cancelled = false;
        const cleanups: (() => void)[] = [];

        function setup(container: HTMLElement) {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reducedMotion) {
                const revealAll = () => {
                    container.querySelectorAll(`${selector}:not(.animate)`).forEach((el) => {
                        el.classList.add('animate');
                    });
                };
                revealAll();
                const mutation = new MutationObserver(revealAll);
                mutation.observe(container, { childList: true, subtree: true });
                cleanups.push(() => mutation.disconnect());
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold, rootMargin }
            );

            const observeNew = () => {
                container.querySelectorAll(`${selector}:not(.animate)`).forEach((el) => {
                    observer.observe(el);
                });
            };

            observeNew();

            // Watch for dynamically added elements (e.g. after data loads)
            const mutation = new MutationObserver(observeNew);
            mutation.observe(container, { childList: true, subtree: true });

            cleanups.push(() => {
                observer.disconnect();
                mutation.disconnect();
            });
        }

        if (containerRef.current) {
            setup(containerRef.current);
        } else {
            // Ref not yet available (component shows loading/error state first).
            // Poll until the ref-bearing element mounts.
            const id = setInterval(() => {
                if (cancelled) return;
                if (containerRef.current) {
                    clearInterval(id);
                    setup(containerRef.current);
                }
            }, 100);
            cleanups.push(() => clearInterval(id));
        }

        return () => {
            cancelled = true;
            cleanups.forEach((fn) => fn());
        };
    }, [threshold, selector, rootMargin]);
}
