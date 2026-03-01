"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Client-only animation wrapper.
 * Renders children server-side, then enhances with GSAP on hydration.
 */
export function LandingAnimations({ children }: { children: React.ReactNode }) {
    const mainRef = useRef<HTMLDivElement>(null);

    // On mount, reveal all opacity-0 elements for reduced-motion users
    useEffect(() => {
        if (!mainRef.current) return;
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) {
            mainRef.current
                .querySelectorAll(".opacity-0")
                .forEach((el) => ((el as HTMLElement).style.opacity = "1"));
        }
    }, []);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            /* Header */
            gsap.fromTo(
                $1(".header-bar"),
                { opacity: 0, y: -30 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" },
            );

            /* Hero */
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
            heroTl
                .fromTo(
                    $1(".hero-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                )
                .fromTo(
                    $(".hero-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1, y: 0, rotateX: 0,
                        duration: 1, stagger: 0.12, clearProps: "transform",
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".hero-body"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" },
                    "-=0.5",
                )
                .fromTo(
                    $(".hero-cta"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, clearProps: "transform" },
                    "-=0.3",
                );

            /* Platform cards */
            gsap.fromTo(
                $(".platform-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.15,
                    ease: "power3.out", clearProps: "transform",
                    scrollTrigger: { trigger: $1(".platforms-grid"), start: "top 85%" },
                },
            );

            /* Footer */
            gsap.fromTo(
                $1(".footer-content"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.6,
                    ease: "power2.out", clearProps: "transform",
                    scrollTrigger: { trigger: $1(".footer-content"), start: "top 90%" },
                },
            );
        },
        { scope: mainRef },
    );

    return <div ref={mainRef}>{children}</div>;
}
