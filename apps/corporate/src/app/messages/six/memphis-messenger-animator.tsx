"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

// Memphis animation constants
const D = { fast: 0.25, normal: 0.4, slow: 0.6, entrance: 0.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.5)",
    pop: "back.out(2.0)",
    snappy: "power3.out",
};
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };

interface MemphisMessengerAnimatorProps {
    children: ReactNode;
}

export function MemphisMessengerAnimator({ children }: MemphisMessengerAnimatorProps) {
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
            // HEADER ENTRANCE
            // ════════════════════════════════════════
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });

            // Header slides down
            headerTl.fromTo(
                $1(".messenger-header"),
                { y: -80, opacity: 0 },
                { y: 0, opacity: 1, duration: D.entrance, ease: E.bounce },
            );

            // Badge pops in
            const badge = $1(".header-badge");
            if (badge) {
                headerTl.fromTo(
                    badge,
                    { scale: 0, rotation: -15 },
                    { scale: 1, rotation: 0, duration: D.fast, ease: E.elastic },
                    "-=0.2",
                );
            }

            // ════════════════════════════════════════
            // CONVERSATION LIST
            // ════════════════════════════════════════
            const convPanel = $1(".conversation-panel");
            if (convPanel) {
                gsap.fromTo(
                    convPanel,
                    { x: -60, opacity: 0 },
                    { x: 0, opacity: 1, duration: D.slow, ease: E.smooth, delay: 0.2 },
                );
            }

            // Filter tabs pop in
            gsap.fromTo(
                $(".filter-tabs button"),
                { scale: 0, y: 10 },
                {
                    scale: 1, y: 0,
                    duration: D.fast,
                    ease: E.pop,
                    stagger: S.tight,
                    delay: 0.4,
                },
            );

            // Conversation items slide in with stagger
            gsap.fromTo(
                $(".conv-item"),
                { x: -40, opacity: 0, skewX: -2 },
                {
                    x: 0, opacity: 1, skewX: 0,
                    duration: D.normal,
                    ease: E.snappy,
                    stagger: S.normal,
                    delay: 0.5,
                },
            );

            // ════════════════════════════════════════
            // MESSAGE THREAD
            // ════════════════════════════════════════
            const threadPanel = $1(".message-thread");
            if (threadPanel) {
                gsap.fromTo(
                    threadPanel,
                    { x: 60, opacity: 0 },
                    { x: 0, opacity: 1, duration: D.slow, ease: E.smooth, delay: 0.3 },
                );
            }

            // Thread header
            gsap.fromTo(
                $1(".thread-header"),
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: D.normal, ease: E.bounce, delay: 0.5 },
            );

            // Message bubbles cascade in
            gsap.fromTo(
                $(".msg-bubble"),
                { y: 30, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: D.normal,
                    ease: E.bounce,
                    stagger: S.loose,
                    delay: 0.6,
                },
            );

            // ════════════════════════════════════════
            // COMPOSE AREA
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".compose-area"),
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: D.entrance, ease: E.smooth, delay: 0.8 },
            );

            // Quick action buttons
            gsap.fromTo(
                $(".quick-action"),
                { scale: 0, rotation: -10 },
                {
                    scale: 1, rotation: 0,
                    duration: D.fast,
                    ease: E.elastic,
                    stagger: S.tight,
                    delay: 1.0,
                },
            );
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
