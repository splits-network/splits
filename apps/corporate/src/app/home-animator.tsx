"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Animation Constants (Basel: power3.out, subtle editorial motion) ──── */

const D = { fast: 0.5, normal: 0.7, slow: 1.0 };
const E = { smooth: "power3.out", soft: "power2.out" };

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function $1(selector: string, parent: HTMLElement) {
    return parent.querySelector(selector);
}

function $$(selector: string, parent: HTMLElement) {
    return Array.from(parent.querySelectorAll(selector));
}

/* ─── HomeBaselAnimator ─────────────────────────────────────────────────── */

export function HomeBaselAnimator({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) {
                gsap.set($$("[class*='opacity-0']", document.documentElement as HTMLElement), {
                    opacity: 1,
                });
                return;
            }

            const c = containerRef.current;
            if (!c) return;

            // ─── HERO ────────────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroKicker = $1(".bh-hero-kicker", c);
            const heroWords = $$(".bh-hero-word", c);
            const heroBody = $1(".bh-hero-body", c);
            const heroCtas = $$(".bh-hero-cta", c);
            const heroImg = $1(".bh-hero-img", c);

            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast },
                );
            }

            if (heroWords.length > 0) {
                heroTl.fromTo(
                    heroWords,
                    { opacity: 0, y: 80, rotateX: 40 },
                    { opacity: 1, y: 0, rotateX: 0, duration: D.slow, stagger: 0.12 },
                    "-=0.3",
                );
            }

            if (heroBody) {
                heroTl.fromTo(
                    heroBody,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.5",
                );
            }

            if (heroCtas.length > 0) {
                heroTl.fromTo(
                    heroCtas,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast, stagger: 0.1 },
                    "-=0.3",
                );
            }

            if (heroImg) {
                gsap.fromTo(
                    heroImg,
                    { opacity: 0, scale: 1.08 },
                    { opacity: 1, scale: 1, duration: 1.4, ease: E.soft, delay: 0.2 },
                );

                const heroImgInner = heroImg.querySelector("img");
                if (heroImgInner) {
                    gsap.to(heroImgInner, {
                        yPercent: 12,
                        ease: "none",
                        scrollTrigger: {
                            trigger: $1(".bh-hero-section", c),
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            }

            // ─── STATS BAR ───────────────────────────────────────────
            const statItems = $$(".bh-stat-item", c);
            if (statItems.length > 0) {
                gsap.fromTo(
                    statItems,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        stagger: 0.1,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: $1(".bh-stats-bar", c),
                            start: "top 85%",
                        },
                    },
                );
            }

            // ─── PROBLEM SECTION ─────────────────────────────────────
            const problemText = $1(".bh-problem-text", c);
            const problemImg = $1(".bh-problem-img", c);
            const problemPains = $$(".bh-problem-pain", c);

            if (problemText) {
                gsap.fromTo(
                    problemText,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-problem-section", c),
                            start: "top 70%",
                        },
                    },
                );
            }

            if (problemImg) {
                gsap.fromTo(
                    problemImg,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-problem-section", c),
                            start: "top 70%",
                        },
                    },
                );
            }

            if (problemPains.length > 0) {
                gsap.fromTo(
                    problemPains,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.4,
                        stagger: 0.08,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: $1(".bh-problem-section", c),
                            start: "top 60%",
                        },
                    },
                );
            }

            // ─── HOW IT WORKS ────────────────────────────────────────
            const hiwHeading = $1(".bh-hiw-heading", c);
            const hiwSteps = $$(".bh-hiw-step", c);

            if (hiwHeading) {
                gsap.fromTo(
                    hiwHeading,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-hiw-section", c),
                            start: "top 75%",
                        },
                    },
                );
            }

            hiwSteps.forEach((step, i) => {
                gsap.fromTo(
                    step,
                    { opacity: 0, y: 50, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: { trigger: step, start: "top 80%" },
                        delay: i * 0.05,
                    },
                );
            });

            // ─── FOR RECRUITERS ──────────────────────────────────────
            animateAudienceSection(c, "recruiter", "left");

            // ─── FOR CANDIDATES ──────────────────────────────────────
            animateAudienceSection(c, "candidate", "right");

            // ─── FOR COMPANIES ───────────────────────────────────────
            animateAudienceSection(c, "company", "left");

            // ─── EDITORIAL SPLIT (ECOSYSTEM) ─────────────────────────
            const editorialImg = $1(".bh-editorial-img", c);
            const editorialText = $1(".bh-editorial-text", c);

            if (editorialImg) {
                gsap.fromTo(
                    editorialImg,
                    { opacity: 0, scale: 1.05 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: D.slow,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: $1(".bh-editorial-section", c),
                            start: "top 70%",
                        },
                    },
                );

                const editorialInner = editorialImg.querySelector("img");
                if (editorialInner) {
                    gsap.to(editorialInner, {
                        yPercent: 10,
                        ease: "none",
                        scrollTrigger: {
                            trigger: $1(".bh-editorial-section", c),
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            }

            if (editorialText) {
                gsap.fromTo(
                    editorialText,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-editorial-section", c),
                            start: "top 65%",
                        },
                    },
                );
            }

            // ─── TESTIMONIALS ────────────────────────────────────────
            const testimonialsHeading = $1(".bh-testimonials-heading", c);
            const testimonialCards = $$(".bh-testimonial-card", c);

            if (testimonialsHeading) {
                gsap.fromTo(
                    testimonialsHeading,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-testimonials-section", c),
                            start: "top 75%",
                        },
                    },
                );
            }

            if (testimonialCards.length > 0) {
                gsap.fromTo(
                    testimonialCards,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        stagger: 0.12,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-testimonials-grid", c),
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── FINAL CTA ──────────────────────────────────────────
            const ctaContent = $1(".bh-final-cta-content", c);
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bh-final-cta", c),
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

/* ─── Shared audience section animation helper ────────────────────────────── */

function animateAudienceSection(
    c: HTMLElement,
    prefix: string,
    contentSide: "left" | "right",
) {
    const header = $1(`.bh-${prefix}-header`, c);
    const features = $$(`.bh-${prefix}-feature`, c);
    const cta = $1(`.bh-${prefix}-cta`, c);
    const visual = $1(`.bh-${prefix}-visual`, c);
    const section = $1(`.bh-${prefix}-section`, c);

    const contentX = contentSide === "left" ? -40 : 40;
    const visualX = contentSide === "left" ? 40 : -40;

    if (header) {
        gsap.fromTo(
            header,
            { opacity: 0, x: contentX },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: { trigger: section || header, start: "top 75%" },
            },
        );
    }

    if (features.length > 0) {
        gsap.fromTo(
            features,
            { opacity: 0, x: contentX * 0.5 },
            {
                opacity: 1,
                x: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: { trigger: features[0], start: "top 80%" },
            },
        );
    }

    if (cta) {
        gsap.fromTo(
            cta,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out",
                scrollTrigger: { trigger: cta, start: "top 85%" },
            },
        );
    }

    if (visual) {
        gsap.fromTo(
            visual,
            { opacity: 0, x: visualX, scale: 0.96 },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: { trigger: section || visual, start: "top 75%" },
            },
        );
    }
}
