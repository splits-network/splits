"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

const D = { fast: 0.3, normal: 0.6, slow: 1 };
const E = { smooth: "power2.out", bounce: "back.out(1.7)" };
const S = { cards: 0.1, stats: 0.08 };

export default function MarketplaceAnimator({
    children,
}: {
    children: React.ReactNode;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const $1 = gsap.utils.selector(containerRef);

            // Check reduced motion
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set($1("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            // Hero animations
            const heroTitle = $1(".hero-title")[0];
            const heroSubtitle = $1(".hero-subtitle")[0];
            const searchBar = $1(".search-bar")[0];

            if (heroTitle) {
                gsap.fromTo(
                    heroTitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth }
                );
            }

            if (heroSubtitle) {
                gsap.fromTo(
                    heroSubtitle,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.2,
                    }
                );
            }

            if (searchBar) {
                gsap.fromTo(
                    searchBar,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.4,
                    }
                );
            }

            // Stats animation
            const stats = $1(".stat-item");
            if (stats.length > 0) {
                gsap.fromTo(
                    stats,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.stats,
                        delay: 0.6,
                    }
                );
            }

            // Controls bar animation
            const controlsBar = $1(".controls-bar")[0];
            if (controlsBar) {
                gsap.fromTo(
                    controlsBar,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.8,
                    }
                );
            }

            // Content area animation
            const contentArea = $1(".content-area")[0];
            if (contentArea) {
                gsap.fromTo(
                    contentArea,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        delay: 1,
                    }
                );
            }

            // Stagger recruiter cards when they appear
            const cards = $1(".recruiter-card");
            if (cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.cards,
                        delay: 1.2,
                    }
                );
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
