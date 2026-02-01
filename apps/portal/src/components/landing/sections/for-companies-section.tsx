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

            // Dashboard card - slides in from left with depth (opposite of recruiters)
            gsap.fromTo(
                dashboardRef.current,
                { opacity: 0, x: -60, rotateY: 5 },
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
                    { opacity: 0, x: -20 },
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
                const target = 15;
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: 1.2,
                        ease: easing.smooth,
                        delay: 0.8,
                        scrollTrigger: {
                            trigger: dashboardRef.current,
                            start: "top 75%",
                        },
                        onUpdate: function () {
                            if (statValue) {
                                statValue.textContent = Math.floor(
                                    this.targets()[0].value,
                                ).toString();
                            }
                        },
                    },
                );
            }

            // Heading animation - slides from right (opposite of recruiters)
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

            // Benefits list - staggered pop in from right
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
        },
        { scope: sectionRef },
    );

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
                        ref={dashboardRef}
                        className="relative opacity-0 order-2 lg:order-1"
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
                                <div className="space-y-3 mb-4">
                                    {dashboardRoles.map((role, index) => (
                                        <div
                                            key={index}
                                            className="dashboard-row p-3 bg-base-200 rounded-lg opacity-0"
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
                                            <div className="stat-value text-3xl font-bold text-secondary">
                                                0
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
                        <div ref={headingRef} className="opacity-0">
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
