"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal, useAnimatedCounter } from "@splits-network/basel-ui";

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        text: "Tap into a network of specialized recruiters—no need to manage individual contracts",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        text: "Full visibility into every pipeline. See who&apos;s working your roles and where candidates stand.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Set fees and terms once. They apply to every recruiter consistently.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        text: "Pay only when someone starts. No retainers, no surprises.",
    },
    {
        icon: "fa-duotone fa-regular fa-messages",
        text: "All communication in one place. No more email threads or spreadsheet chaos.",
    },
];

const dashboardRoles = [
    {
        title: "Backend Engineer",
        location: "San Francisco, CA",
        candidates: 5,
        candidateColor: "badge-success",
        recruiters: 3,
        fee: "20%",
    },
    {
        title: "Sales Director",
        location: "Remote",
        candidates: 2,
        candidateColor: "badge-info",
        recruiters: 2,
        fee: "25%",
    },
    {
        title: "Product Manager",
        location: "New York, NY",
        candidates: 8,
        candidateColor: "badge-success",
        recruiters: 4,
        fee: "22%",
    },
];

export function ForCompaniesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    const counterRef = useAnimatedCounter(15);

    return (
        <section
            ref={sectionRef}
            id="for-companies"
            className="py-24 bg-secondary text-secondary-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                    {/* Dashboard Preview - on left for companies (reversed from recruiters) */}
                    <div
                        className="scroll-reveal slide-from-left relative order-2 lg:order-1"
                        style={{ perspective: "1000px" }}
                    >
                        <div className="card bg-base-100 text-base-content shadow-2xl">
                            <div className="card-body p-6">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                            Company Dashboard
                                        </div>
                                        <div className="font-bold text-lg">
                                            Your Open Roles
                                        </div>
                                    </div>
                                    <div className="badge badge-secondary badge-outline">
                                        3 active
                                    </div>
                                </div>

                                {/* Role List */}
                                <div className="space-y-3 mb-4 stagger-children">
                                    {dashboardRoles.map((role, index) => (
                                        <div
                                            key={index}
                                            className="scroll-reveal fade-up p-3 bg-base-200 rounded-lg"
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
                                                <span
                                                    className={`badge ${role.candidateColor} badge-sm`}
                                                >
                                                    {role.candidates} candidates
                                                </span>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="badge badge-ghost badge-sm">
                                                    {role.recruiters} recruiters
                                                </span>
                                                <span className="badge badge-ghost badge-sm">
                                                    {role.fee} fee
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider my-2"></div>

                                {/* Stats */}
                                <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                Total Candidates
                                            </div>
                                            <div className="text-3xl font-bold text-secondary">
                                                <span ref={counterRef}>0</span>
                                            </div>
                                            <div className="text-xs text-base-content/60 mt-1">
                                                across 3 active roles
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-users text-2xl text-secondary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content - on right for companies */}
                    <div className="order-1 lg:order-2">
                        <div className="scroll-reveal slide-from-right">
                            <p className="text-sm uppercase tracking-wider opacity-70 mb-3">
                                For Companies
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                A network of recruiters,
                                <br />
                                <span className="opacity-90">
                                    one simple platform
                                </span>
                            </h2>
                            <p className="text-lg opacity-80 mb-8">
                                Stop managing dozens of contracts. Get qualified
                                candidates from vetted recruiters.
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
                                className="btn btn-lg bg-white text-secondary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post a Role
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
