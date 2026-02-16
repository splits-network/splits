import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { WhatIsAnimator } from "./what-is-animator";

export const metadata = getDocMetadata("getting-started/what-is-splits-network");

// ─── Data ────────────────────────────────────────────────────────────────────

const platformPillars = [
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "Role Management",
        description:
            "Create and publish roles with compensation details, requirements, and recruiter visibility settings. Every role becomes a hub where candidates, applications, and decisions converge.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        description:
            "Connect with recruiters who specialize in your industry. Split fees fairly, track assignments, and manage proposals in a transparent marketplace that rewards collaboration.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Pipeline Tracking",
        description:
            "Track every candidate from submission through placement. Status changes, notes, and decisions are visible to everyone involved so nothing falls through the cracks.",
        accent: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Collaboration",
        description:
            "Messages, notifications, and activity feeds keep your team aligned without spreadsheets or email chains. Everyone sees what happened, when, and what needs to happen next.",
        accent: "purple",
    },
];

const audienceCards = [
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        role: "Recruiters",
        tagline: "YOUR PLACEMENTS. YOUR EARNINGS. ONE PLATFORM.",
        points: [
            "Browse open roles from hiring companies in the marketplace",
            "Submit candidates directly through structured applications",
            "Track placement status and fee splits in real time",
            "Build reputation through successful placements and ratings",
        ],
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-building",
        role: "Hiring Companies",
        tagline: "POST ROLES. REVIEW CANDIDATES. HIRE FASTER.",
        points: [
            "Publish roles with detailed requirements and compensation",
            "Receive candidate submissions from vetted recruiters",
            "Manage application stages from review to offer",
            "Control team access with role-based permissions",
        ],
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-user-check",
        role: "Candidates",
        tagline: "GET DISCOVERED. GET PLACED. GET PAID.",
        points: [
            "Recruiters advocate for you directly with hiring companies",
            "Your profile and documents stay organized in one place",
            "Track where you are in the process without guesswork",
            "AI-powered matching connects you with fitting roles",
        ],
        accent: "yellow",
    },
];

const workflowSteps = [
    {
        number: "01",
        title: "Company Posts A Role",
        description:
            "A hiring company creates a role with title, compensation, location, and requirements. They set visibility to control which recruiters can see and submit to it.",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        number: "02",
        title: "Recruiters Find & Submit",
        description:
            "Recruiters browse available roles, request assignments, and submit qualified candidates. Each submission includes the candidate profile, resume, and recruiter notes.",
        icon: "fa-duotone fa-regular fa-paper-plane",
    },
    {
        number: "03",
        title: "Company Reviews Applications",
        description:
            "Hiring managers review submissions, advance candidates through stages, and collaborate with recruiters through messages. Every decision is tracked with timestamps.",
        icon: "fa-duotone fa-regular fa-clipboard-check",
    },
    {
        number: "04",
        title: "Placement & Payout",
        description:
            "When a candidate is hired, a placement record captures the fee structure. Split fees are calculated automatically and payouts are tracked through billing.",
        icon: "fa-duotone fa-regular fa-trophy",
    },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-gauge-max",
        title: "Eliminate Coordination Overhead",
        description:
            "Stop managing hiring through spreadsheets, email threads, and phone calls. Every role, candidate, and decision lives in one platform that everyone can access.",
    },
    {
        icon: "fa-duotone fa-regular fa-lock-keyhole",
        title: "Role-Based Access Control",
        description:
            "Recruiters see what recruiters need. Hiring managers see what hiring managers need. Company admins control everything. Permissions are automatic, not manual.",
    },
    {
        icon: "fa-duotone fa-regular fa-robot",
        title: "AI-Powered Matching",
        description:
            "Automated candidate-job fit analysis scores submissions so recruiters and hiring managers can prioritize the strongest candidates first.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        title: "Transparent Fee Splits",
        description:
            "Fee structures are defined up front on every role. When a placement happens, everyone knows exactly what they earn. No surprises, no disputes.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Real-Time Analytics",
        description:
            "Dashboards show pipeline health, placement velocity, recruiter performance, and revenue metrics. Make decisions based on data, not gut feeling.",
    },
    {
        icon: "fa-duotone fa-regular fa-messages",
        title: "Built-In Messaging",
        description:
            "Conversations are tied to roles and candidates. Context travels with the message so nobody has to ask what is being discussed or who the candidate is.",
    },
];

const useCases = [
    {
        icon: "fa-duotone fa-regular fa-building-columns",
        title: "Staffing Agencies",
        description:
            "Manage multiple client companies and their open roles from a single dashboard. Assign recruiters to accounts, track submissions across clients, and consolidate billing.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-laptop-code",
        title: "Tech Companies",
        description:
            "Work with external recruiters on hard-to-fill engineering and product roles while keeping your internal hiring team in the loop on every submission.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Independent Recruiters",
        description:
            "Access a marketplace of open roles without cold outreach. Build relationships with companies through successful placements and grow your book of business.",
        accent: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-people-group",
        title: "Recruiting Networks",
        description:
            "Coordinate split-fee arrangements between recruiters in different markets. The platform handles assignment tracking, fee calculations, and payout records.",
        accent: "purple",
    },
];

// ─── Accent helpers ──────────────────────────────────────────────────────────

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-coral" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-teal" },
    yellow: { bg: "bg-yellow", border: "border-yellow", text: "text-yellow" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-purple" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WhatIsSplitsNetworkMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("getting-started/what-is-splits-network")} id="docs-getting-started-what-is-splits-network-jsonld" />
            <WhatIsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="what-is-hero relative min-h-[55vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[6%] w-20 h-20 rounded-full border-[5px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[48%] right-[10%] w-16 h-16 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[14%] left-[18%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[22%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[36%] w-20 h-8 -rotate-6 border-[4px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[42%] left-[28%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[48%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                            <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20"
                                fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <ul className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                                    <li>
                                        <Link href="/public/documentation" className="transition-colors hover:text-white">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li>
                                        <Link href="/public/documentation/getting-started" className="transition-colors hover:text-white">
                                            Getting Started
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li className="text-white">What Is Splits Network</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                                    Platform Overview
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                                What Is{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">Splits Network</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-white/70 max-w-2xl opacity-0">
                                A split-fee recruiting marketplace that aligns recruiters, hiring
                                companies, and candidates around the same hiring workflow. One
                                platform. Every stakeholder. Complete visibility.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PLATFORM OVERVIEW — What It Does
                   ══════════════════════════════════════════════════════════════ */}
                <section className="overview-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="overview-heading text-center mb-14 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                    The Platform
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Here&apos;s What{" "}
                                    <span className="text-coral">Splits Network Does</span>
                                </h2>
                                <p className="mt-4 text-base md:text-lg leading-relaxed text-dark/70 max-w-3xl mx-auto">
                                    Splits Network replaces the patchwork of email, spreadsheets,
                                    and phone calls that most recruiting teams use to coordinate
                                    hiring. It gives every participant a shared workspace where
                                    roles, candidates, and decisions are visible in real time.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {platformPillars.map((pillar, index) => {
                                    const a = accentMap[pillar.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`overview-card border-4 ${a.border} bg-white p-6 md:p-8 opacity-0`}
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                <i className={`${pillar.icon} text-lg text-white`}></i>
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-tight mb-3 text-dark">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-dark/70">
                                                {pillar.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    WHO IT'S FOR
                   ══════════════════════════════════════════════════════════════ */}
                <section className="audience-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="audience-heading text-center mb-14 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Who It&apos;s For
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                    Three Audiences.{" "}
                                    <span className="text-teal">One Platform.</span>
                                </h2>
                                <p className="mt-4 text-base md:text-lg leading-relaxed text-white/60 max-w-3xl mx-auto">
                                    Every feature in Splits Network is built for one of three
                                    audiences. The interface adapts based on your role so you only
                                    see what matters to your work.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {audienceCards.map((card, index) => {
                                    const a = accentMap[card.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`audience-card border-4 ${a.border} bg-white/[0.04] p-6 opacity-0`}
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                <i className={`${card.icon} text-lg ${card.accent === "yellow" ? "text-dark" : "text-white"}`}></i>
                                            </div>
                                            <h3 className={`font-black text-xl uppercase tracking-tight mb-2 ${a.text}`}>
                                                {card.role}
                                            </h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">
                                                {card.tagline}
                                            </p>
                                            <ul className="space-y-2">
                                                {card.points.map((point, pi) => (
                                                    <li key={pi} className="flex items-start gap-2 text-sm leading-relaxed text-white/70">
                                                        <i className={`fa-solid fa-check text-[10px] mt-1.5 ${a.text}`}></i>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    HOW IT FITS INTO HIRING WORKFLOWS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="how-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="how-heading text-center mb-14 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    The Workflow
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    From Role To{" "}
                                    <span className="text-yellow">Placement</span>
                                </h2>
                                <p className="mt-4 text-base md:text-lg leading-relaxed text-dark/70 max-w-3xl mx-auto">
                                    Every hiring engagement follows the same four-step cycle.
                                    Splits Network structures each step so nothing gets lost
                                    between handoffs.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {workflowSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="step-card border-4 border-dark bg-white p-6 md:p-8 opacity-0"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-dark text-yellow font-black text-lg">
                                                {step.number}
                                            </span>
                                            <div className="w-10 h-10 flex items-center justify-center border-4 border-yellow">
                                                <i className={`${step.icon} text-sm text-yellow`}></i>
                                            </div>
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-tight mb-3 text-dark">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    KEY BENEFITS & DIFFERENTIATORS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="benefits-section py-20 overflow-hidden bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="benefits-heading text-center mb-14 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                    Why It Works
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Built For{" "}
                                    <span className="text-purple">How Recruiting Actually Works</span>
                                </h2>
                                <p className="mt-4 text-base md:text-lg leading-relaxed text-dark/70 max-w-3xl mx-auto">
                                    Most hiring tools are built for one side of the equation.
                                    Splits Network is built for all of them.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {benefits.map((benefit, index) => {
                                    const accentColors = ["coral", "teal", "yellow", "purple", "coral", "teal"];
                                    const a = accentMap[accentColors[index % accentColors.length]];
                                    return (
                                        <div
                                            key={index}
                                            className={`benefit-item border-4 ${a.border} bg-cream p-6 opacity-0`}
                                        >
                                            <div className={`w-10 h-10 flex items-center justify-center mb-4 ${a.bg}`}>
                                                <i className={`${benefit.icon} text-sm ${accentColors[index % accentColors.length] === "yellow" ? "text-dark" : "text-white"}`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-tight mb-2 text-dark">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-dark/70">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    USE CASES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="use-cases-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="use-cases-heading text-center mb-14 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                    Use Cases
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                    Who Uses{" "}
                                    <span className="text-coral">Splits Network</span>
                                </h2>
                                <p className="mt-4 text-base md:text-lg leading-relaxed text-white/60 max-w-3xl mx-auto">
                                    Whether you are a solo recruiter or a large staffing agency,
                                    the platform scales to match how you work.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {useCases.map((uc, index) => {
                                    const a = accentMap[uc.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`use-case-card border-4 ${a.border} bg-white/[0.04] p-6 md:p-8 opacity-0`}
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 border-4 ${a.border}`}>
                                                <i className={`${uc.icon} text-lg ${a.text}`}></i>
                                            </div>
                                            <h3 className={`font-black text-lg uppercase tracking-tight mb-3 ${a.text}`}>
                                                {uc.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-white/70">
                                                {uc.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    GETTING STARTED NEXT STEPS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="next-steps-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="next-steps-content text-center opacity-0">
                                <div className="border-4 border-teal p-8 md:p-12 bg-white relative">
                                    {/* Corner decorations */}
                                    <div className="absolute top-0 left-0 w-10 h-10 bg-teal" />
                                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-teal" />

                                    <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-teal text-dark">
                                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                        Ready To Start
                                    </span>

                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-dark">
                                        What Happens{" "}
                                        <span className="text-teal">Next</span>
                                    </h2>

                                    <p className="text-base leading-relaxed mb-10 text-dark/70 max-w-xl mx-auto">
                                        Now that you know what Splits Network is and how it works,
                                        set up your account and learn how to navigate the platform.
                                    </p>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Link
                                            href="/public/documentation/getting-started/first-time-setup"
                                            className="next-step-link flex items-center gap-3 p-4 border-4 border-coral bg-cream text-left transition-transform hover:-translate-y-0.5 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-coral">
                                                <i className="fa-duotone fa-regular fa-gear text-white"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm uppercase tracking-tight text-dark">
                                                    First-Time Setup
                                                </h3>
                                                <p className="text-xs text-dark/60 mt-0.5">
                                                    Account access and onboarding
                                                </p>
                                            </div>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-coral ml-auto"></i>
                                        </Link>

                                        <Link
                                            href="/public/documentation/getting-started/navigation-overview"
                                            className="next-step-link flex items-center gap-3 p-4 border-4 border-yellow bg-cream text-left transition-transform hover:-translate-y-0.5 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-yellow">
                                                <i className="fa-duotone fa-regular fa-compass text-dark"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm uppercase tracking-tight text-dark">
                                                    Navigation Overview
                                                </h3>
                                                <p className="text-xs text-dark/60 mt-0.5">
                                                    Find your way around the portal
                                                </p>
                                            </div>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-yellow ml-auto"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </WhatIsAnimator>
        </>
    );
}
