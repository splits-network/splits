"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-table-cells text-secondary",
        title: "Spreadsheet chaos",
        description:
            "Tracking splits across Excel files, hoping nothing gets lost between versions.",
    },
    {
        icon: "fa-duotone fa-regular fa-envelopes-bulk text-accent",
        title: "Email black holes",
        description:
            "Where did that candidate submission go? Check 47 threads to find out.",
    },
    {
        icon: "fa-duotone fa-regular fa-calculator text-info",
        title: "Mystery math",
        description:
            "Fees that change, clawbacks that surprise, splits that never quite add up.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash text-warning",
        title: "Zero visibility",
        description:
            "Is anyone working this role? Did the candidate move forward? Who knows.",
    },
];

export function ProblemSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

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
                        start: "top 80%",
                    },
                },
            );

            // Cards stagger in with a subtle shake effect
            const cards = cardsRef.current?.querySelectorAll(".pain-card");
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: "top 75%",
                        },
                    },
                );

                // Subtle icon pulse on each card after it appears
                cards.forEach((card, index) => {
                    const icon = card.querySelector(".pain-icon");
                    if (icon) {
                        gsap.fromTo(
                            icon,
                            { scale: 1 },
                            {
                                scale: 1.1,
                                duration: 0.3,
                                ease: easing.bounce,
                                delay: 0.3 + index * stagger.normal,
                                scrollTrigger: {
                                    trigger: cardsRef.current,
                                    start: "top 75%",
                                },
                                onComplete: () => {
                                    gsap.to(icon, { scale: 1, duration: 0.2 });
                                },
                            },
                        );
                    }
                });
            }
        },
        { scope: sectionRef },
    );

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-neutral text-neutral-content"
        >
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div ref={headingRef} className="text-center mb-16 opacity-0">
                    <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                        Sound familiar?
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Split placements shouldn't be this hard
                    </h2>
                    <p className="text-lg opacity-70 max-w-2xl mx-auto">
                        Most recruiters and companies are still running split
                        deals the old way.
                    </p>
                </div>

                {/* Pain Point Cards */}
                <div
                    ref={cardsRef}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
                >
                    {painPoints.map((point, index) => (
                        <div
                            key={index}
                            className="pain-card card bg-base-100/10 border border-base-100/20 backdrop-blur-sm opacity-0"
                        >
                            <div className="card-body text-center">
                                <div className="mb-4">
                                    <i
                                        className={`pain-icon ${point.icon} text-4xl`}
                                    ></i>
                                </div>
                                <h3 className="card-title justify-center text-lg">
                                    {point.title}
                                </h3>
                                <p className="text-sm opacity-70">
                                    {point.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
