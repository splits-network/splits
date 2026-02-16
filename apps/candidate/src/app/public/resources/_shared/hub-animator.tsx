"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter durations for hub pages (directory listings)
const D = { fast: 0.25, normal: 0.4, slow: 0.6, hero: 0.7 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.4)",
    elastic: "elastic.out(1, 0.3)",
};
const S = { tight: 0.05, normal: 0.08, loose: 0.12 };

interface HubAnimatorProps {
    children: ReactNode;
}

export function HubAnimator({ children }: HubAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            // Prefers-reduced-motion support
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 }
                );
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // ════════════════════════════════════════
            // MEMPHIS SHAPES (Hero)
            // ════════════════════════════════════════
            const memphisShapes = $(".memphis-shape");
            if (memphisShapes.length > 0) {
                gsap.fromTo(
                    memphisShapes,
                    { opacity: 0, scale: 0.95 },
                    {
                        opacity: 0.3,
                        scale: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: { each: S.tight, from: "random" },
                        delay: 0.1,
                    }
                );

                // Minimal float
                memphisShapes.forEach((shape, i) => {
                    gsap.to(shape, {
                        y: `+=${4 + (i % 2) * 2}`,
                        x: `+=${2 + (i % 2) * 2}`,
                        duration: 4 + i * 0.3,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                    });
                });
            }

            // ════════════════════════════════════════
            // HERO TIMELINE
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -15 },
                    { opacity: 1, y: 0, duration: D.normal }
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.2"
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.3"
                );
            }

            // ════════════════════════════════════════
            // HUB CARDS (Staggered grid)
            // ════════════════════════════════════════
            const hubCards = $(".hub-card");
            if (hubCards.length > 0) {
                gsap.fromTo(
                    hubCards,
                    { opacity: 0, y: 25, scale: 0.98 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: hubCards[0],
                            start: "top 85%",
                        },
                    }
                );
            }

            // ════════════════════════════════════════
            // CTA CARD
            // ════════════════════════════════════════
            const ctaCard = $1(".cta-card");
            if (ctaCard) {
                gsap.fromTo(
                    ctaCard,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: ctaCard,
                            start: "top 85%",
                        },
                    }
                );
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
