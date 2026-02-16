import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { portalFaqs } from "@/components/landing/sections/faq-data";
import { MemphisLandingAnimator } from "@/components/landing/landing-memphis-animator";

// ── Data ───────────────────────────────────────────────────────────────────────

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-handshake-slash",
        title: "Handshake Deals",
        stat: "68%",
        statLabel: "of split deals have no written terms",
        description:
            "You agreed to 75/25 on a phone call. Three months later, the check says 60/40. No paper trail. No recourse.",
        accent: "coral" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-ghost",
        title: "Ghost Pipelines",
        stat: "3.2",
        statLabel: "weeks average candidate follow-up delay",
        description:
            "Candidates enter a black hole between submission and feedback. By the time anyone follows up, they have accepted another offer.",
        accent: "teal" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-lock-keyhole",
        title: "Hoarded Job Orders",
        stat: "41%",
        statLabel: "of recruiters work roles they never fill",
        description:
            "Recruiters hoard job orders like currency. Roles sit unfilled for months because one person cannot cover an entire market.",
        accent: "yellow" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-file-slash",
        title: "Invoice Roulette",
        stat: "52",
        statLabel: "days average payment cycle for split fees",
        description:
            "The placement closed in January. The invoice went out in February. The payment arrived in April. Maybe.",
        accent: "purple" as const,
    },
];

const splitTimeline = [
    {
        step: "01",
        actor: "Company",
        action: "Posts a role with fee and split terms",
        detail: "Senior Engineer, $150K, 20% fee, 75/25 recruiter split",
        icon: "fa-duotone fa-regular fa-briefcase",
        accent: "coral" as const,
    },
    {
        step: "02",
        actor: "Recruiter",
        action: "Finds and submits a qualified candidate",
        detail: "Candidate matched, resume submitted, split terms locked",
        icon: "fa-duotone fa-regular fa-user-magnifying-glass",
        accent: "teal" as const,
    },
    {
        step: "03",
        actor: "Platform",
        action: "Tracks every stage of the pipeline",
        detail: "Screen, interview, offer -- visible to all parties in real time",
        icon: "fa-duotone fa-regular fa-chart-gantt",
        accent: "yellow" as const,
    },
    {
        step: "04",
        actor: "Everyone",
        action: "Candidate starts. Payment flows automatically",
        detail: "$30K fee collected. $22.5K to recruiter. Instant. Transparent.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        accent: "purple" as const,
    },
];

const recruiterBenefits = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Roles",
        text: "Browse roles matched to your specialties. No cold outreach. No gatekeepers. The marketplace brings work to you.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Locked Economics",
        text: "See your exact payout on every deal before you submit a single resume. Terms are set. Math is public. No renegotiation.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        title: "Full Pipeline View",
        text: "Track every candidate and submission in one dashboard. Know where things stand without chasing anyone down.",
    },
    {
        icon: "fa-duotone fa-regular fa-rocket",
        title: "Scale Without Overhead",
        text: "The network brings opportunities. You make placements. No office lease. No cold calling. Just revenue.",
    },
];

const companyBenefits = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        title: "Recruiter Network on Demand",
        text: "Post once and dozens of specialized recruiters start sourcing. No individual contracts. No negotiations.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Real-Time Pipeline",
        text: "See who is working your roles, where candidates stand, and what is moving forward. All in one view.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "Standardized Terms",
        text: "Set fees and split terms once. They apply to every recruiter on the platform. Consistent. Non-negotiable. Clear.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        title: "Pay on Placement Only",
        text: "No retainers. No deposits. No invoices until someone starts. The platform calculates and distributes every split.",
    },
];

const comparisonData = [
    {
        feature: "Split placement tracking",
        old: "Manual spreadsheets",
        splits: "Native. Built from day one.",
    },
    {
        feature: "Fee transparency",
        old: "Verbal agreements",
        splits: "100%. Every party sees the same numbers.",
    },
    {
        feature: "Recruiter network",
        old: "Personal contacts only",
        splits: "Built-in marketplace. Recruiters find you.",
    },
    {
        feature: "Pipeline visibility",
        old: "Scattered across email",
        splits: "Real-time. Shared across all parties.",
    },
    {
        feature: "Payment tracking",
        old: "Manual invoicing",
        splits: "Integrated. Auto-calculated splits.",
    },
    {
        feature: "Candidate ownership",
        old: "Whoever has the file",
        splits: "Timestamped attribution. Recruiter owns it.",
    },
];

const metrics = [
    {
        value: "100%",
        label: "Fee Visibility",
        description:
            "Every split is visible to every party. Before, during, and after the deal closes.",
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

const ACCENT_COLORS = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
};

// ── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: "Split-Fee Recruiting Marketplace",
    description:
        "Post roles. Submit candidates. Split the fee. Splits Network is the platform built for split-fee recruiting -- transparent terms, real-time pipelines, and automated payouts.",
    openGraph: {
        title: "Trust Doesn't Scale. Infrastructure Does.",
        description:
            "The recruiting marketplace where every split placement is tracked, every fee is transparent, and every recruiter gets paid what they agreed to.",
        url: "https://splits.network",
    },
    ...buildCanonical(""),
};

// ── Page ───────────────────────────────────────────────────────────────────────

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
                {/* ═══════════════════════════════════════════════════════════════
                    1. HERO — THE DECLARATION
                ═══════════════════════════════════════════════════════════════ */}
                <section className="hero-section relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis geometric decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Large hollow circle — top left */}
                        <div className="memphis-shape absolute top-[8%] left-[4%] w-36 h-36 rounded-full border-[6px] border-coral opacity-0" />
                        {/* Solid teal circle — right */}
                        <div className="memphis-shape absolute top-[55%] right-[6%] w-28 h-28 rounded-full bg-teal opacity-0" />
                        {/* Small yellow circle — bottom left */}
                        <div className="memphis-shape absolute bottom-[12%] left-[14%] w-14 h-14 rounded-full bg-yellow opacity-0" />
                        {/* Rotated purple square */}
                        <div className="memphis-shape absolute top-[18%] right-[12%] w-24 h-24 rotate-12 bg-purple opacity-0" />
                        {/* Coral rectangle */}
                        <div className="memphis-shape absolute bottom-[22%] right-[28%] w-32 h-12 -rotate-6 border-4 border-coral opacity-0" />
                        {/* Coral diamond */}
                        <div className="memphis-shape absolute top-[42%] left-[18%] w-16 h-16 rotate-45 bg-coral opacity-0" />
                        {/* Dot grid */}
                        <div className="memphis-shape absolute top-[12%] right-[32%] opacity-0">
                            <div className="grid grid-cols-5 gap-2.5">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-yellow"
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg
                            className="memphis-shape absolute bottom-[8%] right-[38%] opacity-0"
                            width="140"
                            height="40"
                            viewBox="0 0 140 40"
                        >
                            <polyline
                                points="0,30 17,10 34,30 51,10 68,30 85,10 102,30 119,10 140,30"
                                fill="none"
                                className="stroke-purple"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        {/* Plus sign */}
                        <svg
                            className="memphis-shape absolute top-[68%] left-[32%] opacity-0"
                            width="44"
                            height="44"
                            viewBox="0 0 44 44"
                        >
                            <line
                                x1="22"
                                y1="5"
                                x2="22"
                                y2="39"
                                className="stroke-teal"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            <line
                                x1="5"
                                y1="22"
                                x2="39"
                                y2="22"
                                className="stroke-teal"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                        {/* Hollow yellow square */}
                        <div className="memphis-shape absolute bottom-[35%] left-[8%] w-20 h-20 border-4 border-yellow rotate-6 opacity-0" />
                        {/* Small teal dot cluster — bottom right */}
                        <div className="memphis-shape absolute bottom-[5%] right-[10%] opacity-0">
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-teal"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-5xl mx-auto text-center">
                            {/* Overline badge */}
                            <div className="hero-overline inline-block mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white border-4 border-coral">
                                    <i className="fa-duotone fa-regular fa-diagram-project"></i>
                                    Split-Fee Infrastructure
                                </span>
                            </div>

                            <h1 className="hero-headline text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] mb-8 text-white uppercase tracking-tight opacity-0">
                                Trust Doesn&apos;t Scale.
                                <br />
                                <span className="relative inline-block mt-2">
                                    <span className="text-teal">
                                        Infrastructure Does.
                                    </span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed text-white/70 opacity-0">
                                Split-fee recruiting runs on relationships. But
                                relationships without infrastructure produce
                                broken deals, lost candidates, and unpaid
                                invoices. We built the infrastructure.
                            </p>

                            <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/sign-up"
                                    className="hero-cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                                    Join as Recruiter
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="hero-cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    Post a Role
                                </Link>
                            </div>

                            <div className="hero-tagline text-sm text-white/40 pt-10 opacity-0 uppercase tracking-wider font-bold">
                                The platform that treats split-fee as a
                                first-class relationship -- not an afterthought.
                            </div>
                        </div>
                    </div>

                    {/* 4-color accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-2">
                        <div className="flex-1 bg-coral" />
                        <div className="flex-1 bg-teal" />
                        <div className="flex-1 bg-yellow" />
                        <div className="flex-1 bg-purple" />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    2. THE BROKEN STATUS QUO
                ═══════════════════════════════════════════════════════════════ */}
                <section className="problem-section py-24 bg-cream overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="problem-heading text-center mb-20 opacity-0 max-w-4xl mx-auto">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                                The Broken Status Quo
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                The Industry Runs on{" "}
                                <span className="text-coral line-through decoration-4">
                                    Trust
                                </span>
                                <br className="hidden md:block" />
                                And Trust Has{" "}
                                <span className="text-coral">No API</span>
                            </h2>
                            <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                                Split-fee deals still happen over phone calls,
                                email threads, and handshake agreements. The
                                result is predictable: missed payments,
                                invisible pipelines, and candidates who
                                disappear into the void.
                            </p>
                        </div>

                        <div className="pain-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {painPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="pain-card relative border-4 border-dark bg-white p-8 opacity-0"
                                >
                                    {/* Color top bar */}
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-2 ${ACCENT_COLORS[point.accent].bg}`}
                                    />
                                    {/* Corner accent square */}
                                    <div
                                        className={`absolute top-0 right-0 w-12 h-12 ${ACCENT_COLORS[point.accent].bg}`}
                                    />
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center mb-5 border-4 ${ACCENT_COLORS[point.accent].border}`}
                                    >
                                        <i
                                            className={`${point.icon} text-2xl ${ACCENT_COLORS[point.accent].text}`}
                                        ></i>
                                    </div>
                                    <div
                                        className={`text-3xl font-black mb-1 ${ACCENT_COLORS[point.accent].text}`}
                                    >
                                        {point.stat}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-4">
                                        {point.statLabel}
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {point.title}
                                    </h3>
                                    <p className="text-base leading-relaxed text-dark/70">
                                        {point.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    3. PULL QUOTE — THE DECLARATION
                ═══════════════════════════════════════════════════════════════ */}
                <section className="bg-dark py-20 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="comparison-quote max-w-4xl mx-auto text-center opacity-0">
                            <div className="relative inline-block">
                                <div className="absolute -top-6 -left-6 w-12 h-12 bg-coral" />
                                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-teal" />
                                <div className="border-l-4 border-coral px-8 py-6">
                                    <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                        &ldquo;Previous attempts at split-fee
                                        platforms failed because they lacked the
                                        technology to enforce{" "}
                                        <span className="text-teal">
                                            transparency.
                                        </span>{" "}
                                        We built the enforcement layer.&rdquo;
                                    </p>
                                    <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-4">
                                        -- Splits Network Founding Principle
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    4. THE SPLIT IN ACTION — TIMELINE
                ═══════════════════════════════════════════════════════════════ */}
                <section
                    id="how-it-works"
                    className="how-section py-24 bg-white overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="how-heading text-center mb-20 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                                A Split in Action
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Four Steps.{" "}
                                <span className="text-teal">Zero Ambiguity.</span>
                            </h2>
                            <p className="text-lg text-dark/70">
                                Every split-fee placement follows the same path.
                                The platform enforces the sequence, tracks every
                                transition, and pays out automatically at the
                                end.
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                {splitTimeline.map((item, index) => (
                                    <div
                                        key={index}
                                        className="how-step relative flex items-start gap-6 opacity-0"
                                    >
                                        {/* Step number block */}
                                        <div
                                            className={`flex-shrink-0 w-20 h-20 ${ACCENT_COLORS[item.accent].bg} border-4 border-dark flex flex-col items-center justify-center`}
                                        >
                                            <span
                                                className={`text-3xl font-black ${item.accent === "yellow" || item.accent === "teal" ? "text-dark" : "text-white"}`}
                                            >
                                                {item.step}
                                            </span>
                                        </div>
                                        <div className="pt-1 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span
                                                    className={`text-xs font-black uppercase tracking-wider ${ACCENT_COLORS[item.accent].text}`}
                                                >
                                                    {item.actor}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-xl uppercase tracking-wide mb-2 text-dark">
                                                {item.action}
                                            </h3>
                                            <p className="text-base text-dark/60 leading-relaxed border-l-4 border-dark/10 pl-4">
                                                {item.detail}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Convergence result */}
                            <div className="convergence-point mt-16 text-center opacity-0">
                                <div className="inline-flex flex-col items-center gap-4 px-10 py-8 border-4 border-dark bg-cream">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-coral border-4 border-dark flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-building text-white"></i>
                                        </div>
                                        <svg
                                            width="60"
                                            height="32"
                                            viewBox="0 0 60 32"
                                            className="arrow-svg text-dark"
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
                                        <div className="w-16 h-16 bg-teal border-4 border-dark flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-check-double text-dark text-xl"></i>
                                        </div>
                                        <svg
                                            width="60"
                                            height="32"
                                            viewBox="0 0 60 32"
                                            className="arrow-svg text-dark"
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
                                        <div className="w-12 h-12 bg-yellow border-4 border-dark flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-user-tie text-dark"></i>
                                        </div>
                                    </div>
                                    <p className="font-black text-base uppercase tracking-wider text-dark">
                                        Company pays. Platform distributes.
                                        Recruiter collects.
                                    </p>
                                    <p className="text-sm text-dark/50 font-bold uppercase tracking-wider">
                                        Every dollar tracked. Every party
                                        visible. Every term honored.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    5. FOR RECRUITERS
                ═══════════════════════════════════════════════════════════════ */}
                <section
                    id="for-recruiters"
                    className="recruiters-section py-24 bg-dark overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            <div>
                                <div className="recruiters-heading opacity-0">
                                    <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                                        For Recruiters
                                    </span>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white uppercase tracking-tight">
                                        Stop Chasing Roles.
                                        <br />
                                        Start{" "}
                                        <span className="text-teal">
                                            Closing Them.
                                        </span>
                                    </h2>
                                    <p className="text-lg text-white/70 mb-10">
                                        Every curated opportunity on the platform
                                        is a split deal with pre-agreed terms.
                                        No cold outreach. No contract
                                        negotiations. No wondering if you will
                                        get paid.
                                    </p>
                                </div>
                                <div className="recruiters-benefits space-y-6 mb-10">
                                    {recruiterBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-12 h-12 bg-teal/20 border-4 border-teal flex items-center justify-center flex-shrink-0">
                                                <i
                                                    className={`${benefit.icon} text-base text-teal`}
                                                ></i>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base uppercase tracking-wide text-white mb-1">
                                                    {benefit.title}
                                                </h4>
                                                <p className="text-base text-white/70 leading-relaxed">
                                                    {benefit.text}
                                                </p>
                                            </div>
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

                            {/* Recruiter dashboard preview */}
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
                                            <div className="text-xs text-white/40 uppercase tracking-wider font-bold">
                                                Your Pipeline
                                            </div>
                                            <div className="font-black text-lg text-white">
                                                Active Split Deals
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-sm font-black uppercase bg-teal text-dark">
                                            4 roles
                                        </span>
                                    </div>
                                    {/* Dashboard rows */}
                                    <div className="space-y-3 mb-4">
                                        {[
                                            {
                                                title: "Senior Engineer",
                                                company: "TechCorp",
                                                status: "Interviewing",
                                                split: "$22.5K",
                                                accent: "teal" as const,
                                            },
                                            {
                                                title: "Product Manager",
                                                company: "ScaleUp Inc",
                                                status: "Offer Stage",
                                                split: "$18K",
                                                accent: "yellow" as const,
                                            },
                                            {
                                                title: "VP of Sales",
                                                company: "GrowthCo",
                                                status: "Submitted",
                                                split: "$37.5K",
                                                accent: "coral" as const,
                                            },
                                        ].map((role, index) => (
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
                                                    <span className="text-sm font-bold text-white/60">
                                                        {role.split}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 text-xs font-bold ${ACCENT_COLORS[role.accent].bg} ${role.accent === "teal" || role.accent === "yellow" ? "text-dark" : "text-white"}`}
                                                    >
                                                        {role.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Earnings summary */}
                                    <div className="border-t-2 border-white/10 pt-4">
                                        <div className="flex items-center justify-between p-4 border-2 border-teal/30 bg-teal/5">
                                            <div>
                                                <div className="text-xs text-white/40 uppercase tracking-wider font-bold">
                                                    Pipeline Value
                                                </div>
                                                <div className="stat-counter text-3xl font-black text-teal">
                                                    $78,000
                                                </div>
                                                <div className="text-xs text-white/40 mt-1">
                                                    across 4 active splits
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

                {/* ═══════════════════════════════════════════════════════════════
                    6. FOR COMPANIES
                ═══════════════════════════════════════════════════════════════ */}
                <section
                    id="for-companies"
                    className="companies-section py-24 bg-cream overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            {/* Company dashboard preview */}
                            <div className="companies-dashboard relative opacity-0 order-2 lg:order-1">
                                <div className="border-4 border-dark bg-white p-6">
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
                                            <div className="text-xs text-dark/40 uppercase tracking-wider font-bold">
                                                Hiring Dashboard
                                            </div>
                                            <div className="font-black text-lg text-dark">
                                                Open Roles
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-sm font-black uppercase bg-coral text-white">
                                            3 active
                                        </span>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {[
                                            {
                                                title: "Backend Engineer",
                                                location: "San Francisco, CA",
                                                candidates: 7,
                                                recruiters: 4,
                                                fee: "20%",
                                                accent: "teal" as const,
                                            },
                                            {
                                                title: "Sales Director",
                                                location: "Remote",
                                                candidates: 3,
                                                recruiters: 2,
                                                fee: "25%",
                                                accent: "yellow" as const,
                                            },
                                            {
                                                title: "Head of Product",
                                                location: "New York, NY",
                                                candidates: 11,
                                                recruiters: 6,
                                                fee: "22%",
                                                accent: "coral" as const,
                                            },
                                        ].map((role, index) => (
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
                                                        className={`px-2 py-1 text-xs font-bold ${ACCENT_COLORS[role.accent].bg} ${role.accent === "teal" || role.accent === "yellow" ? "text-dark" : "text-white"}`}
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
                                        ))}
                                    </div>
                                    <div className="border-t-2 border-dark/10 pt-4">
                                        <div className="flex items-center justify-between p-4 border-2 border-coral/30 bg-coral/5">
                                            <div>
                                                <div className="text-xs text-dark/40 uppercase tracking-wider font-bold">
                                                    Total Candidates
                                                </div>
                                                <div className="stat-counter text-3xl font-black text-coral">
                                                    21
                                                </div>
                                                <div className="text-xs text-dark/40 mt-1">
                                                    from 12 recruiters across 3
                                                    roles
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
                                    <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                                        For Companies
                                    </span>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-dark uppercase tracking-tight">
                                        One Role. Dozens of{" "}
                                        <span className="text-coral">
                                            Recruiters.
                                        </span>
                                        <br />
                                        Zero Contracts.
                                    </h2>
                                    <p className="text-lg text-dark/70 mb-10">
                                        Post a role with your terms. The
                                        marketplace activates specialized
                                        recruiters who compete to fill it. You
                                        manage one platform instead of twelve
                                        vendor relationships.
                                    </p>
                                </div>
                                <div className="companies-benefits space-y-6 mb-10">
                                    {companyBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-12 h-12 bg-coral/10 border-4 border-coral flex items-center justify-center flex-shrink-0">
                                                <i
                                                    className={`${benefit.icon} text-base text-coral`}
                                                ></i>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base uppercase tracking-wide text-dark mb-1">
                                                    {benefit.title}
                                                </h4>
                                                <p className="text-base text-dark/70 leading-relaxed">
                                                    {benefit.text}
                                                </p>
                                            </div>
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

                {/* ═══════════════════════════════════════════════════════════════
                    7. THE MATH — FOLLOW THE MONEY
                ═══════════════════════════════════════════════════════════════ */}
                <section className="money-section py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="money-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-yellow text-dark mb-6">
                                The Math
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Show Me the{" "}
                                <span className="text-yellow">Money.</span>
                                <br />
                                All of It.
                            </h2>
                            <p className="text-lg text-dark/70">
                                No mystery math. No buried clauses. Every party
                                sees the same numbers before the deal starts and
                                after it closes. The math is the product.
                            </p>
                        </div>

                        {/* Flow diagram */}
                        <div className="flow-cards max-w-5xl mx-auto mb-16">
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                                <div className="flow-card border-4 border-dark bg-coral text-white w-full lg:w-64 p-8 text-center opacity-0">
                                    <div className="w-16 h-16 bg-white/20 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-building text-2xl"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase mb-1">
                                        Company
                                    </h3>
                                    <p className="text-base text-white/80">
                                        Pays $30,000
                                    </p>
                                    <p className="text-xs text-white/50 mt-1">
                                        20% of $150K salary
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
                                <div className="flow-card border-4 border-dark bg-teal text-dark w-full lg:w-64 p-8 text-center opacity-0">
                                    <div className="w-16 h-16 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-diagram-project text-2xl"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase mb-1">
                                        Platform
                                    </h3>
                                    <p className="text-base text-dark/80">
                                        Retains $7,500
                                    </p>
                                    <p className="text-xs text-dark/50 mt-1">
                                        25% platform share
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
                                <div className="flow-card border-4 border-dark bg-yellow text-dark w-full lg:w-64 p-8 text-center opacity-0">
                                    <div className="w-16 h-16 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-user-tie text-2xl"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase mb-1">
                                        Recruiter
                                    </h3>
                                    <p className="text-base text-dark/80">
                                        Receives $22,500
                                    </p>
                                    <p className="text-xs text-dark/50 mt-1">
                                        75% recruiter share
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Example breakdown card */}
                        <div className="breakdown-card max-w-4xl mx-auto opacity-0">
                            <div className="border-4 border-dark bg-cream p-8 md:p-10">
                                <h3 className="text-xl font-black text-center mb-8 uppercase tracking-wide text-dark">
                                    Real Placement. Real Numbers.
                                </h3>
                                <div className="grid md:grid-cols-4 gap-6 mb-8">
                                    {[
                                        {
                                            value: "$150K",
                                            label: "Candidate Salary",
                                            accent: "coral" as const,
                                        },
                                        {
                                            value: "$30K",
                                            label: "Placement Fee (20%)",
                                            accent: "teal" as const,
                                        },
                                        {
                                            value: "$22.5K",
                                            label: "Recruiter (75%)",
                                            accent: "yellow" as const,
                                        },
                                        {
                                            value: "$7.5K",
                                            label: "Platform (25%)",
                                            accent: "purple" as const,
                                        },
                                    ].map((item, index) => (
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
                                    <p className="text-center text-base font-black uppercase tracking-wider text-dark/80">
                                        That $22,500 is locked before the first
                                        resume is submitted. Not after. Not
                                        during. Before.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    8. OLD WAY VS NEW WAY — THE COMPARISON
                ═══════════════════════════════════════════════════════════════ */}
                <section className="comparison-section py-24 bg-dark overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="comparison-heading text-center mb-12 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                                The Comparison
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                                The Old Way Is{" "}
                                <span className="text-coral line-through decoration-4">
                                    Comfortable.
                                </span>
                                <br />
                                It&apos;s Also{" "}
                                <span className="text-teal">Expensive.</span>
                            </h2>
                            <p className="text-lg text-white/60">
                                Every workaround has a cost. Every spreadsheet
                                is a liability. Every email chain is a placement
                                at risk.
                            </p>
                        </div>

                        <div className="comparison-table max-w-4xl mx-auto overflow-x-auto">
                            <table className="w-full border-4 border-white/20">
                                <thead>
                                    <tr className="comparison-row opacity-0">
                                        <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-white/60 bg-white/5 w-1/3">
                                            Capability
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-coral bg-coral/10 w-1/3">
                                            The Old Way
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-teal bg-teal/10 w-1/3">
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
                                            <td className="px-6 py-4 text-sm font-bold text-white/80">
                                                {row.feature}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-white/30">
                                                {row.old}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-teal bg-teal/5">
                                                {row.splits}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pull quote */}
                        <div className="max-w-3xl mx-auto mt-14 text-center opacity-0 comparison-quote">
                            <p className="text-xl md:text-2xl font-black uppercase tracking-wide text-white/60 leading-tight">
                                &ldquo;Built for split placements. Not
                                retrofitted. Not bolted on.{" "}
                                <span className="text-teal">Built.</span>
                                &rdquo;
                            </p>
                        </div>
                    </div>
                </section>

                {/* ════��══════════════════════════════════════════════════════════
                    9. METRICS — THE NUMBERS
                ═══════════════════════════════════════════════════════════════ */}
                <section className="metrics-section py-24 bg-cream overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="metrics-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                                By the Numbers
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Architectural{" "}
                                <span className="text-teal">Decisions.</span>
                                <br />
                                Not Aspirational Goals.
                            </h2>
                            <p className="text-lg text-dark/70">
                                These numbers are baked into every transaction.
                                They are not marketing claims. They are how the
                                platform works.
                            </p>
                        </div>

                        <div className="metric-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="metric-card relative border-4 border-dark bg-white p-8 text-center opacity-0"
                                >
                                    {/* Color top bar */}
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-2 ${ACCENT_COLORS[metric.accent].bg}`}
                                    />
                                    {/* Corner accent */}
                                    <div
                                        className={`absolute bottom-0 right-0 w-8 h-8 ${ACCENT_COLORS[metric.accent].bg}`}
                                    />
                                    <div
                                        className={`text-5xl font-black mb-3 ${ACCENT_COLORS[metric.accent].text}`}
                                    >
                                        {metric.value}
                                    </div>
                                    <div className="font-black text-base uppercase tracking-wider text-dark mb-3">
                                        {metric.label}
                                    </div>
                                    <p className="text-base text-dark/60 leading-relaxed">
                                        {metric.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    10. FAQ — STRAIGHT ANSWERS
                ═══════════════════════════════════════════════════════════════ */}
                <section className="faq-section py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                                Straight Answers
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                                Questions You&apos;re{" "}
                                <span className="text-coral">Actually</span>{" "}
                                Asking
                            </h2>
                            <p className="text-lg text-dark/70">
                                No fluff. No corporate deflection. Here is how
                                it works.
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
                                        className="faq-item border-4 border-dark opacity-0"
                                    >
                                        <details className="group">
                                            <summary className="flex items-center justify-between cursor-pointer p-5 font-black text-base uppercase tracking-wide text-dark bg-white hover:bg-cream transition-colors">
                                                {faq.question}
                                                <span
                                                    className={`w-10 h-10 flex items-center justify-center flex-shrink-0 font-black text-xl transition-transform group-open:rotate-45 ${ACCENT_COLORS[accent].bg} ${accent === "yellow" || accent === "teal" ? "text-dark" : "text-white"}`}
                                                >
                                                    +
                                                </span>
                                            </summary>
                                            <div className="px-5 pb-5 border-t-2 border-dark/10">
                                                <p className="text-base leading-relaxed text-dark/70 pt-4">
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

                {/* ═══════════════════════════════════════════════════════════════
                    11. FINAL CTA — THE INFRASTRUCTURE IS LIVE
                ═══════════════════════════════════════════════════════════════ */}
                <section className="cta-section py-28 bg-dark overflow-hidden relative">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[8%] left-[4%] w-24 h-24 rotate-12 bg-coral opacity-20" />
                        <div className="absolute top-[12%] right-[6%] w-20 h-20 rounded-full border-4 border-teal opacity-20" />
                        <div className="absolute bottom-[18%] left-[8%] w-16 h-16 rounded-full bg-yellow opacity-20" />
                        <div className="absolute bottom-[8%] right-[12%] w-28 h-10 -rotate-6 bg-purple opacity-20" />
                        <div className="absolute top-[50%] left-[50%] w-20 h-20 rotate-45 border-4 border-coral opacity-10" />
                        <svg
                            className="absolute bottom-[28%] left-[35%] opacity-20"
                            width="100"
                            height="30"
                            viewBox="0 0 100 30"
                        >
                            <polyline
                                points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                                fill="none"
                                className="stroke-yellow"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <svg
                            className="absolute top-[30%] right-[25%] opacity-15"
                            width="44"
                            height="44"
                            viewBox="0 0 44 44"
                        >
                            <line
                                x1="22"
                                y1="5"
                                x2="22"
                                y2="39"
                                className="stroke-purple"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            <line
                                x1="5"
                                y1="22"
                                x2="39"
                                y2="22"
                                className="stroke-purple"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center mb-14 opacity-0 max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                                The Infrastructure Is{" "}
                                <span className="text-coral">Live.</span>
                                <br />
                                The Network Is{" "}
                                <span className="text-teal">Growing.</span>
                            </h2>
                            <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto">
                                Every day you track splits in spreadsheets is a
                                day a candidate takes another offer. Every
                                handshake deal without a paper trail is a
                                payment at risk.
                            </p>
                            <p className="text-xl text-white/60 max-w-2xl mx-auto">
                                The platform exists. The tools are built. The
                                only variable is whether you are on it or still
                                doing things the old way.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                href="/sign-up"
                                className="cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Join as Recruiter
                            </Link>
                            <Link
                                href="/sign-up"
                                className="cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post a Role
                            </Link>
                        </div>

                        {/* Three-path micro-CTA */}
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
                            {[
                                {
                                    icon: "fa-duotone fa-regular fa-user-tie",
                                    title: "Recruiters",
                                    desc: "Browse roles. Submit candidates. Collect your split.",
                                    accent: "teal" as const,
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-building",
                                    title: "Companies",
                                    desc: "Post roles. Tap the network. Pay on placement only.",
                                    accent: "coral" as const,
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-user",
                                    title: "Candidates",
                                    desc: "Get represented by recruiters competing for your best fit.",
                                    accent: "yellow" as const,
                                },
                            ].map((card, index) => (
                                <div
                                    key={index}
                                    className={`cta-btn border-4 border-white/10 bg-white/5 p-6 text-center opacity-0`}
                                >
                                    <div
                                        className={`w-12 h-12 ${ACCENT_COLORS[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <i
                                            className={`${card.icon} ${card.accent === "teal" || card.accent === "yellow" ? "text-dark" : "text-white"}`}
                                        ></i>
                                    </div>
                                    <h3 className="font-black text-base uppercase tracking-wider text-white mb-2">
                                        {card.title}
                                    </h3>
                                    <p className="text-base text-white/50">
                                        {card.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="cta-footer text-center text-sm opacity-0 max-w-xl mx-auto text-white/40 uppercase tracking-wider font-bold">
                            Join the recruiters and companies already running
                            transparent split placements on Splits Network.
                        </p>
                    </div>

                    {/* 4-color accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-2">
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
