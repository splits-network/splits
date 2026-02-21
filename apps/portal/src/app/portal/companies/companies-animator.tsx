"use client";

import { useRef, useCallback, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

/**
 * Basel GSAP animator for the companies page.
 * Editorial entrance animations: power3.out easing, staggered fade-in.
 * Follows showcase/lists/one patterns.
 */
export function CompaniesAnimator({
    children,
    contentRef,
}: {
    children: ReactNode;
    contentRef: React.RefObject<HTMLDivElement | null>;
}) {
    const mainRef = useRef<HTMLElement>(null);

    /* -- View mode transition -- */

    const animateViewChange = useCallback(
        (callback: () => void) => {
            if (!contentRef.current) {
                callback();
                return;
            }
            gsap.to(contentRef.current, {
                opacity: 0,
                y: 15,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    callback();
                    gsap.fromTo(
                        contentRef.current,
                        { opacity: 0, y: 15 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.35,
                            ease: "power3.out",
                        },
                    );
                },
            });
        },
        [contentRef],
    );

    /* -- Hero entrance -- */

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                const hidden = mainRef.current.querySelectorAll(
                    "[class*='opacity-0']",
                );
                gsap.set(hidden, { opacity: 1 });
                return;
            }

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            /* Hero timeline */
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            const kicker = $1(".hero-kicker");
            if (kicker) {
                heroTl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                );
            }

            const words = $(".hero-headline-word");
            if (words.length) {
                heroTl.fromTo(
                    words,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                );
            }

            const subtitle = $1(".hero-subtitle");
            if (subtitle) {
                heroTl.fromTo(
                    subtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );
            }

            const stats = $(".hero-stat");
            if (stats.length) {
                heroTl.fromTo(
                    stats,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                );
            }

            /* Controls bar */
            const controlsBar = $1(".controls-bar");
            if (controlsBar) {
                gsap.fromTo(
                    controlsBar,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        delay: 0.8,
                    },
                );
            }

            /* Content area */
            const contentArea = $1(".content-area");
            if (contentArea) {
                gsap.fromTo(
                    contentArea,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        delay: 1,
                    },
                );
            }
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden min-h-screen">
            {children}
        </main>
    );
}
