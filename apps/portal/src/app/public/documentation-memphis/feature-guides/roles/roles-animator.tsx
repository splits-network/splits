"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter animation constants — professional, subtle
const D = { fast: 0.35, normal: 0.5, slow: 0.7, hero: 0.9 };
const E = {
    smooth: "power2.out",
    gentle: "power3.out",
    soft: "power1.out",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.14 };

interface RolesAnimatorProps {
    children: ReactNode;
}

export function RolesAnimator({ children }: RolesAnimatorProps) {
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
                { opacity: 0, scale: 0.6 },
                {
                    opacity: 0.3,
                    scale: 1,
                    duration: D.slow,
                    ease: E.gentle,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.15,
                },
            );

            // Gentle floating for Memphis shapes
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

            // ════════════════════════════════════════
            // HERO — Content timeline
            // ════════════════════════════════════════
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
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.gentle },
                    "-=0.15",
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
                    "-=0.35",
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
            // OVERVIEW
            // ════════════════════════════════════════
            const overviewSection = $1(".overview-section");
            if (overviewSection) {
                const overviewHeading = $1(".overview-heading");
                if (overviewHeading) {
                    gsap.fromTo(
                        overviewHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: overviewSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".overview-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: overviewSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CREATING ROLES
            // ════════════════════════════════════════
            const createSection = $1(".create-section");
            if (createSection) {
                const createHeading = $1(".create-heading");
                if (createHeading) {
                    gsap.fromTo(
                        createHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: createSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".create-step"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: createSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // STATUS PIPELINE
            // ════════════════════════════════════════
            const statusSection = $1(".status-section");
            if (statusSection) {
                const statusHeading = $1(".status-heading");
                if (statusHeading) {
                    gsap.fromTo(
                        statusHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: statusSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".status-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: statusSection, start: "top 75%" },
                    },
                );

                const statusFlow = $1(".status-flow");
                if (statusFlow) {
                    gsap.fromTo(
                        statusFlow,
                        { opacity: 0, y: 15 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: statusSection, start: "top 60%" },
                        },
                    );
                }
            }

            // ════════════════════════════════════════
            // PIPELINE STAGES
            // ════════════════════════════════════════
            const pipelineSection = $1(".pipeline-section");
            if (pipelineSection) {
                const pipelineHeading = $1(".pipeline-heading");
                if (pipelineHeading) {
                    gsap.fromTo(
                        pipelineHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: pipelineSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".pipeline-card"),
                    { opacity: 0, y: 25, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: pipelineSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // VISIBILITY & PERMISSIONS
            // ════════════════════════════════════════
            const visibilitySection = $1(".visibility-section");
            if (visibilitySection) {
                const visibilityHeading = $1(".visibility-heading");
                if (visibilityHeading) {
                    gsap.fromTo(
                        visibilityHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: visibilitySection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".visibility-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: visibilitySection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SEARCH & FILTERING
            // ════════════════════════════════════════
            const searchSection = $1(".search-section");
            if (searchSection) {
                const searchHeading = $1(".search-heading");
                if (searchHeading) {
                    gsap.fromTo(
                        searchHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: searchSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".filter-card"),
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1, x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: { trigger: searchSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // BULK OPERATIONS
            // ════════════════════════════════════════
            const bulkSection = $1(".bulk-section");
            if (bulkSection) {
                const bulkHeading = $1(".bulk-heading");
                if (bulkHeading) {
                    gsap.fromTo(
                        bulkHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: bulkSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".bulk-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: bulkSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // BEST PRACTICES
            // ════════════════════════════════════════
            const practicesSection = $1(".practices-section");
            if (practicesSection) {
                const practicesHeading = $1(".practices-heading");
                if (practicesHeading) {
                    gsap.fromTo(
                        practicesHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: practicesSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".practice-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: practicesSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TROUBLESHOOTING
            // ════════════════════════════════════════
            const troubleSection = $1(".trouble-section");
            if (troubleSection) {
                const troubleHeading = $1(".trouble-heading");
                if (troubleHeading) {
                    gsap.fromTo(
                        troubleHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: troubleSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".trouble-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: troubleSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // RELATED PAGES
            // ════════════════════════════════════════
            const relatedSection = $1(".related-section");
            if (relatedSection) {
                const relatedHeading = $1(".related-heading");
                if (relatedHeading) {
                    gsap.fromTo(
                        relatedHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: relatedSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".related-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: relatedSection, start: "top 75%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
