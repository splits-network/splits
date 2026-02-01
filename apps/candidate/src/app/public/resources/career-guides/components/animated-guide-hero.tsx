"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    prefersReducedMotion,
} from "@/components/landing/shared/animation-utils";

interface AnimatedGuideHeroProps {
    icon: string;
    badge: string;
    title: string;
    description: string;
    readTime: string;
    author: string;
    gradientFrom: string;
    gradientTo: string;
}

export function AnimatedGuideHero({
    icon,
    badge,
    title,
    description,
    readTime,
    author,
    gradientFrom,
    gradientTo,
}: AnimatedGuideHeroProps) {
    const heroRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!heroRef.current || prefersReducedMotion()) return;

            const backBtn = heroRef.current.querySelector(".back-btn");
            const iconEl = heroRef.current.querySelector(".hero-icon");
            const badgeEl = heroRef.current.querySelector(".hero-badge");
            const heading = heroRef.current.querySelector("h1");
            const desc = heroRef.current.querySelector(".hero-description");
            const meta = heroRef.current.querySelector(".hero-meta");

            const tl = gsap.timeline();

            if (backBtn) {
                tl.fromTo(
                    backBtn,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: duration.fast, ease: easing.smooth }
                );
            }

            if (iconEl) {
                tl.fromTo(
                    iconEl,
                    { opacity: 0, scale: 0, rotation: -180 },
                    { opacity: 1, scale: 1, rotation: 0, duration: duration.normal, ease: easing.bounce },
                    "-=0.2"
                );
            }

            if (badgeEl) {
                tl.fromTo(
                    badgeEl,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: duration.fast, ease: easing.smooth },
                    "-=0.3"
                );
            }

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
                    "-=0.3"
                );
            }

            if (desc) {
                tl.fromTo(
                    desc,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
                    "-=0.4"
                );
            }

            if (meta) {
                tl.fromTo(
                    meta,
                    { opacity: 0 },
                    { opacity: 0.8, duration: duration.fast, ease: easing.smooth },
                    "-=0.3"
                );
            }
        },
        { scope: heroRef }
    );

    return (
        <div
            ref={heroRef}
            className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white py-16 overflow-hidden`}
        >
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <Link href="/resources/career-guides" className="back-btn btn btn-ghost btn-sm mb-4 opacity-0">
                        <i className="fa-duotone fa-regular fa-arrow-left"></i> Back to Career Guides
                    </Link>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="hero-icon w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                            <i className={`fa-duotone fa-regular fa-${icon} text-3xl`}></i>
                        </div>
                        <div className="flex-1">
                            <div className="hero-badge badge badge-neutral mb-2">{badge}</div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
                        </div>
                    </div>
                    <p className="hero-description text-lg md:text-xl opacity-90 max-w-3xl">
                        {description}
                    </p>
                    <div className="hero-meta flex items-center gap-4 mt-6 text-sm">
                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                            <i className="fa-duotone fa-regular fa-clock"></i> {readTime}
                        </span>
                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                            <i className="fa-duotone fa-regular fa-user"></i> {author}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
