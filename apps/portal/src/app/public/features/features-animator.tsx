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

interface FeaturesAnimatorProps {
    children: ReactNode;
}

export function FeaturesAnimator({ children }: FeaturesAnimatorProps) {
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

            // Memphis shapes -- elastic bounce in from random positions
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

            heroTl.fromTo(
                $1(".hero-meta"),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
            );
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 60, skewY: 2 },
                { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.4",
            );
            heroTl.fromTo(
                $1(".hero-byline"),
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: D.normal, ease: E.bounce },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".stat-block"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".features-stats"), start: "top 90%" },
                },
            );

            // ════════════════════════════════════════
            // ARTICLE-STYLE TEXT SECTIONS
            // ════════════════════════════════════════
            const articleSections = [".features-intro", ".features-recruiters-prose", ".features-companies-prose", ".features-more-prose"];
            articleSections.forEach((sel) => {
                const section = $1(sel);
                if (!section) return;
                const inner = section.querySelector(".article-section, .prose-section");
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1, y: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: section, start: "top 75%" },
                        },
                    );
                }
            });

            // ════════════════════════════════════════
            // PULL QUOTES
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
            // CORE FEATURES GRID
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".core-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".features-core"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".core-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".core-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // IMAGE BREAKS
            // ════════════════════════════════════════
            const imageCaptions = [".image-caption", ".image-caption-2"];
            imageCaptions.forEach((sel) => {
                const el = $1(sel);
                if (el) {
                    gsap.fromTo(
                        el,
                        { opacity: 0, y: 30, scale: 0.95 },
                        {
                            opacity: 1, y: 0, scale: 1,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: el, start: "top 85%" },
                        },
                    );
                }
            });

            // ════════════════════════════════════════
            // RECRUITER BENEFITS GRID
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".recruiter-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".features-recruiters"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".recruiter-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: -2 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".recruiter-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // COMPANY BENEFITS GRID
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".company-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".features-companies"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".company-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: 2 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".company-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // TECH / MORE FEATURES
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".more-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".features-more"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".more-card"),
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".more-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0,
                    duration: D.hero, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".features-cta"), start: "top 80%" },
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
                    scrollTrigger: { trigger: $1(".features-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal, ease: E.smooth,
                    delay: 0.6,
                    scrollTrigger: { trigger: $1(".features-cta"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
