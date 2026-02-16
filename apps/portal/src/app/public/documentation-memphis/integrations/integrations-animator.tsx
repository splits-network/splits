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

interface IntegrationsAnimatorProps {
    children: ReactNode;
}

export function IntegrationsAnimator({ children }: IntegrationsAnimatorProps) {
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

            // Hero content timeline
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBreadcrumb = $1(".hero-breadcrumb");
            if (heroBreadcrumb) {
                heroTl.fromTo(
                    heroBreadcrumb,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: D.fast },
                );
            }

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                    "-=0.2",
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 50, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            // ════════════════════════════════════════
            // COMING SOON CARD
            // ════════════════════════════════════════
            const comingSoonCard = $1(".coming-soon-card");
            if (comingSoonCard) {
                gsap.fromTo(
                    comingSoonCard,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.slow,
                        ease: E.bounce,
                        scrollTrigger: {
                            trigger: $1(".integrations-content"),
                            start: "top 85%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // PLANNED INTEGRATION ITEMS
            // ════════════════════════════════════════
            const plannedSection = $1(".planned-section");
            if (plannedSection) {
                const plannedHeading = $1(".planned-heading");
                if (plannedHeading) {
                    gsap.fromTo(
                        plannedHeading,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: D.normal,
                            ease: E.smooth,
                            scrollTrigger: {
                                trigger: plannedSection,
                                start: "top 80%",
                            },
                        },
                    );
                }

                gsap.fromTo(
                    $(".planned-card"),
                    { opacity: 0, y: 30, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: plannedSection,
                            start: "top 75%",
                        },
                    },
                );
            }

            // ════════════════════════════════════════
            // BACK LINK
            // ════════════════════════════════════════
            const backLink = $1(".back-link");
            if (backLink) {
                gsap.fromTo(
                    backLink,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: backLink,
                            start: "top 90%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
