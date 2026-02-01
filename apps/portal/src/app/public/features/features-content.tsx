"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
    fadeUp,
    scaleIn,
    popIn,
} from "@/components/landing/shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const coreFeatures = [
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "ATS Foundation",
        description: "Full applicant tracking system built for collaborative recruiting.",
        color: "primary",
        items: [
            "Role & job posting management",
            "Candidate profiles & resumes",
            "Application tracking & stages",
            "Notes & activity history",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Split Placement Engine",
        description: "Automatic fee calculation and transparent split tracking.",
        color: "secondary",
        items: [
            "Placement fee calculation",
            "Recruiter share tracking",
            "Platform fee transparency",
            "Placement history & reporting",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiter Network",
        description: "Connect with specialized recruiters across industries.",
        color: "accent",
        items: [
            "Role assignments by niche",
            "Recruiter profiles & stats",
            "Access control & permissions",
            "Performance tracking",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-crown",
        title: "Flexible Plans",
        description: "Subscription tiers that grow with your business.",
        color: "primary",
        items: [
            "Starter, Pro & Partner tiers",
            "Higher payouts on paid plans",
            "Priority access to roles",
            "Enhanced features per tier",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Smart Notifications",
        description: "Stay informed with real-time updates via email.",
        color: "secondary",
        items: [
            "New application alerts",
            "Stage change notifications",
            "Placement confirmations",
            "Customizable preferences",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Admin Console",
        description: "Comprehensive controls for platform administrators.",
        color: "accent",
        items: [
            "Recruiter approval workflow",
            "Company management",
            "Placement oversight",
            "Analytics & reporting",
        ],
    },
];

const recruiterFeatures = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Role Discovery",
        description:
            "Browse curated roles that match your specialties. No more hunting through job boards—opportunities come to you based on your expertise and tier.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-between-lines",
        title: "Candidate Management",
        description:
            "Submit candidates with ease. Track every submission through interview stages, and maintain full visibility into where each candidate stands.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Earnings Dashboard",
        description:
            "See exactly what you've earned, what's pending, and your placement history. No mystery math—just transparent fee calculations and clear splits.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Performance Insights",
        description:
            "Track your placement rate, average time to hire, and other key metrics to optimize your recruiting strategy and grow your business.",
    },
];

const companyFeatures = [
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Role Posting",
        description:
            "Post open positions with clear requirements, compensation, and fee structures. Control which recruiters have access to each role.",
    },
    {
        icon: "fa-duotone fa-regular fa-diagram-project",
        title: "Pipeline Visibility",
        description:
            "See all candidates across all external recruiters in one unified pipeline. No more scattered spreadsheets or email chains.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Recruiter Coordination",
        description:
            "Manage all your external recruiters from one platform. Set fees, track performance, and maintain consistent communication.",
    },
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Cost Management",
        description:
            "Track placement costs, analyze ROI by recruiter, and maintain transparency with standardized fee agreements.",
    },
];

const techFeatures = [
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Secure by Design",
        description:
            "Enterprise authentication, role-based access control, and encrypted data storage",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Lightning Fast",
        description:
            "Microservices architecture with optimized database queries for instant response times",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-spin",
        title: "Always Reliable",
        description:
            "99.9% uptime guarantee with automated backups and redundant systems",
    },
];

export function FeaturesContent() {
    const heroRef = useRef<HTMLElement>(null);
    const coreRef = useRef<HTMLElement>(null);
    const recruitersRef = useRef<HTMLElement>(null);
    const companiesRef = useRef<HTMLElement>(null);
    const techRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    // Hero animations
    useGSAP(
        () => {
            if (!heroRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = heroRef.current.querySelector(".hero-content");
            gsap.fromTo(
                content,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.hero,
                    ease: easing.smooth,
                }
            );
        },
        { scope: heroRef }
    );

    // Core Features animations
    useGSAP(
        () => {
            if (!coreRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = coreRef.current.querySelector(".section-heading");
            gsap.fromTo(heading, fadeUp.from, {
                ...fadeUp.to,
                scrollTrigger: {
                    trigger: coreRef.current,
                    start: "top 80%",
                },
            });

            // Cards stagger in
            const cards = coreRef.current.querySelectorAll(".feature-card");
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: duration.normal,
                    ease: easing.bounce,
                    stagger: stagger.tight,
                    scrollTrigger: {
                        trigger: coreRef.current,
                        start: "top 75%",
                    },
                }
            );

            // Icons pop in
            const icons = coreRef.current.querySelectorAll(".feature-icon");
            gsap.fromTo(icons, popIn.from, {
                ...popIn.to,
                stagger: stagger.tight,
                delay: 0.2,
                scrollTrigger: {
                    trigger: coreRef.current,
                    start: "top 75%",
                },
            });
        },
        { scope: coreRef }
    );

    // Recruiters section animations
    useGSAP(
        () => {
            if (!recruitersRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading
            const heading = recruitersRef.current.querySelector(".section-heading");
            gsap.fromTo(heading, fadeUp.from, {
                ...fadeUp.to,
                scrollTrigger: {
                    trigger: recruitersRef.current,
                    start: "top 80%",
                },
            });

            // Cards slide in from alternating sides
            const cards = recruitersRef.current.querySelectorAll(".recruiter-card");
            cards.forEach((card, index) => {
                const fromX = index % 2 === 0 ? -50 : 50;
                gsap.fromTo(
                    card,
                    { opacity: 0, x: fromX },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        delay: index * stagger.normal,
                        scrollTrigger: {
                            trigger: recruitersRef.current,
                            start: "top 75%",
                        },
                    }
                );
            });

            // Icons pop
            const icons = recruitersRef.current.querySelectorAll(".card-icon");
            gsap.fromTo(icons, popIn.from, {
                ...popIn.to,
                stagger: stagger.normal,
                delay: 0.3,
                scrollTrigger: {
                    trigger: recruitersRef.current,
                    start: "top 75%",
                },
            });
        },
        { scope: recruitersRef }
    );

    // Companies section animations
    useGSAP(
        () => {
            if (!companiesRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading
            const heading = companiesRef.current.querySelector(".section-heading");
            gsap.fromTo(heading, fadeUp.from, {
                ...fadeUp.to,
                scrollTrigger: {
                    trigger: companiesRef.current,
                    start: "top 80%",
                },
            });

            // Cards slide in from alternating sides (opposite direction from recruiters)
            const cards = companiesRef.current.querySelectorAll(".company-card");
            cards.forEach((card, index) => {
                const fromX = index % 2 === 0 ? 50 : -50;
                gsap.fromTo(
                    card,
                    { opacity: 0, x: fromX },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        delay: index * stagger.normal,
                        scrollTrigger: {
                            trigger: companiesRef.current,
                            start: "top 75%",
                        },
                    }
                );
            });

            // Icons pop
            const icons = companiesRef.current.querySelectorAll(".card-icon");
            gsap.fromTo(icons, popIn.from, {
                ...popIn.to,
                stagger: stagger.normal,
                delay: 0.3,
                scrollTrigger: {
                    trigger: companiesRef.current,
                    start: "top 75%",
                },
            });
        },
        { scope: companiesRef }
    );

    // Technical features animations
    useGSAP(
        () => {
            if (!techRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading
            const heading = techRef.current.querySelector(".section-heading");
            gsap.fromTo(heading, fadeUp.from, {
                ...fadeUp.to,
                scrollTrigger: {
                    trigger: techRef.current,
                    start: "top 80%",
                },
            });

            // Features scale in
            const features = techRef.current.querySelectorAll(".tech-feature");
            gsap.fromTo(features, scaleIn.from, {
                ...scaleIn.to,
                stagger: stagger.normal,
                scrollTrigger: {
                    trigger: techRef.current,
                    start: "top 75%",
                },
            });

            // Icons pop with spin
            const icons = techRef.current.querySelectorAll(".tech-icon");
            gsap.fromTo(
                icons,
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: duration.normal,
                    ease: easing.bounce,
                    stagger: stagger.normal,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: techRef.current,
                        start: "top 75%",
                    },
                }
            );
        },
        { scope: techRef }
    );

    // CTA animations
    useGSAP(
        () => {
            if (!ctaRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = ctaRef.current.querySelector(".cta-content");
            gsap.fromTo(
                content,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 80%",
                    },
                }
            );

            const buttons = ctaRef.current.querySelectorAll(".cta-btn");
            gsap.fromTo(
                buttons,
                { opacity: 0, y: 20, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: duration.normal,
                    ease: easing.bounce,
                    stagger: stagger.normal,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 80%",
                    },
                }
            );
        },
        { scope: ctaRef }
    );

    // Hover handlers for cards
    const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            y: -8,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            duration: 0.3,
            ease: "power2.out",
        });
        const icon = e.currentTarget.querySelector(".feature-icon, .card-icon");
        if (icon) {
            gsap.to(icon, {
                scale: 1.15,
                rotation: 5,
                duration: 0.3,
                ease: "back.out(1.4)",
            });
        }
    };

    const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            y: 0,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            duration: 0.3,
            ease: "power2.out",
        });
        const icon = e.currentTarget.querySelector(".feature-icon, .card-icon");
        if (icon) {
            gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    };

    // Hover handlers for CTA buttons
    const handleButtonEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    const handleButtonLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    return (
        <>
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="hero bg-primary text-primary-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Everything You Need for Split Placements
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Built from the ground up for collaborative recruiting. No
                            retrofitting, no workarounds—just pure split placement
                            functionality.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section ref={coreRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">Core Platform Features</h2>
                        <p className="text-lg text-base-content/70">
                            A complete recruiting ecosystem in one platform
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {coreFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card card bg-base-200 shadow cursor-pointer opacity-0"
                                onMouseEnter={handleCardEnter}
                                onMouseLeave={handleCardLeave}
                            >
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`feature-icon w-14 h-14 rounded-lg bg-${feature.color}/20 flex items-center justify-center`}
                                        >
                                            <i
                                                className={`${feature.icon} text-${feature.color} text-2xl`}
                                            ></i>
                                        </div>
                                        <h3 className="card-title">{feature.title}</h3>
                                    </div>
                                    <p className="text-base-content/70 mb-4">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        {feature.items.map((item, itemIndex) => (
                                            <li
                                                key={itemIndex}
                                                className="flex items-start gap-2"
                                            >
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Recruiters Features */}
            <section ref={recruitersRef} className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="section-heading text-center mb-12 opacity-0">
                            <h2 className="text-3xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>{" "}
                                For Recruiters
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Tools designed to maximize your placement success
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {recruiterFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="recruiter-card card bg-base-100 shadow cursor-pointer opacity-0"
                                    onMouseEnter={handleCardEnter}
                                    onMouseLeave={handleCardLeave}
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-xl mb-3">
                                            <i
                                                className={`card-icon ${feature.icon} text-primary`}
                                            ></i>
                                            {feature.title}
                                        </h3>
                                        <p className="text-base-content/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* For Companies Features */}
            <section ref={companiesRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="section-heading text-center mb-12 opacity-0">
                            <h2 className="text-3xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-building text-secondary"></i>{" "}
                                For Companies
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Streamline your external recruiting operations
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {companyFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="company-card card bg-base-200 shadow cursor-pointer opacity-0"
                                    onMouseEnter={handleCardEnter}
                                    onMouseLeave={handleCardLeave}
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-xl mb-3">
                                            <i
                                                className={`card-icon ${feature.icon} text-secondary`}
                                            ></i>
                                            {feature.title}
                                        </h3>
                                        <p className="text-base-content/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Features */}
            <section
                ref={techRef}
                className="py-20 bg-neutral text-neutral-content overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-12 opacity-0">
                        <h2 className="text-3xl font-bold mb-4">
                            Built on Modern Architecture
                        </h2>
                        <p className="text-lg opacity-80">
                            Enterprise-grade infrastructure with security and scalability
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {techFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="tech-feature text-center opacity-0"
                            >
                                <i
                                    className={`tech-icon ${feature.icon} text-5xl mb-4 opacity-80`}
                                ></i>
                                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                                <p className="text-sm opacity-70">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                ref={ctaRef}
                className="py-20 bg-primary text-primary-content overflow-hidden"
            >
                <div className="container mx-auto px-4 text-center">
                    <div className="cta-content opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Experience the Difference?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Join the platform built specifically for split placements. No
                            retrofitting, no compromises.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-up"
                            className="cta-btn btn btn-lg btn-neutral opacity-0"
                            onMouseEnter={handleButtonEnter}
                            onMouseLeave={handleButtonLeave}
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as a Recruiter
                        </Link>
                        <Link
                            href="/sign-up"
                            className="cta-btn btn btn-lg btn-secondary opacity-0"
                            onMouseEnter={handleButtonEnter}
                            onMouseLeave={handleButtonLeave}
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
