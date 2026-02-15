import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { NineAnimator } from "./nine-animator";

export const metadata: Metadata = {
    title: "Clean Architecture for Recruiting | Employment Networks",
    description:
        "Employment Networks brings architectural precision to recruiting. Two platforms, one structured ecosystem connecting recruiters, companies, and candidates.",
    ...buildCanonical("/landing/nine"),
};

// -- Data -------------------------------------------------------------------

const blueprintStats = [
    { label: "Active Roles", value: "10,000+", mono: true },
    { label: "Recruiters", value: "2,000+", mono: true },
    { label: "Companies", value: "500+", mono: true },
    { label: "Response Rate", value: "95%", mono: true },
];

const painPoints = [
    {
        role: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
        items: [
            "Fragmented tools that don't talk to each other",
            "Spreadsheet chaos for split-fee tracking",
            "Hours wasted on admin instead of recruiting",
        ],
    },
    {
        role: "Candidates",
        icon: "fa-duotone fa-regular fa-user",
        items: [
            "Ghosted after interviews with no feedback",
            "Applications vanish into black holes",
            "Duplicate listings across dozens of boards",
        ],
    },
    {
        role: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        items: [
            "Managing dozens of recruiter contracts",
            "No visibility into recruiter activity",
            "Surprise fees and unclear terms",
        ],
    },
];

const pillars = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Transparent Partnerships",
        desc: "Clear terms, visible pipelines, and honest communication between all parties.",
        ref: "01",
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Connected Ecosystem",
        desc: "Recruiters, companies, and candidates on platforms designed to work together.",
        ref: "02",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Modern Technology",
        desc: "Real-time updates, automated workflows, and tools that save everyone time.",
        ref: "03",
    },
];

const recruiterFeatures = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Roles",
        desc: "Access roles matching your expertise. No cold outreach needed.",
    },
    {
        icon: "fa-duotone fa-regular fa-sliders",
        title: "Choose Your Work",
        desc: "Pick only the roles that fit your niche. You decide what to take on.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        title: "Pipeline Tracking",
        desc: "Track every candidate and submission in one clean pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Transparent Earnings",
        desc: "See exactly what you earn on each placement. No mystery math.",
    },
];

const candidateFeatures = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Expert Matching",
        desc: "Get matched with recruiters who actually advocate for you.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real Communication",
        desc: "Status updates, feedback, and no ghosting. Ever.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Opportunities",
        desc: "Opportunities that match your skills and career goals.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Privacy First",
        desc: "Your data stays private until you choose to share it.",
    },
];

const companyFeatures = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        title: "Recruiter Network",
        desc: "Tap into specialized recruiters without individual contracts.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Full Visibility",
        desc: "See every pipeline. Know who is working your roles.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "Consistent Terms",
        desc: "Set fees once. They apply to every recruiter consistently.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        title: "Pay on Hire",
        desc: "No retainers, no surprises. Pay only when someone starts.",
    },
];

const processSteps = [
    {
        num: "01",
        title: "Company Posts Role",
        desc: "Define requirements, set terms, and publish to the network.",
        icon: "fa-duotone fa-regular fa-file-plus",
    },
    {
        num: "02",
        title: "Recruiters Engage",
        desc: "Qualified recruiters opt in and begin sourcing candidates.",
        icon: "fa-duotone fa-regular fa-user-magnifying-glass",
    },
    {
        num: "03",
        title: "Candidates Apply",
        desc: "Matched candidates apply through their dedicated portal.",
        icon: "fa-duotone fa-regular fa-paper-plane",
    },
    {
        num: "04",
        title: "Placement Made",
        desc: "Hire is completed. Fees are split automatically.",
        icon: "fa-duotone fa-regular fa-badge-check",
    },
];

const faqs = [
    {
        q: "What is split-fee recruiting?",
        a: "Split-fee recruiting is a collaborative model where two recruiters share a placement fee. One provides the job order, the other provides the candidate. Our platform automates the entire process.",
    },
    {
        q: "How does pricing work?",
        a: "Companies set their own fee structures. Recruiters see exact earnings before opting into any role. No hidden costs, no surprise invoices.",
    },
    {
        q: "Is it free for candidates?",
        a: "Yes. Applicant Network is completely free for job seekers. You get matched with expert recruiters, track your applications, and never pay a dime.",
    },
    {
        q: "How do I get started as a recruiter?",
        a: "Sign up on Splits Network, complete your profile, and start browsing available roles. You can opt into opportunities that match your expertise immediately.",
    },
    {
        q: "What makes this different from job boards?",
        a: "Job boards are passive. Our ecosystem actively connects all three parties with real-time communication, transparent pipelines, and structured collaboration.",
    },
];

// -- Page -------------------------------------------------------------------

export default function LandingNinePage() {
    return (
        <NineAnimator>
            {/* ============================================================
                HERO - Clean white with dotted grid background
            ============================================================ */}
            <section className="nine-hero relative min-h-[92vh] flex items-center overflow-hidden bg-white">
                {/* Dotted grid background */}
                <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Blueprint border lines */}
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/15 pointer-events-none" />
                <div className="absolute top-16 left-16 right-16 bottom-16 border border-dashed border-[#233876]/8 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 py-24">
                    <div className="max-w-5xl mx-auto">
                        {/* Reference number */}
                        <div className="nine-hero-ref mb-6 opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase">
                                REF: EN-2026-LP09 // Employment Networks
                            </span>
                        </div>

                        <h1 className="nine-hero-headline text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-8 text-[#0f1b3d] opacity-0">
                            Precision-Built
                            <br />
                            <span className="text-[#233876]">Recruiting Infrastructure</span>
                        </h1>

                        <p className="nine-hero-sub text-lg md:text-xl text-[#0f1b3d]/60 mb-12 max-w-2xl leading-relaxed opacity-0">
                            Two platforms, one connected ecosystem. Designed with
                            architectural precision for recruiters, companies, and
                            candidates who value clarity over chaos.
                        </p>

                        {/* Stats bar */}
                        <div className="nine-hero-stats grid grid-cols-2 md:grid-cols-4 gap-px bg-[#233876]/10 border border-[#233876]/10 mb-12 opacity-0">
                            {blueprintStats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-white px-6 py-5 text-center"
                                >
                                    <div className="font-mono text-2xl md:text-3xl font-bold text-[#233876] mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.15em] text-[#0f1b3d]/40 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="nine-hero-ctas flex flex-col sm:flex-row gap-4 opacity-0">
                            <a
                                href="#for-recruiters"
                                className="btn btn-lg border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-8 font-medium tracking-wide"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie" />
                                I&apos;m a Recruiter
                            </a>
                            <a
                                href="#for-candidates"
                                className="btn btn-lg border-2 border-[#233876] bg-white text-[#233876] hover:bg-[#233876]/5 rounded-none px-8 font-medium tracking-wide"
                            >
                                <i className="fa-duotone fa-regular fa-user" />
                                I&apos;m Looking for a Job
                            </a>
                            <a
                                href="#for-companies"
                                className="btn btn-lg border-2 border-[#233876]/30 bg-white text-[#233876]/70 hover:border-[#233876] hover:text-[#233876] rounded-none px-8 font-medium tracking-wide"
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                I&apos;m Hiring
                            </a>
                        </div>
                    </div>
                </div>

                {/* Corner reference marks */}
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">
                    v9.0
                </div>
                <div className="absolute bottom-8 left-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">
                    EMPLOYMENT NETWORKS
                </div>
            </section>

            {/* ============================================================
                PROBLEM - Light gray with grid
            ============================================================ */}
            <section className="nine-problem relative py-24 bg-[#f7f8fa] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="nine-problem-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            Problem Analysis
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6">
                            The Current System is{" "}
                            <span className="border-b-4 border-red-500">Broken</span>
                        </h2>
                        <p className="text-lg text-[#0f1b3d]/50 max-w-2xl mx-auto">
                            Recruiting fails recruiters, candidates, and companies alike.
                            Here is the diagnostic.
                        </p>
                    </div>

                    <div className="nine-problem-grid grid md:grid-cols-3 gap-px bg-[#233876]/10 max-w-5xl mx-auto">
                        {painPoints.map((group, gi) => (
                            <div
                                key={gi}
                                className="nine-problem-card bg-white p-8 opacity-0"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 border-2 border-[#233876]/20 flex items-center justify-center">
                                        <i className={`${group.icon} text-[#233876]`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            {group.role}
                                        </div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider">
                                            PAIN POINTS
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {group.items.map((item, ii) => (
                                        <li
                                            key={ii}
                                            className="nine-problem-item flex items-start gap-3 opacity-0"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                                            <span className="text-sm text-[#0f1b3d]/60 leading-relaxed">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                SOLUTION PILLARS - White with blueprint lines
            ============================================================ */}
            <section className="nine-solution relative py-24 bg-white overflow-hidden">
                {/* Horizontal blueprint lines */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-[#233876]/5"
                            style={{ top: `${(i + 1) * 8}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="nine-solution-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            Architecture Overview
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6">
                            Built on Three Pillars
                        </h2>
                        <p className="text-lg text-[#0f1b3d]/50 max-w-2xl mx-auto">
                            Employment Networks creates platforms where transparency,
                            technology, and trust reinforce each other.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pillars.map((pillar, i) => (
                            <div
                                key={i}
                                className="nine-pillar-card border-2 border-[#233876]/10 p-8 relative opacity-0 bg-white"
                            >
                                {/* Reference number */}
                                <div className="absolute top-4 right-4 font-mono text-xs text-[#233876]/20">
                                    {pillar.ref}
                                </div>

                                <div className="w-14 h-14 border-2 border-[#233876]/20 flex items-center justify-center mb-6">
                                    <i className={`${pillar.icon} text-2xl text-[#233876]`} />
                                </div>
                                <h3 className="font-bold text-xl text-[#0f1b3d] mb-3">
                                    {pillar.title}
                                </h3>
                                <p className="text-sm text-[#0f1b3d]/50 leading-relaxed">
                                    {pillar.desc}
                                </p>

                                {/* Bottom line accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#233876]/10 nine-pillar-line" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                FOR RECRUITERS - White with navy accents
            ============================================================ */}
            <section
                id="for-recruiters"
                className="nine-recruiters relative py-24 bg-[#f7f8fa] overflow-hidden"
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        {/* Content */}
                        <div>
                            <div className="nine-recruiters-heading opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src="/splits.png"
                                        alt="Splits Network"
                                        className="h-7"
                                    />
                                    <span className="font-mono text-xs tracking-[0.2em] text-[#233876]/40 uppercase border border-[#233876]/15 px-3 py-1">
                                        For Recruiters
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                                    Turn Your Network
                                    <br />
                                    Into Revenue
                                </h2>
                                <p className="text-lg text-[#0f1b3d]/50 mb-10">
                                    A collaborative marketplace where split-fee recruiting
                                    actually works. Stop chasing roles and let opportunities
                                    come to you.
                                </p>
                            </div>

                            <div className="nine-recruiters-features grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#233876]/10 mb-10">
                                {recruiterFeatures.map((f, i) => (
                                    <div
                                        key={i}
                                        className="nine-feature-card bg-white p-6 opacity-0"
                                    >
                                        <i className={`${f.icon} text-[#233876] text-lg mb-3 block`} />
                                        <div className="font-semibold text-[#0f1b3d] text-sm mb-1">
                                            {f.title}
                                        </div>
                                        <div className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                            {f.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="nine-recruiters-cta opacity-0">
                                <a
                                    href="https://splits.network/sign-up"
                                    className="btn btn-lg border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-8 font-medium tracking-wide"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Join Splits Network
                                </a>
                            </div>
                        </div>

                        {/* Visual - Blueprint-style dashboard */}
                        <div className="nine-recruiter-visual opacity-0">
                            <div className="border-2 border-[#233876]/15 bg-white p-6 relative">
                                {/* Corner marks */}
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/30" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/30" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/30" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/30" />

                                <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                                    <div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                            Dashboard Preview
                                        </div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            Active Roles
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs border border-[#233876]/20 px-3 py-1 text-[#233876]">
                                        3 roles
                                    </span>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {[
                                        {
                                            title: "Senior Software Engineer",
                                            company: "TechCorp",
                                            status: "Active",
                                        },
                                        {
                                            title: "Product Manager",
                                            company: "StartupXYZ",
                                            status: "Interviewing",
                                        },
                                        {
                                            title: "UX Designer",
                                            company: "DesignCo",
                                            status: "Offer Stage",
                                        },
                                    ].map((role, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center p-3 border border-[#233876]/8 bg-[#f7f8fa]"
                                        >
                                            <div>
                                                <div className="font-medium text-sm text-[#0f1b3d]">
                                                    {role.title}
                                                </div>
                                                <div className="font-mono text-xs text-[#0f1b3d]/30">
                                                    {role.company}
                                                </div>
                                            </div>
                                            <span className="font-mono text-[10px] tracking-wider text-[#233876]/60 uppercase border border-[#233876]/15 px-2 py-0.5">
                                                {role.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-2 border-[#233876]/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                This Month
                                            </div>
                                            <div className="font-mono text-3xl font-bold text-[#233876]">
                                                $12,450
                                            </div>
                                            <div className="font-mono text-xs text-[#0f1b3d]/30 mt-1">
                                                from 3 placements
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-chart-line-up text-xl text-[#233876]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                FOR CANDIDATES - White with clean lines
            ============================================================ */}
            <section
                id="for-candidates"
                className="nine-candidates relative py-24 bg-white overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 border-l border-dashed border-[#233876]/5"
                            style={{ left: `${(i + 1) * 11}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        {/* Visual on left */}
                        <div className="nine-candidate-visual order-2 lg:order-1 opacity-0">
                            <div className="border-2 border-[#233876]/15 bg-white p-6 relative">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/30" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/30" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/30" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/30" />

                                <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                                    <div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                            Applicant Portal
                                        </div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            Your Applications
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs border border-[#233876]/20 px-3 py-1 text-[#233876]">
                                        5 active
                                    </span>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {[
                                        {
                                            title: "Senior Frontend Developer",
                                            company: "Acme Inc",
                                            status: "Interview",
                                        },
                                        {
                                            title: "Full Stack Engineer",
                                            company: "TechStart",
                                            status: "Review",
                                        },
                                        {
                                            title: "React Developer",
                                            company: "BuildCo",
                                            status: "Matched",
                                        },
                                    ].map((app, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center p-3 border border-[#233876]/8 bg-[#f7f8fa]"
                                        >
                                            <div>
                                                <div className="font-medium text-sm text-[#0f1b3d]">
                                                    {app.title}
                                                </div>
                                                <div className="font-mono text-xs text-[#0f1b3d]/30">
                                                    {app.company}
                                                </div>
                                            </div>
                                            <span className="font-mono text-[10px] tracking-wider text-[#233876]/60 uppercase border border-[#233876]/15 px-2 py-0.5">
                                                {app.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-2 border-[#233876]/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                Your Recruiter
                                            </div>
                                            <div className="font-bold text-[#0f1b3d]">
                                                Sarah Chen
                                            </div>
                                            <div className="font-mono text-xs text-[#0f1b3d]/30 mt-1">
                                                Tech Recruiting Specialist
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876] text-white font-bold">
                                            SC
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content on right */}
                        <div className="order-1 lg:order-2">
                            <div className="nine-candidates-heading opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src="/applicant.png"
                                        alt="Applicant Network"
                                        className="h-7"
                                    />
                                    <span className="font-mono text-xs tracking-[0.2em] text-[#233876]/40 uppercase border border-[#233876]/15 px-3 py-1">
                                        For Candidates
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                                    Your Job Search,
                                    <br />
                                    With Backup
                                </h2>
                                <p className="text-lg text-[#0f1b3d]/50 mb-10">
                                    Get matched with expert recruiters who open doors, prep
                                    you for interviews, and make sure you never get ghosted.
                                </p>
                            </div>

                            <div className="nine-candidates-features grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#233876]/10 mb-10">
                                {candidateFeatures.map((f, i) => (
                                    <div
                                        key={i}
                                        className="nine-feature-card bg-white p-6 opacity-0"
                                    >
                                        <i className={`${f.icon} text-[#233876] text-lg mb-3 block`} />
                                        <div className="font-semibold text-[#0f1b3d] text-sm mb-1">
                                            {f.title}
                                        </div>
                                        <div className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                            {f.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="nine-candidates-cta opacity-0">
                                <a
                                    href="https://applicant.network/sign-up"
                                    className="btn btn-lg border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-8 font-medium tracking-wide"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus" />
                                    Create Free Profile
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                FOR COMPANIES - Light gray
            ============================================================ */}
            <section
                id="for-companies"
                className="nine-companies relative py-24 bg-[#f7f8fa] overflow-hidden"
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        {/* Content */}
                        <div>
                            <div className="nine-companies-heading opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src="/splits.png"
                                        alt="Splits Network"
                                        className="h-7"
                                    />
                                    <span className="font-mono text-xs tracking-[0.2em] text-[#233876]/40 uppercase border border-[#233876]/15 px-3 py-1">
                                        For Companies
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                                    A Network of Recruiters,
                                    <br />
                                    One Simple Platform
                                </h2>
                                <p className="text-lg text-[#0f1b3d]/50 mb-10">
                                    Stop managing dozens of contracts. Get qualified
                                    candidates from vetted recruiters with complete
                                    transparency.
                                </p>
                            </div>

                            <div className="nine-companies-features grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#233876]/10 mb-10">
                                {companyFeatures.map((f, i) => (
                                    <div
                                        key={i}
                                        className="nine-feature-card bg-white p-6 opacity-0"
                                    >
                                        <i className={`${f.icon} text-[#233876] text-lg mb-3 block`} />
                                        <div className="font-semibold text-[#0f1b3d] text-sm mb-1">
                                            {f.title}
                                        </div>
                                        <div className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                            {f.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="nine-companies-cta opacity-0">
                                <a
                                    href="https://splits.network/sign-up"
                                    className="btn btn-lg border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-8 font-medium tracking-wide"
                                >
                                    <i className="fa-duotone fa-regular fa-building" />
                                    Post a Role
                                </a>
                            </div>
                        </div>

                        {/* Visual */}
                        <div className="nine-company-visual opacity-0">
                            <div className="border-2 border-[#233876]/15 bg-white p-6 relative">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/30" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/30" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/30" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/30" />

                                <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                                    <div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                            Company Dashboard
                                        </div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            Open Roles
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs border border-[#233876]/20 px-3 py-1 text-[#233876]">
                                        3 active
                                    </span>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {[
                                        {
                                            title: "Backend Engineer",
                                            loc: "San Francisco, CA",
                                            cand: 5,
                                            rec: 3,
                                        },
                                        {
                                            title: "Sales Director",
                                            loc: "Remote",
                                            cand: 2,
                                            rec: 2,
                                        },
                                        {
                                            title: "Product Manager",
                                            loc: "New York, NY",
                                            cand: 8,
                                            rec: 4,
                                        },
                                    ].map((role, i) => (
                                        <div
                                            key={i}
                                            className="p-3 border border-[#233876]/8 bg-[#f7f8fa]"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-medium text-sm text-[#0f1b3d]">
                                                        {role.title}
                                                    </div>
                                                    <div className="font-mono text-xs text-[#0f1b3d]/30">
                                                        {role.loc}
                                                    </div>
                                                </div>
                                                <span className="font-mono text-[10px] tracking-wider text-[#233876]/60 uppercase border border-[#233876]/15 px-2 py-0.5">
                                                    {role.cand} candidates
                                                </span>
                                            </div>
                                            <div className="font-mono text-[10px] text-[#0f1b3d]/30">
                                                {role.rec} recruiters assigned
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-2 border-[#233876]/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                Total Candidates
                                            </div>
                                            <div className="font-mono text-3xl font-bold text-[#233876]">
                                                15
                                            </div>
                                            <div className="font-mono text-xs text-[#0f1b3d]/30 mt-1">
                                                across 3 active roles
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-users text-xl text-[#233876]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                PROCESS - Horizontal scroll / timeline
            ============================================================ */}
            <section className="nine-process relative py-24 bg-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="nine-process-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            Workflow Schematic
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6">
                            How It Works
                        </h2>
                        <p className="text-lg text-[#0f1b3d]/50 max-w-2xl mx-auto">
                            A structured four-step process from job posting to placement.
                        </p>
                    </div>

                    {/* Horizontal scroll container */}
                    <div className="nine-process-track overflow-x-auto pb-4 -mx-6 px-6">
                        <div className="flex gap-px bg-[#233876]/10 min-w-[900px] max-w-5xl mx-auto relative">
                            {processSteps.map((step, i) => (
                                <div
                                    key={i}
                                    className="nine-process-step flex-1 bg-white p-8 relative opacity-0"
                                >
                                    <div className="font-mono text-4xl font-bold text-[#233876]/10 mb-4">
                                        {step.num}
                                    </div>
                                    <div className="w-12 h-12 border-2 border-[#233876]/20 flex items-center justify-center mb-4">
                                        <i className={`${step.icon} text-xl text-[#233876]`} />
                                    </div>
                                    <h3 className="font-bold text-[#0f1b3d] mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-[#0f1b3d]/40 leading-relaxed">
                                        {step.desc}
                                    </p>

                                    {/* Connector arrow */}
                                    {i < processSteps.length - 1 && (
                                        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white border-2 border-[#233876]/20 flex items-center justify-center">
                                            <i className="fa-regular fa-chevron-right text-xs text-[#233876]/40" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                IMAGE SECTION - Overhead office shot
            ============================================================ */}
            <section className="nine-image relative h-[50vh] md:h-[60vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
                    alt="Modern office workspace from above"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                        <div className="nine-image-text opacity-0">
                            <div className="font-mono text-xs tracking-[0.3em] text-[#233876]/50 uppercase mb-4">
                                Built for Modern Teams
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0f1b3d]">
                                Where Precision
                                <br />
                                Meets People
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Blueprint overlay lines */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute top-1/4 left-0 right-0 border-t border-dashed border-[#233876]" />
                    <div className="absolute top-3/4 left-0 right-0 border-t border-dashed border-[#233876]" />
                    <div className="absolute left-1/4 top-0 bottom-0 border-l border-dashed border-[#233876]" />
                    <div className="absolute left-3/4 top-0 bottom-0 border-l border-dashed border-[#233876]" />
                </div>
            </section>

            {/* ============================================================
                FAQ
            ============================================================ */}
            <section className="nine-faq relative py-24 bg-[#f7f8fa] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="nine-faq-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            Reference Guide
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6">
                            Common Questions
                        </h2>
                        <p className="text-lg text-[#0f1b3d]/50 max-w-2xl mx-auto">
                            Everything you need to know about our platforms.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-px bg-[#233876]/10">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="nine-faq-item bg-white opacity-0"
                            >
                                <details className="group">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer select-none">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-xs text-[#233876]/30 w-6">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className="font-semibold text-[#0f1b3d]">
                                                {faq.q}
                                            </span>
                                        </div>
                                        <i className="fa-regular fa-plus text-[#233876]/40 group-open:rotate-45 transition-transform duration-200" />
                                    </summary>
                                    <div className="px-6 pb-6 pl-16">
                                        <p className="text-sm text-[#0f1b3d]/50 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                CTA - Navy on white
            ============================================================ */}
            <section className="nine-cta relative py-24 bg-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Blueprint border */}
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="nine-cta-content text-center mb-14 opacity-0 max-w-3xl mx-auto">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            Get Started
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                            Ready to Transform
                            <br />
                            How You Recruit?
                        </h2>
                        <p className="text-lg text-[#0f1b3d]/50">
                            Join the ecosystem built with architectural precision
                            for every participant.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-px bg-[#233876]/10 max-w-5xl mx-auto mb-14">
                        {/* Recruiters */}
                        <div className="nine-cta-card bg-white p-8 opacity-0">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 border-2 border-[#233876]/20 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-user-tie text-[#233876]" />
                                </div>
                                <div>
                                    <div className="font-bold text-[#0f1b3d]">
                                        Recruiters
                                    </div>
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider">
                                        SPLITS NETWORK
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-[#0f1b3d]/40 mb-6 leading-relaxed">
                                Collaborative marketplace with curated roles and
                                transparent splits.
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none w-full font-medium tracking-wide"
                            >
                                Join Network
                                <i className="fa-regular fa-arrow-right" />
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="nine-cta-card bg-white p-8 opacity-0">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 border-2 border-[#233876]/20 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-building text-[#233876]" />
                                </div>
                                <div>
                                    <div className="font-bold text-[#0f1b3d]">
                                        Companies
                                    </div>
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider">
                                        SPLITS NETWORK
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-[#0f1b3d]/40 mb-6 leading-relaxed">
                                Access recruiters with full pipeline visibility and
                                pay-on-hire.
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-sm border-2 border-[#233876] bg-white text-[#233876] hover:bg-[#233876]/5 rounded-none w-full font-medium tracking-wide"
                            >
                                Post a Role
                                <i className="fa-regular fa-arrow-right" />
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="nine-cta-card bg-white p-8 opacity-0">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 border-2 border-[#233876]/20 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-user text-[#233876]" />
                                </div>
                                <div>
                                    <div className="font-bold text-[#0f1b3d]">
                                        Candidates
                                    </div>
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider">
                                        APPLICANT NETWORK
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-[#0f1b3d]/40 mb-6 leading-relaxed">
                                Expert recruiters, real communication, and zero
                                cost. Free forever.
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-sm border-2 border-[#233876] bg-white text-[#233876] hover:bg-[#233876]/5 rounded-none w-full font-medium tracking-wide"
                            >
                                Create Profile
                                <i className="fa-regular fa-arrow-right" />
                            </a>
                        </div>
                    </div>

                    <div className="nine-cta-footer text-center opacity-0">
                        <p className="text-sm text-[#0f1b3d]/30 mb-3">
                            Questions? Reach out directly.
                        </p>
                        <a
                            href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 font-mono text-sm text-[#233876]/60 hover:text-[#233876] transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </NineAnimator>
    );
}
