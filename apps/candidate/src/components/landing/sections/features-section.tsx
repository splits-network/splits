"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

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
    const headingRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

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

            // Feature cards stagger in
            const cards = cardsRef.current?.querySelectorAll(".feature-card");
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: "top 80%",
                        },
                    },
                );

                // Icons pop in after cards
                const icons = cardsRef.current?.querySelectorAll(".feature-icon");
                if (icons) {
                    gsap.fromTo(
                        icons,
                        { scale: 0, rotation: -15 },
                        {
                            scale: 1,
                            rotation: 0,
                            duration: duration.fast,
                            ease: easing.bounce,
                            stagger: stagger.tight,
                            delay: 0.15,
                            scrollTrigger: {
                                trigger: cardsRef.current,
                                start: "top 80%",
                            },
                        },
                    );
                }
            }
        },
        { scope: sectionRef },
    );

    // Hover animations
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            y: -8,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            duration: duration.fast,
            ease: easing.smooth,
        });
        const icon = e.currentTarget.querySelector(".feature-icon");
        if (icon) {
            gsap.to(icon, {
                scale: 1.1,
                rotation: 5,
                duration: duration.fast,
                ease: easing.bounce,
            });
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            y: 0,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            duration: duration.fast,
            ease: easing.smooth,
        });
        const icon = e.currentTarget.querySelector(".feature-icon");
        if (icon) {
            gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: duration.fast,
                ease: easing.smooth,
            });
        }
    };

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-100 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    ref={headingRef}
                    className="text-center mb-16 opacity-0 max-w-3xl mx-auto"
                >
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

                <div
                    ref={cardsRef}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card bg-base-200 rounded-2xl p-6 opacity-0 cursor-pointer transition-colors hover:bg-base-300"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`feature-icon w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}
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
