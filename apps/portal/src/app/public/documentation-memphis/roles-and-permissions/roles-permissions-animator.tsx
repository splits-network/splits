"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Memphis retro animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface RolesPermissionsAnimatorProps {
    children: ReactNode;
}

export function RolesPermissionsAnimator({ children }: RolesPermissionsAnimatorProps) {
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
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                    "-=0.1",
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

            // ════════════════════════════════════════
            // ROLE CARDS
            // ════════════════════════════════════════

            const cardsHeading = $1(".cards-heading");
            if (cardsHeading) {
                gsap.fromTo(
                    cardsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: $1(".rp-cards"), start: "top 75%" },
                    },
                );
            }

            const cardsGrid = $1(".cards-grid");
            if (cardsGrid) {
                gsap.fromTo(
                    $(".role-card"),
                    { opacity: 0, y: 50, scale: 0.9, rotation: -2 },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: 0,
                        duration: D.normal,
                        ease: E.bounce,
                        stagger: S.normal,
                        scrollTrigger: { trigger: cardsGrid, start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
