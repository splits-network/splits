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

interface NavigationAnimatorProps {
    children: ReactNode;
}

export function NavigationAnimator({ children }: NavigationAnimatorProps) {
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
            // NAV CARDS — stagger in with slight scale
            // ════════════════════════════════════════

            const cardsContainer = $1(".nav-cards-container");
            if (cardsContainer) {
                gsap.fromTo(
                    $(".nav-card"),
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: cardsContainer, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // SHORTCUT TABLE ROWS — stagger fade
            // ════════════════════════════════════════

            const shortcutTable = $1(".shortcut-table");
            if (shortcutTable) {
                gsap.fromTo(
                    $(".shortcut-row"),
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1, x: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.tight,
                        scrollTrigger: { trigger: shortcutTable, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // ROLE COMPARISON CARDS
            // ════════════════════════════════════════

            const roleCards = $1(".role-cards-container");
            if (roleCards) {
                gsap.fromTo(
                    $(".role-card"),
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        scrollTrigger: { trigger: roleCards, start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // TIPS CARDS — stagger
            // ════════════════════════════════════════

            const tipsContainer = $1(".tips-container");
            if (tipsContainer) {
                gsap.fromTo(
                    $(".tip-card"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: D.fast,
                        ease: E.smooth,
                        stagger: S.normal,
                        scrollTrigger: { trigger: tipsContainer, start: "top 85%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════

            const ctaSection = $1(".nav-cta");
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
