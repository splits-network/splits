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

interface PrivacyAnimatorProps {
    children: ReactNode;
}

export function PrivacyAnimator({ children }: PrivacyAnimatorProps) {
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

            // ── Hero Memphis shapes ──
            const shapes = $(".memphis-shape");
            if (shapes.length) {
                gsap.fromTo(
                    shapes,
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

                shapes.forEach((shape, i) => {
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
            }

            // ── Hero content ──
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });
            const badge = $1(".hero-badge");
            if (badge) heroTl.fromTo(badge, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.bounce });
            const headline = $1(".hero-headline");
            if (headline) heroTl.fromTo(headline, { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: D.hero }, "-=0.3");
            const subtitle = $1(".hero-subtitle");
            if (subtitle) heroTl.fromTo(subtitle, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.4");
            const lastUpdated = $1(".hero-date");
            if (lastUpdated) heroTl.fromTo(lastUpdated, { opacity: 0 }, { opacity: 1, duration: D.fast }, "-=0.2");

            // ── TOC ──
            const toc = $1(".legal-toc");
            if (toc) {
                gsap.fromTo(toc, { opacity: 0, y: 30 }, {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: toc, start: "top 85%" },
                });
            }

            // ── Content sections ──
            $(".legal-section").forEach((section) => {
                gsap.fromTo(section, { opacity: 0, y: 40 }, {
                    opacity: 1, y: 0, duration: D.slow, ease: E.smooth,
                    scrollTrigger: { trigger: section, start: "top 80%" },
                });
            });

            // ── Contact card ──
            const contact = $1(".legal-contact");
            if (contact) {
                gsap.fromTo(contact, { opacity: 0, y: 30 }, {
                    opacity: 1, y: 0, duration: D.normal, ease: E.bounce,
                    scrollTrigger: { trigger: contact, start: "top 85%" },
                });
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
