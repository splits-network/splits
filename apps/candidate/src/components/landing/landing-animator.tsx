"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const EASE = {
    smooth: "power2.out",
    bounce: "back.out(1.4)",
};

const DUR = { fast: 0.3, normal: 0.6, hero: 1.2, counter: 1.5 };
const STAG = { tight: 0.08, normal: 0.12, loose: 0.2 };

interface LandingAnimatorProps {
    children: ReactNode;
}

/**
 * Thin client wrapper that adds custom GSAP animations to the
 * server-rendered landing page sections. Content passed as `children`
 * is a React Server Component — it renders into the initial HTML
 * for crawlers and SEO.
 *
 * Targets elements by CSS class names set on the server-rendered markup.
 */
export function LandingAnimator({ children }: LandingAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const root = containerRef.current;
            if (!root) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                return;
            }

            const q = (sel: string) => root.querySelector(sel);
            const qa = (sel: string) => root.querySelectorAll(sel);

            // ── Hero Section ──────────────────────────────────────────

            const heroHeadline = q(".hero-headline");
            if (heroHeadline) {
                const tl = gsap.timeline({
                    defaults: { ease: EASE.smooth },
                });
                tl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: DUR.hero },
                );

                const heroSubtext = q(".hero-subtext");
                if (heroSubtext) {
                    tl.fromTo(
                        heroSubtext,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: DUR.normal },
                        "-=0.6",
                    );
                }

                const heroButtons = q(".hero-cta")?.querySelectorAll("a");
                if (heroButtons?.length) {
                    tl.fromTo(
                        heroButtons,
                        { opacity: 0, y: 20, scale: 0.95 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: DUR.normal,
                            stagger: STAG.normal,
                            ease: EASE.bounce,
                        },
                        "-=0.4",
                    );
                }

                const trustItems = qa(".hero-trust-item");
                if (trustItems.length) {
                    tl.fromTo(
                        trustItems,
                        { opacity: 0, y: 10 },
                        {
                            opacity: 0.7,
                            y: 0,
                            duration: DUR.fast,
                            stagger: STAG.tight,
                        },
                        "-=0.3",
                    );
                }
            }

            // Video parallax
            const heroVideo = q(".hero-video");
            const heroSection = q(".hero-section");
            if (heroVideo && heroSection) {
                gsap.to(heroVideo, {
                    opacity: 0,
                    y: 100,
                    scrollTrigger: {
                        trigger: heroSection,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            }

            // ── Problem Section ───────────────────────────────────────

            const problemSection = q(".problem-section");
            if (problemSection) {
                const problemHeading = q(".problem-heading");
                if (problemHeading) {
                    gsap.fromTo(
                        problemHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: problemSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const painContainer = q(".pain-cards");
                if (painContainer) {
                    const painCards = qa(".pain-card");
                    if (painCards.length) {
                        gsap.fromTo(
                            painCards,
                            { opacity: 0, x: -30 },
                            {
                                opacity: 1,
                                x: 0,
                                duration: DUR.fast,
                                ease: EASE.smooth,
                                stagger: STAG.normal,
                                scrollTrigger: {
                                    trigger: painContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }

                    const painIcons = qa(".pain-icon");
                    if (painIcons.length) {
                        gsap.fromTo(
                            painIcons,
                            { scale: 0, rotation: -10 },
                            {
                                scale: 1,
                                rotation: 0,
                                duration: DUR.fast,
                                ease: EASE.bounce,
                                stagger: STAG.normal,
                                delay: 0.1,
                                scrollTrigger: {
                                    trigger: painContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }
                }
            }

            // ── Solution Bridge Section ───────────────────────────────

            const bridgeSection = q(".bridge-section");
            if (bridgeSection) {
                const bridgeHeading = q(".bridge-heading");
                if (bridgeHeading) {
                    gsap.fromTo(
                        bridgeHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: bridgeSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const promiseContainer = q(".promise-cards");
                if (promiseContainer) {
                    const promiseCards = qa(".promise-card");
                    if (promiseCards.length) {
                        gsap.fromTo(
                            promiseCards,
                            { opacity: 0, y: 30, scale: 0.95 },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: DUR.normal,
                                ease: EASE.bounce,
                                stagger: STAG.loose,
                                scrollTrigger: {
                                    trigger: promiseContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }

                    const promiseIcons = qa(".promise-icon");
                    if (promiseIcons.length) {
                        gsap.fromTo(
                            promiseIcons,
                            { scale: 0 },
                            {
                                scale: 1,
                                duration: DUR.fast,
                                ease: EASE.bounce,
                                stagger: STAG.loose,
                                delay: 0.2,
                                scrollTrigger: {
                                    trigger: promiseContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }
                }
            }

            // ── How It Works Section ──────────────────────────────────

            const howSection = q(".how-section");
            if (howSection) {
                const howHeading = q(".how-heading");
                if (howHeading) {
                    gsap.fromTo(
                        howHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: howSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const timeline = q(".how-timeline");
                if (timeline) {
                    const line =
                        root.querySelector<SVGPathElement>(".timeline-line");
                    if (line) {
                        const len = line.getTotalLength();
                        gsap.set(line, {
                            strokeDasharray: len,
                            strokeDashoffset: len,
                        });
                        gsap.to(line, {
                            strokeDashoffset: 0,
                            duration: DUR.counter,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: timeline,
                                start: "top 70%",
                            },
                        });
                    }

                    const stepCards = qa(".step-card");
                    if (stepCards.length) {
                        gsap.fromTo(
                            stepCards,
                            { opacity: 0, x: -40 },
                            {
                                opacity: 1,
                                x: 0,
                                duration: DUR.normal,
                                ease: EASE.smooth,
                                stagger: STAG.loose,
                                scrollTrigger: {
                                    trigger: timeline,
                                    start: "top 70%",
                                },
                            },
                        );
                    }

                    const stepBadges = qa(".step-badge");
                    if (stepBadges.length) {
                        gsap.fromTo(
                            stepBadges,
                            { scale: 0 },
                            {
                                scale: 1,
                                duration: DUR.fast,
                                ease: EASE.bounce,
                                stagger: STAG.loose,
                                delay: 0.2,
                                scrollTrigger: {
                                    trigger: timeline,
                                    start: "top 70%",
                                },
                            },
                        );
                    }
                }
            }

            // ── Features Section ──────────────────────────────────────

            const featSection = q(".features-section");
            if (featSection) {
                const featHeading = q(".features-heading");
                if (featHeading) {
                    gsap.fromTo(
                        featHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: featSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const featureContainer = q(".feature-cards");
                if (featureContainer) {
                    const featureCards = qa(".feature-card");
                    if (featureCards.length) {
                        gsap.fromTo(
                            featureCards,
                            { opacity: 0, y: 40, scale: 0.95 },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: DUR.normal,
                                ease: EASE.smooth,
                                stagger: STAG.tight,
                                scrollTrigger: {
                                    trigger: featureContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }

                    const featureIcons = qa(".feature-icon");
                    if (featureIcons.length) {
                        gsap.fromTo(
                            featureIcons,
                            { scale: 0, rotation: -15 },
                            {
                                scale: 1,
                                rotation: 0,
                                duration: DUR.fast,
                                ease: EASE.bounce,
                                stagger: STAG.tight,
                                delay: 0.15,
                                scrollTrigger: {
                                    trigger: featureContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }
                }
            }

            // ── Metrics Section ───────────────────────────────────────

            const metricsSection = q(".metrics-section");
            if (metricsSection) {
                const metricsHeading = q(".metrics-heading");
                if (metricsHeading) {
                    gsap.fromTo(
                        metricsHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: metricsSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const metricsContainer = q(".metric-cards");
                if (metricsContainer) {
                    const metricCards = qa(".metric-card");
                    if (metricCards.length) {
                        gsap.fromTo(
                            metricCards,
                            { opacity: 0, y: 40, scale: 0.9 },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: DUR.normal,
                                ease: EASE.bounce,
                                stagger: STAG.normal,
                                scrollTrigger: {
                                    trigger: metricsContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }

                    const metricIcons = qa(".metric-icon");
                    if (metricIcons.length) {
                        gsap.fromTo(
                            metricIcons,
                            { scale: 0 },
                            {
                                scale: 1,
                                duration: DUR.fast,
                                ease: EASE.bounce,
                                stagger: STAG.normal,
                                delay: 0.2,
                                scrollTrigger: {
                                    trigger: metricsContainer,
                                    start: "top 80%",
                                },
                            },
                        );
                    }

                    // Counter animations
                    const metricValues = qa(".metric-value");
                    metricValues.forEach((el, index) => {
                        const target = parseInt(
                            el.getAttribute("data-value") || "0",
                            10,
                        );
                        const suffix = el.getAttribute("data-suffix") || "";

                        gsap.fromTo(
                            { value: 0 },
                            { value: target },
                            {
                                duration: DUR.counter,
                                ease: EASE.smooth,
                                delay: 0.3 + index * STAG.normal,
                                scrollTrigger: {
                                    trigger: metricsContainer,
                                    start: "top 80%",
                                },
                                onUpdate: function () {
                                    const current = Math.floor(
                                        this.targets()[0].value,
                                    );
                                    if (target >= 1000) {
                                        el.textContent =
                                            current.toLocaleString() + suffix;
                                    } else {
                                        el.textContent = current + suffix;
                                    }
                                },
                            },
                        );
                    });
                }
            }

            // ── FAQ Section ───────────────────────────────────────────

            const faqSection = q(".faq-section");
            if (faqSection) {
                const faqHeading = q(".faq-heading");
                if (faqHeading) {
                    gsap.fromTo(
                        faqHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: faqSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const faqItems = qa(".faq-item");
                if (faqItems.length) {
                    gsap.fromTo(
                        faqItems,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.fast,
                            ease: EASE.smooth,
                            stagger: STAG.tight,
                            scrollTrigger: {
                                trigger: q(".faq-items"),
                                start: "top 80%",
                            },
                        },
                    );
                }
            }

            // ── CTA Section ───────────────────────────────────────────

            const ctaSection = q(".cta-section");
            if (ctaSection) {
                const ctaContent = q(".cta-content");
                if (ctaContent) {
                    gsap.fromTo(
                        ctaContent,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: DUR.hero,
                            ease: EASE.smooth,
                            scrollTrigger: {
                                trigger: ctaSection,
                                start: "top 80%",
                            },
                        },
                    );
                }

                const ctaButtons = qa(".cta-btn");
                if (ctaButtons.length) {
                    gsap.fromTo(
                        ctaButtons,
                        { opacity: 0, scale: 0.9, y: 20 },
                        {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            duration: DUR.normal,
                            ease: EASE.bounce,
                            stagger: 0.15,
                            delay: 0.3,
                            scrollTrigger: {
                                trigger: ctaSection,
                                start: "top 80%",
                            },
                        },
                    );
                }

                const ctaFooter = q(".cta-footer");
                if (ctaFooter) {
                    gsap.fromTo(
                        ctaFooter,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: DUR.normal,
                            ease: EASE.smooth,
                            delay: 0.6,
                            scrollTrigger: {
                                trigger: ctaSection,
                                start: "top 80%",
                            },
                        },
                    );
                }
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
