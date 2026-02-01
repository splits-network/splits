"use client";

import { useRef } from "react";
import Link from "next/link";
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
        text: "See exactly what you&apos;ll earn on each placement. No mystery math.",
    },
    {
        icon: "fa-duotone fa-regular fa-rocket",
        text: "Scale your business with a network that brings opportunities to you",
    },
];

const dashboardRoles = [
    {
        title: "Senior Software Engineer",
        company: "TechCorp",
        status: "Active",
        statusColor: "badge-primary",
    },
    {
        title: "Product Manager",
        company: "StartupXYZ",
        status: "Interviewing",
        statusColor: "badge-info",
    },
    {
        title: "UX Designer",
        company: "DesignCo",
        status: "Offer Stage",
        statusColor: "badge-success",
    },
];

export function ForRecruitersSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

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

            // Benefits list - staggered pop in
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

                // Icons pop with bounce
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

            // Dashboard card - slides in from right with depth
            gsap.fromTo(
                dashboardRef.current,
                { opacity: 0, x: 60, rotateY: -5 },
                {
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    duration: duration.hero,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                    },
                },
            );

            // Dashboard rows stagger in
            const dashboardRows =
                dashboardRef.current?.querySelectorAll(".dashboard-row");
            if (dashboardRows) {
                gsap.fromTo(
                    dashboardRows,
                    { opacity: 0, x: 20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                        delay: 0.4,
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 70%",
                        },
                    },
                );
            }

            // Stats counter animation
            const statValue =
                dashboardRef.current?.querySelector(".stat-value");
            if (statValue) {
                const target = 12450;
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: 1.5,
                        ease: easing.smooth,
                        delay: 0.8,
                        scrollTrigger: {
                            trigger: dashboardRef.current,
                            start: "top 75%",
                        },
                        onUpdate: function () {
                            if (statValue) {
                                statValue.textContent = `$${Math.floor(this.targets()[0].value).toLocaleString()}`;
                            }
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
            id="for-recruiters"
            className="py-24 bg-primary text-primary-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                    {/* Content */}
                    <div>
                        <div ref={headingRef} className="opacity-0">
                            <p className="text-sm uppercase tracking-wider opacity-70 mb-3">
                                For Recruiters
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Turn your network into
                                <br />
                                <span className="opacity-90">
                                    recurring revenue
                                </span>
                            </h2>
                            <p className="text-lg opacity-80 mb-8">
                                Stop chasing roles. Let opportunities come to
                                you.
                            </p>
                        </div>

                        <div ref={benefitsRef} className="space-y-4 mb-10">
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

                        <div ref={ctaRef} className="opacity-0">
                            <Link
                                href="/sign-up"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Join as a Recruiter
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div
                        ref={dashboardRef}
                        className="relative opacity-0"
                        style={{ perspective: "1000px" }}
                    >
                        <div className="card bg-base-100 text-base-content shadow-2xl">
                            <div className="card-body p-6">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                            Dashboard
                                        </div>
                                        <div className="font-bold text-lg">
                                            Your Active Roles
                                        </div>
                                    </div>
                                    <div className="badge badge-primary badge-outline">
                                        3 roles
                                    </div>
                                </div>

                                {/* Role List */}
                                <div className="space-y-3 mb-4">
                                    {dashboardRoles.map((role, index) => (
                                        <div
                                            key={index}
                                            className="dashboard-row flex justify-between items-center p-3 bg-base-200 rounded-lg opacity-0"
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
                                                className={`badge ${role.statusColor} badge-sm`}
                                            >
                                                {role.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider my-2"></div>

                                {/* Stats */}
                                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                This Month
                                            </div>
                                            <div className="stat-value text-3xl font-bold text-primary">
                                                $0
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
