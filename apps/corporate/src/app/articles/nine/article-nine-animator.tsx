"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Same timing & easing as landing page nine
const D = { fast: 0.35, normal: 0.6, hero: 1.0, line: 0.8 };
const E = { crisp: "power3.out", draw: "power2.inOut", soft: "power2.out" };
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface ArticleNineAnimatorProps {
    children: ReactNode;
}

export function ArticleNineAnimator({ children }: ArticleNineAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            document.documentElement.style.scrollBehavior = "smooth";

            // ─── HERO ────────────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.crisp } });

            heroTl.fromTo(
                $1(".art9-hero-meta"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.normal },
            );
            heroTl.fromTo(
                $1(".art9-hero-title"),
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: D.hero },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".art9-hero-excerpt"),
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.5",
            );
            heroTl.fromTo(
                $1(".art9-hero-author"),
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.3",
            );
            // Hero bottom rule line-draw
            heroTl.fromTo(
                $1(".art9-hero-rule"),
                { scaleX: 0, transformOrigin: "left center" },
                { scaleX: 1, duration: D.line, ease: E.draw },
                "-=0.4",
            );

            // ─── TABLE OF CONTENTS ───────────────────────────────────
            gsap.fromTo(
                $1(".art9-toc-label"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.soft,
                    scrollTrigger: {
                        trigger: $1(".art9-toc"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $(".art9-toc-item"),
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".art9-toc"),
                        start: "top 85%",
                    },
                },
            );

            // ─── ARTICLE SECTIONS ────────────────────────────────────
            // Animate each section head + body + special elements
            $(".art9-section").forEach((section) => {
                const head = section.querySelector(".art9-section-head");
                const line = section.querySelector(".art9-section-line");
                const body = section.querySelector(".art9-body");

                if (head) {
                    gsap.fromTo(
                        head,
                        { opacity: 0, x: -20 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: D.normal,
                            ease: E.crisp,
                            scrollTrigger: {
                                trigger: section,
                                start: "top 75%",
                            },
                        },
                    );
                }

                // Section heading underline draw
                if (line) {
                    gsap.fromTo(
                        line,
                        { scaleX: 0, transformOrigin: "left center" },
                        {
                            scaleX: 1,
                            duration: D.line,
                            ease: E.draw,
                            delay: 0.2,
                            scrollTrigger: {
                                trigger: section,
                                start: "top 75%",
                            },
                        },
                    );
                }

                if (body) {
                    gsap.fromTo(
                        body,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.normal,
                            ease: E.soft,
                            delay: 0.15,
                            scrollTrigger: {
                                trigger: section,
                                start: "top 70%",
                            },
                        },
                    );
                }
            });

            // ─── STATS GRID ──────────────────────────────────────────
            gsap.fromTo(
                $1(".art9-stats"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".art9-stats"),
                        start: "top 85%",
                    },
                },
            );

            // ─── PULL QUOTES ─────────────────────────────────────────
            $(".art9-pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.hero,
                        ease: E.crisp,
                        scrollTrigger: {
                            trigger: quote,
                            start: "top 80%",
                        },
                    },
                );
            });

            // ─── ADVANTAGES GRID ─────────────────────────────────────
            gsap.fromTo(
                $1(".art9-advantages"),
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".art9-advantages"),
                        start: "top 80%",
                    },
                },
            );

            // ─── DIAGRAM ─────────────────────────────────────────────
            gsap.fromTo(
                $1(".art9-diagram"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".art9-diagram"),
                        start: "top 80%",
                    },
                },
            );

            // ─── STAKEHOLDER CARDS ───────────────────────────────────
            gsap.fromTo(
                $(".art9-stakeholder-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".art9-stakeholders"),
                        start: "top 80%",
                    },
                },
            );

            // ─── OUTCOME METRICS ─────────────────────────────────────
            gsap.fromTo(
                $1(".art9-outcomes"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".art9-outcomes"),
                        start: "top 85%",
                    },
                },
            );

            // ─── IMAGE BREAKS ────────────────────────────────────────
            $(".art9-image-text").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 35 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.hero,
                        ease: E.crisp,
                        scrollTrigger: {
                            trigger: el.closest(".art9-image-break"),
                            start: "top 70%",
                        },
                    },
                );
            });

            // ─── CTA ─────────────────────────────────────────────────
            gsap.fromTo(
                $1(".art9-cta-content"),
                { opacity: 0, y: 35 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".art9-cta"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".art9-cta-card"),
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".art9-cta-cards"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".art9-cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal,
                    ease: E.soft,
                    delay: 0.4,
                    scrollTrigger: {
                        trigger: $1(".art9-cta"),
                        start: "top 75%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
