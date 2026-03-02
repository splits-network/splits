"use client";

import { useRef, useCallback, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

interface FirmsAnimatorProps {
    children: ReactNode;
    contentRef: React.RefObject<HTMLDivElement | null>;
}

export function FirmsAnimator({ children, contentRef }: FirmsAnimatorProps) {
    const mainRef = useRef<HTMLElement>(null);

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
                            clearProps: "transform",
                        },
                    );
                },
            });
        },
        [contentRef],
    );

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

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            // Hero kicker
            const kicker = $1(".hero-kicker");
            if (kicker) {
                tl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                );
            }

            // Hero headline words (3D entrance)
            const words = $(".hero-headline-word");
            if (words.length) {
                tl.fromTo(
                    words,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                        clearProps: "transform",
                    },
                    "-=0.3",
                );
            }

            // Subtitle
            const subtitle = $1(".hero-subtitle");
            if (subtitle) {
                tl.fromTo(
                    subtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" },
                    "-=0.5",
                );
            }

            // Stat bar
            const statBar = $1(".header-stat-bar");
            if (statBar) {
                tl.fromTo(
                    statBar,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                    "-=0.3",
                );
            }

            // Controls bar
            const controlsBar = $1(".controls-bar");
            if (controlsBar) {
                tl.fromTo(
                    controlsBar,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                    "-=0.2",
                );
            }

            // Content area
            const contentArea = $1(".content-area");
            if (contentArea) {
                tl.fromTo(
                    contentArea,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" },
                    "-=0.3",
                );
            }

            // Firm cards (staggered reveal)
            const cards = $(".firm-card");
            if (cards.length) {
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.06,
                        clearProps: "transform",
                    },
                    "-=0.3",
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
