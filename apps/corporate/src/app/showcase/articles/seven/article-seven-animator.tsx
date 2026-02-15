"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Blueprint mechanical animation constants (matching landing page seven)
const D = { snap: 0.25, mech: 0.5, reveal: 0.8, boot: 1.2, counter: 1.8 };
const E = {
    mechanical: "power3.out",
    step: "steps(8)",
    precise: "power2.inOut",
};
const S = { tight: 0.06, normal: 0.1, cascade: 0.15 };

interface ArticleSevenAnimatorProps {
    children: ReactNode;
}

export function ArticleSevenAnimator({ children }: ArticleSevenAnimatorProps) {
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

            // ════════════════════════════════════════
            // HERO - Boot Sequence
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.mechanical } });

            heroTl.fromTo(
                $1(".bp-hero-ref"),
                { opacity: 0 },
                { opacity: 1, duration: D.snap },
            );

            heroTl.fromTo(
                $1(".bp-hero-meta"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.snap },
                "-=0.1",
            );

            heroTl.fromTo(
                $1(".bp-hero-headline"),
                { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: D.boot },
                "-=0.1",
            );

            heroTl.fromTo(
                $1(".bp-hero-sub"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.mech },
                "-=0.5",
            );

            heroTl.fromTo(
                $1(".bp-hero-byline"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.mech },
                "-=0.3",
            );

            heroTl.fromTo(
                $1(".bp-hero-divider"),
                { opacity: 0, scaleX: 0 },
                {
                    opacity: 1,
                    scaleX: 1,
                    duration: D.reveal,
                    transformOrigin: "left center",
                },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // METRICS - Counter Boot
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-stats-label"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.snap,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-stats-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-stat-cell"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".bp-stats-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ARTICLE BODY SECTIONS - Mechanical Reveal
            // ════════════════════════════════════════
            const bodySections = [
                ".bp-intro-section",
                ".bp-why-section",
                ".bp-future-section",
            ];
            bodySections.forEach((sel) => {
                const section = $1(sel);
                if (!section) return;
                const inner = section.querySelector(
                    ".bp-intro-content, .bp-why-content, .bp-future-content",
                );
                if (inner) {
                    gsap.fromTo(
                        inner,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.reveal,
                            ease: E.mechanical,
                            scrollTrigger: {
                                trigger: section,
                                start: "top 75%",
                            },
                        },
                    );
                }
            });

            // ════════════════════════════════════════
            // PULL QUOTES - Clip Reveal
            // ════════════════════════════════════════
            $(".bp-pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                    {
                        opacity: 1,
                        clipPath: "inset(0 0% 0 0)",
                        duration: D.reveal,
                        ease: E.mechanical,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // COMPARISON - Grid Deploy
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-comparison-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-comparison-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-comparison-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".bp-comparison-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // IMAGE BREAKS - Fade Scan
            // ════════════════════════════════════════
            const imageCaptions = [".bp-image-caption", ".bp-image-caption-2"];
            imageCaptions.forEach((sel) => {
                const el = $1(sel);
                if (el) {
                    gsap.fromTo(
                        el,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.reveal,
                            ease: E.mechanical,
                            scrollTrigger: { trigger: el, start: "top 85%" },
                        },
                    );
                }
            });

            // ════════════════════════════════════════
            // TIMELINE - Sequential Scan
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-timeline-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-timeline-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-timeline-item"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: $1(".bp-timeline-items"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // BENEFITS - Module Deploy
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-benefits-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-benefits-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-benefit-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".bp-benefits-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CTA - Final Deploy
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-cta-content"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-cta-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-cta-card"),
                { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
                {
                    opacity: 1,
                    y: 0,
                    clipPath: "inset(0% 0 0 0)",
                    duration: D.reveal,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".bp-cta-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $1(".bp-cta-footer"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.mech,
                    ease: E.mechanical,
                    delay: 0.5,
                    scrollTrigger: {
                        trigger: $1(".bp-cta-section"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // Pulsing dot (continuous)
            // ════════════════════════════════════════
            gsap.to($1(".bp-pulse-dot"), {
                opacity: 0.3,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(
                            rgba(59, 92, 204, 0.3) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(59, 92, 204, 0.3) 1px,
                            transparent 1px
                        );
                    background-size: 60px 60px;
                }
            `}</style>
            <div ref={containerRef}>{children}</div>
        </>
    );
}
