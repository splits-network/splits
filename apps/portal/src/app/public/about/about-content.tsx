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

const coreValues = [
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Transparency",
        description:
            "Every fee, every split, every transaction is crystal clear. No hidden percentages, no mystery math, no surprise deductions.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Fairness",
        description:
            "Recruiters deserve the lion's share of placement fees. We take only what we need to run a sustainable platform.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-lightbulb",
        title: "Simplicity",
        description:
            "Complex processes should feel simple. We hide the complexity so you can focus on what matters: making great placements.",
        color: "accent",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Community",
        description:
            "We're building more than a platform—we're creating a network of recruiters who support and collaborate with each other.",
        color: "info",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Growth",
        description:
            "Your success is our success. We're invested in helping recruiters build sustainable, growing businesses.",
        color: "success",
    },
    {
        icon: "fa-duotone fa-regular fa-rocket",
        title: "Innovation",
        description:
            "We're constantly improving, listening to feedback, and building features that solve real problems.",
        color: "warning",
    },
];

const whyDifferent = [
    {
        icon: "fa-duotone fa-regular fa-hammer",
        title: "Built for Splits, Not Adapted",
        description:
            "Most ATS systems treat split placements as an afterthought. We built Splits Network from the ground up with collaborative recruiting as the core use case.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Recruiter-First Philosophy",
        description:
            "We're recruiters building for recruiters. Every feature, every workflow, every decision is made with your success in mind.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "Modern Technology Stack",
        description:
            "We use enterprise-grade, modern technology that's fast, reliable, and scales with your business. No legacy systems holding you back.",
        color: "accent",
    },
];

const teamMembers = [
    {
        initials: "FN",
        name: "Founder Name",
        title: "Co-Founder & CEO",
        description:
            "15 years in recruiting and technology. Previously built recruiting teams at Fortune 500 companies.",
        color: "primary",
    },
    {
        initials: "TN",
        name: "Tech Name",
        title: "Co-Founder & CTO",
        description:
            "Former engineering leader at SaaS companies. Passionate about building scalable platforms.",
        color: "secondary",
    },
    {
        initials: "ON",
        name: "Operations Name",
        title: "Head of Operations",
        description:
            "Recruiting operations expert. Ensures every recruiter and company has a great experience.",
        color: "accent",
    },
];

export function AboutContent() {
    const heroRef = useRef<HTMLElement>(null);
    const missionRef = useRef<HTMLElement>(null);
    const valuesRef = useRef<HTMLElement>(null);
    const differentRef = useRef<HTMLElement>(null);
    const teamRef = useRef<HTMLElement>(null);
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

    // Mission & Vision section animations
    useGSAP(
        () => {
            if (!missionRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Mission/Vision cards scale in
            const cards = missionRef.current.querySelectorAll(".mission-card");
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: duration.normal,
                    ease: easing.bounce,
                    stagger: stagger.loose,
                    scrollTrigger: {
                        trigger: missionRef.current,
                        start: "top 80%",
                    },
                }
            );

            // Icons pop
            const icons = missionRef.current.querySelectorAll(".mission-icon");
            gsap.fromTo(icons, popIn.from, {
                ...popIn.to,
                stagger: stagger.loose,
                delay: 0.3,
                scrollTrigger: {
                    trigger: missionRef.current,
                    start: "top 80%",
                },
            });

            // Story heading fade up
            const storyHeading = missionRef.current.querySelector(".story-heading");
            if (storyHeading) {
                gsap.fromTo(storyHeading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: storyHeading,
                        start: "top 85%",
                    },
                });
            }

            // Story paragraphs stagger
            const storyParagraphs =
                missionRef.current.querySelectorAll(".story-paragraph");
            gsap.fromTo(
                storyParagraphs,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    stagger: stagger.normal,
                    scrollTrigger: {
                        trigger: storyParagraphs[0],
                        start: "top 85%",
                    },
                }
            );
        },
        { scope: missionRef }
    );

    // Core Values section animations
    useGSAP(
        () => {
            if (!valuesRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = valuesRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: valuesRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Value cards stagger in
            const cards = valuesRef.current.querySelectorAll(".value-card");
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
                        trigger: valuesRef.current,
                        start: "top 75%",
                    },
                }
            );

            // Icons pop
            const icons = valuesRef.current.querySelectorAll(".value-icon");
            gsap.fromTo(icons, popIn.from, {
                ...popIn.to,
                stagger: stagger.tight,
                delay: 0.2,
                scrollTrigger: {
                    trigger: valuesRef.current,
                    start: "top 75%",
                },
            });
        },
        { scope: valuesRef }
    );

    // Why Different section animations
    useGSAP(
        () => {
            if (!differentRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = differentRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: differentRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Cards slide in from alternating sides
            const cards = differentRef.current.querySelectorAll(".different-card");
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
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                        },
                    }
                );
            });

            // Icons pop
            const icons = differentRef.current.querySelectorAll(".different-icon");
            icons.forEach((icon, index) => {
                gsap.fromTo(icon, popIn.from, {
                    ...popIn.to,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: icon.closest(".different-card"),
                        start: "top 85%",
                    },
                });
            });
        },
        { scope: differentRef }
    );

    // Team section animations
    useGSAP(
        () => {
            if (!teamRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = teamRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: teamRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Team cards stagger in
            const cards = teamRef.current.querySelectorAll(".team-card");
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: duration.normal,
                    ease: easing.bounce,
                    stagger: stagger.normal,
                    scrollTrigger: {
                        trigger: teamRef.current,
                        start: "top 75%",
                    },
                }
            );

            // Avatars pop
            const avatars = teamRef.current.querySelectorAll(".team-avatar");
            gsap.fromTo(
                avatars,
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: duration.fast,
                    ease: easing.bounce,
                    stagger: stagger.normal,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: teamRef.current,
                        start: "top 75%",
                    },
                }
            );

            // CTA button
            const ctaButton = teamRef.current.querySelector(".team-cta");
            if (ctaButton) {
                gsap.fromTo(
                    ctaButton,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        delay: 0.5,
                        scrollTrigger: {
                            trigger: teamRef.current,
                            start: "top 70%",
                        },
                    }
                );
            }
        },
        { scope: teamRef }
    );

    // CTA section animations
    useGSAP(
        () => {
            if (!ctaRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = ctaRef.current.querySelector(".cta-content");
            if (content) {
                gsap.fromTo(
                    content,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.hero,
                        ease: easing.smooth,
                        scrollTrigger: {
                            trigger: ctaRef.current,
                            start: "top 80%",
                        },
                    }
                );
            }

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
        const icon = e.currentTarget.querySelector(
            ".value-icon, .different-icon, .mission-icon"
        );
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
        const icon = e.currentTarget.querySelector(
            ".value-icon, .different-icon, .mission-icon"
        );
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
                className="hero bg-gradient-to-r from-primary to-accent text-primary-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">About Splits Network</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            We're building the future of collaborative recruiting—a
                            platform where transparency, fair splits, and quality
                            placements drive everything we do.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section ref={missionRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 mb-16">
                            <div
                                className="mission-card card bg-primary text-primary-content shadow cursor-pointer opacity-0"
                                onMouseEnter={handleCardEnter}
                                onMouseLeave={handleCardLeave}
                            >
                                <div className="card-body p-8">
                                    <h2 className="card-title text-3xl mb-4">
                                        <i className="mission-icon fa-duotone fa-regular fa-bullseye"></i>
                                        Our Mission
                                    </h2>
                                    <p className="text-lg opacity-90">
                                        To create a transparent, fair marketplace where
                                        specialized recruiters and companies collaborate
                                        seamlessly on placements—eliminating the chaos of
                                        spreadsheets, email chains, and unclear fee structures.
                                    </p>
                                </div>
                            </div>
                            <div
                                className="mission-card card bg-secondary text-secondary-content shadow cursor-pointer opacity-0"
                                onMouseEnter={handleCardEnter}
                                onMouseLeave={handleCardLeave}
                            >
                                <div className="card-body p-8">
                                    <h2 className="card-title text-3xl mb-4">
                                        <i className="mission-icon fa-duotone fa-regular fa-telescope"></i>
                                        Our Vision
                                    </h2>
                                    <p className="text-lg opacity-90">
                                        A world where every specialized recruiter can build a
                                        sustainable business through split placements, and
                                        every company has instant access to the perfect
                                        recruiting talent for their needs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Story */}
                        <div className="prose lg:prose-xl mx-auto">
                            <h2 className="story-heading text-3xl font-bold text-center mb-8 opacity-0">
                                Our Story
                            </h2>
                            <p className="story-paragraph text-lg text-base-content/80 opacity-0">
                                Splits Network was born from years of frustration with the
                                split placement process. As recruiters ourselves, we
                                experienced firsthand the pain of managing splits across
                                spreadsheets, losing track of candidates, and dealing with
                                unclear fee agreements.
                            </p>
                            <p className="story-paragraph text-lg text-base-content/80 opacity-0">
                                We saw talented recruiters avoiding split placements
                                entirely—not because they didn't want to collaborate, but
                                because the tools didn't exist to make it work smoothly.
                                Companies were equally frustrated, struggling to manage
                                multiple external recruiters without a unified system.
                            </p>
                            <p className="story-paragraph text-lg text-base-content/80 opacity-0">
                                So we built Splits Network: a platform designed specifically
                                for split placements, not retrofitted from general-purpose
                                ATS systems. We built it with transparency, fairness, and
                                simplicity at its core.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section ref={valuesRef} className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-lg text-base-content/70">
                            The principles that guide everything we build
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {coreValues.map((value, index) => (
                            <div
                                key={index}
                                className="value-card card bg-base-100 shadow cursor-pointer opacity-0"
                                onMouseEnter={handleCardEnter}
                                onMouseLeave={handleCardLeave}
                            >
                                <div className="card-body text-center">
                                    <div
                                        className={`value-icon w-20 h-20 rounded-full bg-${value.color}/20 flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <i
                                            className={`${value.icon} text-${value.color} text-3xl`}
                                        ></i>
                                    </div>
                                    <h3 className="card-title justify-center text-2xl mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-base-content/70">{value.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why We're Different */}
            <section ref={differentRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold text-center mb-12 opacity-0">
                            Why We're Different
                        </h2>
                        <div className="space-y-6">
                            {whyDifferent.map((item, index) => (
                                <div
                                    key={index}
                                    className="different-card card bg-base-200 shadow cursor-pointer opacity-0"
                                    onMouseEnter={handleCardEnter}
                                    onMouseLeave={handleCardLeave}
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-xl">
                                            <i
                                                className={`different-icon ${item.icon} text-${item.color}`}
                                            ></i>
                                            {item.title}
                                        </h3>
                                        <p className="text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section
                ref={teamRef}
                className="py-20 bg-neutral text-neutral-content overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-12 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">Meet the Team</h2>
                        <p className="text-lg opacity-80">
                            The people building the future of split placements
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="team-card card bg-base-100 text-base-content shadow opacity-0"
                            >
                                <div className="card-body text-center">
                                    <div className="team-avatar avatar placeholder mx-auto mb-4 opacity-0">
                                        <div
                                            className={`bg-${member.color} text-${member.color}-content rounded-full w-24`}
                                        >
                                            <span className="text-3xl">{member.initials}</span>
                                        </div>
                                    </div>
                                    <h3 className="card-title justify-center">{member.name}</h3>
                                    <p className="text-sm text-base-content/60 mb-2">
                                        {member.title}
                                    </p>
                                    <p className="text-sm text-base-content/70">
                                        {member.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="team-cta text-center mt-12 opacity-0">
                        <Link
                            href="/careers"
                            className="btn btn-primary btn-lg"
                            onMouseEnter={handleButtonEnter}
                            onMouseLeave={handleButtonLeave}
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Join Our Team
                        </Link>
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
                            Ready to Join the Movement?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Be part of the platform that's changing how split placements
                            work.
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
