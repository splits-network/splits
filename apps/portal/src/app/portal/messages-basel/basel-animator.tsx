"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Basel editorial page animator.
 * Uses power3.out easing and staggered fade-in — no Memphis shapes,
 * no elastic/bounce easing, no floating geometric decorations.
 */

const D = { fast: 0.4, normal: 0.6, slow: 0.9 };
const E = { editorial: "power3.out" };
const S = { tight: 0.08 };

interface BaselAnimatorProps {
    children: ReactNode;
}

export function BaselAnimator({ children }: BaselAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            /* Header kicker */
            const kicker = $1(".header-kicker");
            if (kicker) {
                gsap.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast, ease: E.editorial },
                );
            }

            /* Header words — staggered reveal */
            const words = $(".header-word");
            if (words.length) {
                gsap.fromTo(
                    words,
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: D.slow,
                        stagger: 0.1,
                        ease: E.editorial,
                        delay: 0.15,
                    },
                );
            }

            /* Stat bar */
            const statBar = $1(".header-stat-bar");
            if (statBar) {
                gsap.fromTo(
                    statBar,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.editorial,
                        delay: 0.4,
                    },
                );
            }

            /* Controls bar */
            const controls = $1(".controls-bar");
            if (controls) {
                gsap.fromTo(
                    controls,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.editorial,
                        delay: 0.5,
                    },
                );
            }

            /* Inbox panel — slide from left */
            const inbox = $1(".inbox-panel");
            if (inbox) {
                gsap.fromTo(
                    inbox,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.editorial,
                        delay: 0.3,
                    },
                );
            }

            /* Thread panel — slide from right */
            const thread = $1(".thread-panel");
            if (thread) {
                gsap.fromTo(
                    thread,
                    { opacity: 0, x: 40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.editorial,
                        delay: 0.4,
                    },
                );
            }

            /* Conversation items stagger */
            const items = $(".conv-item");
            if (items.length) {
                gsap.fromTo(
                    items,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.fast,
                        stagger: S.tight,
                        ease: E.editorial,
                        delay: 0.5,
                    },
                );
            }

            /* Listings content — generic fade in */
            const listings = $1(".listings-content");
            if (listings) {
                gsap.fromTo(
                    listings,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.editorial,
                        delay: 0.6,
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
