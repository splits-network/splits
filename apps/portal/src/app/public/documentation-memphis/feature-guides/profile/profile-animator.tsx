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

interface ProfileAnimatorProps {
    children: ReactNode;
}

export function ProfileAnimator({ children }: ProfileAnimatorProps) {
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
            // PERSONAL INFORMATION
            // ════════════════════════════════════════
            const personalSection = $1(".personal-section");
            if (personalSection) {
                const personalHeading = $1(".personal-heading");
                if (personalHeading) {
                    gsap.fromTo(
                        personalHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: personalSection, start: "top 80%" },
                        },
                    );
                }

                const personalContent = $1(".personal-content");
                if (personalContent) {
                    gsap.fromTo(
                        personalContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: personalSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".personal-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: personalSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CONTACT PREFERENCES
            // ════════════════════════════════════════
            const contactSection = $1(".contact-section");
            if (contactSection) {
                const contactHeading = $1(".contact-heading");
                if (contactHeading) {
                    gsap.fromTo(
                        contactHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: contactSection, start: "top 80%" },
                        },
                    );
                }

                const contactContent = $1(".contact-content");
                if (contactContent) {
                    gsap.fromTo(
                        contactContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: contactSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".contact-card"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: contactSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // VISIBILITY AND PRIVACY
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
            // NOTIFICATION PREFERENCES
            // ════════════════════════════════════════
            const notificationsSection = $1(".notifications-section");
            if (notificationsSection) {
                const notificationsHeading = $1(".notifications-heading");
                if (notificationsHeading) {
                    gsap.fromTo(
                        notificationsHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: notificationsSection, start: "top 80%" },
                        },
                    );
                }

                const notificationsContent = $1(".notifications-content");
                if (notificationsContent) {
                    gsap.fromTo(
                        notificationsContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: notificationsSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".notification-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: notificationsSection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SECURITY AND ACCESS
            // ════════════════════════════════════════
            const securitySection = $1(".security-section");
            if (securitySection) {
                const securityHeading = $1(".security-heading");
                if (securityHeading) {
                    gsap.fromTo(
                        securityHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: securitySection, start: "top 80%" },
                        },
                    );
                }

                const securityContent = $1(".security-content");
                if (securityContent) {
                    gsap.fromTo(
                        securityContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: securitySection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".security-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: securitySection, start: "top 70%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PROFILE COMPLETION
            // ════════════════════════════════════════
            const completionSection = $1(".completion-section");
            if (completionSection) {
                const completionHeading = $1(".completion-heading");
                if (completionHeading) {
                    gsap.fromTo(
                        completionHeading,
                        { opacity: 0, y: 25 },
                        {
                            opacity: 1, y: 0,
                            duration: D.normal, ease: E.smooth,
                            scrollTrigger: { trigger: completionSection, start: "top 80%" },
                        },
                    );
                }

                const completionContent = $1(".completion-content");
                if (completionContent) {
                    gsap.fromTo(
                        completionContent,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: D.fast, ease: E.smooth,
                            scrollTrigger: { trigger: completionSection, start: "top 78%" },
                        },
                    );
                }

                gsap.fromTo(
                    $(".completion-card"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: completionSection, start: "top 70%" },
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
