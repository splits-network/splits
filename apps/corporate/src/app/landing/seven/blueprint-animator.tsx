"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Animation constants - mechanical / precise feel
const D = { snap: 0.25, mech: 0.5, reveal: 0.8, boot: 1.2, counter: 1.8 };
const E = {
    mechanical: "power3.out",
    step: "steps(8)",
    precise: "power2.inOut",
};
const S = { tight: 0.06, normal: 0.1, cascade: 0.15 };

interface BlueprintAnimatorProps {
    children: ReactNode;
}

export function BlueprintAnimator({ children }: BlueprintAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                // Show everything immediately if reduced motion preferred
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), {
                    opacity: 1,
                });
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

            // Status bar types in
            heroTl.fromTo(
                $1(".bp-status-bar"),
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: D.snap },
            );

            // Label appears with typewriter feel
            heroTl.fromTo(
                $1(".bp-hero-label"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.snap },
                "-=0.1",
            );

            // Headline clips in from left
            heroTl.fromTo(
                $1(".bp-hero-headline"),
                { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: D.boot },
                "-=0.2",
            );

            // Subtext fades up
            heroTl.fromTo(
                $1(".bp-hero-sub"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.mech },
                "-=0.5",
            );

            // CTA buttons slide in
            heroTl.fromTo(
                $1(".bp-hero-cta"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.mech },
                "-=0.3",
            );

            // Divider line draws
            heroTl.fromTo(
                $1(".bp-divider-line"),
                { opacity: 0, scaleX: 0 },
                { opacity: 1, scaleX: 1, duration: D.reveal, transformOrigin: "left center" },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // METRICS - Counter Boot
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-metrics-label"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.snap,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-metrics-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-metric-cell"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".bp-metrics-grid"),
                        start: "top 80%",
                    },
                },
            );

            // Counter animations
            const metricValues = $(".bp-metric-value");
            metricValues.forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.precise,
                        delay: 0.2 + i * S.cascade,
                        scrollTrigger: {
                            trigger: $1(".bp-metrics-grid"),
                            start: "top 80%",
                        },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            if (target >= 1000) {
                                el.textContent = current.toLocaleString() + suffix;
                            } else {
                                el.textContent = current + suffix;
                            }
                        },
                    },
                );
            });

            // ════════════════════════════════════════
            // MODULES - Mechanical Grid Reveal
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-modules-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-modules-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-module-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".bp-modules-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // PROCESS - Sequential Reveal
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-process-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-process-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-process-step"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: $1(".bp-process-steps"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // INTERFACES - Card Deploy
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-interfaces-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-interfaces-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-interface-card"),
                { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
                {
                    opacity: 1,
                    y: 0,
                    clipPath: "inset(0% 0 0 0)",
                    duration: D.reveal,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".bp-interfaces-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // DIAGNOSTICS - Row Scan
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".bp-diagnostics-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".bp-diagnostics-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".bp-diag-row"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.snap,
                    ease: E.mechanical,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".bp-diagnostics-table"),
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
                $1(".bp-cta-buttons"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.mech,
                    ease: E.mechanical,
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
            // Pulsing dot animation (continuous)
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
                        linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>
            <div ref={containerRef}>{children}</div>
        </>
    );
}
