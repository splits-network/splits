"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Animation Constants ────────────────────────────────────────────────────
const D = { fast: 0.4, normal: 0.6, slow: 0.8 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.4)" };
const S = { tight: 0.05, normal: 0.1 };

// ─── Helper ─────────────────────────────────────────────────────────────────
function $1(selector: string, parent?: HTMLElement) {
    return parent ? parent.querySelector(selector) : document.querySelector(selector);
}

function $$(selector: string, parent?: HTMLElement) {
    return Array.from(
        parent ? parent.querySelectorAll(selector) : document.querySelectorAll(selector)
    );
}

// ─── LegalAnimator ──────────────────────────────────────────────────────────
export function LegalAnimator({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Handle prefers-reduced-motion
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (prefersReducedMotion) {
                gsap.set($$("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            const container = containerRef.current;
            if (!container) return;

            // ─── MEMPHIS SHAPES ─────────────────────────────────────────────
            const memphisShapes = $$(".memphis-shape", container);
            if (memphisShapes.length > 0) {
                gsap.fromTo(
                    memphisShapes,
                    { opacity: 0, scale: 0, rotation: -180 },
                    {
                        opacity: 0.3,
                        scale: 1,
                        rotation: 0,
                        duration: D.slow,
                        ease: E.elastic,
                        stagger: { each: S.tight, from: "random" },
                        delay: 0.2,
                    }
                );

                // Continuous floating motion
                memphisShapes.forEach((shape, i) => {
                    gsap.to(shape, {
                        y: `+=${6 + (i % 3) * 3}`,
                        x: `+=${3 + (i % 2) * 4}`,
                        rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}`,
                        duration: 2.5 + i * 0.3,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                    });
                });
            }

            // ─── HERO TIMELINE ──────────────────────────────────────────────
            const heroBadge = $1(".hero-badge", container);
            const heroTitle = $1(".hero-title", container);
            const heroSubtitle = $1(".hero-subtitle", container);
            const heroDate = $1(".hero-date", container);

            const heroTimeline = gsap.timeline({ delay: 0.3 });

            if (heroBadge) {
                heroTimeline.fromTo(
                    heroBadge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.fast, ease: E.smooth }
                );
            }

            if (heroTitle) {
                heroTimeline.fromTo(
                    heroTitle,
                    { opacity: 0, y: 40, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: D.slow, ease: E.smooth },
                    "-=0.2"
                );
            }

            if (heroSubtitle) {
                heroTimeline.fromTo(
                    heroSubtitle,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth },
                    "-=0.3"
                );
            }

            if (heroDate) {
                heroTimeline.fromTo(
                    heroDate,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: D.fast, ease: E.smooth },
                    "-=0.2"
                );
            }

            // ─── TABLE OF CONTENTS ──────────────────────────────────────────
            const tocCard = $1(".toc-card", container);
            if (tocCard) {
                gsap.fromTo(
                    tocCard,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: tocCard,
                            start: "top 85%",
                        },
                    }
                );
            }

            // ─── CONTENT SECTIONS ───────────────────────────────────────────
            const sections = $$(".content-section", container);
            if (sections.length > 0) {
                sections.forEach((section) => {
                    gsap.fromTo(
                        section,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.normal,
                            ease: E.smooth,
                            scrollTrigger: {
                                trigger: section,
                                start: "top 85%",
                            },
                        }
                    );
                });
            }

            // ─── SECTION CARDS ──────────────────────────────────────────────
            const sectionCards = $$(".section-card", container);
            if (sectionCards.length > 0) {
                sectionCards.forEach((card) => {
                    gsap.fromTo(
                        card,
                        { opacity: 0, y: 20, scale: 0.98 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: D.fast,
                            ease: E.smooth,
                            scrollTrigger: {
                                trigger: card,
                                start: "top 90%",
                            },
                        }
                    );
                });
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
