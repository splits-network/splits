"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface BlogAnimatorProps {
    children: ReactNode;
}

export function BlogAnimator({ children }: BlogAnimatorProps) {
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
            // HERO — Memphis shapes elastic bounce-in
            // ════════════════════════════════════════

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

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 60, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            // ════════════════════════════════════════
            // CATEGORY FILTER BAR
            // ════════════════════════════════════════

            const filterBar = $1(".category-filter-bar");
            if (filterBar) {
                gsap.fromTo(
                    $(".category-tag"),
                    { opacity: 0, y: 20, scale: 0.8 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: { trigger: filterBar, start: "top 90%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FEATURED POST
            // ════════════════════════════════════════

            const featuredCard = $1(".featured-card");
            if (featuredCard) {
                gsap.fromTo(
                    featuredCard,
                    { opacity: 0, y: 50, scale: 0.95, rotation: -1 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: featuredCard, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // POST GRID
            // ════════════════════════════════════════

            const postGrid = $1(".post-grid");
            if (postGrid) {
                gsap.fromTo(
                    $1(".post-grid-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: postGrid, start: "top 80%" },
                    },
                );

                gsap.fromTo(
                    $(".post-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: postGrid, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PULL QUOTE
            // ════════════════════════════════════════

            const pullQuote = $1(".pullquote");
            if (pullQuote) {
                gsap.fromTo(
                    pullQuote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1, x: 0, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: pullQuote, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // NEWSLETTER CTA
            // ════════════════════════════════════════

            const newsletter = $1(".newsletter-section");
            if (newsletter) {
                gsap.fromTo(
                    $1(".newsletter-content"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: newsletter, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════

            const ctaSection = $1(".blog-cta");
            if (ctaSection) {
                gsap.fromTo(
                    $1(".cta-content"),
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0,
                        duration: D.hero, ease: E.smooth,
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
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
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                    },
                );

                gsap.fromTo(
                    $1(".cta-footer"),
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: D.normal, ease: E.smooth,
                        delay: 0.6,
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
