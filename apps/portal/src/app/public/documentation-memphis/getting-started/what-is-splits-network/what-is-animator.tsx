"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter animation constants — professional, subtle
const D = { fast: 0.35, normal: 0.5, slow: 0.7, hero: 0.9 };
const E = {
    smooth: "power2.out",
    gentle: "power3.out",
    soft: "power1.out",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.14 };

interface WhatIsAnimatorProps {
    children: ReactNode;
}

export function WhatIsAnimator({ children }: WhatIsAnimatorProps) {
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
            // HERO — Memphis shapes: gentle fade + scale
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0.6 },
                {
                    opacity: 0.3,
                    scale: 1,
                    duration: D.slow,
                    ease: E.gentle,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.15,
                },
            );

            // Gentle floating for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${4 + (i % 3) * 2}`,
                    x: `+=${2 + (i % 2) * 3}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (2 + i)}`,
                    duration: 4 + i * 0.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Hero content timeline
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBreadcrumb = $1(".hero-breadcrumb");
            if (heroBreadcrumb) {
                heroTl.fromTo(
                    heroBreadcrumb,
                    { opacity: 0, x: -15 },
                    { opacity: 1, x: 0, duration: D.fast },
                );
            }

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.gentle },
                    "-=0.15",
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.35",
                );
            }

            // ════════════════════════════════════════
            // PLATFORM OVERVIEW SECTION
            // ════════════════════════════════════════
            const overviewSection = $1(".overview-section");
            if (overviewSection) {
                const overviewHeading = $1(".overview-heading");
                if (overviewHeading) {
                    gsap.fromTo(
                        overviewHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: overviewSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".overview-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: overviewSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // WHO IT'S FOR SECTION
            // ════════════════════════════════════════
            const audienceSection = $1(".audience-section");
            if (audienceSection) {
                const audienceHeading = $1(".audience-heading");
                if (audienceHeading) {
                    gsap.fromTo(
                        audienceHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: audienceSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".audience-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.loose,
                        scrollTrigger: { trigger: audienceSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // HOW IT WORKS SECTION
            // ════════════════════════════════════════
            const howSection = $1(".how-section");
            if (howSection) {
                const howHeading = $1(".how-heading");
                if (howHeading) {
                    gsap.fromTo(
                        howHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: howSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".step-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: howSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // BENEFITS SECTION
            // ════════════════════════════════════════
            const benefitsSection = $1(".benefits-section");
            if (benefitsSection) {
                const benefitsHeading = $1(".benefits-heading");
                if (benefitsHeading) {
                    gsap.fromTo(
                        benefitsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: benefitsSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".benefit-item"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.tight,
                        scrollTrigger: { trigger: benefitsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // USE CASES SECTION
            // ════════════════════════════════════════
            const useCasesSection = $1(".use-cases-section");
            if (useCasesSection) {
                const useCasesHeading = $1(".use-cases-heading");
                if (useCasesHeading) {
                    gsap.fromTo(
                        useCasesHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: useCasesSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".use-case-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: useCasesSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // NEXT STEPS CTA
            // ════════════════════════════════════════
            const ctaSection = $1(".next-steps-section");
            if (ctaSection) {
                const ctaContent = $1(".next-steps-content");
                if (ctaContent) {
                    gsap.fromTo(
                        ctaContent,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".next-step-link"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: ctaSection, start: "top 75%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
