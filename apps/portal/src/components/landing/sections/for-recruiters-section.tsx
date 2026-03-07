"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal, useAnimatedCounter } from "@splits-network/basel-ui";

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

    useScrollReveal(sectionRef);

    const counterRef = useAnimatedCounter(12450, { prefix: "$", duration: 1500 });

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
                        <div className="scroll-reveal slide-from-left">
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

                        <div className="space-y-4 mb-10 stagger-children">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="scroll-reveal fade-up flex items-start gap-4"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
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

                        <div className="scroll-reveal fade-up">
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
                        className="scroll-reveal slide-from-right relative"
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
                                <div className="space-y-3 mb-4 stagger-children">
                                    {dashboardRoles.map((role, index) => (
                                        <div
                                            key={index}
                                            className="scroll-reveal fade-up flex justify-between items-center p-3 bg-base-200 rounded-lg"
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
                                            <div className="text-3xl font-bold text-primary">
                                                <span ref={counterRef}>$0</span>
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
