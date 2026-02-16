"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface PressAnimatorProps {
    children: ReactNode;
}

export function PressAnimator({ children }: PressAnimatorProps) {
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

            document.documentElement.style.scrollBehavior = "smooth";

            // ════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════

            // Memphis shapes -- elastic bounce in from random positions
            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 0.4,
                    scale: 1,
                    rotation: 0,
                    duration: D.slow,
                    ease: E.elastic,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.2,
                },
            );

            // Continuous floating for Memphis shapes
            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${8 + (i % 3) * 4}`,
                    x: `+=${4 + (i % 2) * 6}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}`,
                    duration: 3 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Hero content timeline
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                );
            }

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 60, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
                    "-=0.3",
                );
            }

            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            const heroMeta = $1(".hero-meta");
            if (heroMeta) {
                heroTl.fromTo(
                    heroMeta,
                    { opacity: 0, x: -30 },
                    { opacity: 1, x: 0, duration: D.normal, ease: E.bounce },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // FEATURED RELEASE
            // ════════════════════════════════════════
            const featuredCard = $1(".featured-card");
            if (featuredCard) {
                gsap.fromTo(
                    featuredCard,
                    { opacity: 0, y: 50, scale: 0.9, rotation: -2 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.hero, ease: E.bounce,
                        scrollTrigger: { trigger: $1(".press-featured"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // KEY STATS BAR
            // ════════════════════════════════════════
            const statBlocks = $(".stat-block");
            if (statBlocks.length) {
                gsap.fromTo(
                    statBlocks,
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: $1(".press-stats"), start: "top 90%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PRESS RELEASES GRID
            // ════════════════════════════════════════
            const gridHeading = $1(".releases-heading");
            if (gridHeading) {
                gsap.fromTo(
                    gridHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".press-releases"), start: "top 75%" },
                    },
                );
            }

            const releaseCards = $(".release-card");
            if (releaseCards.length) {
                gsap.fromTo(
                    releaseCards,
                    { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: $1(".releases-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // PULL QUOTE
            // ════════════════════════════════════════
            const pullquotes = $(".pullquote");
            pullquotes.forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -40, rotation: -1 },
                    {
                        opacity: 1, x: 0, rotation: 0,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ════════════════════════════════════════
            // MEDIA KIT
            // ════════════════════════════════════════
            const mediaHeading = $1(".media-heading");
            if (mediaHeading) {
                gsap.fromTo(
                    mediaHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".press-media"), start: "top 75%" },
                    },
                );
            }

            const mediaCards = $(".media-card");
            if (mediaCards.length) {
                gsap.fromTo(
                    mediaCards,
                    { opacity: 0, y: 40, scale: 0.85 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: $1(".media-grid"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // MEDIA CONTACT
            // ════════════════════════════════════════
            const contactCard = $1(".contact-card");
            if (contactCard) {
                gsap.fromTo(
                    contactCard,
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.slow, ease: E.bounce,
                        scrollTrigger: { trigger: $1(".press-contact"), start: "top 80%" },
                    },
                );
            }

            // ════════════════════════════════════════
            // CTA
            // ════════════════════════════════════════
            const ctaContent = $1(".cta-content");
            if (ctaContent) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0,
                        duration: D.hero, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".press-cta"), start: "top 80%" },
                    },
                );
            }

            const ctaCards = $(".cta-card");
            if (ctaCards.length) {
                gsap.fromTo(
                    ctaCards,
                    { opacity: 0, y: 40, scale: 0.85 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.loose,
                        delay: 0.3,
                        scrollTrigger: { trigger: $1(".press-cta"), start: "top 80%" },
                    },
                );
            }

            const ctaFooter = $1(".cta-footer");
            if (ctaFooter) {
                gsap.fromTo(
                    ctaFooter,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: D.normal, ease: E.smooth,
                        delay: 0.6,
                        scrollTrigger: { trigger: $1(".press-cta"), start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
