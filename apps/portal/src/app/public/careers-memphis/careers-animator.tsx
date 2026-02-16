"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface CareersAnimatorProps {
    children: ReactNode;
}

export function CareersAnimator({ children }: CareersAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            document.documentElement.style.scrollBehavior = "smooth";

            // ════════════════════════════════════════
            // HERO - Memphis shapes
            // ════════════════════════════════════════

            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 0.4,
                    scale: 1,
                    rotation: 0,
                    duration: D.slow,
                    ease: E.elastic,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.2,
                },
            );

            // Continuous floating for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${8 + (i % 3) * 4}`,
                    x: `+=${4 + (i % 2) * 6}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}`,
                    duration: 3 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Hero content timeline
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroMeta = $1(".hero-meta");
            if (heroMeta) {
                heroTl.fromTo(
                    heroMeta,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 60, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            const heroCta = $1(".hero-cta");
            if (heroCta) {
                heroTl.fromTo(
                    heroCta,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            const statsSection = $1(".careers-stats");
            if (statsSection) {
                gsap.fromTo(
                    $(".stat-block"),
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: statsSection, start: "top 90%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // MISSION SECTION
            // ════════════════════════════════════════
            const missionSection = $1(".careers-mission");
            if (missionSection) {
                const inner = missionSection.querySelector(".mission-content");
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.slow,
                            ease: E.smooth,
                            scrollTrigger: { trigger: missionSection, start: "top 75%" },
                        },
                    );
                }
            }

            // ════════════════════════════════════════
            // PULL QUOTES
            // ════════════════════════════════════════
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1,
                        x: 0,
                        rotation: 0,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // VALUES GRID
            // ════════════════════════════════════════
            const valuesHeading = $1(".values-heading");
            if (valuesHeading) {
                gsap.fromTo(
                    valuesHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".careers-values"), start: "top 75%" },
                    },
                );
            }

            const valuesGrid = $1(".values-grid");
            if (valuesGrid) {
                gsap.fromTo(
                    $(".value-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: valuesGrid, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // OPEN ROLES
            // ════════════════════════════════════════
            const rolesSection = $1(".careers-roles");
            if (rolesSection) {
                const inner = rolesSection.querySelector(".roles-content");
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.slow,
                            ease: E.smooth,
                            scrollTrigger: { trigger: rolesSection, start: "top 75%" },
                        },
                    );
                }
            }

            // ════════════════════════════════════════
            // BENEFITS GRID
            // ════════════════════════════════════════
            const benefitsHeading = $1(".benefits-heading");
            if (benefitsHeading) {
                gsap.fromTo(
                    benefitsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".careers-benefits"), start: "top 75%" },
                    },
                );
            }

            const benefitsGrid = $1(".benefits-grid");
            if (benefitsGrid) {
                gsap.fromTo(
                    $(".benefit-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: benefitsGrid, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaSection = $1(".careers-cta");
            if (ctaSection) {
                const ctaContent = $1(".cta-content");
                if (ctaContent) {
                    gsap.fromTo(
                        ctaContent,
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.hero,
                            ease: E.smooth,
                            scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                        },
                    );
                }

                const ctaFooter = $1(".cta-footer");
                if (ctaFooter) {
                    gsap.fromTo(
                        ctaFooter,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.normal,
                            ease: E.smooth,
                            delay: 0.4,
                            scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                        },
                    );
                }
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
