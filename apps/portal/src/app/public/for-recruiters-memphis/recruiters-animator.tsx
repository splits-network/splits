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

interface RecruitersAnimatorProps {
    children: ReactNode;
}

export function RecruitersAnimator({ children }: RecruitersAnimatorProps) {
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
            // MEMPHIS SHAPES -- elastic bounce in
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

            // Continuous floating
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

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroTag = $1(".hero-tag");
            if (heroTag) {
                heroTl.fromTo(
                    heroTag,
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

            const heroSub = $1(".hero-subtext");
            if (heroSub) {
                heroTl.fromTo(
                    heroSub,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            const heroCta = $1(".hero-cta");
            if (heroCta) {
                heroTl.fromTo(
                    heroCta,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast, ease: E.bounce },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            const statsSection = $1(".recruiters-stats");
            if (statsSection) {
                gsap.fromTo(
                    $(".stat-block"),
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: statsSection, start: "top 90%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PAIN POINTS
            // ════════════════════════════════════════
            const painSection = $1(".pain-section");
            if (painSection) {
                gsap.fromTo(
                    $1(".pain-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: painSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".pain-item"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: painSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PULL QUOTE
            // ════════════════════════════════════════
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1, x: 0, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // FEATURES GRID
            // ════════════════════════════════════════
            const featuresSection = $1(".features-section");
            if (featuresSection) {
                gsap.fromTo(
                    $1(".features-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: featuresSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".feature-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: $1(".features-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // HOW IT WORKS
            // ════════════════════════════════════════
            const howSection = $1(".how-section");
            if (howSection) {
                gsap.fromTo(
                    $1(".how-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: howSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".how-step"),
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: howSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // COMPARISON
            // ════════════════════════════════════════
            const compSection = $1(".comparison-section");
            if (compSection) {
                gsap.fromTo(
                    $1(".comparison-heading"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: compSection, start: "top 75%" },
                    },
                );

                gsap.fromTo(
                    $(".comparison-card"),
                    { opacity: 0, y: 50, scale: 0.9, rotation: -2 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: $1(".comparison-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SOCIAL PROOF
            // ════════════════════════════════════════
            const proofSection = $1(".proof-section");
            if (proofSection) {
                gsap.fromTo(
                    $1(".proof-content"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: proofSection, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaSection = $1(".cta-section");
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
                    $(".cta-stat"),
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        delay: 0.3,
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
