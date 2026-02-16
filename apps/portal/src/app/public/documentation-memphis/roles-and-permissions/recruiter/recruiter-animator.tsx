"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter animation constants for documentation pages
const D = { fast: 0.3, normal: 0.5, slow: 0.7, hero: 0.9 };
const E = {
    smooth: "power2.out",
    gentle: "power3.out",
    soft: "power1.out",
};
const S = { tight: 0.05, normal: 0.08, loose: 0.12 };

interface RecruiterAnimatorProps {
    children: ReactNode;
}

export function RecruiterAnimator({ children }: RecruiterAnimatorProps) {
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
                { opacity: 0, scale: 0.6 },
                {
                    opacity: 0.2,
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
            // SOURCING STEPS
            // ════════════════════════════════════════
            const sourcingSection = $1(".sourcing-section");
            if (sourcingSection) {
                const sourcingHeading = $1(".sourcing-heading");
                if (sourcingHeading) {
                    gsap.fromTo(
                        sourcingHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: sourcingSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".sourcing-card"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: sourcingSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SUBMISSION WORKFLOW
            // ════════════════════════════════════════
            const submissionSection = $1(".submission-section");
            if (submissionSection) {
                const submissionHeading = $1(".submission-heading");
                if (submissionHeading) {
                    gsap.fromTo(
                        submissionHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: submissionSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".submission-card"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: submissionSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TRACKING CAPABILITIES
            // ════════════════════════════════════════
            const trackingSection = $1(".tracking-section");
            if (trackingSection) {
                const trackingHeading = $1(".tracking-heading");
                if (trackingHeading) {
                    gsap.fromTo(
                        trackingHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: trackingSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".tracking-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: trackingSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // DOCUMENT MANAGEMENT
            // ════════════════════════════════════════
            const documentsSection = $1(".documents-section");
            if (documentsSection) {
                const documentsHeading = $1(".documents-heading");
                if (documentsHeading) {
                    gsap.fromTo(
                        documentsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: documentsSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".documents-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: documentsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SEARCH AND FILTERING
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
                    $(".search-card"),
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
            // EARNINGS TRACKING
            // ════════════════════════════════════════
            const earningsSection = $1(".earnings-section");
            if (earningsSection) {
                const earningsHeading = $1(".earnings-heading");
                if (earningsHeading) {
                    gsap.fromTo(
                        earningsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: earningsSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".earnings-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: earningsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // ACCESS SCOPE
            // ════════════════════════════════════════
            const accessSection = $1(".access-section");
            if (accessSection) {
                const accessHeading = $1(".access-heading");
                if (accessHeading) {
                    gsap.fromTo(
                        accessHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: accessSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".access-card"),
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1, x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: { trigger: accessSection, start: "top 75%" },
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
            // NEXT STEPS
            // ════════════════════════════════════════
            const nextSection = $1(".next-section");
            if (nextSection) {
                const nextHeading = $1(".next-heading");
                if (nextHeading) {
                    gsap.fromTo(
                        nextHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: nextSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".next-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: nextSection, start: "top 75%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
