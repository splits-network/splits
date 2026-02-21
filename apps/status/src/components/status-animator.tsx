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

export function StatusAnimator({ children }: { children: ReactNode }) {
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

            // Hero
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

            // Metrics
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

            // Editorial section — shared heading
            const editorialHeading = $1(".bs-editorial-heading");
            if (editorialHeading) {
                gsap.fromTo(
                    editorialHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-editorial"),
                            start: "top 80%",
                        },
                    },
                );
            }

            // Service grid (left column)
            const servicesHeading = $1(".bs-services-heading");
            if (servicesHeading) {
                gsap.fromTo(
                    servicesHeading,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-services"),
                            start: "top 85%",
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

            // Incidents (right column)
            const incidentsHeading = $1(".bs-incidents-heading");
            if (incidentsHeading) {
                gsap.fromTo(
                    incidentsHeading,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-incidents"),
                            start: "top 85%",
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
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        stagger: 0.1,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-incidents"),
                            start: "top 85%",
                        },
                    },
                );
            }

            // Sidebar info cards (right column, below incidents)
            const sidebarCards = $$(".bs-sidebar-card");
            if (sidebarCards.length > 0) {
                gsap.fromTo(
                    sidebarCards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        stagger: 0.1,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: sidebarCards[0],
                            start: "top 90%",
                        },
                    },
                );
            }

            // Contact section
            const contactHeading = $1(".bs-contact-heading");
            if (contactHeading) {
                gsap.fromTo(
                    contactHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".bs-contact"),
                            start: "top 80%",
                        },
                    },
                );
            }

            const contactForm = $1(".bs-contact-form");
            if (contactForm) {
                gsap.fromTo(
                    contactForm,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: contactForm,
                            start: "top 85%",
                        },
                    },
                );
            }

            // CTA
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

            // Past incidents toggle
            const pastIncidentsToggle = $1(".bs-past-incidents-toggle");
            if (pastIncidentsToggle) {
                gsap.fromTo(
                    pastIncidentsToggle,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.soft,
                        scrollTrigger: {
                            trigger: $1(".bs-past-incidents"),
                            start: "top 85%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
