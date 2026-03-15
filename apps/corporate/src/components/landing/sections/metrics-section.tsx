"use client";

import { useRef } from "react";
import { useScrollReveal, useAnimatedCounter } from "@splits-network/basel-ui";

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

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
    const counterRef = useAnimatedCounter(metric.value, {
        suffix: metric.suffix,
    });

    return (
        <div className="scroll-reveal fade-up metric-card bg-base-100/5 border border-base-100/10 rounded-2xl p-8 text-center">
            <div
                className={`scroll-reveal scale-in metric-icon w-16 h-16 rounded-full bg-${metric.color}/20 flex items-center justify-center mx-auto mb-6`}
            >
                <i
                    className={`${metric.icon} text-2xl text-${metric.color}`}
                ></i>
            </div>
            <span
                ref={counterRef}
                className={`metric-value block text-4xl md:text-5xl font-bold text-${metric.color} mb-2`}
            >
                0{metric.suffix}
            </span>
            <div className="font-semibold text-lg mb-1">{metric.label}</div>
            <div className="text-sm opacity-60">{metric.description}</div>
        </div>
    );
}

export function MetricsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-300 text-base-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto">
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

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto stagger-children">
                    {metrics.map((metric, index) => (
                        <MetricCard key={index} metric={metric} />
                    ))}
                </div>
            </div>
        </section>
    );
}
