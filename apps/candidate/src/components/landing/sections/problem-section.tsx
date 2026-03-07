"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-circle-xmark text-secondary",
        icon_bg: "bg-secondary/20",
        title: "Application Black Holes",
        text: "You send applications into the void. No response, no feedback, just silence.",
    },
    {
        icon: "fa-duotone fa-regular fa-ghost text-error",
        icon_bg: "bg-error/20",
        title: "Ghosted by Recruiters",
        text: "Phone screens go well, then nothing. You're left wondering if you said something wrong.",
    },
    {
        icon: "fa-duotone fa-regular fa-shuffle text-info",
        icon_bg: "bg-info/20",
        title: "Endless Job Board Scrolling",
        text: "Hours spent on Indeed, LinkedIn, Glassdoor—duplicates everywhere, outdated listings.",
    },
    {
        icon: "fa-duotone fa-regular fa-question text-warning",
        icon_bg: "bg-warning/20",
        title: "No Salary Transparency",
        text: "You invest time interviewing only to discover the pay is half your expectations.",
    },
];

export function ProblemSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-neutral text-neutral-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                        Sound Familiar?
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Job searching shouldn&apos;t feel like&nbsp;
                        <span className="text-error">this:</span>
                    </h2>
                    <p className="text-lg opacity-70">
                        You&apos;re qualified, motivated, and ready—but the
                        traditional job search feels like shouting into a void.
                    </p>
                </div>

                <div className="stagger-children grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {painPoints.map((point, index) => (
                        <div
                            key={index}
                            className="scroll-reveal slide-from-left flex items-start gap-4 p-6 bg-base-100/5 rounded-xl border border-base-100/10"
                        >
                            <div
                                className={`scroll-reveal pop-in w-12 h-12 rounded-full ${point.icon_bg} flex items-center justify-center flex-shrink-0`}
                            >
                                <i className={`${point.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">
                                    {point.title}
                                </h3>
                                <p className="text-sm opacity-70">
                                    {point.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
