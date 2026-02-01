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

interface TierInfo {
    name: string;
    monthlyPrice: number;
    candidateRecruiterShare: number;
    platformTake: number;
    description: string;
    highlight?: boolean;
}

const tierData: TierInfo[] = [
    {
        name: "Starter",
        monthlyPrice: 0,
        candidateRecruiterShare: 20,
        platformTake: 48,
        description: "Perfect for getting started with split placements",
    },
    {
        name: "Pro",
        monthlyPrice: 99,
        candidateRecruiterShare: 30,
        platformTake: 24,
        description: "For active recruiters making regular placements",
        highlight: true,
    },
    {
        name: "Partner",
        monthlyPrice: 249,
        candidateRecruiterShare: 40,
        platformTake: 0,
        description: "Maximum earnings for established recruiting partners",
    },
];

const roleDefinitions = [
    {
        role: "Candidate Recruiter",
        description:
            "The recruiter who sourced and represents the candidate throughout the process",
        example: "You find a software engineer through your network",
        icon: "fa-user-tie",
    },
    {
        role: "Job Owner",
        description:
            "The recruiter assigned to fill the specific role by the company",
        example: "Company recruiter managing hiring for a specific position",
        icon: "fa-briefcase",
    },
    {
        role: "Company Recruiter",
        description:
            "Internal or preferred recruiter working directly with the company",
        example: "In-house talent acquisition team member",
        icon: "fa-building",
    },
    {
        role: "Candidate Sourcer",
        description:
            "Recruiter who identified the candidate but doesn't represent them",
        example:
            "You found the candidate's profile but another recruiter represents them",
        icon: "fa-search",
    },
    {
        role: "Company Sourcer",
        description:
            "Recruiter who identified the role but doesn't own the placement",
        example:
            "You found the job opening but another recruiter manages the placement",
        icon: "fa-handshake",
    },
];

const processSteps = [
    {
        step: 1,
        title: "Placement is Made",
        description: "A candidate you referred gets hired by the company",
        details:
            "The hiring company confirms the placement and records the final salary and placement fee",
    },
    {
        step: 2,
        title: "Fee Calculation",
        description:
            "Total placement fee is calculated based on candidate's salary",
        details:
            "Example: $150,000 salary × 20% fee = $30,000 total placement fee",
    },
    {
        step: 3,
        title: "Role Identification",
        description:
            "System identifies all recruiters who contributed to the placement",
        details:
            "Automatically assigns roles like Candidate Recruiter, Job Owner, etc.",
    },
    {
        step: 4,
        title: "Split Calculation",
        description: "Fee is divided based on roles and your subscription tier",
        details:
            "Each role gets a percentage based on their contribution level",
    },
    {
        step: 5,
        title: "Payout Processing",
        description: "Your earnings are calculated and processed for payment",
        details:
            "Transparent breakdown showing exactly how your share was calculated",
    },
];

export function SplitsBreakdownContent() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const sections = gsap.utils.toArray(".animate-section");
            sections.forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.medium,
                        ease: easing.out,
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    },
                );
            });

            const cards = gsap.utils.toArray(".animate-card");
            cards.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.medium,
                        ease: easing.out,
                        delay: index * 0.1,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    },
                );
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 py-24 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-section">
                        <div className="badge badge-primary badge-lg mb-6">
                            <i className="fa-duotone fa-regular fa-chart-pie mr-2"></i>
                            Transparent Splits
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-base-content mb-8">
                            How <span className="text-primary">Splits</span>{" "}
                            Work
                        </h1>
                        <p className="text-xl md:text-2xl text-base-content/80 max-w-4xl mx-auto mb-12 leading-relaxed">
                            Understanding placement fee distribution on Splits
                            Network. Clear, transparent, and designed to reward
                            collaboration in recruiting.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/portal/dashboard"
                                className="btn btn-primary btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right mr-2"></i>
                                Start Recruiting
                            </Link>
                            <Link
                                href="#calculator"
                                className="btn btn-outline btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-calculator mr-2"></i>
                                Calculate Earnings
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Concept Section */}
            <section className="py-24 px-4 bg-base-200/50">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-section text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                            The Split Concept
                        </h2>
                        <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                            When multiple recruiters contribute to a placement,
                            the fee is shared based on their roles and
                            contributions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="animate-card card bg-base-100 shadow-lg">
                            <div className="card-body text-center">
                                <div className="text-primary text-6xl mb-4">
                                    <i className="fa-duotone fa-regular fa-users"></i>
                                </div>
                                <h3 className="card-title text-2xl justify-center mb-4">
                                    Collaboration
                                </h3>
                                <p className="text-base-content/80">
                                    Multiple recruiters can work together on the
                                    same placement, each contributing their
                                    unique strengths.
                                </p>
                            </div>
                        </div>

                        <div className="animate-card card bg-base-100 shadow-lg">
                            <div className="card-body text-center">
                                <div className="text-secondary text-6xl mb-4">
                                    <i className="fa-duotone fa-regular fa-chart-pie"></i>
                                </div>
                                <h3 className="card-title text-2xl justify-center mb-4">
                                    Fair Distribution
                                </h3>
                                <p className="text-base-content/80">
                                    Placement fees are automatically split based
                                    on each recruiter's role and contribution
                                    level.
                                </p>
                            </div>
                        </div>

                        <div className="animate-card card bg-base-100 shadow-lg">
                            <div className="card-body text-center">
                                <div className="text-accent text-6xl mb-4">
                                    <i className="fa-duotone fa-regular fa-transparent"></i>
                                </div>
                                <h3 className="card-title text-2xl justify-center mb-4">
                                    Transparency
                                </h3>
                                <p className="text-base-content/80">
                                    See exactly how much you'll earn before you
                                    start, with clear breakdowns of every split.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tier Comparison Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-section text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                            Earning Tiers
                        </h2>
                        <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                            Your subscription tier determines your share of
                            placement fees. Higher tiers mean bigger payouts.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {tierData.map((tier, index) => (
                            <div
                                key={tier.name}
                                className={`animate-card card bg-base-100 shadow-lg ${tier.highlight ? "ring-2 ring-primary" : ""}`}
                            >
                                {tier.highlight && (
                                    <div className="badge badge-primary absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        Most Popular
                                    </div>
                                )}
                                <div className="card-body">
                                    <h3 className="card-title text-2xl text-center justify-center mb-2">
                                        {tier.name}
                                    </h3>
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-primary">
                                            ${tier.monthlyPrice}
                                            <span className="text-base font-normal text-base-content/60">
                                                /month
                                            </span>
                                        </div>
                                        <p className="text-sm text-base-content/80 mt-2">
                                            {tier.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="stat bg-base-200 rounded-lg">
                                            <div className="stat-title text-center">
                                                As Candidate Recruiter
                                            </div>
                                            <div className="stat-value text-center text-primary text-2xl">
                                                {tier.candidateRecruiterShare}%
                                            </div>
                                            <div className="stat-desc text-center">
                                                of placement fee
                                            </div>
                                        </div>

                                        <div className="stat bg-base-200 rounded-lg">
                                            <div className="stat-title text-center">
                                                Platform Take
                                            </div>
                                            <div className="stat-value text-center text-base-content/60 text-2xl">
                                                {tier.platformTake}%
                                            </div>
                                            <div className="stat-desc text-center">
                                                network fee
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-center mt-6">
                                        <Link
                                            href="/portal/dashboard"
                                            className={`btn ${tier.highlight ? "btn-primary" : "btn-outline"} btn-wide`}
                                        >
                                            {tier.monthlyPrice === 0
                                                ? "Start Free"
                                                : "Upgrade"}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role Definitions Section */}
            <section className="py-24 px-4 bg-base-200/50">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-section text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                            Recruiter Roles
                        </h2>
                        <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                            Different roles in a placement earn different
                            percentages. Understanding these roles helps you
                            maximize your earnings.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {roleDefinitions.map((role, index) => (
                            <div
                                key={role.role}
                                className="animate-card card bg-base-100 shadow-lg"
                            >
                                <div className="card-body">
                                    <div className="flex items-center mb-4">
                                        <div className="text-primary text-3xl mr-3">
                                            <i
                                                className={`fa-duotone fa-regular ${role.icon}`}
                                            ></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            {role.role}
                                        </h3>
                                    </div>
                                    <p className="text-base-content/80 mb-4">
                                        {role.description}
                                    </p>
                                    <div className="bg-primary/5 p-3 rounded-lg">
                                        <p className="text-sm font-medium">
                                            Example:
                                        </p>
                                        <p className="text-sm text-base-content/80">
                                            {role.example}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Timeline Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-section text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                            How Payouts Work
                        </h2>
                        <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                            From placement to payout, here's exactly how the
                            process works when you make a successful referral.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary/20 h-full"></div>

                        {processSteps.map((step, index) => (
                            <div
                                key={step.step}
                                className={`animate-card relative flex items-center mb-16 ${
                                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                                }`}
                            >
                                <div
                                    className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-16" : "md:pr-16"}`}
                                >
                                    <div className="card bg-base-100 shadow-lg">
                                        <div className="card-body">
                                            <div className="flex items-center mb-4">
                                                <div className="badge badge-primary badge-lg mr-3">
                                                    {step.step}
                                                </div>
                                                <h3 className="card-title text-xl">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base-content/80 mb-4">
                                                {step.description}
                                            </p>
                                            <div className="bg-base-200 p-3 rounded-lg">
                                                <p className="text-sm text-base-content/70">
                                                    {step.details}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary rounded-full items-center justify-center text-primary-content font-bold text-lg">
                                    {step.step}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Example Calculation Section */}
            <section id="calculator" className="py-24 px-4 bg-base-200/50">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-section text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                            Example Calculation
                        </h2>
                        <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                            See how much you could earn with a real placement
                            example.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-lg max-w-4xl mx-auto">
                        <div className="card-body">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 text-center">
                                        Placement Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="stat bg-base-200 rounded-lg">
                                            <div className="stat-title">
                                                Candidate Salary
                                            </div>
                                            <div className="stat-value text-primary">
                                                $150,000
                                            </div>
                                        </div>
                                        <div className="stat bg-base-200 rounded-lg">
                                            <div className="stat-title">
                                                Placement Fee Rate
                                            </div>
                                            <div className="stat-value text-secondary">
                                                20%
                                            </div>
                                        </div>
                                        <div className="stat bg-base-200 rounded-lg">
                                            <div className="stat-title">
                                                Total Placement Fee
                                            </div>
                                            <div className="stat-value text-accent">
                                                $30,000
                                            </div>
                                        </div>
                                        <div className="stat bg-base-200 rounded-lg">
                                            <div className="stat-title">
                                                Your Role
                                            </div>
                                            <div className="stat-value text-base-content text-lg">
                                                Candidate Recruiter
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-6 text-center">
                                        Your Earnings by Tier
                                    </h3>
                                    <div className="space-y-4">
                                        {tierData.map((tier) => {
                                            const earnings =
                                                30000 *
                                                (tier.candidateRecruiterShare /
                                                    100);
                                            return (
                                                <div
                                                    key={tier.name}
                                                    className="stat bg-primary/5 rounded-lg"
                                                >
                                                    <div className="stat-title">
                                                        {tier.name} Tier
                                                    </div>
                                                    <div className="stat-value text-primary">
                                                        $
                                                        {earnings.toLocaleString()}
                                                    </div>
                                                    <div className="stat-desc">
                                                        {
                                                            tier.candidateRecruiterShare
                                                        }
                                                        % of $30,000 fee
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="text-center">
                                <p className="text-lg text-base-content/80 mb-6">
                                    Ready to start earning? Join thousands of
                                    recruiters making split placements.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/portal/dashboard"
                                        className="btn btn-primary btn-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                        Start Recruiting
                                    </Link>
                                    <Link
                                        href="/public/pricing"
                                        className="btn btn-outline btn-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-tag mr-2"></i>
                                        View All Pricing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-section">
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                            Ready to Start Splitting?
                        </h2>
                        <p className="text-xl text-base-content/80 max-w-3xl mx-auto mb-12">
                            Join the collaborative recruiting revolution.
                            Transparent fees, fair splits, and unlimited earning
                            potential.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                href="/portal/dashboard"
                                className="btn btn-primary btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus mr-2"></i>
                                Create Account
                            </Link>
                            <Link
                                href="/public/how-it-works"
                                className="btn btn-outline btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-circle-info mr-2"></i>
                                Learn More
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="stat">
                                <div className="stat-title">
                                    Active Recruiters
                                </div>
                                <div className="stat-value text-primary">
                                    2,500+
                                </div>
                                <div className="stat-desc">Growing network</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">
                                    Total Placements
                                </div>
                                <div className="stat-value text-secondary">
                                    12,000+
                                </div>
                                <div className="stat-desc">
                                    Successful referrals
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">
                                    Fees Distributed
                                </div>
                                <div className="stat-value text-accent">
                                    $85M+
                                </div>
                                <div className="stat-desc">
                                    To our recruiters
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
