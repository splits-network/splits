"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

/**
 * Basel GSAP animator for the candidate dashboard.
 * Editorial entrance animations: power3.out easing, staggered fade-in.
 * Follows showcase/dashboards/one patterns.
 */
export function DashboardAnimator({ children }: { children: ReactNode }) {
    const mainRef = useRef<HTMLElement>(null);

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

            /* ── Hero timeline ── */
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

            const heroActions = $1(".hero-actions");
            if (heroActions) {
                heroTl.fromTo(
                    heroActions,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );
            }

            /* ── Data-dependent sections (kpi, charts, feed, sidebar, actions)
                 are animated inside CandidateDashboard via useGSAP
                 once data finishes loading. ── */
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden min-h-screen">
            {children}
        </main>
    );
}
