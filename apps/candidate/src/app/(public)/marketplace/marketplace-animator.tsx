"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface MarketplaceAnimatorProps {
    children: ReactNode;
}

export default function MarketplaceAnimator({
    children,
}: MarketplaceAnimatorProps) {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                gsap.set(
                    mainRef.current!.querySelectorAll(
                        "[class*='opacity-0']",
                    ),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            // Hero kicker
            const kicker = $1(".hero-kicker");
            if (kicker) {
                tl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                );
            }

            // Hero headline words (3D entrance)
            const words = $(".hero-headline-word");
            if (words.length) {
                tl.fromTo(
                    words,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                );
            }

            // Subtitle
            const subtitle = $1(".hero-subtitle");
            if (subtitle) {
                tl.fromTo(
                    subtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );
            }

            // Search bar
            const searchBar = $1(".search-bar");
            if (searchBar) {
                tl.fromTo(
                    searchBar,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );
            }

            // Hero stat items
            const stats = $(".hero-stat");
            if (stats.length) {
                tl.fromTo(
                    stats,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.08,
                    },
                    "-=0.3",
                );
            }

            // Controls bar
            const controlsBar = $1(".controls-bar");
            if (controlsBar) {
                tl.fromTo(
                    controlsBar,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );
            }

            // Content area
            const contentArea = $1(".content-area");
            if (contentArea) {
                tl.fromTo(
                    contentArea,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.3",
                );
            }

            // Recruiter cards (staggered reveal)
            const cards = $(".recruiter-card");
            if (cards.length) {
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.06,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {children}
        </main>
    );
}
