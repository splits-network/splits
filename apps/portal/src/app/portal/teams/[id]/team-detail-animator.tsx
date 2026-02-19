"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

export function TeamDetailAnimator({ children }: { children: ReactNode }) {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) {
                gsap.set(
                    mainRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);
            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Header elements
            const badge = $1(".detail-badge");
            if (badge)
                tl.fromTo(
                    badge,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4 },
                );

            const title = $1(".detail-title");
            if (title)
                tl.fromTo(
                    title,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );

            const subtitle = $1(".detail-subtitle");
            if (subtitle)
                tl.fromTo(
                    subtitle,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );

            const stats = $(".detail-stat");
            if (stats.length)
                tl.fromTo(
                    stats,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.2",
                );

            // Tabs and content
            const tabs = $1(".detail-tabs");
            if (tabs)
                gsap.fromTo(
                    tabs,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: "power3.out",
                        delay: 0.6,
                    },
                );

            const content = $1(".detail-content");
            if (content)
                gsap.fromTo(
                    content,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        delay: 0.8,
                    },
                );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {children}
        </main>
    );
}
