"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Data Observatory animation constants (matching landing page five)
const D = { fast: 0.3, normal: 0.6, slow: 0.9, hero: 1.2, counter: 1.5 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", strong: "power3.out" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

interface ArticleFiveAnimatorProps {
    children: ReactNode;
}

export function ArticleFiveAnimator({ children }: ArticleFiveAnimatorProps) {
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
            // HERO - Dashboard bootup sequence
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            // System status bar flickers on
            heroTl.fromTo(
                $1(".hero-status"),
                { opacity: 0 },
                { opacity: 1, duration: D.fast },
            );

            // Category meta
            heroTl.fromTo(
                $1(".hero-meta"),
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.1",
            );

            // Headline types in
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: D.hero, ease: E.strong },
                "-=0.3",
            );

            // Subtext fades up
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.6",
            );

            // Author byline
            heroTl.fromTo(
                $1(".hero-byline"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.normal, ease: E.bounce },
                "-=0.3",
            );

            // ════════════════════════════════════════
            // SIGNAL BAR - Live stat counters
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".signal-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".signal-section"), start: "top 85%" },
                },
            );

            // Counter animations in signal bar
            const signalValues = $(".signal-value");
            signalValues.forEach((el, i) => {
                const raw = el.getAttribute("data-value") || "0";
                const target = parseFloat(raw);
                const suffix = el.getAttribute("data-suffix") || "";
                const prefix = el.getAttribute("data-prefix") || "";
                const isDecimal = raw.includes(".");

                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".signal-section"), start: "top 85%" },
                        delay: i * S.normal,
                        onUpdate: function () {
                            const current = this.targets()[0].value;
                            if (isDecimal) {
                                el.textContent = prefix + current.toFixed(1) + suffix;
                            } else if (target >= 1000) {
                                el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
                            } else {
                                el.textContent = prefix + Math.floor(current) + suffix;
                            }
                        },
                    },
                );
            });

            // ════════════════════════════════════════
            // ARTICLE TEXT SECTIONS
            // ════════════════════════════════════════
            const textSections = [".article-intro", ".article-why", ".article-future"];
            textSections.forEach((sel) => {
                const section = $1(sel);
                if (!section) return;
                const inner = section.querySelector(".section-content");
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
            // PULL QUOTES - Terminal style
            // ════════════════════════════════════════
            $(".terminal-quote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, y: 30, scale: 0.98 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // COMPARISON - Old vs New
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".comparison-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".article-comparison"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".comparison-panel"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".comparison-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // IMAGE BREAKS
            // ════════════════════════════════════════
            $(".image-overlay-text").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: el, start: "top 85%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // TIMELINE - Evolution section
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".timeline-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".article-timeline"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".timeline-node"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1, x: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".timeline-track"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // DATA MODULES - Benefits grid
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".modules-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".article-modules"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".module-card"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".modules-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // CTA - Final section
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cta-content"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: D.hero, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".article-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $(".cta-panel"),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    delay: 0.3,
                    scrollTrigger: { trigger: $1(".article-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal, ease: E.smooth,
                    delay: 0.5,
                    scrollTrigger: { trigger: $1(".article-cta"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
