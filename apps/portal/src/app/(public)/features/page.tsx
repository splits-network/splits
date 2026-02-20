import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { FeaturesAnimator } from "./features-animator";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore the tools and workflows that power split placements on Splits Network, from role setup and submissions to messaging, placements, and payout tracking.",
    openGraph: {
        title: "Features",
        description:
            "Explore the tools and workflows that power split placements on Splits Network, from role setup and submissions to messaging, placements, and payout tracking.",
        url: "https://splits.network/features",
    },
    ...buildCanonical("/features"),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    {
        value: "6",
        label: "Core platform modules",
        bg: "bg-coral",
        text: "text-white",
    },
    {
        value: "3",
        label: "Subscription tiers",
        bg: "bg-teal",
        text: "text-white",
    },
    {
        value: "100%",
        label: "Fee transparency",
        bg: "bg-yellow",
        text: "text-dark",
    },
    {
        value: "24/7",
        label: "Real-time notifications",
        bg: "bg-purple",
        text: "text-white",
    },
];

const coreFeatures = [
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "ATS Foundation",
        description:
            "Full applicant tracking system built for collaborative recruiting.",
        border: "border-primary",
        bg: "bg-coral",
        text: "text-coral",
        items: [
            "Role & job posting management",
            "Candidate profiles & resumes",
            "Application tracking & stages",
            "Notes & activity history",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Split Placement Engine",
        description:
            "Automatic fee calculation and transparent split tracking.",
        border: "border-teal",
        bg: "bg-teal",
        text: "text-teal",
        items: [
            "Placement fee calculation",
            "Recruiter share tracking",
            "Platform fee transparency",
            "Placement history & reporting",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiter Network",
        description: "Connect with specialized recruiters across industries.",
        border: "border-yellow",
        bg: "bg-yellow",
        text: "text-yellow",
        items: [
            "Role assignments by niche",
            "Recruiter profiles & stats",
            "Access control & permissions",
            "Performance tracking",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-crown",
        title: "Flexible Plans",
        description: "Subscription tiers that grow with your business.",
        border: "border-purple",
        bg: "bg-purple",
        text: "text-purple",
        items: [
            "Starter, Pro & Partner tiers",
            "Higher payouts on paid plans",
            "Priority access to roles",
            "Enhanced features per tier",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Smart Notifications",
        description: "Stay informed with real-time updates via email.",
        border: "border-primary",
        bg: "bg-coral",
        text: "text-coral",
        items: [
            "New application alerts",
            "Stage change notifications",
            "Placement confirmations",
            "Customizable preferences",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Admin Console",
        description: "Comprehensive controls for platform administrators.",
        border: "border-teal",
        bg: "bg-teal",
        text: "text-teal",
        items: [
            "Recruiter approval workflow",
            "Company management",
            "Placement oversight",
            "Analytics & reporting",
        ],
    },
];

const recruiterFeatures = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Role Discovery",
        text: "Browse curated roles that match your specialties. No more hunting through job boards -- opportunities come to you based on your expertise and tier.",
        border: "border-primary",
        bg: "bg-coral",
        textColor: "text-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-users-between-lines",
        title: "Candidate Management",
        text: "Submit candidates with ease. Track every submission through interview stages, and maintain full visibility into where each candidate stands.",
        border: "border-teal",
        bg: "bg-teal",
        textColor: "text-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Earnings Dashboard",
        text: "See exactly what you&apos;ve earned, what&apos;s pending, and your placement history. No mystery math -- just transparent fee calculations and clear splits.",
        border: "border-yellow",
        bg: "bg-yellow",
        textColor: "text-yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Performance Insights",
        text: "Track your placement rate, average time to hire, and other key metrics to optimize your recruiting strategy and grow your business.",
        border: "border-purple",
        bg: "bg-purple",
        textColor: "text-purple",
    },
];

const companyFeatures = [
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Role Posting",
        text: "Post open positions with clear requirements, compensation, and fee structures. Control which recruiters have access to each role.",
        border: "border-coral",
        bg: "bg-coral",
        textColor: "text-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-diagram-project",
        title: "Pipeline Visibility",
        text: "See all candidates across all external recruiters in one unified pipeline. No more scattered spreadsheets or email chains.",
        border: "border-teal",
        bg: "bg-teal",
        textColor: "text-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Recruiter Coordination",
        text: "Manage all your external recruiters from one platform. Set fees, track performance, and maintain consistent communication.",
        border: "border-yellow",
        bg: "bg-yellow",
        textColor: "text-yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Cost Management",
        text: "Track placement costs, analyze ROI by recruiter, and maintain transparency with standardized fee agreements.",
        border: "border-purple",
        bg: "bg-purple",
        textColor: "text-purple",
    },
];

const techFeatures = [
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Secure by Design",
        text: "Enterprise authentication, role-based access control, and encrypted data storage protect every interaction on the platform.",
        border: "border-coral",
        bg: "bg-coral",
        textColor: "text-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Lightning Fast",
        text: "Microservices architecture with optimized database queries delivers instant response times across every workflow.",
        border: "border-teal",
        bg: "bg-teal",
        textColor: "text-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-spin",
        title: "Always Reliable",
        text: "99.9% uptime guarantee with automated backups, redundant systems, and real-time health monitoring.",
        border: "border-yellow",
        bg: "bg-yellow",
        textColor: "text-yellow",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
    return (
        <FeaturesAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-hero relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle -- keep inline style for CSS triangle border trick */}
                    <div
                        className="memphis-shape absolute top-[18%] left-[45%] opacity-0"
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: "25px solid transparent",
                            borderRight: "25px solid transparent",
                            borderBottom: "43px solid #FFE66D",
                            transform: "rotate(-10deg)",
                        }}
                    />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[20%] right-[45%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-teal"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag -- keep inline SVG attributes */}
                    <svg
                        className="memphis-shape absolute top-[70%] left-[40%] opacity-0"
                        width="100"
                        height="30"
                        viewBox="0 0 100 30"
                    >
                        <polyline
                            points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none"
                            stroke="#A78BFA"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Plus sign -- keep inline SVG attributes */}
                    <svg
                        className="memphis-shape absolute top-[65%] left-[8%] opacity-0"
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                    >
                        <line
                            x1="15"
                            y1="3"
                            x2="15"
                            y2="27"
                            stroke="#FFE66D"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <line
                            x1="3"
                            y1="15"
                            x2="27"
                            y2="15"
                            stroke="#FFE66D"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Extra circle */}
                    <div className="memphis-shape absolute top-[75%] right-[15%] w-8 h-8 rounded-full border-[3px] border-teal opacity-0" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category badge */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-cube"></i>
                                Platform Features
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-yellow">
                                <i className="fa-duotone fa-regular fa-layer-group mr-1"></i>
                                Full Ecosystem
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                            Everything You Need for{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">
                                    Split Placements
                                </span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            Built from the ground up for collaborative
                            recruiting. No retrofitting, no workarounds -- just
                            pure split placement functionality across every
                            workflow.
                        </p>

                        {/* Byline */}
                        <div className="hero-byline flex items-center gap-4 opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center font-black text-lg bg-teal text-dark">
                                SN
                            </div>
                            <div>
                                <div className="font-bold uppercase tracking-wide text-sm text-cream">
                                    Splits Network
                                </div>
                                <div className="text-xs uppercase tracking-wider text-cream/50">
                                    Platform Overview
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div
                            key={index}
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${stat.bg} ${stat.text}`}
                        >
                            <div className="text-3xl md:text-4xl font-black mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTRO SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-intro py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="article-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                A Complete{" "}
                                <span className="text-coral">
                                    Recruiting Ecosystem
                                </span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark opacity-80">
                                Most recruiting platforms were designed for a
                                single agency working its own clients. They bolt
                                on collaboration features as an afterthought.
                                Splits Network is different. Every module, every
                                workflow, every line of code was built with
                                split-fee collaboration as the core assumption.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-dark opacity-80">
                                The result is a platform where posting a role,
                                assigning recruiters, tracking candidates,
                                calculating splits, and managing payouts all
                                flow together seamlessly. No spreadsheets. No
                                side channels. No guesswork.
                            </p>

                            <p className="text-lg leading-relaxed text-dark opacity-80">
                                Here&apos;s a look at everything the platform
                                delivers -- from the ATS foundation to the admin
                                console, and every feature in between.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 1
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                            No retrofitting, no workarounds. Every feature was
                            designed for collaborative recruiting from day one.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CORE FEATURES GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-core py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="core-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Core Platform
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Six Modules.{" "}
                                <span className="text-purple">
                                    One Ecosystem.
                                </span>
                            </h2>
                        </div>

                        <div className="core-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coreFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`core-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${feature.border}`}
                                >
                                    {/* Corner accent */}
                                    <div
                                        className={`absolute top-0 right-0 w-10 h-10 ${feature.bg}`}
                                    />

                                    <div
                                        className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.border}`}
                                    >
                                        <i
                                            className={`${feature.icon} text-2xl ${feature.text}`}
                                        ></i>
                                    </div>

                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed mb-4 text-dark/75">
                                        {feature.description}
                                    </p>

                                    <ul className="space-y-2">
                                        {feature.items.map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm leading-relaxed text-dark/70"
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 ${feature.text}`}
                                                ></i>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK 1
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden min-h-[400px]">
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                    alt="Team collaborating in modern office"
                    className="w-full h-full object-cover absolute inset-0 min-h-[400px]"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-dark opacity-75" />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 border-yellow pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-cream">
                            One platform where{" "}
                            <span className="text-yellow">every workflow</span>{" "}
                            connects seamlessly.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOR RECRUITERS SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-recruiters-prose py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="prose-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                Built for{" "}
                                <span className="text-coral">Recruiters</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark opacity-80">
                                Independent recruiters and agency teams spend
                                too much time on administrative overhead and not
                                enough time doing what they do best -- finding
                                great candidates. Splits Network gives
                                recruiters a single workspace to discover roles,
                                submit candidates, track earnings, and measure
                                performance.
                            </p>

                            <p className="text-lg leading-relaxed text-dark opacity-80">
                                Whether you&apos;re on the Starter, Pro, or
                                Partner tier, the platform scales with your
                                business. Higher tiers unlock better payout
                                percentages and priority access to premium roles
                                -- rewarding the recruiters who commit to the
                                network.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-recruiters py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="recruiter-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                Recruiter Tools
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Maximize Your{" "}
                                <span className="text-coral">
                                    Placement Success
                                </span>
                            </h2>
                        </div>

                        <div className="recruiter-grid grid md:grid-cols-2 gap-6">
                            {recruiterFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`recruiter-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${feature.border}`}
                                >
                                    <div
                                        className={`absolute top-0 right-0 w-10 h-10 ${feature.bg}`}
                                    />
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.border}`}
                                    >
                                        <i
                                            className={`${feature.icon} text-2xl ${feature.textColor}`}
                                        ></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-coral opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-coral">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                            No mystery math. Transparent fee calculations and
                            clear splits on every single placement.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Earnings Dashboard
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOR COMPANIES SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-companies-prose py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="prose-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                Designed for{" "}
                                <span className="text-teal">Companies</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark opacity-80">
                                Managing external recruiters has always been
                                messy. Different agencies, different fee
                                structures, candidates scattered across email
                                threads and spreadsheets. Companies need a
                                single source of truth for their external
                                recruiting operations -- and that&apos;s exactly
                                what Splits Network provides.
                            </p>

                            <p className="text-lg leading-relaxed text-dark opacity-80">
                                Post roles with clear requirements and fee
                                structures. See every candidate from every
                                recruiter in one unified pipeline. Track costs,
                                measure recruiter performance, and maintain
                                complete visibility from requisition to
                                placement.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-companies py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="company-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Company Tools
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                Streamline{" "}
                                <span className="text-teal">
                                    External Recruiting
                                </span>
                            </h2>
                        </div>

                        <div className="company-grid grid md:grid-cols-2 gap-6">
                            {companyFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`company-card relative p-6 md:p-8 border-4 bg-white/[0.03] opacity-0 ${feature.border}`}
                                >
                                    <div
                                        className={`absolute top-0 right-0 w-10 h-10 ${feature.bg}`}
                                    />
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.border}`}
                                    >
                                        <i
                                            className={`${feature.icon} text-2xl ${feature.textColor}`}
                                        ></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-cream">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-cream/65">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden min-h-[350px]">
                <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80"
                    alt="Modern workspace with technology"
                    className="w-full h-full object-cover absolute inset-0 min-h-[350px]"
                />
                <div className="absolute inset-0 bg-dark opacity-80" />
                <div className="absolute inset-4 md:inset-8 border-4 border-coral pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center py-20 px-8">
                    <div className="image-caption-2 text-center max-w-3xl opacity-0">
                        <p className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight text-cream">
                            Enterprise-grade{" "}
                            <span className="text-coral">infrastructure</span>{" "}
                            that scales with your ambition.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MORE FEATURES / TECH / ADMIN
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-more-prose py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="prose-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                Built on{" "}
                                <span className="text-purple">
                                    Modern Architecture
                                </span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark opacity-80">
                                Features are only as good as the infrastructure
                                behind them. Splits Network runs on a
                                microservices architecture designed for speed,
                                security, and reliability. Every service is
                                purpose-built, independently deployable, and
                                optimized for its specific domain.
                            </p>

                            <p className="text-lg leading-relaxed text-dark opacity-80">
                                Enterprise authentication protects every login.
                                Role-based access control ensures the right
                                people see the right data. Encrypted storage
                                safeguards sensitive information. And automated
                                backups mean your data is never at risk.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-more py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="more-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Infrastructure
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Under the{" "}
                                <span className="text-yellow">Hood</span>
                            </h2>
                        </div>

                        <div className="more-grid grid md:grid-cols-3 gap-6">
                            {techFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`more-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${feature.border}`}
                                >
                                    <div
                                        className={`absolute top-0 right-0 w-10 h-10 ${feature.bg}`}
                                    />
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.border}`}
                                    >
                                        <i
                                            className={`${feature.icon} text-2xl ${feature.textColor}`}
                                        ></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FINAL PULL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-yellow opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-yellow">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                            Join the platform built specifically for split
                            placements. No retrofitting, no compromises.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-yellow">
                            <span className="text-sm font-bold uppercase tracking-wider text-yellow">
                                -- Splits Network
                            </span>
                        </div>
                        <div className="absolute top-0 left-0 w-10 h-10 bg-yellow" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    {/* Zigzag -- keep inline SVG attributes */}
                    <svg
                        className="absolute bottom-[25%] right-[18%]"
                        width="70"
                        height="25"
                        viewBox="0 0 70 25"
                    >
                        <polyline
                            points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none"
                            stroke="#A78BFA"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                            Get Started
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-cream">
                            Ready To{" "}
                            <span className="text-coral">Experience</span> The
                            Difference?
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Pick your path and get started today. Every feature,
                            every workflow, designed for split-fee recruiting.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 border-coral bg-white/[0.03] text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-white"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-cream">
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Access the split-fee marketplace
                            </p>
                            <a
                                href="/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-white text-center text-sm transition-transform hover:-translate-y-1"
                            >
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 border-yellow bg-white/[0.03] text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-yellow">
                                <i className="fa-duotone fa-regular fa-building text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-cream">
                                Companies
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Post roles, find vetted talent
                            </p>
                            <a
                                href="/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-dark text-center text-sm transition-transform hover:-translate-y-1"
                            >
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 border-teal bg-white/[0.03] text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-user text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-cream">
                                Candidates
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Free profile, real recruiters
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-dark text-center text-sm transition-transform hover:-translate-y-1"
                            >
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-cream/50">
                            Have questions? We&apos;d love to hear from you.
                        </p>
                        <a
                            href="mailto:hello@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow"
                        >
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </FeaturesAnimator>
    );
}
