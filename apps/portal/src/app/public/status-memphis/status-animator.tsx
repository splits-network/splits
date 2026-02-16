"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface StatusAnimatorProps {
    children: ReactNode;
}

export function StatusAnimator({ children }: StatusAnimatorProps) {
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
            // HERO — Memphis shapes
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 0.35,
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
                    y: `+=${6 + (i % 3) * 3}`,
                    x: `+=${3 + (i % 2) * 4}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}`,
                    duration: 3 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Hero content
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(heroBadge, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.bounce });
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(heroHeadline, { opacity: 0, y: 50, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: D.hero }, "-=0.3");
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(heroSubtext, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.4");
            }

            const heroTimestamp = $1(".hero-timestamp");
            if (heroTimestamp) {
                heroTl.fromTo(heroTimestamp, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: D.normal, ease: E.bounce }, "-=0.2");
            }

            // ════════════════════════════════════════
            // OVERALL STATUS CARD
            // ════════════════════════════════════════
            const overallCard = $1(".overall-card");
            if (overallCard) {
                gsap.fromTo(
                    overallCard,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: $1(".status-overall"), start: "top 85%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SERVICE GRID
            // ════════════════════════════════════════
            const servicesHeading = $1(".services-heading");
            if (servicesHeading) {
                gsap.fromTo(
                    servicesHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".status-services"), start: "top 80%" },
                    },
                );
            }

            gsap.fromTo(
                $(".service-card"),
                { opacity: 0, y: 30, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".services-grid"), start: "top 85%" },
                },
            );

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".stat-block"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".status-stats"), start: "top 90%" },
                },
            );

            // ════════════════════════════════════════
            // INCIDENTS
            // ════════════════════════════════════════
            const incidentsHeading = $1(".incidents-heading");
            if (incidentsHeading) {
                gsap.fromTo(
                    incidentsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".status-incidents"), start: "top 80%" },
                    },
                );
            }

            const noIncidents = $1(".no-incidents-card");
            if (noIncidents) {
                gsap.fromTo(
                    noIncidents,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: noIncidents, start: "top 85%" },
                    },
                );
            }

            gsap.fromTo(
                $(".incident-card"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1, x: 0,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.normal,
                    scrollTrigger: { trigger: $1(".status-incidents"), start: "top 80%" },
                },
            );

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaContent = $1(".cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".status-cta"), start: "top 85%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
