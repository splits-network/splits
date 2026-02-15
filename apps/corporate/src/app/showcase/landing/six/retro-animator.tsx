"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Retro-themed animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15, dramatic: 0.25 };

interface RetroAnimatorProps {
    children: ReactNode;
}

export function RetroAnimator({ children }: RetroAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                // Make everything visible
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            document.documentElement.style.scrollBehavior = "smooth";

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════

            // Memphis shapes float in with bounce
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
                    delay: 0.3,
                },
            );

            // Floating animation for Memphis shapes (continuous)
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${10 + (i % 3) * 5}`,
                    x: `+=${5 + (i % 2) * 8}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (5 + i * 2)}`,
                    duration: 3 + i * 0.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            heroTl.fromTo(
                $1(".hero-overline"),
                { opacity: 0, y: -30, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: D.normal, ease: E.bounce },
            );
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, y: 80, skewY: 3 },
                { opacity: 1, y: 0, skewY: 0, duration: D.hero, ease: E.smooth },
                "-=0.3",
            );
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.5",
            );
            heroTl.fromTo(
                $(".hero-cta-btn"),
                { opacity: 0, y: 30, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    stagger: S.normal,
                    ease: E.bounce,
                },
                "-=0.3",
            );

            // ════════════════════════════════════════
            // PROBLEM
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".problem-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-problem"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".pain-card"),
                { opacity: 0, y: 60, scale: 0.85, rotation: -3 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".pain-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // PLATFORMS
            // ════════════════════════════════════════
            $(".platform-block").forEach((block) => {
                const content = block.querySelector(".platform-content");
                const visual = block.querySelector(".platform-visual");
                const features = block.querySelectorAll(".platform-feature");

                if (content) {
                    gsap.fromTo(
                        content,
                        { opacity: 0, x: -60 },
                        {
                            opacity: 1, x: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: block, start: "top 70%" },
                        },
                    );
                }

                if (visual) {
                    gsap.fromTo(
                        visual,
                        { opacity: 0, x: 60, scale: 0.95 },
                        {
                            opacity: 1, x: 0, scale: 1,
                            duration: D.slow, ease: E.smooth,
                            delay: 0.2,
                            scrollTrigger: { trigger: block, start: "top 70%" },
                        },
                    );
                }

                if (features.length) {
                    gsap.fromTo(
                        features,
                        { opacity: 0, y: 15, scale: 0.9 },
                        {
                            opacity: 1, y: 0, scale: 1,
                            duration: D.fast,
                            ease: E.pop,
                            stagger: S.tight,
                            delay: 0.4,
                            scrollTrigger: { trigger: block, start: "top 70%" },
                        },
                    );
                }
            });

            // ════════════════════════════════════════
            // HOW IT WORKS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".how-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-how"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".how-step-card"),
                { opacity: 0, y: 60, rotation: -5 },
                {
                    opacity: 1, y: 0, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.dramatic,
                    scrollTrigger: { trigger: $1(".how-steps"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // METRICS
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".metric-block"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".retro-metrics"), start: "top 85%" },
                },
            );

            // Counter animations
            const valueEls = $(".retro-metric-value");
            valueEls.forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.smooth,
                        delay: 0.3 + i * S.normal,
                        scrollTrigger: { trigger: $1(".retro-metrics"), start: "top 85%" },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            el.textContent = (target >= 1000 ? current.toLocaleString() : String(current)) + suffix;
                        },
                    },
                );
            });

            // ════════════════════════════════════════
            // TESTIMONIALS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".testimonials-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-testimonials"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".testimonial-card"),
                { opacity: 0, y: 50, scale: 0.9, rotation: 2 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".testimonial-grid"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // FAQ
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".faq-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-faq"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".faq-item"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1, x: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".faq-list"), start: "top 80%" },
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
                    scrollTrigger: { trigger: $1(".retro-cta"), start: "top 80%" },
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
                    scrollTrigger: { trigger: $1(".retro-cta"), start: "top 80%" },
                },
            );

            gsap.fromTo(
                $1(".cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.normal, ease: E.smooth,
                    delay: 0.6,
                    scrollTrigger: { trigger: $1(".retro-cta"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
