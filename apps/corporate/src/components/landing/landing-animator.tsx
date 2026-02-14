"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Inlined animation constants
const D = { fast: 0.3, normal: 0.6, hero: 1.2, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.4)",
};
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

interface LandingAnimatorProps {
    children: ReactNode;
}

export function LandingAnimator({ children }: LandingAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // Enable smooth scrolling for anchor links
            document.documentElement.style.scrollBehavior = "smooth";

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: D.hero },
            );
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.6",
            );
            heroTl.fromTo(
                $(".platform-badge"),
                { opacity: 0, scale: 0.8, y: 20 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: D.normal,
                    stagger: S.normal,
                    ease: E.bounce,
                },
                "-=0.4",
            );
            heroTl.fromTo(
                $(".hero-cta-buttons a"),
                { opacity: 0, y: 20, scale: 0.95 },
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

            // ════════════════════════════════════════
            // PROBLEM
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".problem-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".problem-section"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".pain-column"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".pain-columns"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".pain-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".pain-columns"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // SOLUTION
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".solution-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".solution-section"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".pillar-card"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".pillar-cards"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".pillar-icon"),
                { scale: 0 },
                {
                    scale: 1,
                    duration: D.fast,
                    ease: E.bounce,
                    stagger: S.loose,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: $1(".pillar-cards"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // FOR RECRUITERS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".recruiters-heading"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".recruiters-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".recruiters-section .benefit-item"),
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
                $(".recruiters-section .benefit-icon"),
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
            gsap.fromTo(
                $(".recruiters-section .feature-badge"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.fast,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".recruiters-features"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $1(".recruiters-cta"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".recruiters-cta"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // FOR CANDIDATES
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".candidates-heading"),
                { opacity: 0, x: 40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".candidates-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".candidates-section .benefit-item"),
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".candidates-benefits"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".candidates-section .benefit-icon"),
                { scale: 0 },
                {
                    scale: 1,
                    duration: D.fast,
                    ease: E.bounce,
                    stagger: S.tight,
                    delay: 0.1,
                    scrollTrigger: {
                        trigger: $1(".candidates-benefits"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".candidates-section .feature-badge"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.fast,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".candidates-features"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $1(".candidates-cta"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".candidates-cta"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // FOR COMPANIES
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".companies-heading"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".companies-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".companies-section .benefit-item"),
                { opacity: 0, x: -30 },
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
                $(".companies-section .benefit-icon"),
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
            gsap.fromTo(
                $(".companies-section .feature-badge"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.fast,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".companies-features"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $1(".companies-cta"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".companies-cta"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ECOSYSTEM
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".ecosystem-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".ecosystem-section"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".platform-card"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: $1(".ecosystem-diagram"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".center-hub"),
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".ecosystem-diagram"),
                        start: "top 80%",
                    },
                },
            );

            // SVG path draw
            const paths = containerRef.current!.querySelectorAll(
                ".ecosystem-arrows path",
            );
            paths.forEach((path) => {
                const svgPath = path as SVGPathElement;
                const length = svgPath.getTotalLength();
                gsap.set(svgPath, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                });
                gsap.to(svgPath, {
                    strokeDashoffset: 0,
                    duration: D.hero,
                    ease: E.smooth,
                    delay: 0.5,
                    scrollTrigger: {
                        trigger: $1(".ecosystem-diagram"),
                        start: "top 80%",
                    },
                });
            });

            // ════════════════════════════════════════
            // METRICS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".metrics-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".metrics-section"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".metric-card"),
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".metrics-grid"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".metric-icon"),
                { scale: 0 },
                {
                    scale: 1,
                    duration: D.fast,
                    ease: E.bounce,
                    stagger: S.normal,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: $1(".metrics-grid"),
                        start: "top 80%",
                    },
                },
            );

            // Counter animations
            const valueEls = $(".metric-value");
            valueEls.forEach((el, i) => {
                const target = parseInt(
                    el.getAttribute("data-value") || "0",
                    10,
                );
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.smooth,
                        delay: 0.3 + i * S.normal,
                        scrollTrigger: {
                            trigger: $1(".metrics-grid"),
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

            // ════════════════════════════════════════
            // FAQ
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".faq-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".faq-section"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".faq-item"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".faq-list"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cta-content"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.hero,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".cta-section"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".cta-card"),
                { opacity: 0, scale: 0.9, y: 20 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".cta-section"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal,
                    ease: E.smooth,
                    delay: 0.6,
                    scrollTrigger: {
                        trigger: $1(".cta-section"),
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
