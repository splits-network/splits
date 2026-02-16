"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter animation constants — subtle, professional
const D = { fast: 0.3, normal: 0.5, slow: 0.7, hero: 0.9 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.4)",
    gentle: "power3.out",
};
const S = { tight: 0.05, normal: 0.08, loose: 0.12 };

interface InviteAnimatorProps {
    children: ReactNode;
}

export function InviteAnimator({ children }: InviteAnimatorProps) {
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
            // HERO — Memphis shapes (subtle entrance)
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
            // INVITATION TYPES
            // ════════════════════════════════════════

            const typesSection = $1(".types-section");
            if (typesSection) {
                const typesHeading = $1(".types-heading");
                if (typesHeading) {
                    gsap.fromTo(
                        typesHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: typesSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".type-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: typesSection, start: "top 75%" },
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
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: stepsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PERMISSION LEVELS
            // ════════════════════════════════════════

            const permissionsSection = $1(".permissions-section");
            if (permissionsSection) {
                const permissionsHeading = $1(".permissions-heading");
                if (permissionsHeading) {
                    gsap.fromTo(
                        permissionsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: permissionsSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".permission-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: permissionsSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // INVITATION STATUS
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
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: statusSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // BULK INVITES
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
                    { opacity: 0, y: 25, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: bulkSection, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // ONBOARDING
            // ════════════════════════════════════════

            const onboardingSection = $1(".onboarding-section");
            if (onboardingSection) {
                const onboardingHeading = $1(".onboarding-heading");
                if (onboardingHeading) {
                    gsap.fromTo(
                        onboardingHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: onboardingSection, start: "top 80%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".onboarding-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: onboardingSection, start: "top 75%" },
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
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1, x: 0,
                        duration: D.fast,
                        ease: E.smooth,
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
                        ease: E.smooth,
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
                        ease: E.bounce,
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
