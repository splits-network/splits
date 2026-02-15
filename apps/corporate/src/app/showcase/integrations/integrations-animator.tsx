"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Memphis retro animation constants (matching landing/six and articles/six)
const D = { fast: 0.3, normal: 0.5, slow: 0.8 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface IntegrationsAnimatorProps {
    children: ReactNode;
}

export function IntegrationsAnimator({ children }: IntegrationsAnimatorProps) {
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
            // MEMPHIS SHAPES
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
            // HEADER
            // ════════════════════════════════════════
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });

            headerTl.fromTo(
                $1(".header-badge"),
                { opacity: 0, y: -20, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: D.normal, ease: E.bounce },
            );
            headerTl.fromTo(
                $1(".header-title"),
                { opacity: 0, y: 50, skewY: 2 },
                { opacity: 1, y: 0, skewY: 0, duration: D.slow },
                "-=0.3",
            );
            headerTl.fromTo(
                $1(".header-subtitle"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.4",
            );

            // ════════════════════════════════════════
            // CONTROLS BAR
            // ════════════════════════════════════════
            headerTl.fromTo(
                $1(".controls-bar"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal, ease: E.bounce },
                "-=0.2",
            );

            // ════════════════════════════════════════
            // STATS BAR
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".stat-pill"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1,
                    duration: D.fast,
                    ease: E.pop,
                    stagger: S.tight,
                    delay: 0.8,
                },
            );

            // ════════════════════════════════════════
            // CONTENT AREA
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".listings-content"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.normal,
                    ease: E.smooth,
                    delay: 1.0,
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
