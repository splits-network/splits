"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0, counter: 1.5 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
    pop: "back.out(2.0)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

export function ArticleAnimator({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 }
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            /* ── Memphis shapes ── */
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
                }
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

            /* ── Hero timeline ── */
            const tl = gsap.timeline({ defaults: { ease: E.smooth } });

            const heroBreadcrumb = $1(".hero-breadcrumb");
            if (heroBreadcrumb)
                tl.fromTo(
                    heroBreadcrumb,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast }
                );

            const heroHeadline = $1(".hero-headline");
            if (heroHeadline)
                tl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.2"
                );

            const heroMeta = $1(".hero-meta");
            if (heroMeta)
                tl.fromTo(
                    heroMeta,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4"
                );

            const heroTags = $1(".hero-tags");
            if (heroTags)
                tl.fromTo(
                    heroTags,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: D.fast },
                    "-=0.3"
                );

            /* ── Article body fade-in ── */
            const articleBody = $1(".article-body");
            if (articleBody) {
                ScrollTrigger.create({
                    trigger: articleBody,
                    start: "top 85%",
                    onEnter: () =>
                        gsap.fromTo(
                            articleBody,
                            { opacity: 0, y: 30 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: D.slow,
                                ease: E.smooth,
                            }
                        ),
                    once: true,
                });
            }

            /* ── Back nav ── */
            const backNav = $1(".back-nav");
            if (backNav) {
                ScrollTrigger.create({
                    trigger: backNav,
                    start: "top 90%",
                    onEnter: () =>
                        gsap.fromTo(
                            backNav,
                            { opacity: 0, y: 20 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: D.normal,
                                ease: E.smooth,
                            }
                        ),
                    once: true,
                });
            }
        },
        { scope: containerRef }
    );

    return <div ref={containerRef}>{children}</div>;
}
