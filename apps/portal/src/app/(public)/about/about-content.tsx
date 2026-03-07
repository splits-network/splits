"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";
import { AuthenticatedCTAWrapper } from "@/components/auth/authenticated-cta-wrapper";

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
    const containerRef = useRef<HTMLDivElement>(null);
    useScrollReveal(containerRef);

    return (
        <div ref={containerRef}>
            {/* Hero Section */}
            <section
                className="hero bg-gradient-to-r from-primary to-accent text-primary-content py-20 overflow-hidden"
            >
                <div className="scroll-reveal fade-up text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            About Splits Network
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            We're building the future of collaborative
                            recruiting—a platform where transparency, fair
                            splits, and quality placements drive everything we
                            do.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section

                className="py-20 bg-base-100 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 mb-16">
                            <div
                                className="scroll-reveal fade-up card bg-primary text-primary-content shadow cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"

                            >
                                <div className="card-body p-8">
                                    <h2 className="card-title text-3xl mb-4">
                                        <i className="mission-icon fa-duotone fa-regular fa-bullseye"></i>
                                        Our Mission
                                    </h2>
                                    <p className="text-lg opacity-90">
                                        To create a transparent, fair
                                        marketplace where specialized recruiters
                                        and companies collaborate seamlessly on
                                        placements—eliminating the chaos of
                                        spreadsheets, email chains, and unclear
                                        fee structures.
                                    </p>
                                </div>
                            </div>
                            <div
                                className="scroll-reveal fade-up card bg-secondary text-secondary-content shadow cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"

                            >
                                <div className="card-body p-8">
                                    <h2 className="card-title text-3xl mb-4">
                                        <i className="mission-icon fa-duotone fa-regular fa-telescope"></i>
                                        Our Vision
                                    </h2>
                                    <p className="text-lg opacity-90">
                                        A world where every specialized
                                        recruiter can build a sustainable
                                        business through split placements, and
                                        every company has instant access to the
                                        perfect recruiting talent for their
                                        needs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Story */}
                        <div className="prose lg:prose-xl mx-auto">
                            <h2 className="scroll-reveal fade-up text-3xl font-bold text-center mb-8">
                                Our Story
                            </h2>
                            <p className="scroll-reveal fade-up text-lg text-base-content/80">
                                Splits Network was born from years of
                                frustration with the split placement process. As
                                recruiters ourselves, we experienced firsthand
                                the pain of managing splits across spreadsheets,
                                losing track of candidates, and dealing with
                                unclear fee agreements.
                            </p>
                            <p className="scroll-reveal fade-up text-lg text-base-content/80">
                                We saw talented recruiters avoiding split
                                placements entirely—not because they didn't want
                                to collaborate, but because the tools didn't
                                exist to make it work smoothly. Companies were
                                equally frustrated, struggling to manage
                                multiple external recruiters without a unified
                                system.
                            </p>
                            <p className="scroll-reveal fade-up text-lg text-base-content/80">
                                So we built Splits Network: a platform designed
                                specifically for split placements, not
                                retrofitted from general-purpose ATS systems. We
                                built it with transparency, fairness, and
                                simplicity at its core.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section

                className="py-20 bg-base-200 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="scroll-reveal fade-up text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-base-content/70">
                            The principles that guide everything we build
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {coreValues.map((value, index) => (
                            <div
                                key={index}
                                className="scroll-reveal fade-up card bg-base-100 shadow cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"

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
                                    <p className="text-base-content/70">
                                        {value.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why We're Different */}
            <section

                className="py-20 bg-base-100 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="scroll-reveal fade-up text-4xl font-bold text-center mb-12">
                            Why We're Different
                        </h2>
                        <div className="space-y-6">
                            {whyDifferent.map((item, index) => (
                                <div
                                    key={index}
                                    className="scroll-reveal fade-up card bg-base-200 shadow cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"

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

                className="py-20 bg-neutral text-neutral-content overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="scroll-reveal fade-up text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Meet the Team
                        </h2>
                        <p className="text-lg opacity-80">
                            The people building the future of split placements
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="scroll-reveal fade-up card bg-base-100 text-base-content shadow"
                            >
                                <div className="card-body text-center">
                                    <div className="scroll-reveal pop-in avatar avatar-placeholder mx-auto mb-4">
                                        <div
                                            className={`bg-${member.color} text-${member.color}-content rounded-full w-24`}
                                        >
                                            <span className="text-3xl">
                                                {member.initials}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="card-title justify-center">
                                        {member.name}
                                    </h3>
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
                    <div className="scroll-reveal fade-up text-center mt-12">
                        <Link
                            href="/careers"
                            className="btn btn-primary btn-lg"

                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Join Our Team
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section

                className="py-20 bg-primary text-primary-content overflow-hidden"
            >
                <AuthenticatedCTAWrapper>
                    <div className="container mx-auto px-4 text-center">
                        <div className="scroll-reveal fade-up">
                            <h2 className="text-4xl font-bold mb-6">
                                Ready to Join the Movement?
                            </h2>
                            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                                Be part of the platform that's changing how
                                split placements work.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/sign-up"
                                className="scroll-reveal pop-in btn btn-lg btn-neutral transition-transform duration-200 hover:scale-105"

                            >
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Join as a Recruiter
                            </Link>
                            <Link
                                href="/sign-up"
                                className="scroll-reveal pop-in btn btn-lg btn-secondary transition-transform duration-200 hover:scale-105"

                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post Roles as a Company
                            </Link>
                        </div>
                    </div>
                </AuthenticatedCTAWrapper>
            </section>
        </div>
    );
}
