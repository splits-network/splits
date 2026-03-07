"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const metrics = [
    {
        value: "100%",
        label: "Fee transparency",
        description: "Every split is visible to all parties",
        icon: "fa-duotone fa-regular fa-eye",
    },
    {
        value: "Zero",
        label: "Hidden clawbacks",
        description: "No surprise deductions, ever",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        value: "Real-time",
        label: "Pipeline visibility",
        description: "Know where every candidate stands",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
    {
        value: "One",
        label: "Platform for everything",
        description: "No more spreadsheet chaos",
        icon: "fa-duotone fa-regular fa-grid-2",
    },
];

export function MetricsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-primary text-primary-content"
        >
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div className="scroll-reveal fade-up text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Built on transparency
                    </h2>
                    <p className="text-lg opacity-80 max-w-2xl mx-auto">
                        No mystery math. No surprise fees. Just clear terms that
                        everyone can see.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto stagger-children">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="scroll-reveal scale-in metric-card card bg-base-100 text-base-content shadow-lg"
                        >
                            <div className="card-body text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <i
                                        className={`${metric.icon} text-xl text-primary`}
                                    ></i>
                                </div>
                                <div className="text-4xl font-bold text-primary mb-1">
                                    {metric.value}
                                </div>
                                <div className="font-semibold text-lg">
                                    {metric.label}
                                </div>
                                <p className="text-sm text-base-content/60 mt-1">
                                    {metric.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
