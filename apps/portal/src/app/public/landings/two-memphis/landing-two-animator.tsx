"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface LandingTwoAnimatorProps {
    children: ReactNode;
}

export function LandingTwoAnimator({ children }: LandingTwoAnimatorProps) {
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

            // ── MEMPHIS SHAPES ──
            gsap.fromTo(
                $(".memphis-shape"),
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 0.4, scale: 1, rotation: 0,
                    duration: D.slow, ease: E.elastic,
                    stagger: { each: S.tight, from: "random" },
                    delay: 0.2,
                },
            );
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

            // ── HERO ──
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });
            const heroStatus = $1(".hero-status");
            if (heroStatus) heroTl.fromTo(heroStatus, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.bounce });
            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) heroTl.fromTo(heroHeadline, { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: D.hero }, "-=0.3");
            const heroSub = $1(".hero-sub");
            if (heroSub) heroTl.fromTo(heroSub, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.4");
            const heroTerminal = $1(".hero-terminal");
            if (heroTerminal) heroTl.fromTo(heroTerminal, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: D.normal, ease: E.bounce }, "-=0.2");
            heroTl.fromTo($(".hero-cta"), { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: D.normal, stagger: S.normal, ease: E.bounce }, "-=0.2");

            // ── TELEMETRY SECTION ──
            const telHeading = $1(".tel-heading");
            if (telHeading) {
                gsap.fromTo(telHeading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".tel-section"), start: "top 75%" } });
            }
            gsap.fromTo($(".tel-card"), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: D.normal, ease: E.bounce, stagger: S.normal, scrollTrigger: { trigger: $1(".tel-grid"), start: "top 80%" } });

            // ── PULL QUOTES ──
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(quote, { opacity: 0, x: -40, rotation: -1 }, { opacity: 1, x: 0, rotation: 0, duration: D.slow, ease: E.bounce, scrollTrigger: { trigger: quote, start: "top 80%" } });
            });

            // ── PAIN POINTS ──
            const painHeading = $1(".pain-heading");
            if (painHeading) {
                gsap.fromTo(painHeading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".pain-section"), start: "top 75%" } });
            }
            gsap.fromTo($(".pain-card"), { opacity: 0, y: 50, scale: 0.85, rotation: -3 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: D.normal, ease: E.bounce, stagger: S.loose, scrollTrigger: { trigger: $1(".pain-grid"), start: "top 80%" } });

            // ── FEATURES ──
            const featHeading = $1(".feat-heading");
            if (featHeading) {
                gsap.fromTo(featHeading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".feat-section"), start: "top 75%" } });
            }
            gsap.fromTo($(".feat-card"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: D.normal, ease: E.bounce, stagger: S.loose, scrollTrigger: { trigger: $1(".feat-grid"), start: "top 80%" } });

            // ── COMPARISON ──
            const compHeading = $1(".comp-heading");
            if (compHeading) {
                gsap.fromTo(compHeading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".comp-section"), start: "top 75%" } });
            }
            gsap.fromTo($(".comp-card"), { opacity: 0, y: 50, scale: 0.9, rotation: -2 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: D.normal, ease: E.bounce, stagger: S.loose, scrollTrigger: { trigger: $1(".comp-grid"), start: "top 80%" } });

            // ── CTA ──
            const ctaContent = $1(".cta-content");
            if (ctaContent) {
                gsap.fromTo(ctaContent, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: D.hero, ease: E.smooth, scrollTrigger: { trigger: $1(".cta-section"), start: "top 80%" } });
            }
            gsap.fromTo($(".cta-card"), { opacity: 0, y: 40, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: D.normal, ease: E.bounce, stagger: S.loose, delay: 0.3, scrollTrigger: { trigger: $1(".cta-section"), start: "top 80%" } });
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
