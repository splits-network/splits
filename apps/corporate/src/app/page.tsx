import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { LandingAnimator } from "./landing-animator";

export const metadata: Metadata = {
    title: "Modern Recruiting & Candidate Experience | Employment Networks",
    description:
        "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates. Two platforms, one connected ecosystem for transparent recruiting.",
    ...buildCanonical(""),
};

// ─── Data ───────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
    {
        audience: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "coral",
        pains: [
            "Spreadsheet chaos for split-fee tracking",
            "Hours wasted on admin instead of recruiting",
            "Fragmented tools that don't talk to each other",
        ],
    },
    {
        audience: "Candidates",
        icon: "fa-duotone fa-regular fa-user",
        color: "teal",
        pains: [
            "Ghosted after interviews with no feedback",
            "Applications vanish into black holes",
            "Duplicate listings across dozens of boards",
        ],
    },
    {
        audience: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        color: "yellow",
        pains: [
            "Managing dozens of recruiter contracts",
            "No visibility into recruiter activity",
            "Surprise fees and unclear terms",
        ],
    },
];

const SOLUTIONS = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Transparent Partnerships",
        text: "Clear terms, visible pipelines, and honest communication between all parties.",
        color: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Connected Ecosystem",
        text: "Recruiters, companies, and candidates all on platforms designed to work together.",
        color: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Modern Technology",
        text: "Real-time updates, automated workflows, and tools that save everyone time.",
        color: "yellow",
    },
];

const RECRUITER_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Roles",
        text: "Access roles that match your expertise—no cold outreach needed.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        title: "Unified Pipeline",
        text: "Track every candidate and submission in one clean dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Transparent Earnings",
        text: "See exactly what you'll earn on each placement. No mystery math.",
    },
];

const CANDIDATE_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Specialized Advocates",
        text: "Get matched with recruiters who actually advocate for you.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real Communication",
        text: "Status updates, feedback, and no ghosting. Ever.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Privacy First",
        text: "Your data stays private until you choose to share it.",
    },
];

const COMPANY_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        title: "Recruiter Network",
        text: "Tap into specialized recruiters—no individual contracts.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Full Visibility",
        text: "See who's working your roles and every pipeline status.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        title: "Pay on Hire",
        text: "Pay only when someone starts. No retainers, no surprises.",
    },
];

const STATS = [
    { value: "10,000+", label: "Active Job Listings", icon: "fa-duotone fa-regular fa-briefcase", color: "coral" },
    { value: "2,000+", label: "Recruiters in Network", icon: "fa-duotone fa-regular fa-user-tie", color: "teal" },
    { value: "500+", label: "Companies Hiring", icon: "fa-duotone fa-regular fa-building", color: "yellow" },
    { value: "95%", label: "48hr Response Rate", icon: "fa-duotone fa-regular fa-comments", color: "purple" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomeMemphisPage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Employment Networks - Modern Recruiting & Candidate Experience",
        url: "https://employment-networks.com",
        description:
            "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates.",
        isPartOf: {
            "@type": "WebSite",
            name: "Employment Networks",
            url: "https://employment-networks.com",
        },
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="employment-home-jsonld" />
            <LandingAnimator>
                <div className="bg-dark text-white">
                    {/* ══════════════════════════════════════════════════════════
                        HERO
                       ══════════════════════════════════════════════════════════ */}
                    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
                        {/* Memphis decorations */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                            <div className="hero-shape absolute top-[10%] left-[8%] w-32 h-32 rounded-full border-4 border-coral opacity-0" />
                            <div className="hero-shape absolute top-[60%] right-[12%] w-24 h-24 rounded-full bg-teal opacity-0" />
                            <div className="hero-shape absolute bottom-[15%] left-[18%] w-16 h-16 bg-yellow opacity-0" />
                            <div className="hero-shape absolute top-[25%] right-[25%] w-20 h-20 rotate-12 bg-purple opacity-0" />
                            <div className="hero-shape absolute bottom-[35%] right-[35%] w-28 h-12 -rotate-6 border-4 border-coral opacity-0" />
                            <div className="hero-shape absolute top-[45%] left-[30%] w-12 h-12 rotate-45 bg-coral opacity-0" />
                            {/* Triangle */}
                            <div
                                className="hero-shape absolute top-[20%] left-[48%] opacity-0"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: "30px solid transparent",
                                    borderRight: "30px solid transparent",
                                    borderBottom: "52px solid #FFE66D",
                                    transform: "rotate(-10deg)",
                                }}
                            />
                            {/* Zigzag */}
                            <svg
                                className="hero-shape absolute top-[75%] left-[42%] opacity-0"
                                width="120"
                                height="40"
                                viewBox="0 0 120 40"
                            >
                                <polyline
                                    points="0,30 15,10 30,30 45,10 60,30 75,10 90,30 105,10 120,30"
                                    fill="none"
                                    stroke="#4ECDC4"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div className="container mx-auto px-4 relative z-10 py-32">
                            <div className="max-w-6xl mx-auto text-center">
                                {/* Kicker */}
                                <div className="hero-kicker mb-6 opacity-0">
                                    <span className="inline-block px-6 py-2 bg-coral/20 border-4 border-coral text-coral text-[10px] font-black uppercase tracking-[0.2em]">
                                        <i className="fa-duotone fa-regular fa-bolt mr-2 text-[9px]"></i>
                                        The Future of Recruiting
                                    </span>
                                </div>

                                {/* Headline */}
                                <h1 className="hero-headline text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0">
                                    <span className="block text-white">TWO PLATFORMS.</span>
                                    <span className="block text-white">ONE ECOSYSTEM.</span>
                                    <span className="block text-coral">TOTAL TRANSPARENCY.</span>
                                </h1>

                                {/* Subheadline */}
                                <p className="hero-subheadline text-lg md:text-xl text-white/70 font-bold mb-12 max-w-3xl mx-auto opacity-0">
                                    Employment Networks powers Splits Network for recruiters and
                                    Applicant Network for candidates. A connected ecosystem built
                                    for modern recruiting.
                                </p>

                                {/* Platform badges */}
                                <div className="hero-badges flex flex-col sm:flex-row gap-6 justify-center mb-16 opacity-0">
                                    <a
                                        href="https://splits.network"
                                        className="group flex items-center gap-4 bg-dark-lighter border-4 border-teal px-8 py-5 hover:bg-teal hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-handshake text-3xl text-teal group-hover:text-dark transition-colors"></i>
                                        <div className="text-left">
                                            <div className="text-sm font-black uppercase tracking-[0.15em] text-teal group-hover:text-dark transition-colors">
                                                Splits Network
                                            </div>
                                            <div className="text-xs font-bold text-white/60 group-hover:text-dark/60 transition-colors">
                                                For Recruiters &amp; Companies
                                            </div>
                                        </div>
                                    </a>
                                    <a
                                        href="https://applicant.network"
                                        className="group flex items-center gap-4 bg-dark-lighter border-4 border-coral px-8 py-5 hover:bg-coral hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-user-check text-3xl text-coral group-hover:text-dark transition-colors"></i>
                                        <div className="text-left">
                                            <div className="text-sm font-black uppercase tracking-[0.15em] text-coral group-hover:text-dark transition-colors">
                                                Applicant Network
                                            </div>
                                            <div className="text-xs font-bold text-white/60 group-hover:text-dark/60 transition-colors">
                                                For Job Seekers
                                            </div>
                                        </div>
                                    </a>
                                </div>

                                {/* CTA Buttons */}
                                <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                                    <a
                                        href="#for-recruiters"
                                        className="px-8 py-4 bg-coral border-4 border-coral text-white text-xs font-black uppercase tracking-[0.15em] hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-user-tie mr-2 text-[10px]"></i>
                                        I&apos;m a Recruiter
                                    </a>
                                    <a
                                        href="#for-candidates"
                                        className="px-8 py-4 bg-teal border-4 border-teal text-dark text-xs font-black uppercase tracking-[0.15em] hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-user mr-2 text-[10px]"></i>
                                        I&apos;m Looking for a Job
                                    </a>
                                    <a
                                        href="#for-companies"
                                        className="px-8 py-4 border-4 border-white text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-white hover:text-dark hover:-translate-y-1 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-building mr-2 text-[10px]"></i>
                                        I&apos;m Hiring
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        PROBLEM
                       ══════════════════════════════════════════════════════════ */}
                    <section id="problem" className="relative py-32 bg-dark-lighter overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                            <div className="absolute top-12 right-[15%] w-20 h-20 rounded-full border-4 border-yellow" />
                            <div className="absolute bottom-16 left-[20%] w-16 h-16 bg-purple" />
                        </div>

                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-6xl mx-auto">
                                {/* Section header */}
                                <div className="problem-header text-center mb-20 opacity-0">
                                    <span className="inline-block px-6 py-2 bg-yellow/20 border-4 border-yellow text-yellow text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                        The Industry Problem
                                    </span>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                        RECRUITING IS{" "}
                                        <span className="text-yellow">BROKEN</span>
                                    </h2>
                                    <p className="text-lg text-white/70 font-bold max-w-2xl mx-auto">
                                        Everyone loses in the current system. Recruiters waste
                                        time. Candidates get ghosted. Companies overpay.
                                    </p>
                                </div>

                                {/* Pain points grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {PAIN_POINTS.map((item, idx) => (
                                        <div
                                            key={item.audience}
                                            className={`problem-card bg-dark border-4 border-${item.color} p-8 opacity-0`}
                                        >
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className={`w-12 h-12 flex items-center justify-center bg-${item.color}/20 border-4 border-${item.color}`}>
                                                    <i className={`${item.icon} text-xl text-${item.color}`}></i>
                                                </div>
                                                <h3 className={`text-xl font-black uppercase tracking-[0.12em] text-${item.color}`}>
                                                    {item.audience}
                                                </h3>
                                            </div>
                                            <ul className="space-y-3">
                                                {item.pains.map((pain, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-3 text-sm font-bold text-white/70"
                                                    >
                                                        <div className={`w-2 h-2 bg-${item.color} flex-shrink-0 mt-1.5`} />
                                                        {pain}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        SOLUTION
                       ══════════════════════════════════════════════════════════ */}
                    <section id="solution" className="relative py-32 bg-dark overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                            <div className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-coral" />
                            <div className="absolute bottom-24 right-[12%] w-20 h-20 rotate-45 border-4 border-teal" />
                        </div>

                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-6xl mx-auto">
                                {/* Section header */}
                                <div className="solution-header text-center mb-20 opacity-0">
                                    <span className="inline-block px-6 py-2 bg-teal/20 border-4 border-teal text-teal text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                        Our Solution
                                    </span>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                        A PLATFORM
                                        <br />
                                        <span className="text-teal">BUILT DIFFERENT</span>
                                    </h2>
                                    <p className="text-lg text-white/70 font-bold max-w-2xl mx-auto">
                                        We rebuilt recruiting from the ground up. Connected.
                                        Transparent. Modern.
                                    </p>
                                </div>

                                {/* Solution cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {SOLUTIONS.map((item, idx) => (
                                        <div
                                            key={item.title}
                                            className={`solution-card bg-dark-lighter border-4 border-${item.color} p-8 hover:bg-${item.color}/10 hover:-translate-y-1 transition-all opacity-0`}
                                        >
                                            <div className={`w-16 h-16 flex items-center justify-center bg-${item.color}/20 border-4 border-${item.color} mb-6`}>
                                                <i className={`${item.icon} text-2xl text-${item.color}`}></i>
                                            </div>
                                            <h3 className={`text-xl font-black uppercase tracking-[0.12em] mb-4 text-${item.color}`}>
                                                {item.title}
                                            </h3>
                                            <p className="text-sm font-bold text-white/70 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        FOR RECRUITERS
                       ══════════════════════════════════════════════════════════ */}
                    <section id="for-recruiters" className="relative py-32 bg-coral/5 overflow-hidden">
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    {/* Left: Content */}
                                    <div>
                                        <div className="recruiter-header mb-12 opacity-0">
                                            <span className="inline-block px-6 py-2 bg-coral border-4 border-coral text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                                <i className="fa-duotone fa-regular fa-user-tie mr-2 text-[9px]"></i>
                                                For Recruiters
                                            </span>
                                            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                                                WORK SMARTER.
                                                <br />
                                                <span className="text-coral">EARN MORE.</span>
                                            </h2>
                                            <p className="text-lg text-white/70 font-bold">
                                                Splits Network gives you the tools to find better
                                                roles, manage candidates efficiently, and track
                                                every placement in one place.
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-6">
                                            {RECRUITER_FEATURES.map((feature, idx) => (
                                                <div
                                                    key={feature.title}
                                                    className="recruiter-feature flex items-start gap-4 bg-dark-lighter border-4 border-transparent hover:border-coral p-6 transition-all opacity-0"
                                                >
                                                    <div className="w-12 h-12 flex items-center justify-center bg-coral/20 border-4 border-coral flex-shrink-0">
                                                        <i className={`${feature.icon} text-lg text-coral`}></i>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black uppercase tracking-[0.12em] text-coral mb-2">
                                                            {feature.title}
                                                        </h4>
                                                        <p className="text-sm font-bold text-white/70">
                                                            {feature.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <div className="recruiter-cta mt-10 opacity-0">
                                            <a
                                                href="https://splits.network"
                                                className="inline-flex items-center gap-3 px-10 py-4 bg-coral border-4 border-coral text-white text-xs font-black uppercase tracking-[0.15em] hover:-translate-y-1 transition-all"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-right text-[10px]"></i>
                                                Join Splits Network
                                            </a>
                                        </div>
                                    </div>

                                    {/* Right: Visual */}
                                    <div className="recruiter-visual opacity-0">
                                        <div className="bg-dark-lighter border-4 border-coral p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-coral">
                                                    Your Pipeline
                                                </h4>
                                                <span className="text-xs font-black uppercase tracking-[0.15em] text-white/40">
                                                    12 Active Roles
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { role: "Senior Software Engineer", company: "TechCorp", status: "3 Candidates", color: "coral" },
                                                    { role: "Product Manager", company: "StartupXYZ", status: "Interviewing", color: "teal" },
                                                    { role: "UX Designer", company: "DesignCo", status: "Offer Stage", color: "yellow" },
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-dark border-4 border-white/10 p-4 hover:border-coral transition-all"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-sm font-black text-white">
                                                                {item.role}
                                                            </h5>
                                                            <span className={`px-3 py-1 bg-${item.color}/20 border-4 border-${item.color} text-${item.color} text-[9px] font-black uppercase tracking-[0.1em]`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-white/60">
                                                            {item.company}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        FOR CANDIDATES
                       ══════════════════════════════════════════════════════════ */}
                    <section id="for-candidates" className="relative py-32 bg-teal/5 overflow-hidden">
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    {/* Left: Visual */}
                                    <div className="candidate-visual opacity-0 order-2 lg:order-1">
                                        <div className="bg-dark-lighter border-4 border-teal p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-teal">
                                                    Your Applications
                                                </h4>
                                                <span className="text-xs font-black uppercase tracking-[0.15em] text-white/40">
                                                    8 Active
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { role: "Senior Frontend Developer", company: "Acme Inc", status: "Interview Scheduled", color: "teal" },
                                                    { role: "Full Stack Engineer", company: "TechStart", status: "Under Review", color: "yellow" },
                                                    { role: "React Developer", company: "BuildCo", status: "Recruiter Matched", color: "coral" },
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-dark border-4 border-white/10 p-4 hover:border-teal transition-all"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-sm font-black text-white">
                                                                {item.role}
                                                            </h5>
                                                            <span className={`px-3 py-1 bg-${item.color}/20 border-4 border-${item.color} text-${item.color} text-[9px] font-black uppercase tracking-[0.1em]`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-white/60">
                                                            {item.company}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Content */}
                                    <div className="order-1 lg:order-2">
                                        <div className="candidate-header mb-12 opacity-0">
                                            <span className="inline-block px-6 py-2 bg-teal border-4 border-teal text-dark text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                                <i className="fa-duotone fa-regular fa-user mr-2 text-[9px]"></i>
                                                For Candidates
                                            </span>
                                            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                                                FIND YOUR DREAM JOB.
                                                <br />
                                                <span className="text-teal">NO GHOSTING.</span>
                                            </h2>
                                            <p className="text-lg text-white/70 font-bold">
                                                Applicant Network connects you with specialized
                                                recruiters who actually care about your success.
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-6">
                                            {CANDIDATE_FEATURES.map((feature, idx) => (
                                                <div
                                                    key={feature.title}
                                                    className="candidate-feature flex items-start gap-4 bg-dark-lighter border-4 border-transparent hover:border-teal p-6 transition-all opacity-0"
                                                >
                                                    <div className="w-12 h-12 flex items-center justify-center bg-teal/20 border-4 border-teal flex-shrink-0">
                                                        <i className={`${feature.icon} text-lg text-teal`}></i>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black uppercase tracking-[0.12em] text-teal mb-2">
                                                            {feature.title}
                                                        </h4>
                                                        <p className="text-sm font-bold text-white/70">
                                                            {feature.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <div className="candidate-cta mt-10 opacity-0">
                                            <a
                                                href="https://applicant.network"
                                                className="inline-flex items-center gap-3 px-10 py-4 bg-teal border-4 border-teal text-dark text-xs font-black uppercase tracking-[0.15em] hover:-translate-y-1 transition-all"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-right text-[10px]"></i>
                                                Join Applicant Network
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        FOR COMPANIES
                       ══════════════════════════════════════════════════════════ */}
                    <section id="for-companies" className="relative py-32 bg-yellow/5 overflow-hidden">
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    {/* Left: Content */}
                                    <div>
                                        <div className="company-header mb-12 opacity-0">
                                            <span className="inline-block px-6 py-2 bg-yellow border-4 border-yellow text-dark text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                                <i className="fa-duotone fa-regular fa-building mr-2 text-[9px]"></i>
                                                For Companies
                                            </span>
                                            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                                                HIRE FASTER.
                                                <br />
                                                <span className="text-yellow">PAY LESS.</span>
                                            </h2>
                                            <p className="text-lg text-white/70 font-bold">
                                                Access a network of specialized recruiters with one
                                                platform. Full transparency, consistent terms.
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-6">
                                            {COMPANY_FEATURES.map((feature, idx) => (
                                                <div
                                                    key={feature.title}
                                                    className="company-feature flex items-start gap-4 bg-dark-lighter border-4 border-transparent hover:border-yellow p-6 transition-all opacity-0"
                                                >
                                                    <div className="w-12 h-12 flex items-center justify-center bg-yellow/20 border-4 border-yellow flex-shrink-0">
                                                        <i className={`${feature.icon} text-lg text-yellow`}></i>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black uppercase tracking-[0.12em] text-yellow mb-2">
                                                            {feature.title}
                                                        </h4>
                                                        <p className="text-sm font-bold text-white/70">
                                                            {feature.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <div className="company-cta mt-10 opacity-0">
                                            <a
                                                href="https://splits.network"
                                                className="inline-flex items-center gap-3 px-10 py-4 bg-yellow border-4 border-yellow text-dark text-xs font-black uppercase tracking-[0.15em] hover:-translate-y-1 transition-all"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-right text-[10px]"></i>
                                                Start Hiring Today
                                            </a>
                                        </div>
                                    </div>

                                    {/* Right: Visual */}
                                    <div className="company-visual opacity-0">
                                        <div className="bg-dark-lighter border-4 border-yellow p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-yellow">
                                                    Open Roles
                                                </h4>
                                                <span className="text-xs font-black uppercase tracking-[0.15em] text-white/40">
                                                    6 Active
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { role: "Backend Engineer", location: "San Francisco, CA", candidates: "5 Candidates", recruiters: "3 Recruiters" },
                                                    { role: "Sales Director", location: "Remote", candidates: "2 Candidates", recruiters: "2 Recruiters" },
                                                    { role: "Product Manager", location: "New York, NY", candidates: "8 Candidates", recruiters: "4 Recruiters" },
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-dark border-4 border-white/10 p-4 hover:border-yellow transition-all"
                                                    >
                                                        <h5 className="text-sm font-black text-white mb-1">
                                                            {item.role}
                                                        </h5>
                                                        <p className="text-xs font-bold text-white/60 mb-3">
                                                            {item.location}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-yellow">
                                                            <span>{item.candidates}</span>
                                                            <span className="text-white/20">•</span>
                                                            <span>{item.recruiters}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        STATS
                       ══════════════════════════════════════════════════════════ */}
                    <section id="stats" className="relative py-32 bg-dark overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                            <div className="absolute top-16 left-[10%] w-28 h-28 rounded-full border-4 border-purple" />
                            <div className="absolute bottom-20 right-[15%] w-20 h-20 rotate-12 bg-coral" />
                        </div>

                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-6xl mx-auto">
                                {/* Section header */}
                                <div className="stats-header text-center mb-20 opacity-0">
                                    <span className="inline-block px-6 py-2 bg-purple/20 border-4 border-purple text-purple text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                        By The Numbers
                                    </span>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                                        PLATFORM <span className="text-purple">IMPACT</span>
                                    </h2>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {STATS.map((stat, idx) => (
                                        <div
                                            key={stat.label}
                                            className={`stat-card bg-dark-lighter border-4 border-${stat.color} p-8 text-center hover:bg-${stat.color}/10 hover:-translate-y-1 transition-all opacity-0`}
                                        >
                                            <div className={`w-16 h-16 flex items-center justify-center bg-${stat.color}/20 border-4 border-${stat.color} mx-auto mb-6`}>
                                                <i className={`${stat.icon} text-2xl text-${stat.color}`}></i>
                                            </div>
                                            <div className={`text-4xl font-black mb-2 text-${stat.color}`}>
                                                {stat.value}
                                            </div>
                                            <div className="text-xs font-black uppercase tracking-[0.12em] text-white/70">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════════════════
                        FINAL CTA
                       ══════════════════════════════════════════════════════════ */}
                    <section id="contact" className="relative py-32 bg-coral overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                            <div className="absolute top-12 right-[20%] w-32 h-32 rounded-full border-4 border-white" />
                            <div className="absolute bottom-16 left-[25%] w-24 h-24 bg-white" />
                        </div>

                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-4xl mx-auto text-center">
                                <div className="cta-content opacity-0">
                                    <h2 className="text-5xl md:text-6xl font-black leading-tight text-white mb-8">
                                        READY TO JOIN THE
                                        <br />
                                        <span className="text-dark">FUTURE OF RECRUITING?</span>
                                    </h2>
                                    <p className="text-xl font-bold text-white/90 mb-12 max-w-2xl mx-auto">
                                        Whether you're a recruiter, candidate, or company—we've built
                                        the platform you've been waiting for.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <a
                                            href="https://splits.network"
                                            className="px-10 py-4 bg-white border-4 border-white text-coral text-xs font-black uppercase tracking-[0.15em] hover:bg-transparent hover:text-white hover:-translate-y-1 transition-all"
                                        >
                                            <i className="fa-duotone fa-regular fa-handshake mr-2 text-[10px]"></i>
                                            Join Splits Network
                                        </a>
                                        <a
                                            href="https://applicant.network"
                                            className="px-10 py-4 bg-dark border-4 border-dark text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-transparent hover:border-white hover:-translate-y-1 transition-all"
                                        >
                                            <i className="fa-duotone fa-regular fa-user-check mr-2 text-[10px]"></i>
                                            Join Applicant Network
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </LandingAnimator>
        </>
    );
}
