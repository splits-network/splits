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
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        text: "Tap into a network of specialized recruiters—no individual contracts",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        text: "Full visibility into every pipeline. See who's working your roles.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Set fees and terms once. They apply to every recruiter consistently.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        text: "Pay only when someone starts. No retainers, no surprises.",
    },
];

const features = [
    { label: "Recruiter network", icon: "fa-duotone fa-regular fa-network-wired" },
    { label: "Pipeline visibility", icon: "fa-duotone fa-regular fa-eye" },
    { label: "Consistent terms", icon: "fa-duotone fa-regular fa-handshake" },
    { label: "Pay on hire", icon: "fa-duotone fa-regular fa-badge-check" },
];

export function ForCompaniesSection() {
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
            id="for-companies"
            className="py-24 bg-base-200 overflow-hidden"
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
                                <span className="badge badge-accent">
                                    For Companies
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                A network of recruiters,
                                <br />
                                <span className="text-accent">
                                    one simple platform
                                </span>
                            </h2>
                            <p className="text-lg text-base-content/70 mb-8">
                                Stop managing dozens of contracts. Get qualified
                                candidates from vetted recruiters with complete
                                transparency.
                            </p>
                        </div>

                        <div ref={benefitsRef} className="space-y-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="benefit-item flex items-start gap-4 opacity-0"
                                >
                                    <div className="benefit-icon w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <i
                                            className={`${benefit.icon} text-sm text-accent`}
                                        ></i>
                                    </div>
                                    <p className="text-base-content/80 leading-relaxed">
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
                                    className="feature-badge badge badge-lg bg-accent/10 border-accent/20 text-accent gap-2 opacity-0"
                                >
                                    <i className={`${feature.icon} text-xs`}></i>
                                    {feature.label}
                                </span>
                            ))}
                        </div>

                        <div ref={ctaRef} className="opacity-0">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-lg btn-accent shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post a Role
                            </a>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <div className="bg-base-100 rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                        Company Dashboard
                                    </div>
                                    <div className="font-bold text-lg">
                                        Your Open Roles
                                    </div>
                                </div>
                                <div className="badge badge-accent">3 active</div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {[
                                    {
                                        title: "Backend Engineer",
                                        location: "San Francisco, CA",
                                        candidates: 5,
                                        recruiters: 3,
                                    },
                                    {
                                        title: "Sales Director",
                                        location: "Remote",
                                        candidates: 2,
                                        recruiters: 2,
                                    },
                                    {
                                        title: "Product Manager",
                                        location: "New York, NY",
                                        candidates: 8,
                                        recruiters: 4,
                                    },
                                ].map((role, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-base-200 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {role.title}
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    {role.location}
                                                </div>
                                            </div>
                                            <span className="badge badge-success badge-sm">
                                                {role.candidates} candidates
                                            </span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="badge badge-ghost badge-sm">
                                                {role.recruiters} recruiters
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                            Total Candidates
                                        </div>
                                        <div className="text-3xl font-bold text-accent">
                                            15
                                        </div>
                                        <div className="text-xs text-base-content/60 mt-1">
                                            across 3 active roles
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-users text-2xl text-accent"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
