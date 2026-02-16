"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Lighter animation constants -- professional, subtle
const D = { fast: 0.3, normal: 0.5, slow: 0.7, hero: 0.9 };
const E = {
    smooth: "power2.out",
    gentle: "power3.out",
    soft: "power1.out",
};
const S = { tight: 0.05, normal: 0.08, loose: 0.12 };

interface BillingAnimatorProps {
    children: ReactNode;
}

export function BillingAnimator({ children }: BillingAnimatorProps) {
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
            // HERO -- Memphis shapes: gentle fade + scale
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
            // HERO -- Content timeline
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
            // CONTENT SECTIONS -- gentle fade-up on scroll
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
            // OVERVIEW CARDS -- stagger with scale
            // ════════════════════════════════════════
            const overviewContainer = $1(".overview-container");
            if (overviewContainer) {
                gsap.fromTo(
                    $(".overview-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
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
            // PLAN CARDS -- stagger with scale
            // ════════════════════════════════════════
            const planContainer = $1(".plan-container");
            if (planContainer) {
                gsap.fromTo(
                    $(".plan-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: planContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PAYMENT METHOD CARDS -- stagger slide-right
            // ════════════════════════════════════════
            const paymentContainer = $1(".payment-container");
            if (paymentContainer) {
                gsap.fromTo(
                    $(".payment-card"),
                    { opacity: 0, x: -25 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: paymentContainer, start: "top 75%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // INVOICE CARDS -- stagger with scale
            // ════════════════════════════════════════
            const invoiceContainer = $1(".invoice-container");
            if (invoiceContainer) {
                gsap.fromTo(
                    $(".invoice-card"),
                    { opacity: 0, y: 25, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: invoiceContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // UPGRADE CARDS
            // ════════════════════════════════════════
            const upgradeContainer = $1(".upgrade-container");
            if (upgradeContainer) {
                gsap.fromTo(
                    $(".upgrade-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: upgradeContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CYCLE CARDS
            // ════════════════════════════════════════
            const cycleContainer = $1(".cycle-container");
            if (cycleContainer) {
                gsap.fromTo(
                    $(".cycle-card"),
                    { opacity: 0, y: 25, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: cycleContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // FAILURE CARDS -- stagger slide-right
            // ════════════════════════════════════════
            const failureContainer = $1(".failure-container");
            if (failureContainer) {
                gsap.fromTo(
                    $(".failure-card"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: failureContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TAX CARDS
            // ════════════════════════════════════════
            const taxContainer = $1(".tax-container");
            if (taxContainer) {
                gsap.fromTo(
                    $(".tax-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: taxContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // USAGE CARDS
            // ════════════════════════════════════════
            const usageContainer = $1(".usage-container");
            if (usageContainer) {
                gsap.fromTo(
                    $(".usage-card"),
                    { opacity: 0, y: 25, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.gentle,
                        stagger: S.normal,
                        scrollTrigger: { trigger: usageContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // NOTIFICATION CARDS
            // ════════════════════════════════════════
            const notificationContainer = $1(".notification-container");
            if (notificationContainer) {
                gsap.fromTo(
                    $(".notification-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: notificationContainer, start: "top 85%" },
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
            // CTA / NEXT STEPS
            // ════════════════════════════════════════
            const ctaSection = $1(".billing-cta");
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
