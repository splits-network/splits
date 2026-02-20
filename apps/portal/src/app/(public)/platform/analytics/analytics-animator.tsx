"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = { smooth: "power2.out", bounce: "back.out(1.7)", elastic: "elastic.out(1, 0.4)", pop: "back.out(2.0)" };
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface AnalyticsAnimatorProps {
    children: ReactNode;
}

export function AnalyticsAnimator({ children }: AnalyticsAnimatorProps) {
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

            // Memphis shapes
            gsap.fromTo($(".memphis-shape"), { opacity: 0, scale: 0, rotation: -180 }, {
                opacity: 0.4, scale: 1, rotation: 0, duration: D.slow, ease: E.elastic, stagger: { each: S.tight, from: "random" }, delay: 0.3,
            });

            $(".memphis-shape").forEach((shape, i) => {
                gsap.to(shape, { y: `+=${10 + (i % 3) * 5}`, x: `+=${5 + (i % 2) * 8}`, rotation: `+=${(i % 2 === 0 ? 1 : -1) * (5 + i * 2)}`, duration: 3 + i * 0.5, ease: "sine.inOut", repeat: -1, yoyo: true });
            });

            // Hero
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });
            const overline = $1(".hero-overline");
            if (overline) heroTl.fromTo(overline, { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: D.normal, ease: E.bounce });
            const headline = $1(".hero-headline");
            if (headline) heroTl.fromTo(headline, { opacity: 0, y: 80, skewY: 3 }, { opacity: 1, y: 0, skewY: 0, duration: D.hero, ease: E.smooth }, "-=0.3");
            const subtext = $1(".hero-subtext");
            if (subtext) heroTl.fromTo(subtext, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.5");
            const ctaBtns = $(".hero-cta-btn");
            if (ctaBtns.length) heroTl.fromTo(ctaBtns, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: D.normal, stagger: S.normal, ease: E.bounce }, "-=0.3");

            // Features
            const featuresHeading = $1(".features-heading");
            if (featuresHeading) gsap.fromTo(featuresHeading, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".analytics-features"), start: "top 75%" } });
            const featureCards = $(".feature-card");
            if (featureCards.length) gsap.fromTo(featureCards, { opacity: 0, y: 60, scale: 0.85, rotation: -3 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: D.normal, ease: E.bounce, stagger: S.normal, scrollTrigger: { trigger: $1(".features-grid"), start: "top 80%" } });

            // Metrics Showcase
            const metricsShowcaseHeading = $1(".metrics-showcase-heading");
            if (metricsShowcaseHeading) gsap.fromTo(metricsShowcaseHeading, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".analytics-metrics-showcase"), start: "top 75%" } });
            const metricItems = $(".metric-item");
            if (metricItems.length) gsap.fromTo(metricItems, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: D.fast, ease: E.bounce, stagger: S.tight, scrollTrigger: { trigger: $1(".metrics-grid"), start: "top 80%" } });

            // Benefits
            const benefitBlocks = $(".benefit-block");
            if (benefitBlocks.length) gsap.fromTo(benefitBlocks, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: D.normal, ease: E.bounce, stagger: S.normal, scrollTrigger: { trigger: $1(".analytics-benefits"), start: "top 85%" } });

            // Use Cases
            const useCasesHeading = $1(".use-cases-heading");
            if (useCasesHeading) gsap.fromTo(useCasesHeading, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, scrollTrigger: { trigger: $1(".analytics-use-cases"), start: "top 75%" } });
            const useCaseCards = $(".use-case-card");
            if (useCaseCards.length) gsap.fromTo(useCaseCards, { opacity: 0, y: 60, rotation: -5 }, { opacity: 1, y: 0, rotation: 0, duration: D.normal, ease: E.bounce, stagger: S.loose, scrollTrigger: { trigger: $1(".use-cases-grid"), start: "top 80%" } });

            // CTA
            const ctaContent = $1(".cta-content");
            if (ctaContent) gsap.fromTo(ctaContent, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: D.hero, ease: E.smooth, scrollTrigger: { trigger: $1(".analytics-cta"), start: "top 80%" } });
            const ctaButtons = $1(".cta-buttons");
            if (ctaButtons) gsap.fromTo(ctaButtons, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal, ease: E.bounce, delay: 0.3, scrollTrigger: { trigger: $1(".analytics-cta"), start: "top 80%" } });
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
