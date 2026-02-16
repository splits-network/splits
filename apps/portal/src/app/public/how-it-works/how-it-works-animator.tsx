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

interface HowItWorksAnimatorProps {
    children: ReactNode;
}

export function HowItWorksAnimator({ children }: HowItWorksAnimatorProps) {
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
            // MEMPHIS SHAPES — elastic bounce in from random positions
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

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════
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
                    scrollTrigger: { trigger: $1(".hiw-stats"), start: "top 90%" },
                },
            );

            // ════════════════════════════════════════
            // ARTICLE INTRO SECTION
            // ════════════════════════════════════════
            const introSection = $1(".hiw-intro");
            if (introSection) {
                const inner = introSection.querySelector(".intro-content");
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1, y: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: introSection, start: "top 75%" },
                        },
                    );
                }
            }

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
            // PROCESS TIMELINE — THE STAR
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".timeline-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".hiw-timeline"), start: "top 75%" },
                },
            );

            // Animate the connecting line growing
            const timelineLine = $1(".timeline-connector");
            if (timelineLine) {
                gsap.fromTo(
                    timelineLine,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        duration: D.counter,
                        ease: E.smooth,
                        transformOrigin: "top center",
                        scrollTrigger: { trigger: $1(".timeline-items"), start: "top 80%" },
                    },
                );
            }

            // Timeline items stagger in with alternating slide direction
            $(".timeline-item").forEach((item, i) => {
                const fromX = i % 2 === 0 ? -50 : 50;
                gsap.fromTo(
                    item,
                    { opacity: 0, x: fromX, scale: 0.9 },
                    {
                        opacity: 1, x: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        scrollTrigger: { trigger: item, start: "top 85%" },
                    },
                );
            });

            // Step number pops
            $(".step-number").forEach((num) => {
                gsap.fromTo(
                    num,
                    { opacity: 0, scale: 0, rotation: -90 },
                    {
                        opacity: 1, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.elastic,
                        scrollTrigger: { trigger: num, start: "top 88%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // IMAGE BREAK
            // ════════════════════════════════════════
            const imgCaption = $1(".image-caption");
            if (imgCaption) {
                gsap.fromTo(
                    imgCaption,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: imgCaption, start: "top 85%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // AUDIENCE CARDS (For Each Audience)
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".audience-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".hiw-audience"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".audience-card"),
                { opacity: 0, y: 50, scale: 0.9, rotation: -2 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".audience-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // BENEFITS GRID
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".benefits-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".hiw-benefits"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".benefit-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".benefits-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // CTA SECTION
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0,
                    duration: D.hero, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".hiw-cta"), start: "top 80%" },
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
                    scrollTrigger: { trigger: $1(".hiw-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal, ease: E.smooth,
                    delay: 0.6,
                    scrollTrigger: { trigger: $1(".hiw-cta"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // MONEY FLOW SECTION
            // ════════════════════════════════════════
            const moneySection = $1(".hiw-money");
            if (moneySection) {
                const inner = moneySection.querySelector(".money-content");
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1, y: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: moneySection, start: "top 75%" },
                        },
                    );
                }
            }

            gsap.fromTo(
                $(".money-block"),
                { opacity: 0, scale: 0.8, y: 20 },
                {
                    opacity: 1, scale: 1, y: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".money-grid"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
