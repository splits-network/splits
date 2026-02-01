"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const metrics = [
    {
        value: 10000,
        suffix: "+",
        label: "Active Job Listings",
        description: "Across both platforms",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "primary",
    },
    {
        value: 2000,
        suffix: "+",
        label: "Recruiters",
        description: "In the Splits Network",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "primary",
    },
    {
        value: 500,
        suffix: "+",
        label: "Companies",
        description: "Hiring on the platform",
        icon: "fa-duotone fa-regular fa-building",
        color: "accent",
    },
    {
        value: 95,
        suffix: "%",
        label: "Response Rate",
        description: "Within 48 hours",
        icon: "fa-duotone fa-regular fa-comments",
        color: "secondary",
    },
];

export function MetricsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const metricsRef = useRef<HTMLDivElement>(null);

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

            // Metric cards stagger in
            const cards = metricsRef.current?.querySelectorAll(".metric-card");
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: stagger.normal,
                        scrollTrigger: {
                            trigger: metricsRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }

            // Counter animations
            const valueElements =
                metricsRef.current?.querySelectorAll(".metric-value");
            if (valueElements) {
                valueElements.forEach((el, index) => {
                    const target = metrics[index].value;
                    const suffix = metrics[index].suffix;

                    gsap.fromTo(
                        { value: 0 },
                        { value: target },
                        {
                            duration: duration.counter,
                            ease: easing.smooth,
                            delay: 0.3 + index * stagger.normal,
                            scrollTrigger: {
                                trigger: metricsRef.current,
                                start: "top 80%",
                            },
                            onUpdate: function () {
                                const current = Math.floor(
                                    this.targets()[0].value,
                                );
                                if (target >= 1000) {
                                    el.textContent =
                                        current.toLocaleString() + suffix;
                                } else {
                                    el.textContent = current + suffix;
                                }
                            },
                        },
                    );
                });
            }

            // Icons pop
            const icons = metricsRef.current?.querySelectorAll(".metric-icon");
            if (icons) {
                gsap.fromTo(
                    icons,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        stagger: stagger.normal,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: metricsRef.current,
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
            className="py-24 bg-neutral text-neutral-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    ref={headingRef}
                    className="text-center mb-16 opacity-0 max-w-3xl mx-auto"
                >
                    <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                        By The Numbers
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        A Growing Ecosystem
                    </h2>
                    <p className="text-lg opacity-70">
                        Thousands of recruiters, companies, and candidates
                        building transparent partnerships
                    </p>
                </div>

                <div
                    ref={metricsRef}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
                >
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="metric-card bg-base-100/5 border border-base-100/10 rounded-2xl p-8 text-center opacity-0"
                        >
                            <div
                                className={`metric-icon w-16 h-16 rounded-full bg-${metric.color}/20 flex items-center justify-center mx-auto mb-6`}
                            >
                                <i
                                    className={`${metric.icon} text-2xl text-${metric.color}`}
                                ></i>
                            </div>
                            <div
                                className={`metric-value text-4xl md:text-5xl font-bold text-${metric.color} mb-2`}
                            >
                                0{metric.suffix}
                            </div>
                            <div className="font-semibold text-lg mb-1">
                                {metric.label}
                            </div>
                            <div className="text-sm opacity-60">
                                {metric.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
