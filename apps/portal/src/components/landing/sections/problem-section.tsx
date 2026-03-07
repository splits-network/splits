"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

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

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-neutral text-neutral-content"
        >
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div className="scroll-reveal fade-up text-center mb-16">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto stagger-children">
                    {painPoints.map((point, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up pain-card card bg-base-100/10 border border-base-100/20 backdrop-blur-sm"
                        >
                            <div className="card-body text-center">
                                <div className="mb-4">
                                    <i
                                        className={`${point.icon} text-4xl`}
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
