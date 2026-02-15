"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Animation constants - mechanical / precise feel (matches blueprint theme)
const D = { snap: 0.25, mech: 0.5, reveal: 0.8, counter: 1.8 };
const E = {
    mechanical: "power3.out",
    precise: "power2.inOut",
};
const S = { tight: 0.06, normal: 0.1, cascade: 0.15 };

interface DashboardAnimatorProps {
    children: ReactNode;
}

export function DashboardAnimator({ children }: DashboardAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
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
            // HEADER - Boot Sequence
            // ════════════════════════════════════════
            const headerTl = gsap.timeline({ defaults: { ease: E.mechanical } });

            headerTl.fromTo(
                $1(".db-status-bar"),
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: D.snap },
            );

            headerTl.fromTo(
                $1(".db-title"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.mech },
                "-=0.1",
            );

            headerTl.fromTo(
                $1(".db-header-divider"),
                { opacity: 0, scaleX: 0 },
                { opacity: 1, scaleX: 1, duration: D.reveal, transformOrigin: "left center" },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // KPI CARDS - Counter Boot
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".db-kpi-label"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.snap,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".db-kpi-section"),
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                $(".db-kpi-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".db-kpi-grid"),
                        start: "top 85%",
                    },
                },
            );

            // KPI counter animations
            const kpiValues = $(".db-kpi-value");
            kpiValues.forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const prefix = el.getAttribute("data-prefix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.precise,
                        delay: 0.2 + i * S.cascade,
                        scrollTrigger: {
                            trigger: $1(".db-kpi-grid"),
                            start: "top 85%",
                        },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            if (target >= 1000) {
                                el.textContent = prefix + current.toLocaleString();
                            } else {
                                el.textContent = prefix + current;
                            }
                        },
                    },
                );
            });

            // ════════════════════════════════════════
            // CHARTS - Staggered Reveal
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".db-charts-label"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.snap,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".db-charts-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-area-chart"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".db-area-chart"),
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-donut-chart"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    delay: 0.15,
                    scrollTrigger: {
                        trigger: $1(".db-donut-chart"),
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-bar-chart"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".db-bar-chart"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ACTIVITY FEED + QUICK ACTIONS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".db-activity-label"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.snap,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".db-activity-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-activity-feed"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.reveal,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".db-activity-feed"),
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-actions-label"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.snap,
                    ease: E.mechanical,
                    scrollTrigger: {
                        trigger: $1(".db-activity-section"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $(".db-action-card"),
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    stagger: S.cascade,
                    scrollTrigger: {
                        trigger: $1(".db-activity-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-diagnostics-mini"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.mech,
                    ease: E.mechanical,
                    delay: 0.4,
                    scrollTrigger: {
                        trigger: $1(".db-activity-section"),
                        start: "top 75%",
                    },
                },
            );

            // ════════════════════════════════════════
            // FOOTER
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".db-footer-line"),
                { opacity: 0, scaleX: 0 },
                {
                    opacity: 1,
                    scaleX: 1,
                    duration: D.reveal,
                    ease: E.mechanical,
                    transformOrigin: "left center",
                    scrollTrigger: {
                        trigger: $1(".db-footer"),
                        start: "top 90%",
                    },
                },
            );

            gsap.fromTo(
                $1(".db-footer-text"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.mech,
                    ease: E.mechanical,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: $1(".db-footer"),
                        start: "top 90%",
                    },
                },
            );

            // ════════════════════════════════════════
            // Pulsing dot animation (continuous)
            // ════════════════════════════════════════
            gsap.to($1(".db-pulse-dot"), {
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
