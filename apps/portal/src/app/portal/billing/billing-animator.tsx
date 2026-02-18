"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const D = { fast: 0.3, normal: 0.5, slow: 0.8 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
};
const S = { tight: 0.06 };

interface BillingAnimatorProps {
    children: ReactNode;
}

export function BillingAnimator({ children }: BillingAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll(
                        "[class*='opacity-0']",
                    ),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // Memphis shapes
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

            // Header timeline
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });

            const headerBadge = $1(".header-badge");
            if (headerBadge) {
                headerTl.fromTo(
                    headerBadge,
                    { opacity: 0, y: -20, scale: 0.8 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: D.normal,
                        ease: E.bounce,
                    },
                );
            }

            const headerTitle = $1(".header-title");
            if (headerTitle) {
                headerTl.fromTo(
                    headerTitle,
                    { opacity: 0, y: 50, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: D.slow },
                    "-=0.3",
                );
            }

            const headerSubtitle = $1(".header-subtitle");
            if (headerSubtitle) {
                headerTl.fromTo(
                    headerSubtitle,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }

            // Sidebar slide in
            const settingsSidebar = $1(".settings-sidebar");
            if (settingsSidebar) {
                gsap.fromTo(
                    settingsSidebar,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.6,
                    },
                );
            }

            // Content fade in
            const settingsContent = $1(".settings-content");
            if (settingsContent) {
                gsap.fromTo(
                    settingsContent,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.8,
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
