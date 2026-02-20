"use client";

import Link from "next/link";
import { HubAnimator } from "../_shared/hub-animator";

// Memphis accent cycling
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

const tips = [
    {
        title: "Start with a Strong Professional Summary",
        description:
            "Create a compelling opening that highlights your key qualifications and career goals in 2-3 sentences.",
        icon: "fa-pen-fancy",
        dos: [
            "Tailor it to the specific role",
            "Include relevant keywords",
            "Highlight your unique value proposition",
        ],
        donts: [
            "Use generic statements",
            "Make it too long",
            "Include personal information",
        ],
    },
    {
        title: "Quantify Your Achievements",
        description:
            "Use numbers, percentages, and metrics to demonstrate the tangible impact of your work.",
        icon: "fa-chart-line",
        dos: [
            "Use specific numbers and percentages",
            "Show before-and-after comparisons",
            "Include timeframes",
        ],
        donts: [
            "List vague responsibilities",
            "Exaggerate your contributions",
            "Forget context",
        ],
    },
    {
        title: "Use Strong Action Verbs",
        description:
            "Start each bullet point with dynamic action verbs that showcase your proactive approach.",
        icon: "fa-bolt",
        dos: [
            "Led, managed, developed, implemented",
            "Optimized, increased, reduced",
            "Collaborated, coordinated, facilitated",
        ],
        donts: ["Responsible for...", "Helped with...", "Worked on..."],
    },
    {
        title: "Tailor for Each Application",
        description:
            "Customize your resume for each position by emphasizing relevant skills and experiences.",
        icon: "fa-bullseye",
        dos: [
            "Match keywords from job description",
            "Prioritize relevant experience",
            "Adjust your summary",
        ],
        donts: [
            "Send the same resume everywhere",
            "Include irrelevant information",
            "Keyword stuff",
        ],
    },
];

const essentialSections = [
    {
        title: "Contact Information",
        icon: "fa-address-card",
        content: "Name, phone, email, LinkedIn, portfolio/website",
    },
    {
        title: "Professional Summary",
        icon: "fa-user",
        content: "2-3 sentences highlighting your experience and value",
    },
    {
        title: "Work Experience",
        icon: "fa-briefcase",
        content: "Reverse chronological with quantified achievements",
    },
    {
        title: "Education",
        icon: "fa-graduation-cap",
        content: "Degree, institution, graduation year, relevant coursework",
    },
    {
        title: "Skills",
        icon: "fa-cog",
        content: "Technical and soft skills relevant to your target role",
    },
    {
        title: "Certifications",
        icon: "fa-certificate",
        content: "Professional certifications and licenses",
    },
];

export function ResumeTipsClient() {
    return (
        <HubAnimator>
            <div className="min-h-screen bg-cream">
                {/* Hero Section */}
                <section className="hero-section py-20 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="accent-badge inline-block px-4 py-2 bg-coral text-white text-sm font-bold uppercase tracking-wider mb-6 opacity-0">
                                Resume Tips & Strategies
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-dark mb-6 opacity-0">
                                Craft a{" "}
                                <span className="text-coral">Standout</span>{" "}
                                Resume
                            </h1>

                            <p className="text-lg md:text-xl text-dark/60 mb-8 max-w-3xl mx-auto opacity-0">
                                Learn expert strategies to create a compelling
                                resume that gets interviews. From formatting to
                                achievement quantification, master the art of
                                professional presentation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Essential Tips Section */}
                <section className="tips-section py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4">
                                    Essential Resume Tips
                                </h2>
                                <p className="text-lg text-dark/60 max-w-2xl mx-auto">
                                    Master these four fundamental strategies to
                                    transform your resume into a powerful career
                                    tool.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {tips.map((tip, index) => (
                                    <div
                                        key={index}
                                        className={`tip-card relative p-8 bg-white border-4 border-${accentAt(index)} opacity-0`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-12 h-12 bg-${accentAt(index)}`}
                                        />

                                        <div className="flex items-start gap-4 mb-6">
                                            <div
                                                className={`w-16 h-16 bg-${accentAt(index)} flex items-center justify-center flex-shrink-0`}
                                            >
                                                <i
                                                    className={`${tip.icon} text-2xl text-white`}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-dark mb-2">
                                                    {tip.title}
                                                </h3>
                                                <p className="text-dark/60">
                                                    {tip.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-teal mb-3">
                                                    ✓ Do This
                                                </h4>
                                                <ul className="space-y-2">
                                                    {tip.dos.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm text-dark/80 flex items-start gap-2"
                                                        >
                                                            <span className="text-teal text-xs mt-1">
                                                                ●
                                                            </span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-coral mb-3">
                                                    ✗ Avoid This
                                                </h4>
                                                <ul className="space-y-2">
                                                    {tip.donts.map(
                                                        (item, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-sm text-dark/80 flex items-start gap-2"
                                                            >
                                                                <span className="text-coral text-xs mt-1">
                                                                    ●
                                                                </span>
                                                                {item}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resume Sections Guide */}
                <section className="sections-section py-20 bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream mb-4">
                                    Essential Resume Sections
                                </h2>
                                <p className="text-lg text-cream/60 max-w-2xl mx-auto">
                                    Every effective resume should include these
                                    key sections, organized for maximum impact.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {essentialSections.map((section, index) => (
                                    <div
                                        key={index}
                                        className={`section-card relative p-6 bg-white border-4 border-${accentAt(index)} opacity-0`}
                                    >
                                        <div
                                            className={`w-12 h-12 bg-${accentAt(index)} flex items-center justify-center mb-4`}
                                        >
                                            <i
                                                className={`${section.icon} text-lg text-white`}
                                            />
                                        </div>

                                        <h3 className="text-lg font-black uppercase tracking-tight text-dark mb-2">
                                            {section.title}
                                        </h3>

                                        <p className="text-sm text-dark/60">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Action Section */}
                <section className="action-section py-20 bg-teal">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-6">
                                Ready to Build Your Resume?
                            </h2>

                            <p className="text-lg text-dark/80 mb-8 max-w-2xl mx-auto">
                                Start applying these strategies today. Browse
                                our job opportunities and put your new resume to
                                work.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/jobs"
                                    className="action-button inline-block px-8 py-4 bg-dark text-cream text-sm font-bold uppercase tracking-wider hover:bg-coral transition-colors"
                                >
                                    Browse Jobs
                                </Link>

                                <Link
                                    href="/resources"
                                    className="action-button inline-block px-8 py-4 bg-white text-dark text-sm font-bold uppercase tracking-wider hover:bg-yellow transition-colors"
                                >
                                    More Resources
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </HubAnimator>
    );
}
