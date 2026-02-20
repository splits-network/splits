"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface ArticleAnimatorProps {
    children: ReactNode;
}

export function ArticleAnimator({ children }: ArticleAnimatorProps) {
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
                    { opacity: 0, scale: 0, rotation: -180 },
                    {
                        opacity: 0.35,
                        scale: 1,
                        rotation: 0,
                        duration: D.slow,
                        ease: E.elastic,
                        stagger: { each: S.tight, from: "random" },
                        delay: 0.2,
                    }
                );

                // Continuous float
                memphisShapes.forEach((shape, i) => {
                    gsap.to(shape, {
                        y: `+=${6 + (i % 3) * 3}`,
                        x: `+=${3 + (i % 2) * 4}`,
                        rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}`,
                        duration: 3 + i * 0.4,
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
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce }
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 50, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                    "-=0.3"
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4"
                );
            }

            const heroMeta = $1(".hero-meta");
            if (heroMeta) {
                heroTl.fromTo(
                    heroMeta,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.3"
                );
            }

            // ════════════════════════════════════════
            // ARTICLE CARDS (Grid stagger)
            // ════════════════════════════════════════
            const articleCards = $(".article-card");
            if (articleCards.length > 0) {
                gsap.fromTo(
                    articleCards,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: articleCards[0],
                            start: "top 85%",
                        },
                    }
                );
            }

            // ════════════════════════════════════════
            // SECTION REVEALS
            // ════════════════════════════════════════
            $(".article-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                        },
                    }
                );
            });

            // ════════════════════════════════════════
            // PULL QUOTES
            // ════════════════════════════════════════
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, scale: 0.95 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: quote,
                            start: "top 85%",
                        },
                    }
                );
            });

            // ════════════════════════════════════════
            // TIP BOXES
            // ════════════════════════════════════════
            $(".tip-box").forEach((box) => {
                gsap.fromTo(
                    box,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: box,
                            start: "top 85%",
                        },
                    }
                );
            });

            // ════════════════════════════════════════
            // BENEFITS/FEATURES GRID
            // ════════════════════════════════════════
            $(".benefit-card").forEach((card, idx) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                        },
                    }
                );
            });

            // ════════════════════════════════════════
            // CTA SECTION
            // ════════════════════════════════════════
            const ctaContent = $1(".cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".article-cta"),
                            start: "top 85%",
                        },
                    }
                );
            }

            // ════════════════════════════════════════
            // RELATED ARTICLES
            // ════════════════════════════════════════
            const relatedCards = $(".related-card");
            if (relatedCards.length > 0) {
                gsap.fromTo(
                    relatedCards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: relatedCards[0],
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
