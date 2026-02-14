"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15, dramatic: 0.25 };

interface DashboardAnimatorProps {
    children: ReactNode;
}

export function DashboardAnimator({ children }: DashboardAnimatorProps) {
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
            // SIDEBAR
            // ════════════════════════════════════════
            const sidebar = document.querySelector(".sidebar-nav");
            if (sidebar && window.innerWidth >= 1024) {
                gsap.fromTo(
                    sidebar,
                    { x: -260, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: D.slow,
                        ease: E.smooth,
                        delay: 0.1,
                    },
                );

                const navItems = sidebar.querySelectorAll(".nav-item");
                gsap.fromTo(
                    navItems,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.fast,
                        ease: E.bounce,
                        stagger: S.tight,
                        delay: 0.5,
                    },
                );
            }

            // ════════════════════════════════════════
            // MEMPHIS SHAPES
            // ════════════════════════════════════════
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
                    delay: 0.2,
                },
            );

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

            // ════════════════════════════════════════
            // HEADER
            // ════════════════════════════════════════
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });

            headerTl.fromTo(
                $1(".dash-overline"),
                { opacity: 0, y: -20, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: D.normal, ease: E.bounce },
            );
            headerTl.fromTo(
                $1(".dash-headline"),
                { opacity: 0, y: 60, skewY: 2 },
                { opacity: 1, y: 0, skewY: 0, duration: D.hero, ease: E.smooth },
                "-=0.3",
            );
            headerTl.fromTo(
                $1(".dash-subtext"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.5",
            );

            // ════════════════════════════════════════
            // KPI CARDS
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".kpi-card"),
                { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    delay: 0.6,
                },
            );

            // Animate KPI values
            $(".kpi-value").forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const prefix = el.getAttribute("data-prefix") || "";
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.smooth,
                        delay: 0.8 + i * S.normal,
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            el.textContent = prefix + (target >= 1000 ? current.toLocaleString() : String(current)) + suffix;
                        },
                    },
                );
            });

            // ════════════════════════════════════════
            // CHARTS SECTION
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".charts-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-charts"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".chart-card"),
                { opacity: 0, y: 60, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".charts-grid"), start: "top 80%" },
                },
            );

            // Animate bar chart bars
            gsap.fromTo(
                $(".chart-bar"),
                { scaleY: 0 },
                {
                    scaleY: 1,
                    duration: D.slow,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".bar-chart-container"), start: "top 85%" },
                },
            );

            // Animate line chart path
            const linePath = $1(".line-chart-path") as SVGPathElement | null;
            if (linePath) {
                const length = linePath.getTotalLength();
                gsap.fromTo(
                    linePath,
                    { strokeDasharray: length, strokeDashoffset: length },
                    {
                        strokeDashoffset: 0,
                        duration: 1.5,
                        ease: E.smooth,
                        scrollTrigger: { trigger: $1(".line-chart-container"), start: "top 85%" },
                    },
                );
            }

            // Animate donut segments
            $(".donut-segment").forEach((seg, i) => {
                const finalDash = seg.getAttribute("data-dash") || "";
                gsap.fromTo(
                    seg,
                    { strokeDasharray: "0 100" },
                    {
                        strokeDasharray: finalDash,
                        duration: D.slow,
                        ease: E.smooth,
                        delay: i * S.normal,
                        scrollTrigger: { trigger: $1(".donut-chart-container"), start: "top 85%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // ACTIVITY FEED
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".activity-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-activity"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".activity-item"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0,
                    duration: D.fast,
                    ease: E.smooth,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".activity-list"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // QUICK ACTIONS
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".actions-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".retro-actions"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".action-card"),
                { opacity: 0, y: 40, scale: 0.85 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".actions-grid"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
