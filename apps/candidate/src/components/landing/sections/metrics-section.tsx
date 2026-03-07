"use client";

import { useRef } from "react";
import { useScrollReveal, useAnimatedCounter } from "@splits-network/basel-ui";

const metrics = [
    {
        value: 10000,
        suffix: "+",
        label: "Active Job Listings",
        description: "New roles added daily from top companies",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "primary",
    },
    {
        value: 500,
        suffix: "+",
        label: "Companies Hiring",
        description: "From startups to Fortune 500",
        icon: "fa-duotone fa-regular fa-building",
        color: "secondary",
    },
    {
        value: 2000,
        suffix: "+",
        label: "Expert Recruiters",
        description: "Specialized across every industry",
        icon: "fa-duotone fa-regular fa-users",
        color: "accent",
    },
    {
        value: 95,
        suffix: "%",
        label: "Response Rate",
        description: "Candidates hear back within 48 hours",
        icon: "fa-duotone fa-regular fa-comments",
        color: "success",
    },
];

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
    const counterRef = useAnimatedCounter(metric.value, {
        suffix: metric.suffix,
    });

    return (
        <div className="scroll-reveal scale-in bg-base-100 rounded-2xl p-8 text-center shadow-sm">
            <div
                className={`scroll-reveal pop-in w-16 h-16 rounded-full bg-${metric.color}/10 flex items-center justify-center mx-auto mb-6`}
            >
                <i
                    className={`${metric.icon} text-2xl text-${metric.color}`}
                ></i>
            </div>
            <span
                ref={counterRef}
                className={`block text-4xl md:text-5xl font-bold text-${metric.color} mb-2`}
            >
                0{metric.suffix}
            </span>
            <div className="font-semibold text-lg mb-1">
                {metric.label}
            </div>
            <div className="text-sm text-base-content/60">
                {metric.description}
            </div>
        </div>
    );
}

export function MetricsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-200 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-wider text-secondary mb-3">
                        By The Numbers
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        A Growing Network
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Join thousands of candidates finding their next
                        opportunity through expert recruiters
                    </p>
                </div>

                <div className="stagger-children grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {metrics.map((metric, index) => (
                        <MetricCard key={index} metric={metric} />
                    ))}
                </div>
            </div>
        </section>
    );
}
