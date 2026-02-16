"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface LandingOneAnimatorProps {
    children: ReactNode;
}

export function LandingOneAnimator({ children }: LandingOneAnimatorProps) {
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

            // ── MEMPHIS SHAPES ──
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

            // ── HERO ──
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(heroBadge, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.bounce });
            }
            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(heroHeadline, { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: D.hero }, "-=0.3");
            }
            const heroSub = $1(".hero-sub");
            if (heroSub) {
                heroTl.fromTo(heroSub, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.4");
            }
            heroTl.fromTo(
                $(".hero-cta"),
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.normal, stagger: S.normal, ease: E.bounce },
                "-=0.2",
            );
            const heroFootnote = $1(".hero-footnote");
            if (heroFootnote) {
                heroTl.fromTo(heroFootnote, { opacity: 0 }, { opacity: 1, duration: D.normal }, "-=0.1");
            }

            // ── STATS BAR ──
            gsap.fromTo(
                $(".stat-block"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1,
                    duration: D.normal, ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".stats-section"), start: "top 90%" },
                },
            );

            // ── PROBLEM SECTION ──
            const problemHeading = $1(".problem-heading");
            if (problemHeading) {
                gsap.fromTo(
                    problemHeading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".problem-section"), start: "top 75%" } },
                );
            }
            gsap.fromTo(
                $(".problem-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".problem-grid"), start: "top 80%" },
                },
            );

            // ── PULL QUOTES ──
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

            // ── PRINCIPLES SECTION ──
            const principlesHeading = $1(".principles-heading");
            if (principlesHeading) {
                gsap.fromTo(
                    principlesHeading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".principles-section"), start: "top 75%" } },
                );
            }
            gsap.fromTo(
                $(".principle-card"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0,
                    duration: D.normal, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".principles-grid"), start: "top 80%" },
                },
            );

            // ── ECONOMICS SECTION ──
            const econHeading = $1(".econ-heading");
            if (econHeading) {
                gsap.fromTo(
                    econHeading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".econ-section"), start: "top 75%" } },
                );
            }
            gsap.fromTo(
                $(".econ-block"),
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal, ease: E.bounce, stagger: S.normal,
                    scrollTrigger: { trigger: $1(".econ-flow"), start: "top 80%" },
                },
            );

            // ── HOW IT WORKS ──
            const howHeading = $1(".how-heading");
            if (howHeading) {
                gsap.fromTo(
                    howHeading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".how-section"), start: "top 75%" } },
                );
            }
            gsap.fromTo(
                $(".how-step"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".how-grid"), start: "top 80%" },
                },
            );

            // ── TESTIMONIAL ──
            const testimonial = $1(".testimonial-block");
            if (testimonial) {
                gsap.fromTo(
                    testimonial,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: D.slow, ease: E.smooth, scrollTrigger: { trigger: testimonial, start: "top 80%" } },
                );
            }

            // ── CTA ──
            const ctaContent = $1(".cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: D.hero, ease: E.smooth, scrollTrigger: { trigger: $1(".cta-section"), start: "top 80%" } },
                );
            }
            gsap.fromTo(
                $(".cta-card"),
                { opacity: 0, y: 40, scale: 0.85 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal, ease: E.bounce, stagger: S.loose, delay: 0.3,
                    scrollTrigger: { trigger: $1(".cta-section"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
