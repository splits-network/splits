"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter animation constants — professional, subtle
const D = { fast: 0.3, normal: 0.5, slow: 0.7, hero: 0.9 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.4)",
    gentle: "power3.out",
};
const S = { tight: 0.05, normal: 0.08, loose: 0.12 };

interface CommunicateAnimatorProps {
    children: ReactNode;
}

export function CommunicateAnimator({ children }: CommunicateAnimatorProps) {
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
            // HERO — Memphis shapes fade-in (lighter)
            // ════════════════════════════════════════

            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0.6, rotation: -90 },
                {
                    opacity: 0.3,
                    scale: 1,
                    rotation: 0,
                    duration: D.slow,
                    ease: E.gentle,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.15,
                },
            );

            // Subtle floating for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${4 + (i % 3) * 2}`,
                    x: `+=${2 + (i % 2) * 3}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (2 + i)}`,
                    duration: 4 + i * 0.5,
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
                    { opacity: 0, x: -15 },
                    { opacity: 1, x: 0, duration: D.fast },
                );
            }

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -15 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                    "-=0.1",
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            const heroRoles = $1(".hero-roles");
            if (heroRoles) {
                heroTl.fromTo(
                    heroRoles,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: D.fast },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // CONTENT SECTIONS — gentle fade-up on scroll
            // ════════════════════════════════════════

            $(".content-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // OVERVIEW CARDS — stagger with slide-right
            // ════════════════════════════════════════

            const overviewContainer = $1(".overview-container");
            if (overviewContainer) {
                gsap.fromTo(
                    $(".overview-card"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: overviewContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // STEP CARDS — stagger fade-up
            // ════════════════════════════════════════

            const stepsContainer = $1(".steps-container");
            if (stepsContainer) {
                gsap.fromTo(
                    $(".step-card"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: stepsContainer, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FEATURE CARDS — stagger with scale
            // ════════════════════════════════════════

            const featuresContainer = $1(".features-container");
            if (featuresContainer) {
                gsap.fromTo(
                    $(".feature-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: featuresContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CHANNEL CARDS
            // ════════════════════════════════════════

            const channelsContainer = $1(".channels-container");
            if (channelsContainer) {
                gsap.fromTo(
                    $(".channel-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: channelsContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PRACTICE CARDS
            // ════════════════════════════════════════

            const practicesContainer = $1(".practices-container");
            if (practicesContainer) {
                gsap.fromTo(
                    $(".practice-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: practicesContainer, start: "top 85%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // COMPLIANCE CARDS
            // ════════════════════════════════════════

            const complianceContainer = $1(".compliance-container");
            if (complianceContainer) {
                gsap.fromTo(
                    $(".compliance-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: complianceContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TROUBLE CARDS
            // ════════════════════════════════════════

            const troubleContainer = $1(".trouble-container");
            if (troubleContainer) {
                gsap.fromTo(
                    $(".trouble-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: troubleContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════

            const ctaSection = $1(".communicate-cta");
            if (ctaSection) {
                const ctaContent = $1(".cta-content");
                if (ctaContent) {
                    gsap.fromTo(
                        ctaContent,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0,
                            duration: D.slow, ease: E.smooth,
                            scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                        },
                    );
                }
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
