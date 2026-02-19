"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface BaselLandingAnimatorProps {
    children: ReactNode;
}

export function LandingAnimator({
    children,
}: BaselLandingAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) {
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

            // ── Hero ────────────────────────────────────────────
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            const heroKicker = $1(".hero-kicker");
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                );
            }

            heroTl.fromTo(
                $(".hero-headline-word"),
                { opacity: 0, y: 80, rotateX: 40 },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.12,
                },
                "-=0.3",
            );

            const heroBody = $1(".hero-body");
            if (heroBody) {
                heroTl.fromTo(
                    heroBody,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );
            }

            heroTl.fromTo(
                $(".hero-cta"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                "-=0.3",
            );

            // Hero image parallax
            const heroImgWrap = $1(".hero-img-wrap");
            if (heroImgWrap) {
                gsap.fromTo(
                    heroImgWrap,
                    { opacity: 0, scale: 1.08 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1.4,
                        ease: "power2.out",
                        delay: 0.2,
                    },
                );

                const heroImg = heroImgWrap.querySelector("img");
                const heroSection = $1(".hero-section");
                if (heroImg && heroSection) {
                    gsap.to(heroImg, {
                        yPercent: 12,
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

            // ── Stats bar ───────────────────────────────────────
            const statsBar = $1(".stats-bar");
            if (statsBar) {
                gsap.fromTo(
                    $(".stat-item"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: statsBar,
                            start: "top 85%",
                        },
                    },
                );
            }

            // ── Problem split-screen ────────────────────────────
            const problemSection = $1(".problem-section");
            if (problemSection) {
                const problemText = $1(".problem-text");
                if (problemText) {
                    gsap.fromTo(
                        problemText,
                        { opacity: 0, x: -60 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.8,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: problemSection,
                                start: "top 70%",
                            },
                        },
                    );
                }

                const problemImg = $1(".problem-img");
                if (problemImg) {
                    gsap.fromTo(
                        problemImg,
                        { opacity: 0, x: 60 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.8,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: problemSection,
                                start: "top 70%",
                            },
                        },
                    );
                }

                gsap.fromTo(
                    $(".problem-pain"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.4,
                        stagger: 0.08,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: problemSection,
                            start: "top 60%",
                        },
                    },
                );
            }

            // ── How-it-works steps ──────────────────────────────
            const hiwSection = $1(".hiw-section");
            if (hiwSection) {
                const hiwHeading = $1(".hiw-heading");
                if (hiwHeading) {
                    gsap.fromTo(
                        hiwHeading,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: hiwSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                $(".hiw-step").forEach((step, i) => {
                    gsap.fromTo(
                        step,
                        { opacity: 0, y: 50, scale: 0.96 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.7,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: step,
                                start: "top 80%",
                            },
                            delay: i * 0.05,
                        },
                    );
                });
            }

            // ── Platforms split ──────────────────────────────────
            const platformsSection = $1(".platforms-section");
            if (platformsSection) {
                const platformsHeading = $1(".platforms-heading");
                if (platformsHeading) {
                    gsap.fromTo(
                        platformsHeading,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: platformsSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const platformsGrid = $1(".platforms-grid");
                if (platformsGrid) {
                    gsap.fromTo(
                        $(".platform-card"),
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            stagger: 0.15,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: platformsGrid,
                                start: "top 80%",
                            },
                        },
                    );
                }
            }

            // ── Editorial split (ecosystem) ─────────────────────
            const editorialSection = $1(".editorial-section");
            if (editorialSection) {
                const editorialImg = $1(".editorial-img");
                if (editorialImg) {
                    gsap.fromTo(
                        editorialImg,
                        { opacity: 0, scale: 1.05 },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: editorialSection,
                                start: "top 70%",
                            },
                        },
                    );

                    // Parallax on editorial image
                    const editorialImgEl =
                        editorialImg.querySelector("img");
                    if (editorialImgEl) {
                        gsap.to(editorialImgEl, {
                            yPercent: 10,
                            ease: "none",
                            scrollTrigger: {
                                trigger: editorialSection,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: true,
                            },
                        });
                    }
                }

                const editorialText = $1(".editorial-text");
                if (editorialText) {
                    gsap.fromTo(
                        editorialText,
                        { opacity: 0, x: 60 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.8,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: editorialSection,
                                start: "top 65%",
                            },
                        },
                    );
                }
            }

            // ── Testimonials ────────────────────────────────────
            const testimonialsSection = $1(".testimonials-section");
            if (testimonialsSection) {
                const testimonialsHeading = $1(".testimonials-heading");
                if (testimonialsHeading) {
                    gsap.fromTo(
                        testimonialsHeading,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: testimonialsSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const testimonialsGrid = $1(".testimonials-grid");
                if (testimonialsGrid) {
                    gsap.fromTo(
                        $(".testimonial-card"),
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.12,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: testimonialsGrid,
                                start: "top 80%",
                            },
                        },
                    );
                }
            }

            // ── FAQ ─────────────────────────────────────────────
            const faqSection = $1(".faq-section");
            if (faqSection) {
                const faqHeading = $1(".faq-heading");
                if (faqHeading) {
                    gsap.fromTo(
                        faqHeading,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: faqSection,
                                start: "top 75%",
                            },
                        },
                    );
                }

                const faqItems = $(".faq-item");
                if (faqItems.length) {
                    gsap.fromTo(
                        faqItems,
                        { opacity: 0, y: 16 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            stagger: 0.08,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: $1(".faq-items"),
                                start: "top 82%",
                            },
                        },
                    );
                }
            }

            // ── CTA ─────────────────────────────────────────────
            const finalCta = $1(".final-cta");
            if (finalCta) {
                const finalCtaContent = $1(".final-cta-content");
                if (finalCtaContent) {
                    gsap.fromTo(
                        finalCtaContent,
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: finalCta,
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
