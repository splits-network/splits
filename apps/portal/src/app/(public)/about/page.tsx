import type { Metadata } from "next";
import Link from "next/link";
import { ScrollAnimator } from "@/components/scroll-animator";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "About Splits Network",
    description:
        "Learn how Splits Network powers collaborative recruiting and split placements, aligning recruiters and companies with transparent workflows and shared outcomes.",
    openGraph: {
        title: "About Splits Network",
        description:
            "Learn how Splits Network powers collaborative recruiting and split placements, aligning recruiters and companies with transparent workflows and shared outcomes.",
        url: "https://splits.network/about",
    },
    ...buildCanonical("/about"),
};

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

export default function AboutPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-gradient-to-r from-primary to-accent text-primary-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl opacity-0">
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
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div
                            className="grid md:grid-cols-2 gap-12 mb-16"
                            data-animate-stagger
                        >
                            <div className="card bg-primary text-primary-content shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0">
                                <div className="card-body p-8">
                                    <h2 className="card-title text-3xl mb-4">
                                        <i className="fa-duotone fa-regular fa-bullseye"></i>
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
                            <div className="card bg-secondary text-secondary-content shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0">
                                <div className="card-body p-8">
                                    <h2 className="card-title text-3xl mb-4">
                                        <i className="fa-duotone fa-regular fa-telescope"></i>
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
                            <h2 className="text-3xl font-bold text-center mb-8 opacity-0">
                                Our Story
                            </h2>
                            <p className="text-lg text-base-content/80 opacity-0">
                                Splits Network was born from years of
                                frustration with the split placement process. As
                                recruiters ourselves, we experienced firsthand
                                the pain of managing splits across spreadsheets,
                                losing track of candidates, and dealing with
                                unclear fee agreements.
                            </p>
                            <p className="text-lg text-base-content/80 opacity-0">
                                We saw talented recruiters avoiding split
                                placements entirely—not because they didn't want
                                to collaborate, but because the tools didn't
                                exist to make it work smoothly. Companies were
                                equally frustrated, struggling to manage
                                multiple external recruiters without a unified
                                system.
                            </p>
                            <p className="text-lg text-base-content/80 opacity-0">
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
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-base-content/70">
                            The principles that guide everything we build
                        </p>
                    </div>
                    <div
                        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                        data-animate-stagger
                    >
                        {coreValues.map((value, index) => (
                            <div
                                key={index}
                                className="card bg-base-100 shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0"
                            >
                                <div className="card-body text-center">
                                    <div
                                        className={`w-20 h-20 rounded-full bg-${value.color}/20 flex items-center justify-center mx-auto mb-4`}
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
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 opacity-0">
                            Why We're Different
                        </h2>
                        <div className="space-y-6" data-animate-stagger>
                            {whyDifferent.map((item, index) => (
                                <div
                                    key={index}
                                    className="card bg-base-200 shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-xl">
                                            <i
                                                className={`${item.icon} text-${item.color}`}
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
            <section className="py-20 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">
                            Meet the Team
                        </h2>
                        <p className="text-lg opacity-80">
                            The people building the future of split placements
                        </p>
                    </div>
                    <div
                        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                        data-animate-stagger
                    >
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="card bg-base-100 text-base-content shadow opacity-0"
                            >
                                <div className="card-body text-center">
                                    <div className="avatar avatar-placeholder mx-auto mb-4">
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
                    <div className="text-center mt-12 opacity-0">
                        <Link
                            href="/careers"
                            className="btn btn-primary btn-lg hover:scale-105 transition-all"
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Join Our Team
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Join the Movement?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Be part of the platform that's changing how split
                            placements work.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-neutral hover:scale-105 transition-all opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as a Recruiter
                        </Link>
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-secondary hover:scale-105 transition-all opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>
                </div>
            </section>
        </ScrollAnimator>
    );
}
