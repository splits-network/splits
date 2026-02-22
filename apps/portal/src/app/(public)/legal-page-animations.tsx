"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LegalPageAnimations({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!ref.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                return;
            }

            const $ = (sel: string) =>
                ref.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                ref.current!.querySelector(sel);

            /* ── HERO ─────────────────────────────────────────── */
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            const heroKicker = $1(".hero-kicker");
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                );
            }

            const heroWords = $(".hero-headline-word");
            if (heroWords.length) {
                heroTl.fromTo(
                    heroWords,
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

            const heroSubtitle = $1(".hero-subtitle");
            if (heroSubtitle) {
                heroTl.fromTo(
                    heroSubtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );
            }

            const heroMetaItems = $(".hero-meta-item");
            if (heroMetaItems.length) {
                heroTl.fromTo(
                    heroMetaItems,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                );
            }

            /* Hero image */
            const heroImgWrap = $1(".hero-img-wrap");
            if (heroImgWrap) {
                gsap.fromTo(
                    heroImgWrap,
                    { opacity: 0, scale: 1.08 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1.4,
                        ease: "power2.out",
                        delay: 0.2,
                    },
                );

                const heroImg = heroImgWrap.querySelector("img");
                const heroSection = $1(".hero-section");
                if (heroImg && heroSection) {
                    gsap.to(heroImg, {
                        yPercent: 12,
                        ease: "none",
                        scrollTrigger: {
                            trigger: heroSection,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            }

            /* ── ARTICLE BLOCKS ───────────────────────────────── */
            $(".article-block").forEach((block) => {
                gsap.fromTo(
                    block,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: block,
                            start: "top 80%",
                        },
                    },
                );
            });

            /* ── SPLIT-SCREEN SECTIONS ────────────────────────── */
            $(".split-text-left").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-img-right").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-text-right").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-img-left").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            /* ── PULL QUOTES ──────────────────────────────────── */
            $(".pull-quote-block").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, scale: 0.96 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.9,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: quote,
                            start: "top 80%",
                        },
                    },
                );
            });

            /* ── CTA ──────────────────────────────────────────── */
            const ctaContent = $1(".final-cta-content");
            const ctaSection = $1(".final-cta");
            if (ctaContent && ctaSection) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: ref },
    );

    return <div ref={ref}>{children}</div>;
}
