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

interface CompaniesAnimatorProps {
    children: ReactNode;
}

export function CompaniesAnimator({ children }: CompaniesAnimatorProps) {
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

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════

            // Memphis shapes -- elastic bounce in from random positions
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

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
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

            heroTl.fromTo(
                $(".hero-cta"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.fast, stagger: S.normal },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            const statsSection = $1(".companies-stats");
            if (statsSection) {
                gsap.fromTo(
                    $(".stat-block"),
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: statsSection, start: "top 90%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PAIN POINTS
            // ════════════════════════════════════════
            const painSection = $1(".pain-section");
            if (painSection) {
                const painHeading = painSection.querySelector(".pain-heading");
                if (painHeading) {
                    gsap.fromTo(
                        painHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: painSection, start: "top 75%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".pain-card"),
                    { opacity: 0, y: 40, rotation: -2 },
                    {
                        opacity: 1, y: 0, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: painSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PULL QUOTE
            // ════════════════════════════════════════
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1, x: 0, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // FEATURES GRID
            // ════════════════════════════════════════
            const featuresSection = $1(".features-section");
            if (featuresSection) {
                const featuresHeading = featuresSection.querySelector(".features-heading");
                if (featuresHeading) {
                    gsap.fromTo(
                        featuresHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: featuresSection, start: "top 75%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".feature-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: $1(".features-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // HOW IT WORKS
            // ════════════════════════════════════════
            const howSection = $1(".how-section");
            if (howSection) {
                const howHeading = howSection.querySelector(".how-heading");
                if (howHeading) {
                    gsap.fromTo(
                        howHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: howSection, start: "top 75%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".how-step"),
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: howSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PRICING
            // ════════════════════════════════════════
            const pricingSection = $1(".pricing-section");
            if (pricingSection) {
                gsap.fromTo(
                    pricingSection.querySelector(".pricing-content"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: pricingSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // COMPARISON
            // ════════════════════════════════════════
            const comparisonSection = $1(".comparison-section");
            if (comparisonSection) {
                const comparisonHeading = comparisonSection.querySelector(".comparison-heading");
                if (comparisonHeading) {
                    gsap.fromTo(
                        comparisonHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: comparisonSection, start: "top 75%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".comparison-card"),
                    { opacity: 0, y: 50, scale: 0.9, rotation: -2 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: $1(".comparison-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaSection = $1(".companies-cta");
            if (ctaSection) {
                // CTA Memphis shapes
                gsap.fromTo(
                    ctaSection.querySelectorAll(".cta-shape"),
                    { opacity: 0, scale: 0, rotation: -90 },
                    {
                        opacity: 1, scale: 1, rotation: 0,
                        duration: D.slow,
                        ease: E.elastic,
                        stagger: { each: S.tight, from: "random" },
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                    },
                );

                const ctaContent = ctaSection.querySelector(".cta-content");
                if (ctaContent) {
                    gsap.fromTo(
                        ctaContent,
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1, y: 0,
                            duration: D.hero, ease: E.smooth,
                            scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".cta-card"),
                    { opacity: 0, y: 40, scale: 0.85 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        delay: 0.3,
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
