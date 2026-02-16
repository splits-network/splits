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

interface CreateRoleAnimatorProps {
    children: ReactNode;
}

export function CreateRoleAnimator({ children }: CreateRoleAnimatorProps) {
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
            // PREREQUISITES
            // ════════════════════════════════════════
            const prereqSection = $1(".prereq-section");
            if (prereqSection) {
                const prereqHeading = $1(".prereq-heading");
                if (prereqHeading) {
                    gsap.fromTo(
                        prereqHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: prereqSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".prereq-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: prereqSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // STEPS
            // ════════════════════════════════════════
            const stepsSection = $1(".steps-section");
            if (stepsSection) {
                const stepsHeading = $1(".steps-heading");
                if (stepsHeading) {
                    gsap.fromTo(
                        stepsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: stepsSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".step-card"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: stepsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FIELDS REFERENCE
            // ════════════════════════════════════════
            const fieldsSection = $1(".fields-section");
            if (fieldsSection) {
                const fieldsHeading = $1(".fields-heading");
                if (fieldsHeading) {
                    gsap.fromTo(
                        fieldsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: fieldsSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".field-row"),
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1, x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: { trigger: fieldsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // STATUS MANAGEMENT
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
            // COMMON MISTAKES
            // ════════════════════════════════════════
            const mistakesSection = $1(".mistakes-section");
            if (mistakesSection) {
                const mistakesHeading = $1(".mistakes-heading");
                if (mistakesHeading) {
                    gsap.fromTo(
                        mistakesHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: mistakesSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".mistake-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: mistakesSection, start: "top 75%" },
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
            // REFERENCE
            // ════════════════════════════════════════
            const referenceSection = $1(".reference-section");
            if (referenceSection) {
                const referenceHeading = $1(".reference-heading");
                if (referenceHeading) {
                    gsap.fromTo(
                        referenceHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: referenceSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".ref-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: referenceSection, start: "top 75%" },
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
