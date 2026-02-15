"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Blueprint Construction timing - matches landing page eight
const D = { fast: 0.4, normal: 0.7, hero: 1.2, build: 0.8, line: 0.9 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", draw: "power2.inOut", crisp: "power3.out" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

interface ArticleEightAnimatorProps {
    children: ReactNode;
}

export function ArticleEightAnimator({ children }: ArticleEightAnimatorProps) {
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

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            document.documentElement.style.scrollBehavior = "smooth";

            // ── HERO ──────────────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.crisp } });

            // Blueprint grid lines draw in
            heroTl.fromTo(
                $(".a8-grid-line"),
                { scaleX: 0, transformOrigin: "left center" },
                { scaleX: 1, duration: D.build, stagger: S.tight, ease: E.draw },
            );
            heroTl.fromTo(
                $(".a8-grid-line-v"),
                { scaleY: 0, transformOrigin: "top center" },
                { scaleY: 1, duration: D.build, stagger: S.tight, ease: E.draw },
                "-=0.6",
            );
            heroTl.fromTo(
                $1(".a8-hero-badge"),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".a8-hero-title"),
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: D.hero },
                "-=0.2",
            );
            heroTl.fromTo(
                $1(".a8-hero-excerpt"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.6",
            );
            heroTl.fromTo(
                $1(".a8-hero-author"),
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".a8-hero-rule"),
                { scaleX: 0, transformOrigin: "left center" },
                { scaleX: 1, duration: D.line, ease: E.draw },
                "-=0.4",
            );

            // ── TABLE OF CONTENTS ─────────────────────────────────────
            gsap.fromTo(
                $1(".a8-toc-label"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1, x: 0, duration: D.fast, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".a8-toc"), start: "top 85%" },
                },
            );
            gsap.fromTo(
                $(".a8-toc-item"),
                { opacity: 0, y: 10 },
                {
                    opacity: 1, y: 0, duration: D.fast, ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".a8-toc"), start: "top 85%" },
                },
            );

            // ── ARTICLE SECTIONS ──────────────────────────────────────
            $(".a8-section").forEach((section) => {
                const head = section.querySelector(".a8-section-head");
                const line = section.querySelector(".a8-section-line");
                const body = section.querySelector(".a8-body");

                if (head) {
                    gsap.fromTo(
                        head,
                        { opacity: 0, x: -20 },
                        {
                            opacity: 1, x: 0, duration: D.normal, ease: E.crisp,
                            scrollTrigger: { trigger: section, start: "top 75%" },
                        },
                    );
                }
                if (line) {
                    gsap.fromTo(
                        line,
                        { scaleX: 0, transformOrigin: "left center" },
                        {
                            scaleX: 1, duration: D.line, ease: E.draw, delay: 0.2,
                            scrollTrigger: { trigger: section, start: "top 75%" },
                        },
                    );
                }
                if (body) {
                    gsap.fromTo(
                        body,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                            delay: 0.15,
                            scrollTrigger: { trigger: section, start: "top 70%" },
                        },
                    );
                }
            });

            // ── BUILDING BLOCKS ───────────────────────────────────────
            gsap.fromTo(
                $(".a8-block-card"),
                { opacity: 0, y: 50, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.build, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".a8-blocks"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".a8-block-icon"),
                { scale: 0, rotation: -90 },
                {
                    scale: 1, rotation: 0,
                    duration: D.fast, ease: "elastic.out(1, 0.5)", stagger: S.loose, delay: 0.3,
                    scrollTrigger: { trigger: $1(".a8-blocks"), start: "top 80%" },
                },
            );

            // ── PULL QUOTES ───────────────────────────────────────────
            $(".a8-pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0, duration: D.hero, ease: E.crisp,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ── BLUEPRINT DIAGRAM ─────────────────────────────────────
            $(".a8-diagram").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.hero, ease: E.crisp,
                        scrollTrigger: { trigger: el, start: "top 80%" },
                    },
                );
            });

            // ── PHASE CARDS ───────────────────────────────────────────
            gsap.fromTo(
                $(".a8-phase-card"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0,
                    duration: D.build, ease: E.smooth, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".a8-phases"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".a8-phase-num"),
                { opacity: 0, scale: 0 },
                {
                    opacity: 1, scale: 1,
                    duration: D.fast, ease: E.bounce, stagger: S.loose, delay: 0.2,
                    scrollTrigger: { trigger: $1(".a8-phases"), start: "top 80%" },
                },
            );

            // ── STATS GRID ────────────────────────────────────────────
            gsap.fromTo(
                $1(".a8-stats"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.crisp,
                    scrollTrigger: { trigger: $1(".a8-stats"), start: "top 85%" },
                },
            );

            // ── STAKEHOLDER CARDS ─────────────────────────────────────
            gsap.fromTo(
                $(".a8-stakeholder-card"),
                { opacity: 0, y: 50, rotateX: 15 },
                {
                    opacity: 1, y: 0, rotateX: 0,
                    duration: D.build, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".a8-stakeholders"), start: "top 80%" },
                },
            );

            // ── OUTCOME METRICS ───────────────────────────────────────
            gsap.fromTo(
                $1(".a8-outcomes"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.crisp,
                    scrollTrigger: { trigger: $1(".a8-outcomes"), start: "top 85%" },
                },
            );

            // ── IMAGE BREAKS ──────────────────────────────────────────
            $(".a8-image-text").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 35 },
                    {
                        opacity: 1, y: 0, duration: D.hero, ease: E.crisp,
                        scrollTrigger: {
                            trigger: el.closest(".a8-image-break"),
                            start: "top 70%",
                        },
                    },
                );
            });

            // ── CTA ───────────────────────────────────────────────────
            gsap.fromTo(
                $1(".a8-cta-content"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: D.hero, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".a8-cta"), start: "top 75%" },
                },
            );
            gsap.fromTo(
                $(".a8-cta-card"),
                { opacity: 0, scale: 0.9, y: 20 },
                {
                    opacity: 1, scale: 1, y: 0,
                    duration: D.normal, ease: E.bounce, stagger: S.loose, delay: 0.3,
                    scrollTrigger: { trigger: $1(".a8-cta-cards"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $1(".a8-cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1, duration: D.normal, ease: E.smooth, delay: 0.4,
                    scrollTrigger: { trigger: $1(".a8-cta"), start: "top 75%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
