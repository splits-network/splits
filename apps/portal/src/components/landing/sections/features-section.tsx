"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const features = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-first by design",
        description:
            "Built for split placements from day one, not retrofitted onto a traditional ATS.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "Built-in ATS",
        description:
            "Jobs, candidates, stages, and notes all in one place. No integrations needed.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Real-time pipelines",
        description:
            "Everyone sees where each candidate stands in the process, instantly.",
        color: "accent",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Transparent fee splits",
        description:
            "Clear view of fee percentage, recruiter share, and platform share. No mystery math.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiter network",
        description:
            "Assign roles to recruiters and control who sees which opportunities.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Smart notifications",
        description:
            "Email alerts for key events: new submissions, stage changes, and placements.",
        color: "accent",
    },
];

const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
};

export function FeaturesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section ref={sectionRef} className="py-24 bg-base-200">
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div className="scroll-reveal fade-up text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Everything you need
                    </h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        A complete platform for managing split placements, from
                        first submission to final payout.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto stagger-children">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up feature-card card bg-base-100 shadow cursor-default hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="card-body">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`feature-icon w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                                    >
                                        <i
                                            className={`${feature.icon} text-xl`}
                                        ></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-base-content/70 text-sm">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
