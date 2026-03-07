"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

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

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-100 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto"
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
                    className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto stagger-children"
                >
                    {pillars.map((pillar, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up pillar-card text-center p-8 bg-base-200 rounded-2xl"
                        >
                            <div className="scroll-reveal scale-in pillar-icon w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
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
