"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter durations for utilitarian help center
const D = { fast: 0.25, normal: 0.4, slow: 0.6, hero: 0.7 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.2)", // Less bounce than marketing
    elastic: "elastic.out(1, 0.3)", // Less elastic
};
const S = { tight: 0.04, normal: 0.07, loose: 0.1 }; // Tighter stagger

interface HelpAnimatorProps {
    children: ReactNode;
}

export function HelpAnimator({ children }: HelpAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(
                    containerRef.current.querySelectorAll(
                        "[class*='opacity-0']"
                    ),
                    { opacity: 1 }
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ════════════════════════════════════════
            // HERO — Subtle Memphis shapes
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 0.25, // More subtle than marketing
                    scale: 1,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.1,
                }
            );

            // Minimal float animation
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${3 + (i % 2) * 2}`,
                    x: `+=${2 + (i % 2) * 2}`,
                    duration: 4 + i * 0.3,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Hero content — quick and direct
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -15 },
                    { opacity: 1, y: 0, duration: D.normal }
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.2"
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.3"
                );
            }

            // ════════════════════════════════════════
            // SEARCH BAR
            // ════════════════════════════════════════
            const searchBar = $1(".help-search-bar");
            if (searchBar) {
                gsap.fromTo(
                    searchBar,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.3,
                    }
                );
            }

            // ════════════════════════════════════════
            // CATEGORY CARDS
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".category-card"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".help-categories"),
                        start: "top 85%",
                    },
                }
            );

            // ════════════════════════════════════════
            // FAQ SECTIONS
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".faq-section"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".faq-content"),
                        start: "top 85%",
                    },
                }
            );

            // ════════════════════════════════════════
            // RESOURCES
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".resource-card"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".help-resources"),
                        start: "top 85%",
                    },
                }
            );

            // ════════════════════════════════════════
            // SUPPORT CTA
            // ════════════════════════════════════════
            const supportCta = $1(".support-cta-content");
            if (supportCta) {
                gsap.fromTo(
                    supportCta,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".help-support-cta"),
                            start: "top 85%",
                        },
                    }
                );
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
