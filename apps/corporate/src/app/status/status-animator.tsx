"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.5, normal: 0.7, slow: 1.0 };
const E = { smooth: "power3.out", soft: "power2.out" };

export function StatusBaselAnimator({ children }: { children: ReactNode }) {
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

            const c = containerRef.current;
            const $1 = (sel: string) => c.querySelector(sel);
            const $$ = (sel: string) => Array.from(c.querySelectorAll(sel));

            // ─── HERO ────────────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".bs-hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast },
                );
            }

            const heroHeadline = $1(".bs-hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: D.slow },
                    "-=0.3",
                );
            }

            const heroBody = $1(".bs-hero-body");
            if (heroBody) {
                heroTl.fromTo(
                    heroBody,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.5",
                );
            }

            const heroTimestamp = $1(".bs-hero-timestamp");
            if (heroTimestamp) {
                heroTl.fromTo(
                    heroTimestamp,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: D.normal },
                    "-=0.3",
                );
            }

            // ─── METRICS ─────────────────────────────────────────────
            const metricItems = $$(".bs-metric-item");
            if (metricItems.length > 0) {
                gsap.fromTo(
                    metricItems,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        stagger: 0.1,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: $1(".bs-metrics"),
                            start: "top 85%",
                        },
                    },
                );
            }

            // ─── SERVICE GRID ────────────────────────────────────────
            const servicesHeading = $1(".bs-services-heading");
            if (servicesHeading) {
                gsap.fromTo(
                    servicesHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-services"),
                            start: "top 80%",
                        },
                    },
                );
            }

            const serviceCards = $$(".bs-service-card");
            if (serviceCards.length > 0) {
                gsap.fromTo(
                    serviceCards,
                    { opacity: 0, y: 30, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        stagger: 0.06,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-services-grid"),
                            start: "top 85%",
                        },
                    },
                );
            }

            // ─── INCIDENTS ───────────────────────────────────────────
            const incidentsHeading = $1(".bs-incidents-heading");
            if (incidentsHeading) {
                gsap.fromTo(
                    incidentsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-incidents"),
                            start: "top 80%",
                        },
                    },
                );
            }

            const noIncidents = $1(".bs-no-incidents");
            if (noIncidents) {
                gsap.fromTo(
                    noIncidents,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: noIncidents,
                            start: "top 85%",
                        },
                    },
                );
            }

            const incidentCards = $$(".bs-incident-card");
            if (incidentCards.length > 0) {
                gsap.fromTo(
                    incidentCards,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        stagger: 0.1,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-incidents"),
                            start: "top 80%",
                        },
                    },
                );
            }

            // ─── CTA ─────────────────────────────────────────────────
            const ctaContent = $1(".bs-cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-cta"),
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
