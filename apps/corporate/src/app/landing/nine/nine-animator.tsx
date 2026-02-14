"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Timing & easing
const D = { fast: 0.35, normal: 0.6, hero: 1.0, line: 0.8 };
const E = { crisp: "power3.out", draw: "power2.inOut", soft: "power2.out" };
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface NineAnimatorProps {
    children: ReactNode;
}

export function NineAnimator({ children }: NineAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                // Reveal everything instantly
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), {
                    opacity: 1,
                });
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
                $1(".nine-hero-ref"),
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: D.normal },
            );
            heroTl.fromTo(
                $1(".nine-hero-headline"),
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: D.hero },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".nine-hero-sub"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.5",
            );
            heroTl.fromTo(
                $1(".nine-hero-stats"),
                { opacity: 0, y: 20, scaleY: 0.95 },
                { opacity: 1, y: 0, scaleY: 1, duration: D.normal },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".nine-hero-ctas"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.2",
            );

            // ─── PROBLEM ─────────────────────────────────────────────
            gsap.fromTo(
                $1(".nine-problem-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-problem"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-problem-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".nine-problem-grid"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-problem-item"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.tight,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".nine-problem-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ─── SOLUTION PILLARS ────────────────────────────────────
            gsap.fromTo(
                $1(".nine-solution-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-solution"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-pillar-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".nine-solution .grid"),
                        start: "top 80%",
                    },
                },
            );
            // Line-draw reveal on pillar bottom borders
            gsap.fromTo(
                $(".nine-pillar-line"),
                { scaleX: 0, transformOrigin: "left center" },
                {
                    scaleX: 1,
                    duration: D.line,
                    ease: E.draw,
                    stagger: S.loose,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".nine-solution .grid"),
                        start: "top 80%",
                    },
                },
            );

            // ─── FOR RECRUITERS ──────────────────────────────────────
            gsap.fromTo(
                $1(".nine-recruiters-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-recruiters"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-recruiters-features .nine-feature-card"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".nine-recruiters-features"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-recruiters-cta"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.soft,
                    scrollTrigger: {
                        trigger: $1(".nine-recruiters-cta"),
                        start: "top 90%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-recruiter-visual"),
                { opacity: 0, x: 40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-recruiters"),
                        start: "top 65%",
                    },
                },
            );

            // ─── FOR CANDIDATES ──────────────────────────────────────
            gsap.fromTo(
                $1(".nine-candidates-heading"),
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-candidates"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-candidates-features .nine-feature-card"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".nine-candidates-features"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-candidates-cta"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.soft,
                    scrollTrigger: {
                        trigger: $1(".nine-candidates-cta"),
                        start: "top 90%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-candidate-visual"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-candidates"),
                        start: "top 65%",
                    },
                },
            );

            // ─── FOR COMPANIES ───────────────────────────────────────
            gsap.fromTo(
                $1(".nine-companies-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-companies"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-companies-features .nine-feature-card"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".nine-companies-features"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-companies-cta"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.soft,
                    scrollTrigger: {
                        trigger: $1(".nine-companies-cta"),
                        start: "top 90%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-company-visual"),
                { opacity: 0, x: 40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-companies"),
                        start: "top 65%",
                    },
                },
            );

            // ─── PROCESS / WORKFLOW ──────────────────────────────────
            gsap.fromTo(
                $1(".nine-process-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-process"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-process-step"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".nine-process-track"),
                        start: "top 80%",
                    },
                },
            );

            // ─── IMAGE SECTION ───────────────────────────────────────
            gsap.fromTo(
                $1(".nine-image-text"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-image"),
                        start: "top 70%",
                    },
                },
            );

            // ─── FAQ ─────────────────────────────────────────────────
            gsap.fromTo(
                $1(".nine-faq-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-faq"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-faq-item"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".nine-faq .space-y-px"),
                        start: "top 80%",
                    },
                },
            );

            // ─── CTA ─────────────────────────────────────────────────
            gsap.fromTo(
                $1(".nine-cta-content"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".nine-cta"),
                        start: "top 75%",
                    },
                },
            );
            gsap.fromTo(
                $(".nine-cta-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".nine-cta .grid"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $1(".nine-cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal,
                    ease: E.soft,
                    delay: 0.4,
                    scrollTrigger: {
                        trigger: $1(".nine-cta"),
                        start: "top 75%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
