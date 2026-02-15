"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.6, slow: 0.9, hero: 1.2, counter: 1.5 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", strong: "power3.out" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

interface Props {
    children: ReactNode;
}

export function LandingFiveAnimator({ children }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                // Make everything visible immediately
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), {
                    opacity: 1,
                });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ════════════════════════════════════════
            // HERO - Dashboard bootup sequence
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            // Status bar flickers on
            heroTl.fromTo(
                $1(".hero-status"),
                { opacity: 0 },
                { opacity: 1, duration: D.fast },
            );

            // Headline types in
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: D.hero, ease: E.strong },
                "-=0.1",
            );

            // Subtext fades up
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.6",
            );

            // Stat cards come online one by one
            heroTl.fromTo(
                $(".stat-card"),
                { opacity: 0, y: 30, scale: 0.95 },
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

            // Counter animations in hero
            const heroStatValues = $(".stat-value");
            heroStatValues.forEach((el, i) => {
                const raw = el.getAttribute("data-value") || "0";
                const target = parseFloat(raw);
                const suffix = el.getAttribute("data-suffix") || "";
                const isDecimal = raw.includes(".");

                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.smooth,
                        delay: 1.0 + i * S.normal,
                        onUpdate: function () {
                            const current = this.targets()[0].value;
                            if (isDecimal) {
                                el.textContent =
                                    current.toFixed(1) + suffix;
                            } else if (target >= 1000) {
                                el.textContent =
                                    Math.floor(current).toLocaleString() +
                                    suffix;
                            } else {
                                el.textContent =
                                    Math.floor(current) + suffix;
                            }
                        },
                    },
                );
            });

            // CTA buttons
            heroTl.fromTo(
                $1(".hero-cta"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // DATA FEEDS - Horizontal scroll cards
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".feeds-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".feeds-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".feed-card"),
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".feeds-track"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CONSTELLATION - Network diagram
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".constellation-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".constellation-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".constellation-node"),
                { opacity: 0, scale: 0.9, y: 30 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".constellation-grid"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $1(".constellation-hub"),
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: D.slow,
                    ease: E.bounce,
                    delay: 0.4,
                    scrollTrigger: {
                        trigger: $1(".constellation-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // MISSION CONTROL - Module cards
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".modules-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".modules-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".module-card"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".modules-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // INSIGHTS - Big picture numbers
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".insights-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".insights-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".insight-card"),
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".insights-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // PLATFORMS - Access panels
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".platforms-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".platforms-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".platform-panel"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".platforms-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $(".platform-feature"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".platforms-section"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CTA - Final section
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
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal,
                    ease: E.smooth,
                    delay: 0.5,
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
