"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Animation constants
const D = {
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
} as const;

const E = {
    out: "power2.out",
    inOut: "power2.inOut",
} as const;

const S = {
    items: 0.05,
    pills: 0.08,
} as const;

export function PlacementsAnimator({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const $1 = (sel: string) => containerRef.current?.querySelector(sel);
            const $$ = (sel: string) => containerRef.current?.querySelectorAll(sel);

            // Check for reduced motion preference
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                // Set everything visible immediately
                const allAnimated = $$("[class*='opacity-0']");
                if (allAnimated) {
                    gsap.set(allAnimated, { opacity: 1 });
                }
                return;
            }

            // Null guards for all elements
            const memphisShapes = $$(".memphis-shape");
            const headerBadge = $1(".header-badge");
            const headerTitle = $1(".header-title");
            const headerSubtitle = $1(".header-subtitle");
            const retroMetrics = $1(".retro-metrics");
            const controlsBar = $1(".controls-bar");
            const listingsContent = $1(".listings-content");

            // Timeline
            const tl = gsap.timeline({ defaults: { ease: E.out } });

            // Memphis shapes
            if (memphisShapes && memphisShapes.length > 0) {
                tl.fromTo(
                    memphisShapes,
                    { opacity: 0, scale: 0, rotation: -45 },
                    { opacity: 0.6, scale: 1, rotation: 0, duration: D.slow, stagger: S.items },
                    0.1
                );
            }

            // Header elements
            if (headerBadge) {
                tl.fromTo(headerBadge, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal }, 0.2);
            }
            if (headerTitle) {
                tl.fromTo(headerTitle, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.slow }, 0.3);
            }
            if (headerSubtitle) {
                tl.fromTo(headerSubtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.normal }, 0.5);
            }

            // Metrics
            if (retroMetrics) {
                const metricBlocks = retroMetrics.querySelectorAll(".metric-block");
                if (metricBlocks && metricBlocks.length > 0) {
                    tl.fromTo(
                        metricBlocks,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: D.normal, stagger: S.pills },
                        0.6
                    );
                }
            }

            // Controls bar
            if (controlsBar) {
                tl.fromTo(controlsBar, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: D.fast }, 0.8);
            }

            // Listings content
            if (listingsContent) {
                tl.fromTo(listingsContent, { opacity: 0 }, { opacity: 1, duration: D.fast }, 0.9);
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
