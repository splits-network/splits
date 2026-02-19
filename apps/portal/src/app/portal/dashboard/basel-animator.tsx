"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Basel dashboard animator.
 * Compact, dense dashboard -- shorter durations than showcase/messages pages.
 * No ScrollTrigger -- everything enters on mount.
 */

const D = { fast: 0.3, normal: 0.5 };
const E = { editorial: "power3.out" };

interface BaselAnimatorProps {
    children: ReactNode;
}

export function BaselAnimator({ children }: BaselAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            /* Respect reduced motion */
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);

            /* Section headings */
            const headings = $(".section-heading");
            if (headings.length) {
                gsap.fromTo(
                    headings,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        ease: E.editorial,
                        stagger: 0.08,
                    },
                );
            }

            /* KPI cards */
            const kpiCards = $(".kpi-card");
            if (kpiCards.length) {
                gsap.fromTo(
                    kpiCards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        ease: E.editorial,
                        stagger: 0.06,
                        delay: 0.1,
                    },
                );
            }

            /* Chart cards */
            const chartCards = $(".chart-card");
            if (chartCards.length) {
                gsap.fromTo(
                    chartCards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.editorial,
                        stagger: 0.1,
                        delay: 0.2,
                    },
                );
            }

            /* Activity items */
            const activityItems = $(".activity-item");
            if (activityItems.length) {
                gsap.fromTo(
                    activityItems,
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.fast,
                        ease: E.editorial,
                        stagger: 0.04,
                        delay: 0.3,
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
