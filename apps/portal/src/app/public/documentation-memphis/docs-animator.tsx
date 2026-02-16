"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface DocsAnimatorProps {
    children: ReactNode;
}

export function DocsAnimator({ children }: DocsAnimatorProps) {
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
            // HERO — Memphis shapes elastic bounce-in
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

            // Continuous floating for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${8 + (i % 3) * 4}`,
                    x: `+=${4 + (i % 2) * 6}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}`,
                    duration: 3 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Hero content timeline
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 60, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            // ════════════════════════════════════════
            // GETTING STARTED SECTION
            // ════════════════════════════════════════

            const gettingStarted = $1(".getting-started-section");
            if (gettingStarted) {
                const headings = gettingStarted.querySelectorAll(".section-heading");
                if (headings.length > 0) {
                    gsap.fromTo(
                        headings[0],
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: gettingStarted, start: "top 85%" },
                        },
                    );
                }

                gsap.fromTo(
                    gettingStarted.querySelectorAll(".doc-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: gettingStarted, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FEATURE GUIDES SECTION
            // ════════════════════════════════════════

            const featureGuides = $1(".feature-guides-section");
            if (featureGuides) {
                const headings = featureGuides.querySelectorAll(".section-heading");
                if (headings.length > 0) {
                    gsap.fromTo(
                        headings[0],
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: featureGuides, start: "top 85%" },
                        },
                    );
                }

                gsap.fromTo(
                    featureGuides.querySelectorAll(".doc-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.tight,
                        scrollTrigger: { trigger: featureGuides, start: "top 75%" },
                    },
                );

                const integrationsCard = featureGuides.querySelector(".integrations-card");
                if (integrationsCard) {
                    gsap.fromTo(
                        integrationsCard,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: integrationsCard, start: "top 90%" },
                        },
                    );
                }
            }

            // ════════════════════════════════════════
            // CORE WORKFLOWS SECTION
            // ════════════════════════════════════════

            const workflows = $1(".workflows-section");
            if (workflows) {
                const headings = workflows.querySelectorAll(".section-heading");
                if (headings.length > 0) {
                    gsap.fromTo(
                        headings[0],
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: workflows, start: "top 85%" },
                        },
                    );
                }

                gsap.fromTo(
                    workflows.querySelectorAll(".doc-card"),
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: workflows, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // ROLES & PERMISSIONS SECTION
            // ════════════════════════════════════════

            const permissions = $1(".permissions-section");
            if (permissions) {
                const headings = permissions.querySelectorAll(".section-heading");
                if (headings.length > 0) {
                    gsap.fromTo(
                        headings[0],
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: permissions, start: "top 85%" },
                        },
                    );
                }

                gsap.fromTo(
                    permissions.querySelectorAll(".doc-card"),
                    { opacity: 0, y: 40, scale: 0.85 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: permissions, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA SECTION
            // ════════════════════════════════════════

            const ctaSection = $1(".docs-cta");
            if (ctaSection) {
                gsap.fromTo(
                    $1(".cta-content"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
