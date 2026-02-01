"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        text: "Access curated roles that match your expertise—no cold outreach needed",
    },
    {
        icon: "fa-duotone fa-regular fa-sliders",
        text: "Work only the roles that fit your niche. You choose what you take on.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        text: "Track every candidate and submission in one clean pipeline",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        text: "See exactly what you'll earn on each placement. No mystery math.",
    },
];

const features = [
    { label: "Split-fee marketplace", icon: "fa-duotone fa-regular fa-handshake" },
    { label: "Built-in ATS", icon: "fa-duotone fa-regular fa-table-columns" },
    { label: "Placement tracking", icon: "fa-duotone fa-regular fa-chart-line-up" },
    { label: "Team collaboration", icon: "fa-duotone fa-regular fa-users" },
];

export function ForRecruitersSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

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
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                    },
                },
            );

            // Benefits list stagger
            const benefitItems =
                benefitsRef.current?.querySelectorAll(".benefit-item");
            if (benefitItems) {
                gsap.fromTo(
                    benefitItems,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        scrollTrigger: {
                            trigger: benefitsRef.current,
                            start: "top 75%",
                        },
                    },
                );

                const icons =
                    benefitsRef.current?.querySelectorAll(".benefit-icon");
                if (icons) {
                    gsap.fromTo(
                        icons,
                        { scale: 0 },
                        {
                            scale: 1,
                            duration: duration.fast,
                            ease: easing.bounce,
                            stagger: stagger.tight,
                            delay: 0.1,
                            scrollTrigger: {
                                trigger: benefitsRef.current,
                                start: "top 75%",
                            },
                        },
                    );
                }
            }

            // Features badges
            const featureBadges =
                featuresRef.current?.querySelectorAll(".feature-badge");
            if (featureBadges) {
                gsap.fromTo(
                    featureBadges,
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        stagger: stagger.tight,
                        scrollTrigger: {
                            trigger: featuresRef.current,
                            start: "top 85%",
                        },
                    },
                );
            }

            // CTA button
            gsap.fromTo(
                ctaRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 85%",
                    },
                },
            );
        },
        { scope: sectionRef },
    );

    return (
        <section
            ref={sectionRef}
            id="for-recruiters"
            className="py-24 bg-primary text-primary-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                    {/* Content */}
                    <div>
                        <div ref={headingRef} className="opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/splits.png"
                                    alt="Splits Network"
                                    className="h-8"
                                />
                                <span className="badge badge-outline">
                                    For Recruiters
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Turn your network into
                                <br />
                                <span className="opacity-90">
                                    recurring revenue
                                </span>
                            </h2>
                            <p className="text-lg opacity-80 mb-8">
                                Join a collaborative marketplace where split-fee
                                recruiting actually works. Stop chasing roles—let
                                opportunities come to you.
                            </p>
                        </div>

                        <div ref={benefitsRef} className="space-y-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="benefit-item flex items-start gap-4 opacity-0"
                                >
                                    <div className="benefit-icon w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <i
                                            className={`${benefit.icon} text-sm`}
                                        ></i>
                                    </div>
                                    <p className="opacity-90 leading-relaxed">
                                        {benefit.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div
                            ref={featuresRef}
                            className="flex flex-wrap gap-2 mb-8"
                        >
                            {features.map((feature, index) => (
                                <span
                                    key={index}
                                    className="feature-badge badge badge-lg bg-white/10 border-white/20 gap-2 opacity-0"
                                >
                                    <i className={`${feature.icon} text-xs`}></i>
                                    {feature.label}
                                </span>
                            ))}
                        </div>

                        <div ref={ctaRef} className="opacity-0">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Join Splits Network
                            </a>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                        Your Dashboard
                                    </div>
                                    <div className="font-bold text-lg">
                                        Active Roles
                                    </div>
                                </div>
                                <div className="badge badge-primary">3 roles</div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {[
                                    {
                                        title: "Senior Software Engineer",
                                        company: "TechCorp",
                                        status: "Active",
                                        color: "badge-primary",
                                    },
                                    {
                                        title: "Product Manager",
                                        company: "StartupXYZ",
                                        status: "Interviewing",
                                        color: "badge-info",
                                    },
                                    {
                                        title: "UX Designer",
                                        company: "DesignCo",
                                        status: "Offer Stage",
                                        color: "badge-success",
                                    },
                                ].map((role, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">
                                                {role.title}
                                            </div>
                                            <div className="text-xs text-base-content/60">
                                                {role.company}
                                            </div>
                                        </div>
                                        <span
                                            className={`badge ${role.color} badge-sm`}
                                        >
                                            {role.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                            This Month
                                        </div>
                                        <div className="text-3xl font-bold text-primary">
                                            $12,450
                                        </div>
                                        <div className="text-xs text-base-content/60 mt-1">
                                            from 3 placements
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-chart-line-up text-2xl text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
