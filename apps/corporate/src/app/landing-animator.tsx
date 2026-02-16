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

// ─── Helper ─────────────────────────────────────────────────────────────────
function $1(selector: string, parent?: HTMLElement) {
    return parent ? parent.querySelector(selector) : document.querySelector(selector);
}

function $$(selector: string, parent?: HTMLElement) {
    return Array.from(
        parent ? parent.querySelectorAll(selector) : document.querySelectorAll(selector)
    );
}

// ─── LandingAnimator ────────────────────────────────────────────────────────
export function LandingAnimator({ children }: { children: React.ReactNode }) {
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

            // ─── HERO ANIMATIONS ────────────────────────────────────────────
            const heroKicker = $1(".hero-kicker", container);
            const heroHeadline = $1(".hero-headline", container);
            const heroSubheadline = $1(".hero-subheadline", container);
            const heroBadges = $1(".hero-badges", container);
            const heroCta = $1(".hero-cta", container);
            const heroShapes = $$(".hero-shape", container);

            const heroTimeline = gsap.timeline({ delay: 0.2 });

            if (heroKicker) {
                heroTimeline.fromTo(
                    heroKicker,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.fast, ease: E.smooth }
                );
            }

            if (heroHeadline) {
                heroTimeline.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 30, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: D.slow, ease: E.smooth },
                    "-=0.2"
                );
            }

            if (heroSubheadline) {
                heroTimeline.fromTo(
                    heroSubheadline,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth },
                    "-=0.3"
                );
            }

            if (heroBadges) {
                heroTimeline.fromTo(
                    heroBadges,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                    "-=0.2"
                );
            }

            if (heroCta) {
                heroTimeline.fromTo(
                    heroCta,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth },
                    "-=0.2"
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
                    "-=0.6"
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
                    }
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
                    }
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
                    }
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
                    }
                );
            }

            // ─── FOR RECRUITERS SECTION ─────────────────────────────────────
            const recruiterHeader = $1(".recruiter-header", container);
            const recruiterFeatures = $$(".recruiter-feature", container);
            const recruiterCta = $1(".recruiter-cta", container);
            const recruiterVisual = $1(".recruiter-visual", container);

            if (recruiterHeader) {
                gsap.fromTo(
                    recruiterHeader,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: recruiterHeader,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (recruiterFeatures.length > 0) {
                gsap.fromTo(
                    recruiterFeatures,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: recruiterFeatures[0],
                            start: "top 80%",
                        },
                    }
                );
            }

            if (recruiterCta) {
                gsap.fromTo(
                    recruiterCta,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: recruiterCta,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (recruiterVisual) {
                gsap.fromTo(
                    recruiterVisual,
                    { opacity: 0, x: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: recruiterVisual,
                            start: "top 80%",
                        },
                    }
                );
            }

            // ─── FOR CANDIDATES SECTION ─────────────────────────────────────
            const candidateHeader = $1(".candidate-header", container);
            const candidateFeatures = $$(".candidate-feature", container);
            const candidateCta = $1(".candidate-cta", container);
            const candidateVisual = $1(".candidate-visual", container);

            if (candidateHeader) {
                gsap.fromTo(
                    candidateHeader,
                    { opacity: 0, x: 40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: candidateHeader,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (candidateFeatures.length > 0) {
                gsap.fromTo(
                    candidateFeatures,
                    { opacity: 0, x: 30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: candidateFeatures[0],
                            start: "top 80%",
                        },
                    }
                );
            }

            if (candidateCta) {
                gsap.fromTo(
                    candidateCta,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: candidateCta,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (candidateVisual) {
                gsap.fromTo(
                    candidateVisual,
                    { opacity: 0, x: -40, scale: 0.95 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: candidateVisual,
                            start: "top 80%",
                        },
                    }
                );
            }

            // ─── FOR COMPANIES SECTION ──────────────────────────────────────
            const companyHeader = $1(".company-header", container);
            const companyFeatures = $$(".company-feature", container);
            const companyCta = $1(".company-cta", container);
            const companyVisual = $1(".company-visual", container);

            if (companyHeader) {
                gsap.fromTo(
                    companyHeader,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: companyHeader,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (companyFeatures.length > 0) {
                gsap.fromTo(
                    companyFeatures,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: companyFeatures[0],
                            start: "top 80%",
                        },
                    }
                );
            }

            if (companyCta) {
                gsap.fromTo(
                    companyCta,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: companyCta,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (companyVisual) {
                gsap.fromTo(
                    companyVisual,
                    { opacity: 0, x: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: companyVisual,
                            start: "top 80%",
                        },
                    }
                );
            }

            // ─── STATS SECTION ──────────────────────────────────────────────
            const statsHeader = $1(".stats-header", container);
            const statCards = $$(".stat-card", container);

            if (statsHeader) {
                gsap.fromTo(
                    statsHeader,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: statsHeader,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (statCards.length > 0) {
                gsap.fromTo(
                    statCards,
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: {
                            trigger: statCards[0],
                            start: "top 80%",
                        },
                    }
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
                    }
                );
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
