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

export function DashboardFiveAnimator({ children }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
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
            // HEADER - Dashboard bootup sequence
            // ════════════════════════════════════════
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });

            headerTl.fromTo(
                $1(".dash-status"),
                { opacity: 0 },
                { opacity: 1, duration: D.fast },
            );

            headerTl.fromTo(
                $1(".dash-headline"),
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: D.hero, ease: E.strong },
                "-=0.1",
            );

            headerTl.fromTo(
                $1(".dash-subtext"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.6",
            );

            // ════════════════════════════════════════
            // KPI CARDS - Come online one by one
            // ════════════════════════════════════════
            headerTl.fromTo(
                $(".kpi-card"),
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

            // Counter animations for KPI values
            const kpiValues = $(".kpi-value");
            kpiValues.forEach((el, i) => {
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
                        delay: 0.8 + i * S.normal,
                        onUpdate: function () {
                            const current = this.targets()[0].value;
                            if (isDecimal) {
                                el.textContent =
                                    prefix + current.toFixed(1) + suffix;
                            } else if (target >= 1000) {
                                el.textContent =
                                    prefix +
                                    Math.floor(current).toLocaleString() +
                                    suffix;
                            } else {
                                el.textContent =
                                    prefix + Math.floor(current) + suffix;
                            }
                        },
                    },
                );
            });

            // ════════════════════════════════════════
            // CHARTS SECTION
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".charts-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".charts-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".chart-card"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".charts-grid"),
                        start: "top 80%",
                    },
                },
            );

            // Animate chart bars growing up
            gsap.fromTo(
                $(".chart-bar"),
                { scaleY: 0 },
                {
                    scaleY: 1,
                    duration: D.slow,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".charts-grid"),
                        start: "top 80%",
                    },
                },
            );

            // Animate area chart path drawing
            const areaPath = $1(".area-chart-line") as SVGPathElement | null;
            if (areaPath) {
                const length = areaPath.getTotalLength();
                gsap.set(areaPath, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                });
                gsap.to(areaPath, {
                    strokeDashoffset: 0,
                    duration: D.counter,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".charts-grid"),
                        start: "top 80%",
                    },
                });
            }

            // Animate area fill
            gsap.fromTo(
                $1(".area-chart-fill"),
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: D.slow,
                    delay: 0.8,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".charts-grid"),
                        start: "top 80%",
                    },
                },
            );

            // Animate donut segments
            gsap.fromTo(
                $(".donut-segment"),
                { strokeDashoffset: 283 },
                {
                    strokeDashoffset: (i: number, el: Element) =>
                        el.getAttribute("data-target-offset") || "283",
                    duration: D.counter,
                    ease: E.smooth,
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: $1(".charts-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ACTIVITY FEED
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".activity-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".activity-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".activity-item"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".activity-list"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // QUICK ACTIONS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".actions-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".actions-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".action-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".actions-grid"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // PIPELINE TABLE
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".pipeline-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    scrollTrigger: {
                        trigger: $1(".pipeline-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".pipeline-row"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".pipeline-table"),
                        start: "top 85%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
