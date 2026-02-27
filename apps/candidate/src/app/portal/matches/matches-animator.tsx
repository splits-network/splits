"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MatchesAnimatorProps {
    containerRef: RefObject<HTMLDivElement | null>;
    loading: boolean;
}

export default function MatchesAnimator({
    containerRef,
    loading,
}: MatchesAnimatorProps) {
    const hasAnimated = useRef(false);

    useGSAP(
        () => {
            if (loading || !containerRef.current || hasAnimated.current) return;
            hasAnimated.current = true;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                containerRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach(
                        (el) => ((el as HTMLElement).style.opacity = "1"),
                    );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            /* Hero entrance */
            const hero = $1(".matches-hero");
            if (hero) {
                gsap.fromTo(
                    hero,
                    { opacity: 0, y: -20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        clearProps: "transform",
                    },
                );
            }

            /* Staggered card entrance */
            const cards = $(".match-card");
            if (cards.length) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.08,
                        ease: "power3.out",
                        delay: 0.2,
                        clearProps: "transform",
                    },
                );
            }
        },
        { scope: containerRef, dependencies: [loading] },
    );

    return null;
}
