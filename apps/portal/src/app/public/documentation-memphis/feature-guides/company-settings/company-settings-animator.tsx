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

interface CompanySettingsAnimatorProps {
    children: ReactNode;
}

export function CompanySettingsAnimator({ children }: CompanySettingsAnimatorProps) {
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

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.15",
                );
            }

            const heroDescription = $1(".hero-description");
            if (heroDescription) {
                heroTl.fromTo(
                    heroDescription,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.35",
                );
            }

            const heroBadges = $1(".hero-badges");
            if (heroBadges) {
                heroTl.fromTo(
                    heroBadges,
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

                const overviewContent = $1(".overview-content");
                if (overviewContent) {
                    gsap.fromTo(
                        overviewContent,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.gentle,
                            scrollTrigger: { trigger: overviewSection, start: "top 75%" },
                        },
                    );
                }
            }

            // ════════════════════════════════════════
            // ORGANIZATION PROFILE
            // ════════════════════════════════════════
            const profileSection = $1(".profile-section");
            if (profileSection) {
                const profileHeading = $1(".profile-heading");
                if (profileHeading) {
                    gsap.fromTo(
                        profileHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: profileSection, start: "top 80%" },
                        },
                    );
                }

                const profileContent = $1(".profile-content");
                if (profileContent) {
                    gsap.fromTo(
                        profileContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: profileSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".profile-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: profileSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // BRANDING AND LOGO
            // ════════════════════════════════════════
            const brandingSection = $1(".branding-section");
            if (brandingSection) {
                const brandingHeading = $1(".branding-heading");
                if (brandingHeading) {
                    gsap.fromTo(
                        brandingHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: brandingSection, start: "top 80%" },
                        },
                    );
                }

                const brandingContent = $1(".branding-content");
                if (brandingContent) {
                    gsap.fromTo(
                        brandingContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: brandingSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".branding-card"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: brandingSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // DEFAULT ROLE SETTINGS
            // ════════════════════════════════════════
            const defaultsSection = $1(".defaults-section");
            if (defaultsSection) {
                const defaultsHeading = $1(".defaults-heading");
                if (defaultsHeading) {
                    gsap.fromTo(
                        defaultsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: defaultsSection, start: "top 80%" },
                        },
                    );
                }

                const defaultsContent = $1(".defaults-content");
                if (defaultsContent) {
                    gsap.fromTo(
                        defaultsContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: defaultsSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".defaults-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: defaultsSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // HIRING WORKFLOW DEFAULTS
            // ════════════════════════════════════════
            const workflowSection = $1(".workflow-section");
            if (workflowSection) {
                const workflowHeading = $1(".workflow-heading");
                if (workflowHeading) {
                    gsap.fromTo(
                        workflowHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: workflowSection, start: "top 80%" },
                        },
                    );
                }

                const workflowContent = $1(".workflow-content");
                if (workflowContent) {
                    gsap.fromTo(
                        workflowContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: workflowSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".workflow-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: workflowSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // INTEGRATION CONFIGURATION
            // ════════════════════════════════════════
            const integrationsSection = $1(".integrations-section");
            if (integrationsSection) {
                const integrationsHeading = $1(".integrations-heading");
                if (integrationsHeading) {
                    gsap.fromTo(
                        integrationsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: integrationsSection, start: "top 80%" },
                        },
                    );
                }

                const integrationsContent = $1(".integrations-content");
                if (integrationsContent) {
                    gsap.fromTo(
                        integrationsContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: integrationsSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".integrations-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: integrationsSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PRIVACY AND COMPLIANCE
            // ════════════════════════════════════════
            const complianceSection = $1(".compliance-section");
            if (complianceSection) {
                const complianceHeading = $1(".compliance-heading");
                if (complianceHeading) {
                    gsap.fromTo(
                        complianceHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: complianceSection, start: "top 80%" },
                        },
                    );
                }

                const complianceContent = $1(".compliance-content");
                if (complianceContent) {
                    gsap.fromTo(
                        complianceContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: complianceSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".compliance-card"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: complianceSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // COMPANY VISIBILITY
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

                const visibilityContent = $1(".visibility-content");
                if (visibilityContent) {
                    gsap.fromTo(
                        visibilityContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: visibilitySection, start: "top 78%" },
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
                        scrollTrigger: { trigger: visibilitySection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SHARED TEAM DEFAULTS
            // ════════════════════════════════════════
            const teamSection = $1(".team-section");
            if (teamSection) {
                const teamHeading = $1(".team-heading");
                if (teamHeading) {
                    gsap.fromTo(
                        teamHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: teamSection, start: "top 80%" },
                        },
                    );
                }

                const teamContent = $1(".team-content");
                if (teamContent) {
                    gsap.fromTo(
                        teamContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: teamSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".team-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: teamSection, start: "top 70%" },
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

                const practicesContent = $1(".practices-content");
                if (practicesContent) {
                    gsap.fromTo(
                        practicesContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: practicesSection, start: "top 78%" },
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
                        scrollTrigger: { trigger: practicesSection, start: "top 70%" },
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

                const troubleContent = $1(".trouble-content");
                if (troubleContent) {
                    gsap.fromTo(
                        troubleContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: troubleSection, start: "top 78%" },
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
                        scrollTrigger: { trigger: troubleSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA / NEXT STEPS
            // ════════════════════════════════════════
            const ctaSection = $1(".cta-section");
            if (ctaSection) {
                const ctaHeading = $1(".cta-heading");
                if (ctaHeading) {
                    gsap.fromTo(
                        ctaHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: ctaSection, start: "top 80%" },
                        },
                    );
                }

                const ctaDescription = $1(".cta-description");
                if (ctaDescription) {
                    gsap.fromTo(
                        ctaDescription,
                        { opacity: 0, y: 15 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.gentle,
                            scrollTrigger: { trigger: ctaSection, start: "top 75%" },
                        },
                    );
                }

                const ctaButtons = $1(".cta-buttons");
                if (ctaButtons) {
                    gsap.fromTo(
                        ctaButtons,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.gentle,
                            scrollTrigger: { trigger: ctaSection, start: "top 70%" },
                        },
                    );
                }
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
