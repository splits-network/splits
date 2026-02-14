"use client";

import { type ReactNode, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Inlined animation constants (from animation-utils.ts)
const D = { fast: 0.3, normal: 0.6, hero: 1.2, counter: 1.5 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

interface LandingAnimatorProps {
    children: ReactNode;
}

export function LandingAnimator({ children }: LandingAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const root = containerRef.current;
            if (!root) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;

            // ── Scoped selectors ──
            const $ = (sel: string): Element | null =>
                root.querySelector(sel);
            const $$ = (sel: string): NodeListOf<Element> =>
                root.querySelectorAll(sel);

            // ── Helpers ──
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
                        scrollTrigger: { trigger: trigger || el, start },
                    },
                );
            };

            const counterAnim = (
                el: Element,
                trigger: Element,
                delay: number,
            ) => {
                const target = parseInt(
                    el.getAttribute("data-value") || "0",
                    10,
                );
                const prefix = el.getAttribute("data-prefix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.smooth,
                        delay,
                        scrollTrigger: { trigger, start: "top 85%" },
                        onUpdate() {
                            el.textContent = `${prefix}${Math.floor(this.targets()[0].value).toLocaleString()}`;
                        },
                    },
                );
            };

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════
            const heroSection = $(".hero-section");
            if (heroSection) {
                const tl = gsap.timeline({ delay: 0.2 });

                const headline = $(".hero-headline");
                const subtitle = $(".hero-subtitle");
                const cta = $(".hero-cta");
                const tagline = $(".hero-tagline");

                if (headline)
                    tl.fromTo(
                        headline,
                        { opacity: 0, y: 50, scale: 0.98 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: D.hero,
                            ease: E.smooth,
                        },
                    );
                if (subtitle)
                    tl.fromTo(
                        subtitle,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.normal,
                            ease: E.smooth,
                        },
                        "-=0.6",
                    );
                if (cta?.children.length)
                    tl.fromTo(
                        cta.children,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.normal,
                            ease: E.smooth,
                            stagger: S.normal,
                        },
                        "-=0.4",
                    );
                if (tagline)
                    tl.fromTo(
                        tagline,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.normal,
                            ease: E.smooth,
                        },
                        "-=0.3",
                    );

                // Video fade on scroll
                const video = $(".hero-video");
                if (video) {
                    gsap.to(video, {
                        opacity: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: heroSection,
                            start: "top top",
                            end: "80% top",
                            scrub: true,
                        },
                    });
                }

                // Content parallax
                const content = $(".hero-content");
                if (content) {
                    gsap.to(content, {
                        yPercent: -15,
                        ease: "none",
                        scrollTrigger: {
                            trigger: heroSection,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            }

            // ════════════════════════════════════════
            // PROBLEM
            // ════════════════════════════════════════
            fadeUp($(".problem-heading"), $(".problem-section"));
            const painCards = $$(".pain-card");
            if (painCards.length) {
                gsap.fromTo(
                    painCards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: $(".pain-cards"),
                            start: "top 75%",
                        },
                    },
                );
                // Icon pulse
                painCards.forEach((card, i) => {
                    const icon = card.querySelector(".pain-icon");
                    if (icon) {
                        gsap.fromTo(
                            icon,
                            { scale: 1 },
                            {
                                scale: 1.1,
                                duration: 0.3,
                                ease: E.bounce,
                                delay: 0.3 + i * S.normal,
                                scrollTrigger: {
                                    trigger: $(".pain-cards"),
                                    start: "top 75%",
                                },
                                onComplete: () => {
                                    gsap.to(icon, {
                                        scale: 1,
                                        duration: 0.2,
                                    });
                                },
                            },
                        );
                    }
                });
            }

            // ════════════════════════════════════════
            // SOLUTION BRIDGE
            // ════════════════════════════════════════
            const bridgeHeading = $(".bridge-heading");
            if (bridgeHeading) {
                gsap.fromTo(
                    bridgeHeading,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.hero,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $(".bridge-section"),
                            start: "top 70%",
                        },
                    },
                );
            }
            const promiseItems = $$(".promise-item");
            if (promiseItems.length) {
                gsap.fromTo(
                    promiseItems,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.loose,
                        scrollTrigger: {
                            trigger: $(".promise-cards"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // HOW IT WORKS
            // ════════════════════════════════════════
            fadeUp($(".how-heading"), $(".how-section"));

            // SVG path draw (scrubbed)
            const pathLines = $$(".how-section .path-line");
            pathLines.forEach((path) => {
                const len = (path as SVGPathElement).getTotalLength();
                gsap.set(path, {
                    strokeDasharray: len,
                    strokeDashoffset: len,
                });
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 2,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $(".how-section"),
                        start: "top 80%",
                        end: "bottom 20%",
                        scrub: 1,
                    },
                });
            });

            // Recruiter timeline
            const recruiterTrack = $(".recruiter-track");
            if (recruiterTrack) {
                gsap.fromTo(
                    recruiterTrack.querySelectorAll(".step-node"),
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: D.fast,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: {
                            trigger: recruiterTrack,
                            start: "top 75%",
                        },
                    },
                );
                gsap.fromTo(
                    recruiterTrack.querySelectorAll(".timeline-line"),
                    { scaleY: 0, transformOrigin: "top" },
                    {
                        scaleY: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.loose,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: recruiterTrack,
                            start: "top 75%",
                        },
                    },
                );
                gsap.fromTo(
                    recruiterTrack.querySelectorAll(".step-content"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.loose,
                        delay: 0.1,
                        scrollTrigger: {
                            trigger: recruiterTrack,
                            start: "top 75%",
                        },
                    },
                );
            }

            // Company timeline
            const companyTrack = $(".company-track");
            if (companyTrack) {
                gsap.fromTo(
                    companyTrack.querySelectorAll(".step-node"),
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: D.fast,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: {
                            trigger: companyTrack,
                            start: "top 75%",
                        },
                    },
                );
                gsap.fromTo(
                    companyTrack.querySelectorAll(".timeline-line"),
                    { scaleY: 0, transformOrigin: "top" },
                    {
                        scaleY: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.loose,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: companyTrack,
                            start: "top 75%",
                        },
                    },
                );
                gsap.fromTo(
                    companyTrack.querySelectorAll(".step-content"),
                    { opacity: 0, x: 30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.loose,
                        delay: 0.1,
                        scrollTrigger: {
                            trigger: companyTrack,
                            start: "top 75%",
                        },
                    },
                );
            }

            // Convergence point
            const convergence = $(".convergence-point");
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

            // ════════════════════════════════════════
            // FOR RECRUITERS
            // ════════════════════════════════════════
            const recSection = $(".recruiters-section");
            if (recSection) {
                gsap.fromTo(
                    $(".recruiters-heading"),
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
                            trigger: $(".recruiters-benefits"),
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
                            trigger: $(".recruiters-benefits"),
                            start: "top 75%",
                        },
                    },
                );

                fadeUp(
                    $(".recruiters-cta"),
                    $(".recruiters-cta"),
                    "top 85%",
                );

                const recDash = $(".recruiters-dashboard");
                if (recDash) {
                    gsap.fromTo(
                        recDash,
                        { opacity: 0, x: 60, rotateY: -5 },
                        {
                            opacity: 1,
                            x: 0,
                            rotateY: 0,
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
                    const recStat = recDash.querySelector(".stat-counter");
                    if (recStat) counterAnim(recStat, recDash, 0.8);
                }
            }

            // ════════════════════════════════════════
            // FOR COMPANIES
            // ════════════════════════════════════════
            const compSection = $(".companies-section");
            if (compSection) {
                const compDash = $(".companies-dashboard");
                if (compDash) {
                    gsap.fromTo(
                        compDash,
                        { opacity: 0, x: -60, rotateY: 5 },
                        {
                            opacity: 1,
                            x: 0,
                            rotateY: 0,
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
                    const compStat = compDash.querySelector(".stat-counter");
                    if (compStat) counterAnim(compStat, compDash, 0.8);
                }

                gsap.fromTo(
                    $(".companies-heading"),
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
                            trigger: $(".companies-benefits"),
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
                            trigger: $(".companies-benefits"),
                            start: "top 75%",
                        },
                    },
                );

                fadeUp(
                    $(".companies-cta"),
                    $(".companies-cta"),
                    "top 85%",
                );
            }

            // ════════════════════════════════════════
            // MONEY FLOW
            // ════════════════════════════════════════
            fadeUp($(".money-heading"), $(".money-section"));

            const flowCards = $$(".flow-card");
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
                            trigger: $(".flow-cards"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // Arrow SVG draw
            $$(".arrow-svg").forEach((svg, i) => {
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
                            trigger: $(".flow-cards"),
                            start: "top 75%",
                        },
                    });
                }
            });

            // Breakdown card
            fadeUp(
                $(".breakdown-card"),
                $(".breakdown-card"),
                "top 85%",
            );

            // Counter values in breakdown
            const breakdownCard = $(".breakdown-card");
            if (breakdownCard) {
                breakdownCard
                    .querySelectorAll(".counter-value")
                    .forEach((el, i) => {
                        counterAnim(el, breakdownCard, 0.3 + i * 0.2);
                    });
            }

            // ════════════════════════════════════════
            // FEATURES
            // ════════════════════════════════════════
            fadeUp($(".features-heading"), $(".features-section"));
            const featureCards = $$(".feature-card");
            if (featureCards.length) {
                gsap.fromTo(
                    featureCards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: $(".feature-grid"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // COMPARISON
            // ════════════════════════════════════════
            fadeUp($(".comparison-heading"), $(".comparison-section"));
            const compRows = $$(".comparison-row");
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
                            trigger: $(".comparison-table"),
                            start: "top 75%",
                        },
                    },
                );
            }
            const splitsCells = $$(".splits-cell");
            if (splitsCells.length) {
                gsap.fromTo(
                    splitsCells,
                    { backgroundColor: "rgba(15,157,138,0)" },
                    {
                        backgroundColor: "rgba(15,157,138,0.1)",
                        duration: 0.5,
                        delay: 0.6,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $(".comparison-table"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // METRICS
            // ════════════════════════════════════════
            fadeUp($(".metrics-heading"), $(".metrics-section"));
            const metricCards = $$(".metric-card");
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
                            trigger: $(".metric-cards"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // FAQ
            // ════════════════════════════════════════
            fadeUp($(".faq-heading"), $(".faq-section"));
            const faqItems = $$(".faq-item");
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
                            trigger: $(".faq-items"),
                            start: "top 80%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaSection = $(".cta-section");
            if (ctaSection) {
                gsap.fromTo(
                    $(".cta-content"),
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
                const ctaBtns = $$(".cta-btn");
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
                    $(".cta-footer"),
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
