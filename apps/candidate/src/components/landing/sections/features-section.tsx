"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const features = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Expert Recruiter Network",
        description:
            "Get matched with specialized recruiters who know your industry and genuinely advocate for your success.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "One-Click Apply",
        description:
            "Apply to multiple jobs instantly with your saved profile—no more copying and pasting the same info.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Updates",
        description:
            "Track your application status and get instant notifications. No more wondering where you stand.",
        color: "accent",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Privacy First",
        description:
            "Your information is secure and only shared with companies you approve. You control your data.",
        color: "success",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Career Insights",
        description:
            "Access salary data, market trends, and personalized recommendations to make informed decisions.",
        color: "warning",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Interview Prep",
        description:
            "Get coaching and resources from your recruiter to ace interviews with confidence.",
        color: "info",
    },
];

export function FeaturesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-100 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-wider text-primary mb-3">
                        Platform Features
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Why Candidates Love Us
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Tools and support designed to accelerate your job search
                        and land you the right role
                    </p>
                </div>

                <div className="stagger-children grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up bg-base-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-base-300 hover:-translate-y-2 hover:shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110`}
                                >
                                    <i
                                        className={`${feature.icon} text-2xl text-${feature.color}`}
                                    ></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-base-content/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
