import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { portalFaqs } from "@/components/landing/sections/faq-data";
import { MemphisLandingAnimator } from "@/components/landing/landing-memphis-animator";

// ── Data arrays ─────────────────────────────────────────────────────────────

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-table-cells",
        title: "Spreadsheet Chaos",
        description:
            "You're tracking splits across Excel files, Google Sheets, and sticky notes. Version control is a fantasy. One wrong cell and $18,000 disappears.",
        accent: "coral" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-envelopes-bulk",
        title: "Email Black Holes",
        description:
            "Candidate submissions vanish into 47-thread email chains. Recruiters follow up. Nobody responds. The candidate takes another offer.",
        accent: "teal" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-calculator",
        title: "Mystery Math",
        description:
            "Fees shift mid-deal. Clawback terms appear from nowhere. The split you agreed to on a handshake isn't the split you receive.",
        accent: "yellow" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        title: "Zero Visibility",
        description:
            "Is anyone actually working this role? Did the candidate advance? You won't know until you chase someone down. Again.",
        accent: "purple" as const,
    },
];

const recruiterSteps = [
    {
        number: "01",
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Claim Your Niche",
        description:
            "Sign up. Set your specialties and target markets. The platform matches you to roles that fit your expertise -- no cold outreach needed.",
    },
    {
        number: "02",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit Candidates",
        description:
            "Found the right person? Submit them directly into the hiring pipeline. The company sees your submission in real time. No email required.",
    },
    {
        number: "03",
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Close and Collect",
        description:
            "Candidate gets hired. Your split percentage -- agreed before you submitted a single resume -- hits your account. Tracked. Transparent. Done.",
    },
];

const companySteps = [
    {
        number: "01",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Post Your Roles",
        description:
            "List open positions with clear requirements, fee percentages, and split terms. Set it once. It applies to every recruiter consistently.",
    },
    {
        number: "02",
        icon: "fa-duotone fa-regular fa-users",
        title: "Tap the Network",
        description:
            "Specialized recruiters see your roles and start sourcing. You control who has access. Quality candidates arrive without the contract chaos.",
    },
    {
        number: "03",
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Hire and Pay",
        description:
            "No retainers. No deposits. You pay the agreed placement fee only when someone starts. The platform calculates and distributes every split automatically.",
    },
];

const recruiterBenefits = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        text: "Browse curated roles matched to your expertise. No cold outreach. No gatekeepers.",
    },
    {
        icon: "fa-duotone fa-regular fa-sliders",
        text: "Work only the roles you want. You pick the niche. The platform brings the pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        text: "Track every candidate and submission in one dashboard. No spreadsheets. No guessing.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        text: "See your exact payout on every deal before you submit a single resume. The math is public.",
    },
    {
        icon: "fa-duotone fa-regular fa-rocket",
        text: "Scale without overhead. The network brings opportunities to you. Your only job is making placements.",
    },
];

const recruiterDashboardRoles = [
    {
        title: "Senior Software Engineer",
        company: "TechCorp",
        status: "Active",
        split: "$18K split",
        accent: "teal" as const,
    },
    {
        title: "Product Manager",
        company: "StartupXYZ",
        status: "Interviewing",
        split: "$22K split",
        accent: "yellow" as const,
    },
    {
        title: "UX Designer",
        company: "DesignCo",
        status: "Offer Stage",
        split: "$15K split",
        accent: "coral" as const,
    },
];

const companyBenefits = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        text: "Tap a network of specialized recruiters without negotiating individual contracts. Post once. They come to you.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        text: "Full pipeline visibility. See who's working your roles, where candidates stand, and what's moving forward -- in real time.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Set fees and terms once. They apply to every recruiter on the platform. Consistent. Non-negotiable. Clear.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        text: "Pay only when someone starts. No retainers. No deposits. No surprise invoices three months later.",
    },
    {
        icon: "fa-duotone fa-regular fa-messages",
        text: "All communication lives on the platform. No more digging through email threads to find that one candidate note.",
    },
];

const companyDashboardRoles = [
    {
        title: "Backend Engineer",
        location: "San Francisco, CA",
        candidates: 5,
        recruiters: 3,
        fee: "20%",
        accent: "teal" as const,
    },
    {
        title: "Sales Director",
        location: "Remote",
        candidates: 2,
        recruiters: 2,
        fee: "25%",
        accent: "yellow" as const,
    },
    {
        title: "Product Manager",
        location: "New York, NY",
        candidates: 8,
        recruiters: 4,
        fee: "22%",
        accent: "coral" as const,
    },
];

const comparisonData = [
    {
        feature: "Split placement tracking",
        spreadsheets: "Manual",
        otherAts: "Retrofitted",
        splits: "Native. Built from day one.",
    },
    {
        feature: "Fee transparency",
        spreadsheets: "None",
        otherAts: "Varies by vendor",
        splits: "100%. Every party sees the same numbers.",
    },
    {
        feature: "Recruiter network",
        spreadsheets: "DIY via email",
        otherAts: "Limited",
        splits: "Built-in marketplace. Recruiters find you.",
    },
    {
        feature: "Pipeline visibility",
        spreadsheets: "Scattered",
        otherAts: "Siloed per user",
        splits: "Real-time. Shared across all parties.",
    },
    {
        feature: "Payment tracking",
        spreadsheets: "Manual invoicing",
        otherAts: "External tools",
        splits: "Integrated. Auto-calculated splits.",
    },
    {
        feature: "Multi-party collaboration",
        spreadsheets: "Email chains",
        otherAts: "Bolt-on add-ons",
        splits: "Core architecture. Not an afterthought.",
    },
    {
        feature: "Smart notifications",
        spreadsheets: "You remembering",
        otherAts: "Basic alerts",
        splits: "Event-driven. Real-time updates.",
    },
    {
        feature: "Candidate ownership",
        spreadsheets: "Whoever has the file",
        otherAts: "Ambiguous",
        splits: "Clear attribution. Recruiter owns it.",
    },
];

const metrics = [
    {
        value: "100%",
        label: "Fee Visibility",
        description:
            "Every split is visible to every party. Before, during, and after the deal.",
        accent: "coral" as const,
    },
    {
        value: "0",
        label: "Hidden Clawbacks",
        description:
            "Terms are locked at submission. No retroactive deductions. No surprises.",
        accent: "teal" as const,
    },
    {
        value: "2.4x",
        label: "Faster Placements",
        description:
            "Shared pipelines and real-time updates cut placement timelines by more than half.",
        accent: "yellow" as const,
    },
    {
        value: "1",
        label: "Platform for Everything",
        description:
            "Roles, candidates, pipelines, payments, communication. One place. No tab juggling.",
        accent: "purple" as const,
    },
];

const exampleBreakdown = [
    { value: "$120,000", label: "Candidate Salary", accent: "coral" as const },
    {
        value: "$24,000",
        label: "Placement Fee (20%)",
        accent: "teal" as const,
    },
    {
        value: "$18,000",
        label: "Recruiter Receives (75%)",
        accent: "yellow" as const,
    },
];

const ACCENT_COLORS = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
};

// ── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: "Split-Fee Recruiting Marketplace",
    description:
        "Post roles. Submit candidates. Split the fee. Splits Network is the platform built for split-fee recruiting -- transparent terms, real-time pipelines, and automated payouts.",
    openGraph: {
        title: "Split the Role. Split the Fee.",
        description:
            "The recruiting marketplace where every split placement is tracked, every fee is transparent, and every recruiter gets paid what they agreed to.",
        url: "https://splits.network",
    },
    ...buildCanonical(""),
};

// ── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Splits Network - Split-Fee Recruiting Marketplace",
        url: "https://splits.network",
        description:
            "Post roles. Submit candidates. Split the fee. The platform built for split-fee recruiting.",
        isPartOf: {
            "@type": "WebSite",
            name: "Splits Network",
            url: "https://splits.network",
        },
    };
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: portalFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="splits-home-jsonld" />
            <JsonLd data={faqJsonLd} id="splits-home-faq-jsonld" />
            <MemphisLandingAnimator>
                {/* ═══════════════════════════════════════════════════════════
                    1. HERO
                ═══════════════════════════════════════════════════════════ */}
                <section className="hero-section relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis geometric decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-32 h-32 rounded-full border-[6px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[60%] right-[8%] w-24 h-24 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[12%] w-16 h-16 rounded-full bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[15%] w-20 h-20 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[25%] right-[25%] w-28 h-12 -rotate-6 border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[45%] left-[20%] w-14 h-14 rotate-45 bg-coral opacity-0" />
                        {/* Dot grid */}
                        <div className="memphis-shape absolute top-[15%] right-[35%] opacity-0">
                            <div className="grid grid-cols-4 gap-3">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-coral"
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg
                            className="memphis-shape absolute bottom-[10%] right-[40%] opacity-0"
                            width="120"
                            height="40"
                            viewBox="0 0 120 40"
                        >
                            <polyline
                                points="0,30 15,10 30,30 45,10 60,30 75,10 90,30 105,10 120,30"
                                fill="none"
                                className="stroke-purple"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        {/* Plus signs */}
                        <svg
                            className="memphis-shape absolute top-[70%] left-[35%] opacity-0"
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                        >
                            <line
                                x1="20"
                                y1="5"
                                x2="20"
                                y2="35"
                                className="stroke-yellow"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            <line
                                x1="5"
                                y1="20"
                                x2="35"
                                y2="20"
                                className="stroke-yellow"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-5xl mx-auto text-center">
                            {/* Overline badge */}
                            <div className="hero-overline inline-block mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-black uppercase tracking-[0.2em] bg-yellow text-dark">
                                    <i className="fa-duotone fa-regular fa-bolt"></i>
                                    Split-Fee Recruiting Marketplace
                                </span>
                            </div>

                            <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 text-white uppercase tracking-tight opacity-0">
                                Split the Role.{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">
                                        Split the Fee.
                                    </span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-white/70 opacity-0">
                                One recruiter has the role. Another has the
                                candidate. The platform handles the rest --
                                terms, tracking, and payout.
                            </p>

                            <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/sign-up"
                                    className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                                    Join as Recruiter
                                </Link>
                                <Link
                                    href="#for-companies"
                                    className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-black uppercase tracking-wider border-4 border-white bg-transparent text-white transition-transform hover:-translate-y-1 opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    Post a Role
                                </Link>
                            </div>

                            <div className="hero-tagline text-sm text-white/40 pt-8 opacity-0 uppercase tracking-wider font-bold">
                                Built by recruiters who got tired of
                                spreadsheets, email chains, and mystery math.
                            </div>
                        </div>
                    </div>

                    {/* 4-color accent bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
                        <div className="flex-1 bg-coral" />
                        <div className="flex-1 bg-teal" />
                        <div className="flex-1 bg-yellow" />
                        <div className="flex-1 bg-purple" />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    2. PROBLEM
                ═══════════════════════════════════════════════════════════ */}
                <section className="problem-section py-24 bg-cream overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="problem-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-coral text-white mb-4">
                                The Problem
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Split Placements Are Stuck
                                <br className="hidden md:block" /> in the{" "}
                                <span className="text-coral line-through decoration-4">
                                    Dark Ages
                                </span>
                            </h2>
                            <p className="text-lg text-dark/70">
                                The recruiting industry runs on relationships.
                                But the tools haven&apos;t caught up. Most split
                                deals still depend on trust, memory, and a
                                prayer.
                            </p>
                        </div>
                        <div className="pain-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {painPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className={`pain-card relative border-4 border-dark bg-white p-6 opacity-0`}
                                >
                                    {/* Color top bar */}
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-1.5 ${ACCENT_COLORS[point.accent].bg}`}
                                    />
                                    {/* Corner accent */}
                                    <div
                                        className={`absolute top-0 right-0 w-10 h-10 ${ACCENT_COLORS[point.accent].bg}`}
                                    />
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${ACCENT_COLORS[point.accent].border}`}
                                    >
                                        <i
                                            className={`pain-icon ${point.icon} text-2xl ${ACCENT_COLORS[point.accent].text}`}
                                        ></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-2 text-dark">
                                        {point.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/70">
                                        {point.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    3. HOW IT WORKS
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="how-it-works"
                    className="how-section py-24 bg-white overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="how-heading text-center mb-20 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-teal text-dark mb-4">
                                How It Works
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Two Paths. One{" "}
                                <span className="text-teal">Platform.</span>
                            </h2>
                            <p className="text-lg text-dark/70">
                                Whether you source candidates or hire them,
                                every step is tracked, every term is locked, and
                                every dollar is accounted for.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto mb-16">
                            {/* Recruiter track */}
                            <div className="recruiter-track">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-12 h-12 bg-teal flex items-center justify-center border-4 border-dark">
                                        <i className="fa-duotone fa-regular fa-user-tie text-dark"></i>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-wide text-dark">
                                        For Recruiters
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    {recruiterSteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className="how-step relative flex items-start gap-5 opacity-0"
                                        >
                                            <div className="flex-shrink-0 w-16 h-16 bg-teal border-4 border-dark flex items-center justify-center">
                                                <span className="text-2xl font-black text-dark">
                                                    {step.number}
                                                </span>
                                            </div>
                                            <div className="pt-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <i
                                                        className={`${step.icon} text-teal`}
                                                    ></i>
                                                    <h4 className="font-black text-lg uppercase tracking-wide text-dark">
                                                        {step.title}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-dark/70 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Company track */}
                            <div className="company-track">
                                <div className="flex items-center gap-3 mb-10 lg:justify-end">
                                    <div className="w-12 h-12 bg-coral flex items-center justify-center border-4 border-dark">
                                        <i className="fa-duotone fa-regular fa-building text-white"></i>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-wide text-dark">
                                        For Companies
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    {companySteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className="how-step relative flex items-start gap-5 opacity-0"
                                        >
                                            <div className="flex-shrink-0 w-16 h-16 bg-coral border-4 border-dark flex items-center justify-center">
                                                <span className="text-2xl font-black text-white">
                                                    {step.number}
                                                </span>
                                            </div>
                                            <div className="pt-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <i
                                                        className={`${step.icon} text-coral`}
                                                    ></i>
                                                    <h4 className="font-black text-lg uppercase tracking-wide text-dark">
                                                        {step.title}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-dark/70 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Convergence */}
                        <div className="convergence-point text-center opacity-0">
                            <div className="inline-flex items-center gap-4 px-8 py-5 border-4 border-dark bg-cream">
                                <div className="w-10 h-10 bg-teal border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-user-tie text-dark text-sm"></i>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-arrows-to-circle text-xl text-dark/40"></i>
                                    <span className="text-xs font-black uppercase tracking-wider text-dark/70">
                                        Successful Placement
                                    </span>
                                </div>
                                <div className="w-10 h-10 bg-coral border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-building text-white text-sm"></i>
                                </div>
                            </div>
                            <p className="mt-4 text-dark/50 text-xs font-bold uppercase tracking-wider">
                                Both paths lead to the same result: a placement
                                that pays everyone fairly.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    4. FOR RECRUITERS
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="for-recruiters"
                    className="recruiters-section py-24 bg-dark overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            <div>
                                <div className="recruiters-heading opacity-0">
                                    <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-teal text-dark mb-4">
                                        For Recruiters
                                    </span>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white uppercase tracking-tight">
                                        Your Network Is{" "}
                                        <span className="text-teal">
                                            Revenue.
                                        </span>
                                        <br />
                                        Treat It That Way.
                                    </h2>
                                    <p className="text-lg text-white/70 mb-8">
                                        Stop chasing roles. Let them come to
                                        you. Every curated opportunity on the
                                        platform is a split deal waiting to
                                        close.
                                    </p>
                                </div>
                                <div className="recruiters-benefits space-y-4 mb-10">
                                    {recruiterBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-8 h-8 bg-teal/20 border-4 border-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i
                                                    className={`${benefit.icon} text-xs text-teal`}
                                                ></i>
                                            </div>
                                            <p className="text-white/80 leading-relaxed text-sm">
                                                {benefit.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="recruiters-cta opacity-0">
                                    <Link
                                        href="/sign-up"
                                        className="inline-flex items-center gap-3 px-8 py-4 font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket"></i>
                                        Join the Network
                                    </Link>
                                </div>
                            </div>
                            <div className="recruiters-dashboard relative opacity-0">
                                <div className="border-4 border-white/20 bg-white/5 p-6">
                                    {/* Window chrome */}
                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-white/10">
                                        <div className="w-3 h-3 rounded-full bg-coral" />
                                        <div className="w-3 h-3 rounded-full bg-yellow" />
                                        <div className="w-3 h-3 rounded-full bg-teal" />
                                        <span className="ml-3 text-xs font-mono text-white/40">
                                            splits.network/dashboard
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                                                Dashboard
                                            </div>
                                            <div className="font-black text-white">
                                                Your Active Roles
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-black uppercase bg-teal text-dark">
                                            3 roles
                                        </span>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {recruiterDashboardRoles.map(
                                            (role, index) => (
                                                <div
                                                    key={index}
                                                    className="dashboard-row flex justify-between items-center p-3 border-2 border-white/10 opacity-0"
                                                >
                                                    <div>
                                                        <div className="font-bold text-sm text-white">
                                                            {role.title}
                                                        </div>
                                                        <div className="text-xs text-white/50">
                                                            {role.company}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white/50">
                                                            {role.split}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-bold ${ACCENT_COLORS[role.accent].bg} text-dark`}
                                                        >
                                                            {role.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="border-t-2 border-white/10 pt-4">
                                        <div className="flex items-center justify-between p-4 border-2 border-teal/30 bg-teal/5">
                                            <div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                                                    This Month
                                                </div>
                                                <div className="stat-counter text-3xl font-black text-teal">
                                                    $12,450
                                                </div>
                                                <div className="text-xs text-white/40 mt-1">
                                                    from 3 placements
                                                </div>
                                            </div>
                                            <div className="w-14 h-14 bg-teal/10 border-4 border-teal/30 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-chart-line-up text-xl text-teal"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    5. FOR COMPANIES
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="for-companies"
                    className="companies-section py-24 bg-cream overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            <div className="companies-dashboard relative opacity-0 order-2 lg:order-1">
                                <div className="border-4 border-dark bg-white p-6">
                                    {/* Window chrome */}
                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-dark/10">
                                        <div className="w-3 h-3 rounded-full bg-coral" />
                                        <div className="w-3 h-3 rounded-full bg-yellow" />
                                        <div className="w-3 h-3 rounded-full bg-teal" />
                                        <span className="ml-3 text-xs font-mono text-dark/40">
                                            splits.network/company
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[10px] text-dark/40 uppercase tracking-wider font-bold">
                                                Company Dashboard
                                            </div>
                                            <div className="font-black text-dark">
                                                Your Open Roles
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-black uppercase bg-coral text-white">
                                            3 active
                                        </span>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {companyDashboardRoles.map(
                                            (role, index) => (
                                                <div
                                                    key={index}
                                                    className="dashboard-row p-3 border-2 border-dark/10 opacity-0"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-bold text-sm text-dark">
                                                                {role.title}
                                                            </div>
                                                            <div className="text-xs text-dark/50">
                                                                {role.location}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-bold ${ACCENT_COLORS[role.accent].bg} text-dark`}
                                                        >
                                                            {role.candidates}{" "}
                                                            candidates
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs">
                                                        <span className="px-2 py-0.5 border-2 border-dark/10 font-bold text-dark/60">
                                                            {role.recruiters}{" "}
                                                            recruiters
                                                        </span>
                                                        <span className="px-2 py-0.5 border-2 border-dark/10 font-bold text-dark/60">
                                                            {role.fee} fee
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="border-t-2 border-dark/10 pt-4">
                                        <div className="flex items-center justify-between p-4 border-2 border-coral/30 bg-coral/5">
                                            <div>
                                                <div className="text-[10px] text-dark/40 uppercase tracking-wider font-bold">
                                                    Total Candidates
                                                </div>
                                                <div className="stat-counter text-3xl font-black text-coral">
                                                    15
                                                </div>
                                                <div className="text-xs text-dark/40 mt-1">
                                                    across 3 active roles
                                                </div>
                                            </div>
                                            <div className="w-14 h-14 bg-coral/10 border-4 border-coral/30 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-users text-xl text-coral"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="companies-heading opacity-0">
                                    <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-coral text-white mb-4">
                                        For Companies
                                    </span>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-dark uppercase tracking-tight">
                                        One Platform. Dozens of{" "}
                                        <span className="text-coral">
                                            Recruiters.
                                        </span>
                                        <br />
                                        Zero Contracts.
                                    </h2>
                                    <p className="text-lg text-dark/70 mb-8">
                                        Stop managing individual recruiter
                                        agreements. Post a role, set your terms,
                                        and let the network compete to fill it.
                                    </p>
                                </div>
                                <div className="companies-benefits space-y-4 mb-10">
                                    {companyBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-8 h-8 bg-coral/10 border-4 border-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i
                                                    className={`${benefit.icon} text-xs text-coral`}
                                                ></i>
                                            </div>
                                            <p className="text-dark/80 leading-relaxed text-sm">
                                                {benefit.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="companies-cta opacity-0">
                                    <Link
                                        href="/sign-up"
                                        className="inline-flex items-center gap-3 px-8 py-4 font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                                    >
                                        <i className="fa-duotone fa-regular fa-building"></i>
                                        Post a Role
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    6. MONEY FLOW
                ═══════════════════════════════════════════════════════════ */}
                <section className="money-section py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="money-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-yellow text-dark mb-4">
                                The Money
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Follow the{" "}
                                <span className="text-yellow">Money.</span>
                                <br />
                                Every Dollar Accounted For.
                            </h2>
                            <p className="text-lg text-dark/70">
                                No mystery math. No buried clauses. Everyone
                                sees the same numbers before the deal starts and
                                after it closes.
                            </p>
                        </div>
                        {/* Flow diagram */}
                        <div className="flow-cards max-w-5xl mx-auto mb-16">
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                                <div className="flow-card border-4 border-dark bg-coral text-white w-full lg:w-56 p-6 text-center opacity-0">
                                    <div className="w-14 h-14 bg-white/20 border-4 border-dark flex items-center justify-center mx-auto mb-3">
                                        <i className="fa-duotone fa-regular fa-building text-2xl"></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase">
                                        Company
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        Pays placement fee
                                    </p>
                                </div>
                                <div className="hidden lg:flex items-center justify-center w-16">
                                    <svg
                                        className="arrow-svg w-full h-8 text-dark"
                                        viewBox="0 0 60 32"
                                    >
                                        <path
                                            className="arrow-path"
                                            d="M0 16 L44 16 L34 6 M44 16 L34 26"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div className="lg:hidden flex items-center justify-center h-10">
                                    <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-dark"></i>
                                </div>
                                <div className="flow-card border-4 border-dark bg-teal text-dark w-full lg:w-56 p-6 text-center opacity-0">
                                    <div className="w-14 h-14 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-3">
                                        <i className="fa-duotone fa-regular fa-handshake text-2xl"></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase">
                                        Splits Network
                                    </h3>
                                    <p className="text-sm text-dark/70">
                                        Platform share (25%)
                                    </p>
                                </div>
                                <div className="hidden lg:flex items-center justify-center w-16">
                                    <svg
                                        className="arrow-svg w-full h-8 text-dark"
                                        viewBox="0 0 60 32"
                                    >
                                        <path
                                            className="arrow-path"
                                            d="M0 16 L44 16 L34 6 M44 16 L34 26"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div className="lg:hidden flex items-center justify-center h-10">
                                    <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-dark"></i>
                                </div>
                                <div className="flow-card border-4 border-dark bg-yellow text-dark w-full lg:w-56 p-6 text-center opacity-0">
                                    <div className="w-14 h-14 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-3">
                                        <i className="fa-duotone fa-regular fa-user-tie text-2xl"></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase">
                                        Recruiter
                                    </h3>
                                    <p className="text-sm text-dark/70">
                                        Recruiter share (75%)
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Example breakdown */}
                        <div className="breakdown-card max-w-4xl mx-auto opacity-0">
                            <div className="border-4 border-dark bg-cream p-8">
                                <h3 className="text-xl font-black text-center mb-8 uppercase tracking-wide text-dark">
                                    Example Placement
                                </h3>
                                <div className="grid md:grid-cols-3 gap-8 mb-8">
                                    {exampleBreakdown.map((item, index) => (
                                        <div
                                            key={index}
                                            className="text-center"
                                        >
                                            <div
                                                className={`text-4xl font-black mb-2 ${ACCENT_COLORS[item.accent].text}`}
                                            >
                                                {item.value}
                                            </div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-dark/60">
                                                {item.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-4 border-dark pt-6">
                                    <p className="text-center text-sm font-black uppercase tracking-wider text-dark/80">
                                        The recruiter walks away with $18,000.
                                        That number is locked before the first
                                        resume is submitted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    7. COMPARISON (THE VERDICT)
                ═══════════════════════════════════════════════════════════ */}
                <section className="comparison-section py-24 bg-dark overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="comparison-heading text-center mb-12 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-purple text-white mb-4">
                                The Verdict
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                                Stop Comparing.{" "}
                                <span className="text-teal">
                                    Start Deciding.
                                </span>
                            </h2>
                            <p className="text-lg text-white/60">
                                Other tools were built for direct hires and
                                retrofitted for splits. This platform was built
                                for splits from line one of code.
                            </p>
                        </div>
                        <div className="comparison-table max-w-5xl mx-auto overflow-x-auto">
                            <table className="w-full border-4 border-white/20">
                                <thead>
                                    <tr className="comparison-row opacity-0">
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-white/60 bg-white/5 w-1/4">
                                            Capability
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-white/40 bg-white/5">
                                            Spreadsheets
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-white/40 bg-white/5">
                                            Other ATS
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-teal bg-teal/10 splits-cell">
                                            Splits Network
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="comparison-row opacity-0 border-t-2 border-white/5"
                                        >
                                            <td className="px-6 py-3 text-xs font-bold text-white/80">
                                                {row.feature}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-white/30">
                                                {row.spreadsheets}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-white/30">
                                                {row.otherAts}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs font-bold text-teal splits-cell bg-teal/5">
                                                {row.splits}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pull quote */}
                        <div className="max-w-3xl mx-auto mt-12 text-center opacity-0 comparison-quote">
                            <p className="text-lg font-black uppercase tracking-wide text-white/60">
                                &ldquo;Built for split placements. Not
                                retrofitted. Not bolted on.{" "}
                                <span className="text-teal">Built.</span>&rdquo;
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    8. METRICS
                ═══════════════════════════════════════════════════════════ */}
                <section className="metrics-section py-24 bg-cream overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="metrics-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-teal text-dark mb-4">
                                The Numbers
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Built on{" "}
                                <span className="text-teal">
                                    Transparency.
                                </span>
                                <br />
                                Backed by Data.
                            </h2>
                            <p className="text-lg text-dark/70">
                                These aren&apos;t aspirational goals.
                                They&apos;re architectural decisions baked into
                                every transaction.
                            </p>
                        </div>
                        <div className="metric-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="metric-card relative border-4 border-dark bg-white p-6 text-center opacity-0"
                                >
                                    {/* Color top bar */}
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-1.5 ${ACCENT_COLORS[metric.accent].bg}`}
                                    />
                                    <div
                                        className={`text-5xl font-black mb-2 ${ACCENT_COLORS[metric.accent].text}`}
                                    >
                                        {metric.value}
                                    </div>
                                    <div className="font-black text-sm uppercase tracking-wider text-dark mb-2">
                                        {metric.label}
                                    </div>
                                    <p className="text-xs text-dark/60 leading-relaxed">
                                        {metric.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    9. FAQ
                ═══════════════════════════════════════════════════════════ */}
                <section className="faq-section py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-coral text-white mb-4">
                                Straight Answers
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Questions You&apos;re{" "}
                                <span className="text-coral">Actually</span>{" "}
                                Asking
                            </h2>
                            <p className="text-lg text-dark/70">
                                No fluff. No corporate deflection. Here&apos;s
                                how it works.
                            </p>
                        </div>
                        <div className="faq-items max-w-3xl mx-auto space-y-4">
                            {portalFaqs.map((faq, index) => {
                                const accents = [
                                    "coral",
                                    "teal",
                                    "yellow",
                                    "purple",
                                ] as const;
                                const accent =
                                    accents[index % accents.length];
                                return (
                                    <div
                                        key={index}
                                        className={`faq-item border-4 border-dark opacity-0`}
                                    >
                                        <details className="group">
                                            <summary className="flex items-center justify-between cursor-pointer p-5 font-black text-sm uppercase tracking-wide text-dark bg-white hover:bg-cream transition-colors">
                                                {faq.question}
                                                <span
                                                    className={`w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-xl transition-transform group-open:rotate-45 ${ACCENT_COLORS[accent].bg} ${accent === "yellow" ? "text-dark" : "text-white"}`}
                                                >
                                                    +
                                                </span>
                                            </summary>
                                            <div className="px-5 pb-5 border-t-2 border-dark/10">
                                                <p className="text-sm leading-relaxed text-dark/70 pt-4">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </details>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    10. CTA
                ═══════════════════════════════════════════════════════════ */}
                <section className="cta-section py-24 bg-dark overflow-hidden relative">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] left-[5%] w-20 h-20 rotate-12 bg-coral opacity-20" />
                        <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-teal opacity-20" />
                        <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rounded-full bg-yellow opacity-20" />
                        <div className="absolute bottom-[10%] right-[15%] w-24 h-8 -rotate-6 bg-purple opacity-20" />
                        <svg
                            className="absolute bottom-[30%] left-[40%] opacity-20"
                            width="80"
                            height="30"
                            viewBox="0 0 80 30"
                        >
                            <polyline
                                points="0,25 10,5 20,25 30,5 40,25 50,5 60,25 70,5 80,25"
                                fill="none"
                                className="stroke-purple"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1] text-white">
                                Your Next Split Placement Closes{" "}
                                <span className="text-coral">This Month.</span>
                            </h2>
                            <p className="text-xl text-white/60 mb-12">
                                Every day you spend tracking splits in
                                spreadsheets is a day a candidate takes another
                                offer. The infrastructure exists. The network is
                                live. The only thing missing is you.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link
                                href="/sign-up"
                                className="cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Join as Recruiter
                            </Link>
                            <Link
                                href="/sign-up"
                                className="cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post a Role
                            </Link>
                        </div>
                        <p className="cta-footer text-center text-sm opacity-0 max-w-xl mx-auto text-white/40 uppercase tracking-wider font-bold">
                            Join the recruiters and companies already running
                            transparent split placements on Splits Network.
                        </p>
                    </div>

                    {/* 4-color accent bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
                        <div className="flex-1 bg-coral" />
                        <div className="flex-1 bg-teal" />
                        <div className="flex-1 bg-yellow" />
                        <div className="flex-1 bg-purple" />
                    </div>
                </section>
            </MemphisLandingAnimator>
        </>
    );
}
