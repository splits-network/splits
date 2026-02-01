"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const pillars = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Transparent Partnerships",
        text: "Clear terms, visible pipelines, and honest communication between all parties.",
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Connected Ecosystem",
        text: "Recruiters, companies, and candidates all on platforms designed to work together.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Modern Technology",
        text: "Real-time updates, automated workflows, and tools that save everyone time.",
    },
];

export function SolutionSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const pillarsRef = useRef<HTMLDivElement>(null);

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

            // Pillars stagger in
            const cards = pillarsRef.current?.querySelectorAll(".pillar-card");
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: stagger.loose,
                        scrollTrigger: {
                            trigger: pillarsRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }

            // Icons pop in
            const icons = pillarsRef.current?.querySelectorAll(".pillar-icon");
            if (icons) {
                gsap.fromTo(
                    icons,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        stagger: stagger.loose,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: pillarsRef.current,
                            start: "top 80%",
                        },
                    },
                );
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
                        Our Approach
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Building a{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            better ecosystem
                        </span>
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Employment Networks creates platforms where transparency,
                        technology, and trust work together to make recruiting
                        work for everyone.
                    </p>
                </div>

                <div
                    ref={pillarsRef}
                    className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                >
                    {pillars.map((pillar, index) => (
                        <div
                            key={index}
                            className="pillar-card text-center p-8 bg-base-200 rounded-2xl opacity-0"
                        >
                            <div className="pillar-icon w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
                                <i
                                    className={`${pillar.icon} text-3xl text-primary`}
                                ></i>
                            </div>
                            <h3 className="font-bold text-xl mb-3">
                                {pillar.title}
                            </h3>
                            <p className="text-base-content/70">{pillar.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
