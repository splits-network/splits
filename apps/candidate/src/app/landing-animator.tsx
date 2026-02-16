"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Animation Constants ────────────────────────────────────────────────────
const D = {
    fast: 0.4,
    normal: 0.6,
    slow: 0.8,
};

const E = {
    smooth: "power2.out",
    bounce: "back.out(1.4)",
};

const S = {
    tight: 0.05,
    normal: 0.1,
    loose: 0.15,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function $1(selector: string, parent?: HTMLElement) {
    return parent
        ? parent.querySelector(selector)
        : document.querySelector(selector);
}

function $$(selector: string, parent?: HTMLElement) {
    return Array.from(
        parent
            ? parent.querySelectorAll(selector)
            : document.querySelectorAll(selector),
    );
}

// ─── PageAnimator ───────────────────────────────────────────────────────────
export function PageAnimator({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Handle prefers-reduced-motion
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) {
                gsap.set($$("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            const container = containerRef.current;
            if (!container) return;

            // ─── HERO ANIMATIONS ────────────────────────────────────────────
            const heroKicker = $1(".hero-kicker", container);
            const heroHeadline = $1(".hero-headline", container);
            const heroSubheadline = $1(".hero-subheadline", container);
            const heroCta = $1(".hero-cta", container);
            const heroTrust = $1(".hero-trust", container);
            const heroShapes = $$(".hero-shape", container);

            const heroTimeline = gsap.timeline({ delay: 0.2 });

            if (heroKicker) {
                heroTimeline.fromTo(
                    heroKicker,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.fast, ease: E.smooth },
                );
            }

            if (heroHeadline) {
                heroTimeline.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.slow,
                        ease: E.smooth,
                    },
                    "-=0.2",
                );
            }

            if (heroSubheadline) {
                heroTimeline.fromTo(
                    heroSubheadline,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth },
                    "-=0.3",
                );
            }

            if (heroCta) {
                heroTimeline.fromTo(
                    heroCta,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                    },
                    "-=0.2",
                );
            }

            if (heroTrust) {
                heroTimeline.fromTo(
                    heroTrust,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth },
                    "-=0.2",
                );
            }

            if (heroShapes.length > 0) {
                heroTimeline.fromTo(
                    heroShapes,
                    { opacity: 0, scale: 0, rotation: -45 },
                    {
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        duration: D.slow,
                        ease: E.bounce,
                        stagger: S.tight,
                    },
                    "-=0.6",
                );
            }

            // ─── PROBLEM SECTION ────────────────────────────────────────────
            const problemHeader = $1(".problem-header", container);
            const problemCards = $$(".problem-card", container);

            if (problemHeader) {
                gsap.fromTo(
                    problemHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: problemHeader,
                            start: "top 80%",
                        },
                    },
                );
            }

            if (problemCards.length > 0) {
                gsap.fromTo(
                    problemCards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: problemCards[0],
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── SOLUTION SECTION ───────────────────────────────────────────
            const solutionHeader = $1(".solution-header", container);
            const solutionCards = $$(".solution-card", container);

            if (solutionHeader) {
                gsap.fromTo(
                    solutionHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: solutionHeader,
                            start: "top 80%",
                        },
                    },
                );
            }

            if (solutionCards.length > 0) {
                gsap.fromTo(
                    solutionCards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: solutionCards[0],
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── HOW IT WORKS SECTION ───────────────────────────────────────
            const howHeader = $1(".how-header", container);
            const stepCards = $$(".step-card", container);

            if (howHeader) {
                gsap.fromTo(
                    howHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: howHeader,
                            start: "top 80%",
                        },
                    },
                );
            }

            if (stepCards.length > 0) {
                gsap.fromTo(
                    stepCards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: stepCards[0],
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── FEATURES SECTION ───────────────────────────────────────────
            const featuresHeader = $1(".features-header", container);
            const featureCards = $$(".feature-card", container);

            if (featuresHeader) {
                gsap.fromTo(
                    featuresHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: featuresHeader,
                            start: "top 80%",
                        },
                    },
                );
            }

            if (featureCards.length > 0) {
                gsap.fromTo(
                    featureCards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: featureCards[0],
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── METRICS SECTION ────────────────────────────────────────────
            const metricsHeader = $1(".metrics-header", container);
            const metricCards = $$(".metric-card", container);

            if (metricsHeader) {
                gsap.fromTo(
                    metricsHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: metricsHeader,
                            start: "top 80%",
                        },
                    },
                );
            }

            if (metricCards.length > 0) {
                gsap.fromTo(
                    metricCards,
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: metricCards[0],
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── FAQ SECTION ────────────────────────────────────────────────
            const faqHeader = $1(".faq-header", container);
            const faqItems = $$(".faq-item", container);

            if (faqHeader) {
                gsap.fromTo(
                    faqHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: faqHeader,
                            start: "top 80%",
                        },
                    },
                );
            }

            if (faqItems.length > 0) {
                gsap.fromTo(
                    faqItems,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: faqItems[0],
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── FINAL CTA ──────────────────────────────────────────────────
            const ctaContent = $1(".cta-content", container);

            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: ctaContent,
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
