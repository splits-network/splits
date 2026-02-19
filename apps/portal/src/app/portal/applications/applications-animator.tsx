"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

/* ─── Basel Animation Constants ──────────────────────────────────────────── */

const D = { fast: 0.3, normal: 0.6, slow: 0.8, hero: 1 };
const E = { smooth: "power3.out", entrance: "power2.out" };
const S = { items: 0.08, words: 0.12 };

/* ─── Animator Component ─────────────────────────────────────────────────── */

export function ApplicationsAnimator({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                // Reveal all hidden elements immediately
                const hidden = containerRef.current.querySelectorAll(
                    "[class*='opacity-0']",
                );
                if (hidden.length) gsap.set(hidden, { opacity: 1 });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // Hero entrance timeline
            const heroTl = gsap.timeline({
                defaults: { ease: E.smooth },
            });

            const kicker = $1(".hero-kicker");
            if (kicker) {
                heroTl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                );
            }

            const headlineWords = $(".hero-headline-word");
            if (headlineWords.length) {
                heroTl.fromTo(
                    headlineWords,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: D.hero,
                        stagger: S.words,
                    },
                    "-=0.3",
                );
            }

            const subtitle = $1(".hero-subtitle");
            if (subtitle) {
                heroTl.fromTo(
                    subtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.slow },
                    "-=0.5",
                );
            }

            const stats = $(".hero-stat");
            if (stats.length) {
                heroTl.fromTo(
                    stats,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast, stagger: S.items },
                    "-=0.3",
                );
            }

            // Controls bar
            const controls = $1(".controls-bar");
            if (controls) {
                gsap.fromTo(
                    controls,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.8,
                    },
                );
            }

            // Content area
            const content = $1(".content-area");
            if (content) {
                gsap.fromTo(
                    content,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        delay: 1,
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="overflow-hidden min-h-screen bg-base-100">
            {children}
        </div>
    );
}
