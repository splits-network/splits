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
        icon: "fa-duotone fa-regular fa-user-tie",
        text: "Get matched with specialized recruiters who actually advocate for you",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        text: "Real communication—status updates, feedback, and no ghosting",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        text: "Curated opportunities that match your skills and goals",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        text: "Your data stays private until you choose to share it",
    },
];

const features = [
    { label: "One-click apply", icon: "fa-duotone fa-regular fa-bolt" },
    { label: "Real-time tracking", icon: "fa-duotone fa-regular fa-chart-line" },
    { label: "Interview prep", icon: "fa-duotone fa-regular fa-graduation-cap" },
    { label: "100% free", icon: "fa-duotone fa-regular fa-badge-check" },
];

export function ForCandidatesSection() {
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

            // Heading animation - from right
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, x: 40 },
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

            // Benefits list stagger - from right
            const benefitItems =
                benefitsRef.current?.querySelectorAll(".benefit-item");
            if (benefitItems) {
                gsap.fromTo(
                    benefitItems,
                    { opacity: 0, x: 30 },
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
            id="for-candidates"
            className="py-24 bg-secondary text-secondary-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                    {/* Visual - on left for candidates */}
                    <div className="relative order-2 lg:order-1">
                        <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                        Your Applications
                                    </div>
                                    <div className="font-bold text-lg">
                                        Active Pipeline
                                    </div>
                                </div>
                                <div className="badge badge-secondary">
                                    5 active
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {[
                                    {
                                        title: "Senior Frontend Developer",
                                        company: "Acme Inc",
                                        status: "Interview Scheduled",
                                        color: "badge-success",
                                    },
                                    {
                                        title: "Full Stack Engineer",
                                        company: "TechStart",
                                        status: "Under Review",
                                        color: "badge-info",
                                    },
                                    {
                                        title: "React Developer",
                                        company: "BuildCo",
                                        status: "Recruiter Matched",
                                        color: "badge-primary",
                                    },
                                ].map((app, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">
                                                {app.title}
                                            </div>
                                            <div className="text-xs text-base-content/60">
                                                {app.company}
                                            </div>
                                        </div>
                                        <span
                                            className={`badge ${app.color} badge-sm`}
                                        >
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                            Your Recruiter
                                        </div>
                                        <div className="font-bold text-lg text-secondary">
                                            Sarah Chen
                                        </div>
                                        <div className="text-xs text-base-content/60 mt-1">
                                            Tech Recruiting Specialist
                                        </div>
                                    </div>
                                    <div className="avatar">
                                        <div className="w-14 h-14 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xl font-bold">
                                            SC
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content - on right for candidates */}
                    <div className="order-1 lg:order-2">
                        <div ref={headingRef} className="opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/applicant.png"
                                    alt="Applicant Network"
                                    className="h-8"
                                />
                                <span className="badge badge-outline">
                                    For Job Seekers
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Your job search,
                                <br />
                                <span className="opacity-90">with backup</span>
                            </h2>
                            <p className="text-lg opacity-80 mb-8">
                                Get matched with expert recruiters who open doors,
                                prep you for interviews, and make sure you never
                                get ghosted again.
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
                                href="https://applicant.network/sign-up"
                                className="btn btn-lg bg-white text-secondary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Free Profile
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
