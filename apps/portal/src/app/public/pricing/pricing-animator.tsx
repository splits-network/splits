"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants (matching article-six pattern)
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface PricingAnimatorProps {
    children: ReactNode;
}

export function PricingAnimator({ children }: PricingAnimatorProps) {
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

            heroTl.fromTo(
                $1(".hero-badge"),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
            );
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 60, skewY: 2 },
                { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.4",
            );
            heroTl.fromTo(
                $1(".hero-cta-row"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".stat-block"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".pricing-stats"), start: "top 90%" },
                },
            );

            // ════════════════════════════════════════
            // INTRO SECTION
            // ════════════════════════════════════════
            const introSection = $1(".pricing-intro");
            if (introSection) {
                const inner = introSection.querySelector(".intro-content");
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1, y: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: introSection, start: "top 75%" },
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
                        opacity: 1, x: 0, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // PRICING CARDS (centerpiece)
            // ════════════════════════════════════════
            const cardsHeading = $1(".pricing-cards-heading");
            if (cardsHeading) {
                gsap.fromTo(
                    cardsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".pricing-cards-section"), start: "top 75%" },
                    },
                );
            }

            // Animate entire pricing grid wrapper (includes billing toggle + cards)
            const pricingGrid = $1(".pricing-cards-grid");
            if (pricingGrid) {
                gsap.fromTo(
                    pricingGrid,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: pricingGrid, start: "top 85%" },
                    },
                );
            }

            // Individual pricing cards animate in with stagger after grid appears
            gsap.fromTo(
                $(".pricing-card"),
                { opacity: 0, y: 60, scale: 0.85, rotation: -2 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.slow,
                    ease: E.bounce,
                    stagger: S.loose,
                    delay: 0.3, // Slight delay after grid wrapper appears
                    scrollTrigger: { trigger: pricingGrid, start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // FOR COMPANIES SECTION
            // ════════════════════════════════════════
            const companiesSection = $1(".companies-section");
            if (companiesSection) {
                gsap.fromTo(
                    $1(".companies-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: companiesSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".companies-card"),
                    { opacity: 0, y: 50, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: companiesSection, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // IMAGE BREAK
            // ════════════════════════════════════════
            const imageCaption = $1(".image-caption");
            if (imageCaption) {
                gsap.fromTo(
                    imageCaption,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: imageCaption, start: "top 85%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FEATURE COMPARISON
            // ════════════════════════════════════════
            const comparisonSection = $1(".feature-comparison");
            if (comparisonSection) {
                gsap.fromTo(
                    $1(".comparison-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: comparisonSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".comparison-row"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: { trigger: $1(".comparison-table"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FAQ SECTION
            // ════════════════════════════════════════
            const faqSection = $1(".pricing-faq");
            if (faqSection) {
                gsap.fromTo(
                    $1(".faq-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: faqSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".faq-card"),
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: $1(".faq-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FINAL QUOTE
            // ════════════════════════════════════════
            const finalQuote = $1(".final-quote");
            if (finalQuote) {
                gsap.fromTo(
                    finalQuote,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: finalQuote, start: "top 85%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0,
                    duration: D.hero, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".pricing-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $(".cta-card"),
                { opacity: 0, y: 40, scale: 0.85 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    delay: 0.3,
                    scrollTrigger: { trigger: $1(".pricing-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal, ease: E.smooth,
                    delay: 0.6,
                    scrollTrigger: { trigger: $1(".pricing-cta"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
