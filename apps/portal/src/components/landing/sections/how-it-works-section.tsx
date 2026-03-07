"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const recruiterSteps = [
    {
        number: 1,
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Join the network",
        description:
            "Sign up, set your specialties, and browse roles that match your expertise.",
    },
    {
        number: 2,
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit candidates",
        description:
            "Found the right fit? Submit them directly into the hiring pipeline.",
    },
    {
        number: 3,
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Get paid your split",
        description:
            "Candidate hired? You receive your share. Tracked transparently.",
    },
];

const companySteps = [
    {
        number: 1,
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Post your roles",
        description:
            "List positions with clear requirements, fees, and timelines.",
    },
    {
        number: 2,
        icon: "fa-duotone fa-regular fa-users",
        title: "Tap the network",
        description:
            "Specialized recruiters see your roles and start sourcing candidates.",
    },
    {
        number: 3,
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Pay only on hire",
        description:
            "No retainers. Pay the agreed split only when someone starts.",
    },
];

interface TimelineStepProps {
    number: number;
    icon: string;
    title: string;
    description: string;
    color: "primary" | "secondary";
    isLast: boolean;
    align: "left" | "right";
}

function TimelineStep({
    number,
    icon,
    title,
    description,
    color,
    isLast,
    align,
}: TimelineStepProps) {
    const colorClasses = {
        primary: {
            bg: "bg-primary",
            text: "text-primary",
            line: "bg-primary/30",
            glow: "shadow-primary/20",
        },
        secondary: {
            bg: "bg-secondary",
            text: "text-secondary",
            line: "bg-secondary/30",
            glow: "shadow-secondary/20",
        },
    };

    const colors = colorClasses[color];

    return (
        <div
            className={`scroll-reveal fade-up relative flex items-start gap-6 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
        >
            {/* Timeline node and line */}
            <div className="flex flex-col items-center">
                {/* Number circle */}
                <div
                    className={`relative  w-16 h-16 rounded-full ${colors.bg} text-white flex items-center justify-center shadow-lg ${colors.glow} shadow-xl`}
                >
                    <span className="text-2xl font-bold">{number}</span>
                </div>
                {/* Connecting line */}
                {!isLast && (
                    <div
                        className={`w-0.5 h-24 ${colors.line} mt-2`}
                    ></div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-2 pb-8">
                <div
                    className={`inline-flex items-center gap-2 mb-2 ${colors.text}`}
                >
                    <i className={`${icon} text-xl`}></i>
                    <h4 className="font-bold text-xl text-base-content">
                        {title}
                    </h4>
                </div>
                <p className="text-base-content/70 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

export function HowItWorksSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            id="how-it-works"
            className="py-24 bg-base-200 text-base-content overflow-hidden relative"
        >
            {/* Background Pattern - Converging Paths */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg
                    className="absolute w-full h-full"
                    viewBox="0 0 1200 800"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Left path (primary color) */}
                    <path
                        d="M0 100 Q300 200 400 400 T600 700"
                        fill="none"
                        stroke="oklch(var(--color-primary))"
                        strokeWidth="2"
                        strokeOpacity="0.08"
                    />
                    <path
                        d="M-50 200 Q250 300 350 450 T550 750"
                        fill="none"
                        stroke="oklch(var(--color-primary))"
                        strokeWidth="1.5"
                        strokeOpacity="0.05"
                    />

                    {/* Right path (secondary color) */}
                    <path
                        d="M1200 100 Q900 200 800 400 T600 700"
                        fill="none"
                        stroke="oklch(var(--color-secondary))"
                        strokeWidth="2"
                        strokeOpacity="0.08"
                    />
                    <path
                        d="M1250 200 Q950 300 850 450 T650 750"
                        fill="none"
                        stroke="oklch(var(--color-secondary))"
                        strokeWidth="1.5"
                        strokeOpacity="0.05"
                    />

                    {/* Subtle grid dots */}
                    <pattern
                        id="dotPattern"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="20"
                            cy="20"
                            r="1"
                            fill="currentColor"
                            fillOpacity="0.05"
                        />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dotPattern)" />

                    {/* Convergence point glow */}
                    <circle
                        cx="600"
                        cy="700"
                        r="100"
                        fill="url(#convergenceGlow)"
                    />
                    <defs>
                        <radialGradient
                            id="convergenceGlow"
                            cx="50%"
                            cy="50%"
                            r="50%"
                        >
                            <stop
                                offset="0%"
                                stopColor="oklch(var(--color-primary))"
                                stopOpacity="0.1"
                            />
                            <stop
                                offset="100%"
                                stopColor="oklch(var(--color-primary))"
                                stopOpacity="0"
                            />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative ">
                {/* Heading */}
                <div className="scroll-reveal fade-up text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Two paths, one platform
                    </h2>
                    <p className="text-lg opacity-70 max-w-2xl mx-auto">
                        Whether you're sourcing candidates or hiring them, the
                        journey is simple.
                    </p>
                </div>

                {/* Dual Timeline */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto mb-16">
                    {/* Recruiter Timeline */}
                    <div>
                        <div className="scroll-reveal fade-up flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>
                            </div>
                            <h3 className="text-2xl font-bold">
                                For Recruiters
                            </h3>
                        </div>
                        <div className="pl-2 stagger-children-loose">
                            {recruiterSteps.map((step, index) => (
                                <TimelineStep
                                    key={step.number}
                                    {...step}
                                    color="primary"
                                    isLast={index === recruiterSteps.length - 1}
                                    align="left"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Company Timeline */}
                    <div>
                        <div className="scroll-reveal fade-up flex items-center gap-3 mb-10 lg:justify-end">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-secondary"></i>
                            </div>
                            <h3 className="text-2xl font-bold">
                                For Companies
                            </h3>
                        </div>
                        <div className="lg:pr-2 stagger-children-loose">
                            {companySteps.map((step, index) => (
                                <TimelineStep
                                    key={step.number}
                                    {...step}
                                    color="secondary"
                                    isLast={index === companySteps.length - 1}
                                    align="left"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Convergence Point */}
                <div className="scroll-reveal scale-in text-center">
                    <div className="inline-flex items-center gap-4 px-8 py-6 rounded-2xl bg-base-100 shadow-lg border border-base-300">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <i className="fa-duotone fa-regular fa-user-tie text-white text-lg"></i>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <i className="fa-duotone fa-regular fa-arrows-to-circle text-2xl text-base-content/40"></i>
                            <span className="text-sm font-medium text-base-content/70">
                                Successful placement
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-md">
                            <i className="fa-duotone fa-regular fa-building text-white text-lg"></i>
                        </div>
                    </div>
                    <p className="mt-6 text-base-content/50 text-sm">
                        Both paths lead to the same destination: a hire that
                        works for everyone.
                    </p>
                </div>
            </div>
        </section>
    );
}
