"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Professional documentation animation constants
const D = { fast: 0.4, normal: 0.6, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    gentle: "power3.out",
    soft: "power1.out",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface RoleBasedAccessAnimatorProps {
    children: ReactNode;
}

export function RoleBasedAccessAnimator({ children }: RoleBasedAccessAnimatorProps) {
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
            // HERO — Memphis shapes: gentle fade + scale
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0.7 },
                {
                    opacity: 0.25,
                    scale: 1,
                    duration: D.slow,
                    ease: E.gentle,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.2,
                },
            );

            // Subtle floating for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${3 + (i % 3) * 2}`,
                    x: `+=${2 + (i % 2) * 2}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (1 + i)}`,
                    duration: 5 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // ════════════════════════════════════════
            // HERO — Content timeline
            // ════════════════════════════════════════
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
                    { opacity: 0, y: -15 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.gentle },
                    "-=0.2",
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: D.hero },
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

            const heroRoles = $1(".hero-roles");
            if (heroRoles) {
                heroTl.fromTo(
                    heroRoles,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.fast },
                    "-=0.25",
                );
            }

            // ════════════════════════════════════════
            // CONTENT SECTIONS — gentle fade-up on scroll
            // ════════════════════════════════════════
            $(".content-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // OVERVIEW CARDS — stagger with subtle scale
            // ════════════════════════════════════════
            const overviewContainer = $1(".overview-container");
            if (overviewContainer) {
                gsap.fromTo(
                    $(".overview-card"),
                    { opacity: 0, y: 35, scale: 0.96 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: overviewContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // ROLE CAPABILITY CARDS — slide from left
            // ════════════════════════════════════════
            const roleContainer = $1(".role-container");
            if (roleContainer) {
                gsap.fromTo(
                    $(".role-card"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: roleContainer, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PERMISSION MATRIX TABLE
            // ════════════════════════════════════════
            const matrixContainer = $1(".matrix-container");
            if (matrixContainer) {
                gsap.fromTo(
                    matrixContainer,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: D.slow,
                        ease: E.gentle,
                        scrollTrigger: { trigger: matrixContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // DATA SCOPING CARDS
            // ════════════════════════════════════════
            const scopeContainer = $1(".scope-container");
            if (scopeContainer) {
                gsap.fromTo(
                    $(".scope-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: scopeContainer, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SECURITY BOUNDARY CARDS
            // ════════════════════════════════════════
            const boundaryContainer = $1(".boundary-container");
            if (boundaryContainer) {
                gsap.fromTo(
                    $(".boundary-card"),
                    { opacity: 0, y: 30, scale: 0.96 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: boundaryContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SCENARIO CARDS
            // ════════════════════════════════════════
            const scenarioContainer = $1(".scenario-container");
            if (scenarioContainer) {
                gsap.fromTo(
                    $(".scenario-card"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: scenarioContainer, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // ROLE CHANGE IMPACT CARDS
            // ════════════════════════════════════════
            const impactContainer = $1(".impact-container");
            if (impactContainer) {
                gsap.fromTo(
                    $(".impact-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: { trigger: impactContainer, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // BEST PRACTICE CARDS
            // ════════════════════════════════════════
            const practiceContainer = $1(".practice-container");
            if (practiceContainer) {
                gsap.fromTo(
                    $(".practice-card"),
                    { opacity: 0, y: 25, scale: 0.96 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: practiceContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TROUBLESHOOTING CARDS
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
            // CTA / NEXT STEPS
            // ════════════════════════════════════════
            const ctaSection = $1(".rbac-cta");
            if (ctaSection) {
                const ctaContent = $1(".cta-content");
                if (ctaContent) {
                    gsap.fromTo(
                        ctaContent,
                        { opacity: 0, y: 35 },
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
