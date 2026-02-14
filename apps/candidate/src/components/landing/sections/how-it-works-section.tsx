"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const steps = [
    {
        number: "1",
        icon: "fa-duotone fa-regular fa-user-circle",
        title: "Create Your Profile",
        description:
            "Build a profile that showcases your skills, experience, and what you're looking for. Upload your resume to get started in minutes.",
        color: "primary",
    },
    {
        number: "2",
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Browse & Apply",
        description:
            "Explore curated opportunities from top companies. Apply with one click and get matched with recruiters who specialize in your field.",
        color: "secondary",
    },
    {
        number: "3",
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Get Expert Support",
        description:
            "Your recruiter preps you for interviews, negotiates on your behalf, and keeps you updated every step of the way.",
        color: "accent",
    },
    {
        number: "4",
        icon: "fa-duotone fa-regular fa-rocket",
        title: "Land Your Dream Job",
        description:
            "Accept an offer you're excited about and start your new role with confidence. That's it—no ghosting, no guessing.",
        color: "success",
    },
];

export function HowItWorksSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<SVGPathElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Heading animation
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    },
                },
            );

            // Timeline line draws itself
            if (lineRef.current) {
                const lineLength = lineRef.current.getTotalLength();
                gsap.set(lineRef.current, {
                    strokeDasharray: lineLength,
                    strokeDashoffset: lineLength,
                });
                gsap.to(lineRef.current, {
                    strokeDashoffset: 0,
                    duration: duration.counter,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: timelineRef.current,
                        start: "top 70%",
                    },
                });
            }

            // Step cards stagger in
            const stepCards =
                timelineRef.current?.querySelectorAll(".step-card");
            if (stepCards) {
                gsap.fromTo(
                    stepCards,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.loose,
                        scrollTrigger: {
                            trigger: timelineRef.current,
                            start: "top 70%",
                        },
                    },
                );
            }

            // Number badges pop in
            const badges = timelineRef.current?.querySelectorAll(".step-badge");
            if (badges) {
                gsap.fromTo(
                    badges,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        stagger: stagger.loose,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: timelineRef.current,
                            start: "top 70%",
                        },
                    },
                );
            }
        },
        { scope: sectionRef },
    );

    return (
        <section
            ref={sectionRef}
            id="how-it-works"
            className="py-24 bg-base-200 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    ref={headingRef}
                    className="text-center mb-16 opacity-0 max-w-3xl mx-auto"
                >
                    <p className="text-sm uppercase tracking-wider text-primary mb-3">
                        How It Works
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Your Path to Success
                    </h2>
                    <p className="text-lg text-base-content/70">
                        From profile to placement—here's how we help you land
                        your next role
                    </p>
                </div>

                <div
                    ref={timelineRef}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* SVG Timeline Line (desktop only) */}
                    <svg
                        className="absolute left-8 top-0 h-full hidden md:block"
                        width="4"
                        viewBox="0 0 4 100"
                        preserveAspectRatio="none"
                        style={{ overflow: "visible" }}
                    >
                        <path
                            ref={lineRef}
                            d="M2,0 L2,100"
                            stroke="url(#timelineGradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient
                                id="timelineGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#233876" />
                                <stop offset="50%" stopColor="#0f9d8a" />
                                <stop offset="100%" stopColor="#36d399" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Steps */}
                    <div className="space-y-8 md:space-y-12">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="step-card relative flex items-start gap-6 md:gap-8 opacity-0"
                            >
                                {/* Step Badge */}
                                <div
                                    className={`step-badge relative z-10 w-16 h-16 rounded-full bg-${step.color} text-${step.color}-content flex items-center justify-center flex-shrink-0 shadow-lg`}
                                >
                                    <span className="text-2xl font-bold">
                                        {step.number}
                                    </span>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 bg-base-100 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-${step.color}/10 flex items-center justify-center flex-shrink-0`}
                                        >
                                            <i
                                                className={`${step.icon} text-xl text-${step.color}`}
                                            ></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-base-content/70">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
