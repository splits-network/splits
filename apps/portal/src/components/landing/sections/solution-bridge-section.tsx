"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const promises = [
    {
        icon: "fa-duotone fa-regular fa-grid-2",
        title: "One platform",
        description: "All your split deals in one place",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Transparent terms",
        description: "Everyone sees the same numbers",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Real-time visibility",
        description: "Know where every candidate stands",
    },
];

export function SolutionBridgeSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section ref={sectionRef} className="py-24 bg-base-100">
            <div className="container mx-auto px-4 text-center">
                {/* Main headline */}
                <h2 className="scroll-reveal fade-up text-4xl md:text-5xl lg:text-6xl font-bold mb-16">
                    What if split placements
                    <br />
                    <span className="text-secondary">just worked?</span>
                </h2>

                {/* Three promises */}
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto stagger-children-loose">
                    {promises.map((promise, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up"
                        >
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                                <i
                                    className={`${promise.icon} text-2xl text-secondary`}
                                ></i>
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {promise.title}
                            </h3>
                            <p className="text-base-content/70">
                                {promise.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
