"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function LegalBaselAnimator({ children }: { children: ReactNode }) {
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

            const c = containerRef.current;
            const $1 = (sel: string) => c.querySelector(sel);
            const $$ = (sel: string) => Array.from(c.querySelectorAll(sel));

            // ─── HERO ────────────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const heroKicker = $1(".bl-hero-kicker");
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                );
            }

            const heroHeadline = $1(".bl-hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    "-=0.3",
                );
            }

            const heroSubtitle = $1(".bl-hero-subtitle");
            if (heroSubtitle) {
                heroTl.fromTo(
                    heroSubtitle,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.4",
                );
            }

            const heroDate = $1(".bl-hero-date");
            if (heroDate) {
                heroTl.fromTo(
                    heroDate,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.5 },
                    "-=0.2",
                );
            }

            // ─── TABLE OF CONTENTS ───────────────────────────────────
            const toc = $1(".bl-toc");
            if (toc) {
                gsap.fromTo(
                    toc,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        scrollTrigger: { trigger: toc, start: "top 85%" },
                    },
                );
            }

            // ─── LEGAL SECTIONS (scroll-triggered) ───────────────────
            $$(".bl-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        scrollTrigger: { trigger: section, start: "top 80%" },
                    },
                );
            });

            // ─── CONTACT FOOTER ──────────────────────────────────────
            const contact = $1(".bl-contact");
            if (contact) {
                gsap.fromTo(
                    contact,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: { trigger: contact, start: "top 80%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return <div ref={containerRef}>{children}</div>;
}
