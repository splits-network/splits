"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis marketing animation constants (aggressive, high energy)
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface ForRecruitersAnimatorProps {
    children: ReactNode;
}

export function ForRecruitersAnimator({ children }: ForRecruitersAnimatorProps) {
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
            // HERO
            // ════════════════════════════════════════

            // Memphis shapes -- elastic bounce in from random positions
            const shapes = $(".memphis-shape");
            if (shapes.length > 0) {
                gsap.fromTo(
                    shapes,
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
                shapes.forEach((shape, i) => {
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
            }

            // Hero content timeline
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroTag = $1(".hero-tag");
            if (heroTag) {
                heroTl.fromTo(
                    heroTag,
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
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: D.normal, ease: E.bounce },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            const statBlocks = $(".stat-block");
            const statsSection = $1(".recruiters-stats");
            if (statBlocks.length > 0 && statsSection) {
                gsap.fromTo(
                    statBlocks,
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
            // BENEFITS
            // ════════════════════════════════════════
            const benefitsHeading = $1(".benefits-heading");
            const benefitsSection = $1(".benefits-section");
            if (benefitsHeading && benefitsSection) {
                gsap.fromTo(
                    benefitsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: benefitsSection, start: "top 75%" },
                    },
                );
            }

            const benefitCards = $(".benefit-card");
            const benefitsGrid = $1(".benefits-grid");
            if (benefitCards.length > 0 && benefitsGrid) {
                gsap.fromTo(
                    benefitCards,
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: benefitsGrid, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PULL QUOTE
            // ════════════════════════════════════════
            const pullquote = $1(".pullquote");
            if (pullquote) {
                gsap.fromTo(
                    pullquote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1, x: 0, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: pullquote, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // HOW IT WORKS
            // ════════════════════════════════════════
            const howHeading = $1(".how-heading");
            const howSection = $1(".how-section");
            if (howHeading && howSection) {
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

            const howSteps = $(".how-step");
            if (howSteps.length > 0 && howSection) {
                gsap.fromTo(
                    howSteps,
                    { opacity: 0, y: 50, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: howSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TESTIMONIALS
            // ════════════════════════════════════════
            const testimonialsHeading = $1(".testimonials-heading");
            const testimonialsSection = $1(".testimonials-section");
            if (testimonialsHeading && testimonialsSection) {
                gsap.fromTo(
                    testimonialsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: testimonialsSection, start: "top 75%" },
                    },
                );
            }

            const testimonialCards = $(".testimonial-card");
            if (testimonialCards.length > 0 && testimonialsSection) {
                gsap.fromTo(
                    testimonialCards,
                    { opacity: 0, y: 40, scale: 0.9, rotation: -2 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: testimonialsSection, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PARTNERSHIP
            // ════════════════════════════════════════
            const partnershipHeading = $1(".partnership-heading");
            const partnershipSection = $1(".partnership-section");
            if (partnershipHeading && partnershipSection) {
                gsap.fromTo(
                    partnershipHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: partnershipSection, start: "top 75%" },
                    },
                );
            }

            const partnershipContent = $1(".partnership-content");
            if (partnershipContent && partnershipSection) {
                gsap.fromTo(
                    partnershipContent,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: partnershipSection, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaContent = $1(".cta-content");
            const ctaSection = $1(".cta-section");
            if (ctaContent && ctaSection) {
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

            const ctaStats = $(".cta-stat");
            if (ctaStats.length > 0 && ctaSection) {
                gsap.fromTo(
                    ctaStats,
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
