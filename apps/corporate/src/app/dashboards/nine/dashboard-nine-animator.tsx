"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Timing & easing - matched to landing nine
const D = { fast: 0.35, normal: 0.6, hero: 1.0, line: 0.8 };
const E = { crisp: "power3.out", draw: "power2.inOut", soft: "power2.out" };
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface DashboardNineAnimatorProps {
    children: ReactNode;
}

export function DashboardNineAnimator({ children }: DashboardNineAnimatorProps) {
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

            // ─── SIDEBAR ───────────────────────────────────────────────
            const sidebarTl = gsap.timeline({
                defaults: { ease: E.crisp },
                delay: 0.1,
            });

            sidebarTl.fromTo(
                $1(".dash-nine-sidebar-brand"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.normal },
            );
            sidebarTl.fromTo(
                $1(".dash-nine-sidebar-label"),
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: D.fast },
                "-=0.3",
            );
            sidebarTl.fromTo(
                $(".dash-nine-sidebar-item"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    stagger: S.tight,
                },
                "-=0.2",
            );
            sidebarTl.fromTo(
                $1(".dash-nine-sidebar-user"),
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.1",
            );

            // ─── HEADER ────────────────────────────────────────────────
            const headerTl = gsap.timeline({ defaults: { ease: E.crisp } });

            headerTl.fromTo(
                $1(".dash-nine-header-ref"),
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: D.normal },
            );
            headerTl.fromTo(
                $1(".dash-nine-header-title"),
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: D.hero },
                "-=0.3",
            );
            headerTl.fromTo(
                $1(".dash-nine-header-meta"),
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: D.normal },
                "-=0.5",
            );

            // ─── KPI CARDS ─────────────────────────────────────────────
            gsap.fromTo(
                $1(".dash-nine-kpi-label"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-kpi"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".dash-nine-kpi-card"),
                { opacity: 0, y: 30, scaleY: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scaleY: 1,
                    duration: D.normal,
                    ease: E.crisp,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-kpi .grid"),
                        start: "top 85%",
                    },
                },
            );

            // ─── CHARTS SECTION ────────────────────────────────────────
            gsap.fromTo(
                $1(".dash-nine-charts-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-charts"),
                        start: "top 75%",
                    },
                },
            );

            // Line chart
            gsap.fromTo(
                $1(".dash-nine-chart-line"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-chart-line"),
                        start: "top 85%",
                    },
                },
            );

            // Donut chart
            gsap.fromTo(
                $1(".dash-nine-chart-donut"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-chart-donut"),
                        start: "top 85%",
                    },
                },
            );

            // Bar chart
            gsap.fromTo(
                $1(".dash-nine-chart-bar"),
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.hero,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-chart-bar"),
                        start: "top 85%",
                    },
                },
            );

            // ─── ACTIVITY FEED ─────────────────────────────────────────
            gsap.fromTo(
                $1(".dash-nine-feed-heading"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-activity"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".dash-nine-feed-item"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.tight,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-activity"),
                        start: "top 70%",
                    },
                },
            );

            // ─── QUICK ACTIONS ─────────────────────────────────────────
            gsap.fromTo(
                $1(".dash-nine-actions-heading"),
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: D.normal,
                    ease: E.crisp,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-activity"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".dash-nine-action-card"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.fast,
                    ease: E.soft,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-actions-heading"),
                        start: "top 80%",
                    },
                },
            );

            // Summary card
            gsap.fromTo(
                $1(".dash-nine-summary"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.soft,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: $1(".dash-nine-summary"),
                        start: "top 90%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
