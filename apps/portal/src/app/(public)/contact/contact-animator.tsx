"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.5, normal: 0.7, slow: 1.0 };
const E = { smooth: "power3.out", soft: "power2.out" };

export function ContactAnimator({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const c = containerRef.current;
            const $1 = (sel: string) => c.querySelector(sel);
            const $$ = (sel: string) => Array.from(c.querySelectorAll(sel));

            // ─── HERO ────────────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroKicker = $1(".bc-hero-kicker");
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast },
                );
            }

            const heroHeadline = $1(".bc-hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: D.slow },
                    "-=0.3",
                );
            }

            const heroBody = $1(".bc-hero-body");
            if (heroBody) {
                heroTl.fromTo(
                    heroBody,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.5",
                );
            }

            const heroStat = $1(".bc-hero-stat");
            if (heroStat) {
                heroTl.fromTo(
                    heroStat,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: D.normal },
                    "-=0.3",
                );
            }

            // ─── FORM & INFO CARDS ───────────────────────────────────
            const formContainer = $1(".bc-form-container");
            if (formContainer) {
                gsap.fromTo(
                    formContainer,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bc-main"),
                            start: "top 80%",
                        },
                    },
                );
            }

            const infoCards = $$(".bc-info-card");
            if (infoCards.length > 0) {
                gsap.fromTo(
                    infoCards,
                    { opacity: 0, x: 40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        stagger: 0.1,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bc-main"),
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── METRICS ─────────────────────────────────────────────
            const metricItems = $$(".bc-metric-item");
            if (metricItems.length > 0) {
                gsap.fromTo(
                    metricItems,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        stagger: 0.1,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: $1(".bc-metrics"),
                            start: "top 85%",
                        },
                    },
                );
            }

            // ─── FOOTER CTA ─────────────────────────────────────────
            const ctaContent = $1(".bc-cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bc-cta"),
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
