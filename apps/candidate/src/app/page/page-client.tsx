"use client";

import Link from "next/link";
import { PageAnimator } from "./page-animator";

// Memphis colors - using semantic Tailwind theme colors
const MEMPHIS_COLORS = {
    coral: "bg-coral border-coral text-coral",
    teal: "bg-teal border-teal text-teal",
    yellow: "bg-yellow border-yellow text-yellow",
    purple: "bg-purple border-purple text-purple",
    dark: "bg-dark border-dark text-dark",
    cream: "bg-cream border-cream text-cream",
};

// ─── Data ───────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
    {
        icon: "fa-duotone fa-regular fa-circle-xmark",
        title: "Application Black Holes",
        text: "You send applications into the void. No response, no feedback, just silence.",
        color: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-ghost",
        title: "Ghosted by Recruiters",
        text: "Phone screens go well, then nothing. You're left wondering if you said something wrong.",
        color: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-shuffle",
        title: "Endless Job Board Scrolling",
        text: "Hours spent on Indeed, LinkedIn, Glassdoor—duplicates everywhere, outdated listings.",
        color: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-question",
        title: "No Salary Transparency",
        text: "You invest time interviewing only to discover the pay is half your expectations.",
        color: "purple",
    },
];

const PROMISES = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "A Recruiter in Your Corner",
        text: "Someone who knows your industry and actually advocates for you",
        color: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real Communication",
        text: "Status updates, feedback, and responses—not radio silence",
        color: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Opportunities",
        text: "Roles that match your skills and goals, not keyword spam",
        color: "yellow",
    },
];

const STEPS = [
    {
        number: "1",
        icon: "fa-duotone fa-regular fa-user-circle",
        title: "Create Your Profile",
        description:
            "Build a profile that showcases your skills, experience, and what you're looking for. Upload your resume to get started in minutes.",
        color: "coral",
    },
    {
        number: "2",
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Browse & Apply",
        description:
            "Explore curated opportunities from top companies. Apply with one click and get matched with recruiters who specialize in your field.",
        color: "teal",
    },
    {
        number: "3",
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Get Expert Support",
        description:
            "Your recruiter preps you for interviews, negotiates on your behalf, and keeps you updated every step of the way.",
        color: "yellow",
    },
    {
        number: "4",
        icon: "fa-duotone fa-regular fa-rocket",
        title: "Land Your Dream Job",
        description:
            "Accept an offer you're excited about and start your new role with confidence. That's it—no ghosting, no guessing.",
        color: "purple",
    },
];

const FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Expert Recruiter Network",
        description:
            "Get matched with specialized recruiters who know your industry and genuinely advocate for your success.",
        color: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "One-Click Apply",
        description:
            "Apply to multiple jobs instantly with your saved profile—no more copying and pasting the same info.",
        color: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Updates",
        description:
            "Track your application status and get instant notifications. No more wondering where you stand.",
        color: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Privacy First",
        description:
            "Your information is secure and only shared with companies you approve. You control your data.",
        color: "purple",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Career Insights",
        description:
            "Access salary data, market trends, and personalized recommendations to make informed decisions.",
        color: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Interview Prep",
        description:
            "Get coaching and resources from your recruiter to ace interviews with confidence.",
        color: "teal",
    },
];

const METRICS = [
    {
        value: "10,000+",
        label: "Active Job Listings",
        description: "New roles added daily from top companies",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "coral",
    },
    {
        value: "500+",
        label: "Companies Hiring",
        description: "From startups to Fortune 500",
        icon: "fa-duotone fa-regular fa-building",
        color: "teal",
    },
    {
        value: "2,000+",
        label: "Expert Recruiters",
        description: "Specialized across every industry",
        icon: "fa-duotone fa-regular fa-users",
        color: "yellow",
    },
    {
        value: "95%",
        label: "Response Rate",
        description: "Candidates hear back within 48 hours",
        icon: "fa-duotone fa-regular fa-comments",
        color: "purple",
    },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface PageMemphisClientProps {
    faqs: Array<{ question: string; answer: string }>;
}

export default function PageMemphisClient({ faqs }: PageMemphisClientProps) {
    return (
        <PageAnimator>
            <div className="bg-dark text-white">
                {/* ══════════════════════════════════════════════════════════
                    HERO SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="hero"
                    className="relative min-h-screen flex items-center overflow-hidden bg-dark"
                >
                    {/* Memphis decorative shapes */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <div className="hero-shape absolute top-[10%] left-[8%] w-32 h-32 rounded-full border-4 border-coral opacity-0" />
                        <div className="hero-shape absolute top-[60%] right-[12%] w-24 h-24 rounded-full bg-teal opacity-0" />
                        <div className="hero-shape absolute bottom-[15%] left-[18%] w-16 h-16 bg-yellow opacity-0" />
                        <div className="hero-shape absolute top-[25%] right-[25%] w-20 h-20 rotate-12 bg-purple opacity-0" />
                        <div className="hero-shape absolute bottom-[35%] right-[35%] w-28 h-12 -rotate-6 border-4 border-coral opacity-0" />
                        <div className="hero-shape absolute top-[45%] left-[30%] w-12 h-12 rotate-45 bg-coral opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-32">
                        <div className="max-w-6xl mx-auto text-center">
                            {/* Kicker */}
                            <div className="hero-kicker mb-6 opacity-0">
                                <span className="inline-block px-6 py-2 bg-coral border-4 border-coral text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                    <i className="fa-duotone fa-regular fa-bolt mr-2 text-[9px]"></i>
                                    Your Career Advocate
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="hero-headline text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0">
                                <span className="block text-white">
                                    FIND YOUR DREAM JOB,
                                </span>
                                <span className="block text-coral">
                                    POWERED BY EXPERT RECRUITERS
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="hero-subheadline text-lg md:text-xl text-white/70 font-bold mb-12 max-w-3xl mx-auto opacity-0">
                                Browse thousands of opportunities from top
                                companies. Get matched with specialized
                                recruiters who advocate for you throughout the
                                hiring process.
                            </p>

                            {/* CTA Buttons */}
                            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center mb-16 opacity-0">
                                <Link
                                    href="/public/jobs"
                                    className="px-8 py-4 bg-coral border-4 border-coral text-white text-xs font-black uppercase tracking-[0.15em] hover:-translate-y-1 transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-magnifying-glass mr-2 text-[10px]"></i>
                                    Explore Jobs
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="px-8 py-4 border-4 border-white text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-white hover:text-dark hover:-translate-y-1 transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus mr-2 text-[10px]"></i>
                                    Create Your Profile
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="hero-trust flex flex-wrap items-center justify-center gap-8 text-sm opacity-0">
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-teal text-lg"></i>
                                    <span className="font-bold text-white/70">
                                        Free to use
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-teal text-lg"></i>
                                    <span className="font-bold text-white/70">
                                        Expert guidance
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-teal text-lg"></i>
                                    <span className="font-bold text-white/70">
                                        Top companies
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    PROBLEM SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="problem"
                    className="relative py-32 bg-dark-lighter overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                        <div className="absolute top-12 right-[15%] w-20 h-20 rounded-full border-4 border-yellow" />
                        <div className="absolute bottom-16 left-[20%] w-16 h-16 bg-purple" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-6xl mx-auto">
                            {/* Section header */}
                            <div className="problem-header text-center mb-20 opacity-0">
                                <span className="inline-block px-6 py-2 bg-yellow border-4 border-yellow text-dark text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    Sound Familiar?
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                    JOB SEARCHING SHOULDN&apos;T{" "}
                                    <span className="text-yellow">
                                        FEEL LIKE THIS
                                    </span>
                                </h2>
                                <p className="text-lg text-white/70 font-bold max-w-2xl mx-auto">
                                    You&apos;re qualified, motivated, and
                                    ready—but the traditional job search feels
                                    like shouting into a void.
                                </p>
                            </div>

                            {/* Pain points grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {PAIN_POINTS.map((item, idx) => (
                                    <div
                                        key={item.title}
                                        className={`problem-card bg-dark border-4 border-${item.color} p-8 opacity-0 relative`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-12 h-12 bg-${item.color}`}
                                        />

                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 flex items-center justify-center bg-${item.color}/20 border-4 border-${item.color} flex-shrink-0`}
                                            >
                                                <i
                                                    className={`${item.icon} text-xl text-${item.color}`}
                                                ></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3
                                                    className={`text-lg font-black uppercase tracking-[0.12em] mb-3 text-${item.color}`}
                                                >
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm font-bold text-white/70 leading-relaxed">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    SOLUTION/PROMISE SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="solution"
                    className="relative py-32 bg-cream text-dark overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                        <div className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-coral" />
                        <div className="absolute bottom-24 right-[12%] w-20 h-20 rotate-45 border-4 border-teal" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-6xl mx-auto">
                            {/* Section header */}
                            <div className="solution-header text-center mb-20 opacity-0">
                                <span className="inline-block px-6 py-2 bg-teal border-4 border-teal text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    There&apos;s a Better Way
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                    WHAT IF YOUR JOB SEARCH
                                    <br />
                                    <span className="text-teal">HAD BACKUP?</span>
                                </h2>
                                <p className="text-lg text-dark/70 font-bold max-w-2xl mx-auto">
                                    Imagine having an expert recruiter working
                                    alongside you—opening doors, prepping you
                                    for interviews, and making sure you never
                                    get ghosted again.
                                </p>
                            </div>

                            {/* Promise cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {PROMISES.map((item, idx) => (
                                    <div
                                        key={item.title}
                                        className={`solution-card bg-white border-4 border-${item.color} p-8 hover:bg-${item.color}/10 hover:-translate-y-1 transition-all opacity-0 relative`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-12 h-12 bg-${item.color}`}
                                        />

                                        <div className="text-center">
                                            <div
                                                className={`w-16 h-16 flex items-center justify-center bg-${item.color}/20 border-4 border-${item.color} mx-auto mb-6`}
                                            >
                                                <i
                                                    className={`${item.icon} text-2xl text-${item.color}`}
                                                ></i>
                                            </div>
                                            <h3
                                                className={`text-xl font-black uppercase tracking-[0.12em] mb-4 text-${item.color}`}
                                            >
                                                {item.title}
                                            </h3>
                                            <p className="text-sm font-bold text-dark/70 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    HOW IT WORKS SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="how-it-works"
                    className="relative py-32 bg-white text-dark overflow-hidden"
                >
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-6xl mx-auto">
                            {/* Section header */}
                            <div className="how-header text-center mb-20 opacity-0">
                                <span className="inline-block px-6 py-2 bg-coral border-4 border-coral text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    How It Works
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                    YOUR PATH TO{" "}
                                    <span className="text-coral">SUCCESS</span>
                                </h2>
                                <p className="text-lg text-dark/70 font-bold max-w-2xl mx-auto">
                                    From profile to placement—here&apos;s how we
                                    help you land your next role
                                </p>
                            </div>

                            {/* Steps grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {STEPS.map((step, idx) => (
                                    <div
                                        key={step.number}
                                        className={`step-card bg-cream border-4 border-${step.color} p-8 opacity-0 relative`}
                                    >
                                        {/* Floating step number */}
                                        <div
                                            className={`absolute -top-5 -left-3 w-14 h-14 flex items-center justify-center bg-${step.color} border-4 border-${step.color}`}
                                        >
                                            <span className="text-2xl font-black text-white">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4 mt-4">
                                            <div
                                                className={`w-12 h-12 flex items-center justify-center bg-${step.color}/20 border-4 border-${step.color} flex-shrink-0`}
                                            >
                                                <i
                                                    className={`${step.icon} text-lg text-${step.color}`}
                                                ></i>
                                            </div>
                                            <div>
                                                <h3
                                                    className={`text-lg font-black uppercase tracking-[0.12em] mb-2 text-${step.color}`}
                                                >
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm font-bold text-dark/70 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FEATURES SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="features"
                    className="relative py-32 bg-dark-lighter overflow-hidden"
                >
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            {/* Section header */}
                            <div className="features-header text-center mb-20 opacity-0">
                                <span className="inline-block px-6 py-2 bg-purple border-4 border-purple text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    Platform Features
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                    WHY CANDIDATES{" "}
                                    <span className="text-purple">LOVE US</span>
                                </h2>
                                <p className="text-lg text-white/70 font-bold max-w-2xl mx-auto">
                                    Tools and support designed to accelerate
                                    your job search and land you the right role
                                </p>
                            </div>

                            {/* Feature cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {FEATURES.map((feature, idx) => (
                                    <div
                                        key={feature.title}
                                        className={`feature-card bg-dark border-4 border-${feature.color} p-6 hover:bg-${feature.color}/10 hover:-translate-y-1 transition-all opacity-0`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-14 h-14 flex items-center justify-center bg-${feature.color}/20 border-4 border-${feature.color} flex-shrink-0`}
                                            >
                                                <i
                                                    className={`${feature.icon} text-2xl text-${feature.color}`}
                                                ></i>
                                            </div>
                                            <div>
                                                <h3
                                                    className={`text-lg font-black uppercase tracking-[0.12em] mb-2 text-${feature.color}`}
                                                >
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm font-bold text-white/70 leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    METRICS SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="metrics"
                    className="relative py-32 bg-dark overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                        <div className="absolute top-16 left-[10%] w-28 h-28 rounded-full border-4 border-purple" />
                        <div className="absolute bottom-20 right-[15%] w-20 h-20 rotate-12 bg-coral" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-6xl mx-auto">
                            {/* Section header */}
                            <div className="metrics-header text-center mb-20 opacity-0">
                                <span className="inline-block px-6 py-2 bg-teal border-4 border-teal text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    By The Numbers
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                                    A GROWING{" "}
                                    <span className="text-teal">NETWORK</span>
                                </h2>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {METRICS.map((stat, idx) => (
                                    <div
                                        key={stat.label}
                                        className={`metric-card bg-dark-lighter border-4 border-${stat.color} p-8 text-center hover:bg-${stat.color}/10 hover:-translate-y-1 transition-all opacity-0`}
                                    >
                                        <div
                                            className={`w-16 h-16 flex items-center justify-center bg-${stat.color}/20 border-4 border-${stat.color} mx-auto mb-6`}
                                        >
                                            <i
                                                className={`${stat.icon} text-2xl text-${stat.color}`}
                                            ></i>
                                        </div>
                                        <div
                                            className={`text-4xl font-black mb-2 text-${stat.color}`}
                                        >
                                            {stat.value}
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-[0.12em] text-white mb-2">
                                            {stat.label}
                                        </div>
                                        <div className="text-xs font-bold text-white/60">
                                            {stat.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FAQ SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="faq"
                    className="relative py-32 bg-cream text-dark overflow-hidden"
                >
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            {/* Section header */}
                            <div className="faq-header text-center mb-20 opacity-0">
                                <span className="inline-block px-6 py-2 bg-coral border-4 border-coral text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    Common Questions
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                    FREQUENTLY ASKED{" "}
                                    <span className="text-coral">QUESTIONS</span>
                                </h2>
                                <p className="text-lg text-dark/70 font-bold max-w-2xl mx-auto">
                                    Everything you need to know about getting
                                    started
                                </p>
                            </div>

                            {/* FAQ items */}
                            <div className="space-y-4">
                                {faqs.map((faq, index) => {
                                    const colors = [
                                        "coral",
                                        "teal",
                                        "yellow",
                                        "purple",
                                    ];
                                    const color =
                                        colors[index % colors.length];
                                    const faqId = `landing-faq-${index}`;

                                    return (
                                        <details
                                            key={index}
                                            className={`faq-item group bg-white border-4 border-${color} p-6 opacity-0`}
                                        >
                                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                                <span
                                                    className={`text-lg font-black uppercase tracking-[0.12em] text-${color} pr-4`}
                                                >
                                                    {faq.question}
                                                </span>
                                                <div
                                                    className={`w-10 h-10 flex items-center justify-center bg-${color} border-4 border-${color} flex-shrink-0 transition-transform group-open:rotate-45`}
                                                >
                                                    <i className="fa-duotone fa-regular fa-plus text-white text-lg"></i>
                                                </div>
                                            </summary>
                                            <div className="mt-6 pt-6 border-t-4 border-dark/10">
                                                <p className="text-sm font-bold text-dark/70 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FINAL CTA SECTION
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="cta"
                    className="relative py-32 bg-coral overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <div className="absolute top-12 right-[20%] w-32 h-32 rounded-full border-4 border-white" />
                        <div className="absolute bottom-16 left-[25%] w-24 h-24 bg-white" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="cta-content opacity-0">
                                <h2 className="text-5xl md:text-6xl font-black leading-tight text-white mb-8">
                                    READY TO TAKE THE
                                    <br />
                                    <span className="text-dark">NEXT STEP?</span>
                                </h2>
                                <p className="text-xl font-bold text-white/90 mb-12 max-w-2xl mx-auto">
                                    Join thousands of candidates who are finding
                                    better opportunities with expert recruiter
                                    support
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                    <Link
                                        href="/sign-up"
                                        className="px-10 py-4 bg-white border-4 border-white text-coral text-xs font-black uppercase tracking-[0.15em] hover:bg-transparent hover:text-white hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-user-plus mr-2 text-[10px]"></i>
                                        Create Free Account
                                    </Link>
                                    <Link
                                        href="/public/jobs"
                                        className="px-10 py-4 bg-dark border-4 border-dark text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-transparent hover:border-white hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-magnifying-glass mr-2 text-[10px]"></i>
                                        Browse Jobs First
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-white text-lg"></i>
                                        <span className="font-bold text-white/90">
                                            No credit card required
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-white text-lg"></i>
                                        <span className="font-bold text-white/90">
                                            Takes less than 2 minutes
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-white text-lg"></i>
                                        <span className="font-bold text-white/90">
                                            Free forever
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageAnimator>
    );
}
