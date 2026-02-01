"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function EcosystemSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    const arrowsRef = useRef<SVGSVGElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Heading animation
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    },
                },
            );

            // Platform cards
            const platforms = diagramRef.current?.querySelectorAll(".platform-card");
            if (platforms) {
                gsap.fromTo(
                    platforms,
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: 0.2,
                        scrollTrigger: {
                            trigger: diagramRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }

            // Center hub
            const hub = diagramRef.current?.querySelector(".center-hub");
            if (hub) {
                gsap.fromTo(
                    hub,
                    { opacity: 0, scale: 0 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        delay: 0.3,
                        scrollTrigger: {
                            trigger: diagramRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }

            // Connecting lines draw
            const paths = arrowsRef.current?.querySelectorAll("path");
            if (paths) {
                paths.forEach((path) => {
                    const length = path.getTotalLength();
                    gsap.set(path, {
                        strokeDasharray: length,
                        strokeDashoffset: length,
                    });
                    gsap.to(path, {
                        strokeDashoffset: 0,
                        duration: duration.hero,
                        ease: easing.smooth,
                        delay: 0.5,
                        scrollTrigger: {
                            trigger: diagramRef.current,
                            start: "top 80%",
                        },
                    });
                });
            }
        },
        { scope: sectionRef },
    );

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-100 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    ref={headingRef}
                    className="text-center mb-16 opacity-0 max-w-3xl mx-auto"
                >
                    <p className="text-sm uppercase tracking-wider text-primary mb-3">
                        Connected Platforms
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        One ecosystem,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            everyone wins
                        </span>
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Companies, recruiters, and candidates all connected
                        through platforms designed to work together seamlessly.
                    </p>
                </div>

                <div
                    ref={diagramRef}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* SVG connecting lines */}
                    <svg
                        ref={arrowsRef}
                        className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
                        viewBox="0 0 800 400"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <linearGradient
                                id="lineGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop offset="0%" stopColor="#233876" />
                                <stop offset="100%" stopColor="#0f9d8a" />
                            </linearGradient>
                        </defs>
                        {/* Left to center */}
                        <path
                            d="M 160 200 Q 280 200 400 200"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* Right to center */}
                        <path
                            d="M 640 200 Q 520 200 400 200"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* Top to center */}
                        <path
                            d="M 400 80 Q 400 140 400 200"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* Bottom to center */}
                        <path
                            d="M 400 320 Q 400 260 400 200"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Grid layout for the diagram */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center min-h-[400px]">
                        {/* Left column - Recruiters */}
                        <div className="platform-card bg-primary text-primary-content rounded-2xl p-6 shadow-xl opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-2xl"></i>
                                <div>
                                    <div className="font-bold">Recruiters</div>
                                    <div className="text-xs opacity-70">
                                        Splits Network
                                    </div>
                                </div>
                            </div>
                            <ul className="text-sm space-y-2 opacity-90">
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                    Access roles
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                    Submit candidates
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                    Earn splits
                                </li>
                            </ul>
                        </div>

                        {/* Center column - Hub + Companies */}
                        <div className="flex flex-col items-center gap-8">
                            {/* Companies card - top */}
                            <div className="platform-card bg-base-200 rounded-2xl p-6 shadow-xl opacity-0 w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <i className="fa-duotone fa-regular fa-building text-2xl text-accent"></i>
                                    <div>
                                        <div className="font-bold">Companies</div>
                                        <div className="text-xs text-base-content/60">
                                            Splits Network
                                        </div>
                                    </div>
                                </div>
                                <ul className="text-sm space-y-2 text-base-content/80">
                                    <li className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-xs text-accent"></i>
                                        Post roles
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-xs text-accent"></i>
                                        Review candidates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-xs text-accent"></i>
                                        Make hires
                                    </li>
                                </ul>
                            </div>

                            {/* Center hub */}
                            <div className="center-hub w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl opacity-0">
                                <i className="fa-duotone fa-regular fa-arrows-to-circle text-3xl text-white"></i>
                            </div>

                            {/* Flow indicator */}
                            <div className="text-center">
                                <div className="text-sm font-semibold text-base-content/60">
                                    Seamless Data Flow
                                </div>
                            </div>
                        </div>

                        {/* Right column - Candidates */}
                        <div className="platform-card bg-secondary text-secondary-content rounded-2xl p-6 shadow-xl opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="fa-duotone fa-regular fa-user text-2xl"></i>
                                <div>
                                    <div className="font-bold">Candidates</div>
                                    <div className="text-xs opacity-70">
                                        Applicant Network
                                    </div>
                                </div>
                            </div>
                            <ul className="text-sm space-y-2 opacity-90">
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                    Apply to jobs
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                    Get matched
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                    Track progress
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
