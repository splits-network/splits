"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimatorProps {
    children: ReactNode;
}

/**
 * Thin client wrapper that adds scroll-triggered GSAP animations to
 * server-rendered children. Content passed as `children` is a React
 * Server Component — it renders into the initial HTML for crawlers.
 *
 * Animation targets:
 * - Every <section> fades up on scroll
 * - Elements with `data-animate-stagger` have their direct children stagger-animate
 */
export function ScrollAnimator({ children }: ScrollAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                return;
            }

            // Animate each section on scroll
            const sections =
                containerRef.current.querySelectorAll("section");
            sections.forEach((section) => {
                gsap.set(section, { opacity: 0, y: 30 });
                gsap.to(section, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                    },
                });
            });

            // Stagger-animate children of marked containers
            const staggerGroups =
                containerRef.current.querySelectorAll(
                    "[data-animate-stagger]",
                );
            staggerGroups.forEach((group) => {
                if (group.children.length === 0) return;
                gsap.set(group.children, { opacity: 0, y: 25, scale: 0.97 });
                gsap.to(group.children, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: group,
                        start: "top 85%",
                    },
                });
            });

            // Recalculate trigger positions after Next.js layout settles —
            // without this, elements already in viewport on mount never fire.
            requestAnimationFrame(() => {
                ScrollTrigger.refresh();
            });
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
