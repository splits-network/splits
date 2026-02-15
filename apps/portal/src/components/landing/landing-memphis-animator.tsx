"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis-themed animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15, dramatic: 0.25 };

interface MemphisLandingAnimatorProps {
    children: ReactNode;
}

export function MemphisLandingAnimator({
    children,
}: MemphisLandingAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                // Make everything visible
                gsap.set(
                    containerRef.current.querySelectorAll(
                        "[class*='opacity-0']",
                    ),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ═══════════════════════════════════════════
            // HERO
            // ═══════════════════════════════════════════

            // Memphis shapes float in with elastic bounce
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
                    delay: 0.3,
                },
            );

            // Continuous float for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${10 + (i % 3) * 5}`,
                    x: `+=${5 + (i % 2) * 8}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (5 + i * 2)}`,
                    duration: 3 + i * 0.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            heroTl.fromTo(
                $1(".hero-overline"),
                { opacity: 0, y: -30, scale: 0.8 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                },
            );
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 80, skewY: 3 },
                {
                    opacity: 1,
                    y: 0,
                    skewY: 0,
                    duration: D.hero,
                    ease: E.smooth,
                },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.5",
            );
            heroTl.fromTo(
                $(".hero-cta-btn"),
                { opacity: 0, y: 30, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    stagger: S.normal,
                    ease: E.bounce,
                },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".hero-tagline"),
                { opacity: 0 },
                { opacity: 1, duration: D.normal },
                "-=0.2",
            );

            // ═══════════════════════════════════════════
            // Helper: fadeUp with scroll trigger
            // ═══════════════════════════════════════════
            const fadeUp = (
                el: Element | null,
                trigger: Element | null,
                start = "top 80%",
            ) => {
                if (!el) return;
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: trigger || el,
                            start,
                        },
                    },
                );
            };

            // ═══════════════════════════════════════════
            // PROBLEM
            // ═══════════════════════════════════════════
            fadeUp($1(".problem-heading"), $1(".problem-section"));
            const painCards = $(".pain-card");
            if (painCards.length) {
                gsap.fromTo(
                    painCards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: $1(".pain-cards"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ═══════════════════════════════════════════
            // HOW IT WORKS
            // ═══════════════════════════════════════════
            fadeUp($1(".how-heading"), $1(".how-section"));

            const howSteps = $(".how-step");
            if (howSteps.length) {
                // Recruiter steps (left track)
                const recruiterSteps =
                    $1(".recruiter-track")?.querySelectorAll(".how-step");
                if (recruiterSteps?.length) {
                    gsap.fromTo(
                        recruiterSteps,
                        { opacity: 0, x: -40 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.normal,
                            ease: E.bounce,
                            stagger: S.loose,
                            scrollTrigger: {
                                trigger: $1(".recruiter-track"),
                                start: "top 75%",
                            },
                        },
                    );
                }

                // Company steps (right track)
                const companySteps =
                    $1(".company-track")?.querySelectorAll(".how-step");
                if (companySteps?.length) {
                    gsap.fromTo(
                        companySteps,
                        { opacity: 0, x: 40 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.normal,
                            ease: E.bounce,
                            stagger: S.loose,
                            scrollTrigger: {
                                trigger: $1(".company-track"),
                                start: "top 75%",
                            },
                        },
                    );
                }
            }

            // Convergence point
            const convergence = $1(".convergence-point");
            if (convergence) {
                gsap.fromTo(
                    convergence,
                    { opacity: 0, scale: 0.8, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: D.hero,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: convergence,
                            start: "top 85%",
                        },
                    },
                );
            }

            // ═══════════════════════════════════════════
            // FOR RECRUITERS
            // ═══════════════════════════════════════════
            const recSection = $1(".recruiters-section");
            if (recSection) {
                gsap.fromTo(
                    $1(".recruiters-heading"),
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: recSection,
                            start: "top 70%",
                        },
                    },
                );

                const recBenefits =
                    recSection.querySelectorAll(".benefit-item");
                gsap.fromTo(
                    recBenefits,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: $1(".recruiters-benefits"),
                            start: "top 75%",
                        },
                    },
                );

                gsap.fromTo(
                    recSection.querySelectorAll(".benefit-icon"),
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: D.fast,
                        ease: E.bounce,
                        stagger: S.tight,
                        delay: 0.1,
                        scrollTrigger: {
                            trigger: $1(".recruiters-benefits"),
                            start: "top 75%",
                        },
                    },
                );

                fadeUp(
                    $1(".recruiters-cta"),
                    $1(".recruiters-cta"),
                    "top 85%",
                );

                const recDash = $1(".recruiters-dashboard");
                if (recDash) {
                    gsap.fromTo(
                        recDash,
                        { opacity: 0, x: 60 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.hero,
                            ease: E.smooth,
                            scrollTrigger: {
                                trigger: recSection,
                                start: "top 70%",
                            },
                        },
                    );
                    gsap.fromTo(
                        recDash.querySelectorAll(".dashboard-row"),
                        { opacity: 0, x: 20 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.fast,
                            ease: E.smooth,
                            stagger: S.normal,
                            delay: 0.4,
                            scrollTrigger: {
                                trigger: recSection,
                                start: "top 70%",
                            },
                        },
                    );
                }
            }

            // ═══════════════════════════════════════════
            // FOR COMPANIES
            // ═══════════════════════════════════════════
            const compSection = $1(".companies-section");
            if (compSection) {
                const compDash = $1(".companies-dashboard");
                if (compDash) {
                    gsap.fromTo(
                        compDash,
                        { opacity: 0, x: -60 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.hero,
                            ease: E.smooth,
                            scrollTrigger: {
                                trigger: compSection,
                                start: "top 70%",
                            },
                        },
                    );
                    gsap.fromTo(
                        compDash.querySelectorAll(".dashboard-row"),
                        { opacity: 0, x: -20 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.fast,
                            ease: E.smooth,
                            stagger: S.normal,
                            delay: 0.4,
                            scrollTrigger: {
                                trigger: compSection,
                                start: "top 70%",
                            },
                        },
                    );
                }

                gsap.fromTo(
                    $1(".companies-heading"),
                    { opacity: 0, x: 40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: compSection,
                            start: "top 70%",
                        },
                    },
                );

                const compBenefits =
                    compSection.querySelectorAll(".benefit-item");
                gsap.fromTo(
                    compBenefits,
                    { opacity: 0, x: 30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: $1(".companies-benefits"),
                            start: "top 75%",
                        },
                    },
                );

                gsap.fromTo(
                    compSection.querySelectorAll(".benefit-icon"),
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: D.fast,
                        ease: E.bounce,
                        stagger: S.tight,
                        delay: 0.1,
                        scrollTrigger: {
                            trigger: $1(".companies-benefits"),
                            start: "top 75%",
                        },
                    },
                );

                fadeUp(
                    $1(".companies-cta"),
                    $1(".companies-cta"),
                    "top 85%",
                );
            }

            // ═══════════════════════════════════════════
            // MONEY FLOW
            // ═══════════════════════════════════════════
            fadeUp($1(".money-heading"), $1(".money-section"));

            const flowCards = $(".flow-card");
            if (flowCards.length) {
                gsap.fromTo(
                    flowCards,
                    { opacity: 0, scale: 0.8, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: {
                            trigger: $1(".flow-cards"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // Arrow SVG draw
            $(".arrow-svg").forEach((svg, i) => {
                const path = svg.querySelector(".arrow-path");
                if (path) {
                    const len = (path as SVGPathElement).getTotalLength();
                    gsap.set(path, {
                        strokeDasharray: len,
                        strokeDashoffset: len,
                    });
                    gsap.to(path, {
                        strokeDashoffset: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        delay: 0.4 + i * 0.3,
                        scrollTrigger: {
                            trigger: $1(".flow-cards"),
                            start: "top 75%",
                        },
                    });
                }
            });

            // Breakdown card
            fadeUp(
                $1(".breakdown-card"),
                $1(".breakdown-card"),
                "top 85%",
            );

            // ═══════════════════════════════════════════
            // COMPARISON
            // ═══════════════════════════════════════════
            fadeUp($1(".comparison-heading"), $1(".comparison-section"));
            const compRows = $(".comparison-row");
            if (compRows.length) {
                gsap.fromTo(
                    compRows,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: $1(".comparison-table"),
                            start: "top 75%",
                        },
                    },
                );
            }
            fadeUp(
                $1(".comparison-quote"),
                $1(".comparison-quote"),
                "top 85%",
            );

            // ═══════════════════════════════════════════
            // METRICS
            // ═══════════════════════════════════════════
            fadeUp($1(".metrics-heading"), $1(".metrics-section"));
            const metricCards = $(".metric-card");
            if (metricCards.length) {
                gsap.fromTo(
                    metricCards,
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: $1(".metric-cards"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ═══════════════════════════════════════════
            // FAQ
            // ═══════════════════════════════════════════
            fadeUp($1(".faq-heading"), $1(".faq-section"));
            const faqItems = $(".faq-item");
            if (faqItems.length) {
                gsap.fromTo(
                    faqItems,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: $1(".faq-items"),
                            start: "top 80%",
                        },
                    },
                );
            }

            // ═══════════════════════════════════════════
            // CTA
            // ═══════════════════════════════════════════
            const ctaSection = $1(".cta-section");
            if (ctaSection) {
                gsap.fromTo(
                    $1(".cta-content"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.hero,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
                const ctaBtns = $(".cta-btn");
                if (ctaBtns.length) {
                    gsap.fromTo(
                        ctaBtns,
                        { opacity: 0, scale: 0.9, y: 20 },
                        {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            duration: D.normal,
                            ease: E.bounce,
                            stagger: 0.15,
                            delay: 0.3,
                            scrollTrigger: {
                                trigger: ctaSection,
                                start: "top 80%",
                            },
                        },
                    );
                }
                gsap.fromTo(
                    $1(".cta-footer"),
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.6,
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}