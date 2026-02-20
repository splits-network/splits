"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants — MARKETING (aggressive)
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface AboutAnimatorProps {
    children: ReactNode;
}

export function AboutAnimator({ children }: AboutAnimatorProps) {
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

            document.documentElement.style.scrollBehavior = "smooth";

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════

            // Memphis shapes — elastic bounce in from random positions
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

            const heroCta = $1(".hero-cta");
            if (heroCta) {
                heroTl.fromTo(
                    heroCta,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: D.normal, ease: E.bounce },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // MISSION SECTION
            // ════════════════════════════════════════
            const missionSection = $1(".mission-section");
            if (missionSection) {
                gsap.fromTo(
                    missionSection,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: { trigger: missionSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // VALUE PROPS / BENEFITS
            // ════════════════════════════════════════
            const benefitsHeading = $1(".benefits-heading");
            if (benefitsHeading) {
                gsap.fromTo(
                    benefitsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".benefits-section"), start: "top 75%" },
                    },
                );
            }

            gsap.fromTo(
                $(".benefit-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".benefits-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // PULL QUOTE
            // ════════════════════════════════════════
            const pullquote = $1(".pullquote");
            if (pullquote) {
                gsap.fromTo(
                    pullquote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1,
                        x: 0,
                        rotation: 0,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: { trigger: pullquote, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // DIFFERENTIATORS
            // ════════════════════════════════════════
            const diffHeading = $1(".diff-heading");
            if (diffHeading) {
                gsap.fromTo(
                    diffHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".diff-section"), start: "top 75%" },
                    },
                );
            }

            gsap.fromTo(
                $(".diff-card"),
                { opacity: 0, y: 50, scale: 0.9, rotation: -2 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".diff-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".stat-block"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".stats-bar"), start: "top 90%" },
                },
            );

            // ════════════════════════════════════════
            // TESTIMONIALS
            // ════════════════════════════════════════
            const testimonialsHeading = $1(".testimonials-heading");
            if (testimonialsHeading) {
                gsap.fromTo(
                    testimonialsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".testimonials-section"), start: "top 75%" },
                    },
                );
            }

            gsap.fromTo(
                $(".testimonial-card"),
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".testimonials-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // TRUST SECTION
            // ════════════════════════════════════════
            const trustSection = $1(".trust-section");
            if (trustSection) {
                gsap.fromTo(
                    trustSection,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: { trigger: trustSection, start: "top 75%" },
                    },
                );
            }

            gsap.fromTo(
                $(".trust-badge"),
                { opacity: 0, scale: 0.85 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".trust-badges"), start: "top 85%" },
                },
            );

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaContent = $1(".cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.hero,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".final-cta"), start: "top 80%" },
                    },
                );
            }

            const ctaButtons = $1(".cta-buttons");
            if (ctaButtons) {
                gsap.fromTo(
                    ctaButtons,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        delay: 0.3,
                        scrollTrigger: { trigger: $1(".final-cta"), start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
