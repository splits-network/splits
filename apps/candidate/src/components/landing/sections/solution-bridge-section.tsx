"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const promises = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "A recruiter in your corner",
        text: "Someone who knows your industry and actually advocates for you",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real communication",
        text: "Status updates, feedback, and responses—not radio silence",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated opportunities",
        text: "Roles that match your skills and goals, not keyword spam",
    },
];

export function SolutionBridgeSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-100 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-wider text-secondary mb-3">
                        There&apos;s a Better Way
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        What if your job search had{" "}
                        <span className="text-secondary">backup?</span>
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Imagine having an expert recruiter working alongside
                        you—opening doors, prepping you for interviews, and
                        making sure you never get ghosted again.
                    </p>
                </div>

                <div className="stagger-children grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {promises.map((promise, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up text-center p-8 bg-base-200 rounded-2xl"
                        >
                            <div className="scroll-reveal pop-in w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                                <i
                                    className={`${promise.icon} text-2xl text-secondary`}
                                ></i>
                            </div>
                            <h3 className="font-bold text-xl mb-3">
                                {promise.title}
                            </h3>
                            <p className="text-base-content/70">
                                {promise.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
