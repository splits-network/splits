import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ArticleFiveAnimator } from "./article-five-animator";

export const metadata: Metadata = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry | Employment Networks",
    description:
        "Split-fee recruiting is rewriting the rules. Discover how networked collaboration, real-time data, and transparent fee structures are replacing outdated agency practices.",
    ...buildCanonical("/articles/five"),
};

// ─── Signal bar data ────────────────────────────────────────────────────────

const signalStats = [
    {
        value: 73,
        suffix: "%",
        prefix: "",
        label: "WANT COLLABORATION",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        value: 4.7,
        suffix: "B",
        prefix: "$",
        label: "MARKET BY 2027",
        icon: "fa-duotone fa-regular fa-chart-line-up",
    },
    {
        value: 2.4,
        suffix: "x",
        prefix: "",
        label: "FASTER PLACEMENTS",
        icon: "fa-duotone fa-regular fa-gauge-max",
    },
    {
        value: 89,
        suffix: "%",
        prefix: "",
        label: "CANDIDATE SATISFACTION",
        icon: "fa-duotone fa-regular fa-face-smile",
    },
];

// ─── Timeline data ──────────────────────────────────────────────────────────

const timelineEvents = [
    {
        year: "2005",
        title: "The Old Guard",
        text: "Recruiting firms operate in isolation. Split-fee deals happen over handshakes and fax machines. Trust is scarce, tracking is nonexistent.",
        color: "text-error",
        border: "border-error/30",
        bg: "bg-error/10",
        dotBg: "bg-error",
    },
    {
        year: "2012",
        title: "Digital Disruption",
        text: "LinkedIn and job boards reshape sourcing. But behind the scenes, recruiter-to-recruiter collaboration remains stuck in spreadsheets and email chains.",
        color: "text-warning",
        border: "border-warning/30",
        bg: "bg-warning/10",
        dotBg: "bg-warning",
    },
    {
        year: "2019",
        title: "Platform Thinking",
        text: "The first split-fee marketplaces emerge. Recruiters start sharing roles digitally, but most platforms lack the tooling to manage the full lifecycle.",
        color: "text-info",
        border: "border-info/30",
        bg: "bg-info/10",
        dotBg: "bg-info",
    },
    {
        year: "2024",
        title: "The Connected Era",
        text: "Modern platforms combine ATS, split-fee management, and candidate portals into unified ecosystems. Transparency becomes the competitive advantage.",
        color: "text-success",
        border: "border-success/30",
        bg: "bg-success/10",
        dotBg: "bg-success",
    },
    {
        year: "2026",
        title: "The Future Is Now",
        text: "AI-powered matching, real-time analytics, and integrated payment flows make split-fee recruiting faster, fairer, and more profitable than ever.",
        color: "text-accent",
        border: "border-accent/30",
        bg: "bg-accent/10",
        dotBg: "bg-accent",
    },
];

// ─── Data modules (benefits) ────────────────────────────────────────────────

const dataModules = [
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Expanded Reach",
        description:
            "Independent recruiters gain access to roles they'd never see on their own. Companies get coverage from specialists across every niche.",
        stat: "10,847 connections live",
        color: "text-info",
        borderColor: "border-info/20",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Built-In Trust",
        description:
            "When terms are set upfront and visible to all parties, disputes drop and partnerships strengthen. Transparency is the foundation.",
        stat: "99.2% dispute-free",
        color: "text-success",
        borderColor: "border-success/20",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-max",
        title: "Faster Fills",
        description:
            "Multiple recruiters working the same role means faster candidate pipelines. Split-fee roles fill 2.4x faster on average.",
        stat: "2.4x fill speed",
        color: "text-warning",
        borderColor: "border-warning/20",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Candidate Experience",
        description:
            "When recruiters collaborate instead of compete, candidates get better representation, clearer communication, and fewer duplicate outreaches.",
        stat: "89% satisfaction",
        color: "text-accent",
        borderColor: "border-accent/20",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        title: "Automated Payouts",
        description:
            "Split-fee calculations, payout schedules, and earnings projections are handled automatically. No invoicing disputes, no chasing payments.",
        stat: "$2.4M processed",
        color: "text-info",
        borderColor: "border-info/20",
    },
    {
        icon: "fa-duotone fa-regular fa-microchip-ai",
        title: "AI-Powered Matching",
        description:
            "Smart algorithms match the right recruiter to the right role based on track record, specialization, and network strength.",
        stat: "12min avg. match",
        color: "text-error",
        borderColor: "border-error/20",
    },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ArticleFivePage() {
    return (
        <ArticleFiveAnimator>
            {/* ================================================================
                HERO - Observatory Article Header
               ================================================================ */}
            <section className="article-hero min-h-[75vh] bg-[#09090b] text-[#e5e7eb] relative overflow-hidden flex items-center">
                {/* Background image - aerial city at night */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
                        alt=""
                        className="w-full h-full object-cover opacity-15"
                    />
                    <div className="absolute inset-0 bg-[#09090b]/70" />
                </div>

                {/* Scanline overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                    }}
                />

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* System status bar */}
                        <div className="hero-status flex items-center gap-3 mb-6 opacity-0">
                            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">
                                Observatory Online
                            </span>
                            <span className="font-mono text-xs text-[#e5e7eb]/30 ml-auto">
                                v2.4.1 // article-feed
                            </span>
                        </div>

                        {/* Category + read time */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 border border-info/30 bg-info/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-info">
                                <i className="fa-duotone fa-regular fa-radar" />
                                Industry Analysis
                            </span>
                            <span className="font-mono text-xs uppercase tracking-[0.15em] text-warning/70">
                                <i className="fa-duotone fa-regular fa-clock mr-1" />
                                12 min read
                            </span>
                            <span className="font-mono text-xs text-[#e5e7eb]/30">
                                February 14, 2026
                            </span>
                        </div>

                        {/* Main headline */}
                        <h1 className="hero-headline text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 opacity-0">
                            <span className="block text-[#e5e7eb]">
                                The Future of Recruiting:
                            </span>
                            <span className="block text-info">
                                How Split-Fee Models Are
                            </span>
                            <span className="block text-[#e5e7eb]">
                                Changing The Industry
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl text-[#e5e7eb]/60 mb-10 max-w-3xl leading-relaxed font-light opacity-0">
                            The recruiting industry has operated the same way for
                            decades. Isolated firms, opaque fees, and candidates
                            caught in the middle. Split-fee models are rewriting
                            those rules -- here&apos;s how the data tells the story.
                        </p>

                        {/* Author byline */}
                        <div className="hero-byline flex items-center gap-4 opacity-0">
                            <div className="w-12 h-12 rounded-lg border border-info/30 bg-info/10 flex items-center justify-center">
                                <span className="font-mono font-bold text-sm text-info">EN</span>
                            </div>
                            <div>
                                <div className="font-bold text-sm text-[#e5e7eb]">
                                    Employment Networks Editorial
                                </div>
                                <div className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                    Research &amp; Strategy Team
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                SIGNAL BAR - Live Stat Counters
               ================================================================ */}
            <section className="signal-section bg-[#0a0a0c] text-[#e5e7eb] py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {signalStats.map((stat, i) => (
                        <div
                            key={i}
                            className="signal-card border-r border-b border-[#27272a]/50 last:border-r-0 bg-[#18181b]/60 p-6 md:p-8 opacity-0"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <i className={`${stat.icon} text-info text-sm`} />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40">
                                    {stat.label}
                                </span>
                            </div>
                            <div
                                className="signal-value font-mono text-3xl md:text-4xl font-bold text-[#e5e7eb]"
                                data-value={stat.value}
                                data-suffix={stat.suffix}
                                data-prefix={stat.prefix}
                            >
                                {stat.prefix}0{stat.suffix}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================================================================
                ARTICLE BODY - Introduction
               ================================================================ */}
            <section className="article-intro bg-[#09090b] text-[#e5e7eb] py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="section-content opacity-0">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-[#27272a]" />
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/60">
                                    Signal Detected
                                </span>
                                <div className="h-px flex-1 bg-[#27272a]" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                The Model Everyone&apos;s{" "}
                                <span className="text-info">Tracking</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                For most of its history, the recruiting industry has been a collection of isolated
                                silos. Agency A works their clients. Agency B works theirs. An independent recruiter
                                might know the perfect candidate for a role they&apos;ll never see -- because it&apos;s
                                locked inside someone else&apos;s network.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                Split-fee recruiting changes that equation entirely. Instead of competing in darkness,
                                recruiters collaborate in the open. One recruiter brings the role. Another brings the
                                candidate. The fee is split according to pre-agreed terms. Everyone wins -- especially
                                the candidate, who gets represented by the recruiter best positioned to advocate for them.
                            </p>

                            <p className="text-lg leading-relaxed text-[#e5e7eb]/70">
                                It sounds simple. And conceptually, it is. But the execution has always been the hard
                                part. Until now.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                PULL QUOTE 1 - Terminal Style
               ================================================================ */}
            <section className="bg-[#0a0a0c] text-[#e5e7eb] py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="terminal-quote max-w-4xl mx-auto border border-info/20 bg-[#18181b]/60 rounded-xl p-8 md:p-12 relative opacity-0">
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#27272a]/50">
                            <span className="w-3 h-3 rounded-full bg-error/60" />
                            <span className="w-3 h-3 rounded-full bg-warning/60" />
                            <span className="w-3 h-3 rounded-full bg-success/60" />
                            <span className="font-mono text-xs text-[#e5e7eb]/30 ml-3">
                                signal-intercept.log
                            </span>
                        </div>

                        <p className="text-xl md:text-2xl font-bold leading-relaxed">
                            <span className="text-info/40 font-mono mr-2">&gt;</span>
                            The best candidate for a role doesn&apos;t care which recruiter
                            found the listing. They care about getting hired.{" "}
                            <span className="text-info">
                                Split-fee models make that happen faster.
                            </span>
                        </p>

                        <div className="mt-6 pt-4 border-t border-[#27272a]/50 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                            <span className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                Industry Research, 2026
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                COMPARISON - Old Way vs New Way (Dashboard Panels)
               ================================================================ */}
            <section className="article-comparison bg-[#09090b] text-[#e5e7eb] py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-warning/60 block mb-3">
                                Comparative Analysis
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                What Changed?{" "}
                                <span className="text-warning">Everything.</span>
                            </h2>
                        </div>

                        <div className="comparison-grid grid md:grid-cols-2 gap-6">
                            {/* Old Way */}
                            <div className="comparison-panel border border-error/20 bg-[#18181b]/40 rounded-xl p-8 opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-error" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">The Old Way</h3>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-error/50">
                                            legacy-mode
                                        </span>
                                    </div>
                                    <span className="ml-auto w-2 h-2 rounded-full bg-error/50" />
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Recruiters hoard job orders and guard client relationships",
                                        "Split deals happen through personal networks and trust alone",
                                        "No standardized terms -- every deal is a negotiation",
                                        "Candidates get passed around with no visibility into the process",
                                        "Payment disputes are common and resolution is painful",
                                        "Independent recruiters are locked out of major opportunities",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-[#e5e7eb]/60 leading-relaxed">
                                            <i className="fa-duotone fa-regular fa-xmark text-error/60 mt-0.5 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* New Way */}
                            <div className="comparison-panel border border-success/20 bg-[#18181b]/40 rounded-xl p-8 opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-rocket text-success" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">The New Way</h3>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-success/50">
                                            network-mode
                                        </span>
                                    </div>
                                    <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Roles are shared openly on a marketplace for qualified recruiters",
                                        "Terms are set upfront and visible to all parties before work begins",
                                        "Standardized contracts eliminate negotiation overhead",
                                        "Candidates track their progress in real-time through their own portal",
                                        "Payments are automated based on verified placement milestones",
                                        "Any recruiter with the right skills can access the right opportunities",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-[#e5e7eb]/60 leading-relaxed">
                                            <i className="fa-duotone fa-regular fa-check text-success/80 mt-0.5 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                IMAGE BREAK 1 - Aerial / observatory view
               ================================================================ */}
            <section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                        alt="Team collaborating in modern office"
                        className="w-full h-full object-cover"
                        style={{ minHeight: "400px" }}
                    />
                    <div className="absolute inset-0 bg-[#09090b]/80" />
                </div>

                {/* Scanline overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                    }}
                />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-overlay-text text-center max-w-3xl opacity-0">
                        <div className="inline-flex items-center gap-2 border border-[#27272a] rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-info animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">
                                Pattern Recognized
                            </span>
                        </div>
                        <p className="text-2xl md:text-4xl font-bold leading-tight text-[#e5e7eb]">
                            Collaboration beats{" "}
                            <span className="text-info">competition</span>{" "}
                            -- every single time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================================================================
                TIMELINE - Evolution of Split-Fee Recruiting
               ================================================================ */}
            <section className="article-timeline bg-[#0a0a0c] text-[#e5e7eb] py-20 overflow-hidden relative">
                {/* Background image - satellite view */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80"
                        alt=""
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-[#0a0a0c]/80" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="timeline-heading text-center mb-16 opacity-0">
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent/60 block mb-3">
                                Signal History
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                How We{" "}
                                <span className="text-accent">Got Here</span>
                            </h2>
                            <p className="text-lg text-[#e5e7eb]/50 max-w-2xl mx-auto">
                                Two decades of evolution, from handshake deals to
                                AI-powered ecosystems.
                            </p>
                        </div>

                        <div className="timeline-track space-y-0">
                            {timelineEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className="timeline-node flex gap-6 md:gap-8 opacity-0"
                                >
                                    {/* Year column with connector */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-16 md:w-20 py-2 text-center font-mono font-bold text-sm md:text-base rounded-lg border ${event.border} ${event.bg} ${event.color}`}>
                                            {event.year}
                                        </div>
                                        {index < timelineEvents.length - 1 && (
                                            <div className="w-px flex-grow bg-[#27272a]/50" style={{ minHeight: "40px" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className={`font-bold text-lg mb-2 ${event.color}`}>
                                            {event.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed text-[#e5e7eb]/60">
                                            {event.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                ARTICLE BODY - Why It Works
               ================================================================ */}
            <section className="article-why bg-[#09090b] text-[#e5e7eb] py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="section-content opacity-0">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-[#27272a]" />
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/60">
                                    Analysis Complete
                                </span>
                                <div className="h-px flex-1 bg-[#27272a]" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Why It{" "}
                                <span className="text-success">Actually Works</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                The skeptics have a point -- split-fee recruiting has been tried before. Networks
                                of recruiters sharing roles over email lists and LinkedIn groups have existed for
                                years. Most of them fizzled. So what&apos;s different now?
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                The answer is infrastructure. Previous split-fee attempts failed because they lacked
                                the underlying technology to enforce transparency, track contributions, and automate
                                payments. Recruiters had to trust each other blindly. Companies had no visibility.
                                Candidates were an afterthought.
                            </p>

                            <p className="text-lg leading-relaxed text-[#e5e7eb]/70">
                                Modern platforms solve this by treating the split-fee relationship as a first-class
                                citizen. Every interaction is tracked. Every contribution is visible. Every payment
                                is tied to a verified outcome. When the infrastructure handles trust, collaboration
                                becomes the default instead of the exception.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                PULL QUOTE 2 - Terminal Style
               ================================================================ */}
            <section className="bg-[#0a0a0c] text-[#e5e7eb] py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="terminal-quote max-w-4xl mx-auto border border-warning/20 bg-[#18181b]/60 rounded-xl p-8 md:p-12 relative opacity-0">
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#27272a]/50">
                            <span className="w-3 h-3 rounded-full bg-error/60" />
                            <span className="w-3 h-3 rounded-full bg-warning/60" />
                            <span className="w-3 h-3 rounded-full bg-success/60" />
                            <span className="font-mono text-xs text-[#e5e7eb]/30 ml-3">
                                pattern-analysis.log
                            </span>
                        </div>

                        <p className="text-xl md:text-2xl font-bold leading-relaxed">
                            <span className="text-warning/40 font-mono mr-2">&gt;</span>
                            Previous split-fee attempts failed because they lacked infrastructure.{" "}
                            <span className="text-warning">
                                When platforms handle trust, collaboration becomes the default.
                            </span>
                        </p>

                        <div className="mt-6 pt-4 border-t border-[#27272a]/50 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                            <span className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                Employment Networks Editorial
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                DATA MODULES - Benefits Grid (Mission Control Style)
               ================================================================ */}
            <section className="article-modules bg-[#09090b] text-[#e5e7eb] py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="modules-heading text-center mb-16 opacity-0">
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/60 block mb-3">
                                System Modules
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                Everyone{" "}
                                <span className="text-info">Benefits</span>
                            </h2>
                            <p className="text-lg text-[#e5e7eb]/50 max-w-2xl mx-auto">
                                Every dimension of the split-fee model, monitored
                                and validated across the network.
                            </p>
                        </div>

                        <div className="modules-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dataModules.map((mod, i) => (
                                <div
                                    key={i}
                                    className={`module-card border ${mod.borderColor} bg-[#18181b]/40 rounded-xl p-6 opacity-0`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <i className={`${mod.icon} text-xl ${mod.color}`} />
                                        <h3 className="font-bold">{mod.title}</h3>
                                    </div>
                                    <p className="text-sm text-[#e5e7eb]/50 mb-4 leading-relaxed">
                                        {mod.description}
                                    </p>
                                    <div className="flex items-center gap-2 pt-3 border-t border-[#27272a]/50">
                                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                        <span className="font-mono text-xs text-[#e5e7eb]/40">
                                            {mod.stat}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                IMAGE BREAK 2 - Observatory view
               ================================================================ */}
            <section className="relative overflow-hidden" style={{ minHeight: "350px" }}>
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80"
                        alt="Modern workspace with technology"
                        className="w-full h-full object-cover"
                        style={{ minHeight: "350px" }}
                    />
                    <div className="absolute inset-0 bg-[#09090b]/85" />
                </div>

                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                    }}
                />

                <div className="relative z-10 flex items-center justify-center py-20 px-8">
                    <div className="image-overlay-text text-center max-w-3xl opacity-0">
                        <div className="inline-flex items-center gap-2 border border-[#27272a] rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">
                                Insight Confirmed
                            </span>
                        </div>
                        <p className="text-xl md:text-3xl font-bold leading-tight text-[#e5e7eb]">
                            The platforms that win will be the ones that make{" "}
                            <span className="text-accent">transparency</span>{" "}
                            feel effortless.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================================================================
                ARTICLE BODY - Looking Ahead
               ================================================================ */}
            <section className="article-future bg-[#09090b] text-[#e5e7eb] py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="section-content opacity-0">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-[#27272a]" />
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent/60">
                                    Projection Model
                                </span>
                                <div className="h-px flex-1 bg-[#27272a]" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                What&apos;s{" "}
                                <span className="text-accent">Next</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                The split-fee model is still early. Most of the recruiting industry hasn&apos;t
                                adopted collaborative platforms yet. But the trajectory is clear. The firms
                                and independent recruiters who embrace open collaboration now are building the
                                networks that will dominate the next decade.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                AI will accelerate this shift. When platforms can automatically match the right
                                recruiter to the right role based on track record, specialization, and network --
                                the friction that once made split-fee deals impractical disappears entirely.
                                Matching becomes instant. Trust becomes data-driven.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-[#e5e7eb]/70">
                                For candidates, this means better representation. When multiple specialized
                                recruiters can advocate for a candidate rather than a single generalist, the
                                quality of opportunities and communication improves dramatically. The data
                                already shows an 89% increase in candidate satisfaction on collaborative platforms.
                            </p>

                            <p className="text-lg leading-relaxed text-[#e5e7eb]/70">
                                The future of recruiting isn&apos;t solo. It&apos;s networked. It&apos;s transparent.
                                And it&apos;s already here.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                PULL QUOTE 3 - Terminal Style (Final)
               ================================================================ */}
            <section className="bg-[#0a0a0c] text-[#e5e7eb] py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="terminal-quote max-w-4xl mx-auto border border-accent/20 bg-[#18181b]/60 rounded-xl p-8 md:p-12 relative opacity-0">
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#27272a]/50">
                            <span className="w-3 h-3 rounded-full bg-error/60" />
                            <span className="w-3 h-3 rounded-full bg-warning/60" />
                            <span className="w-3 h-3 rounded-full bg-success/60" />
                            <span className="font-mono text-xs text-[#e5e7eb]/30 ml-3">
                                final-transmission.log
                            </span>
                        </div>

                        <p className="text-xl md:text-2xl font-bold leading-relaxed">
                            <span className="text-accent/40 font-mono mr-2">&gt;</span>
                            The future of recruiting isn&apos;t solo.{" "}
                            <span className="text-accent">
                                It&apos;s networked. It&apos;s transparent. And it&apos;s already here.
                            </span>
                        </p>

                        <div className="mt-6 pt-4 border-t border-[#27272a]/50 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                Employment Networks, 2026
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                CTA - Observatory Mission Complete
               ================================================================ */}
            <section className="article-cta bg-[#09090b] text-[#e5e7eb] py-24 overflow-hidden relative">
                {/* Subtle top border accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-info/20" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content max-w-4xl mx-auto text-center mb-12 opacity-0">
                        <div className="inline-flex items-center gap-2 border border-[#27272a] rounded-full px-4 py-2 mb-8">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">
                                All systems operational
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to See{" "}
                            <span className="text-info">Split-Fee</span>{" "}
                            In Action?
                        </h2>

                        <p className="text-lg text-[#e5e7eb]/50 mb-10 max-w-xl mx-auto">
                            Employment Networks powers the platforms making this future real.
                            Pick your access point and enter the network.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-panel border border-info/20 bg-[#18181b]/40 rounded-xl p-6 text-center opacity-0">
                            <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-info" />
                            </div>
                            <h3 className="font-bold text-base mb-2">Recruiters</h3>
                            <p className="text-xs text-[#e5e7eb]/40 mb-5 font-mono">
                                Access the split-fee marketplace
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-info w-full font-mono uppercase tracking-wider text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-panel border border-warning/20 bg-[#18181b]/40 rounded-xl p-6 text-center opacity-0">
                            <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-building text-xl text-warning" />
                            </div>
                            <h3 className="font-bold text-base mb-2">Companies</h3>
                            <p className="text-xs text-[#e5e7eb]/40 mb-5 font-mono">
                                Post roles, find vetted talent
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-outline border-warning/30 text-warning w-full font-mono uppercase tracking-wider text-sm hover:bg-warning/10 hover:border-warning"
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-panel border border-success/20 bg-[#18181b]/40 rounded-xl p-6 text-center opacity-0">
                            <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-user text-xl text-success" />
                            </div>
                            <h3 className="font-bold text-base mb-2">Candidates</h3>
                            <p className="text-xs text-[#e5e7eb]/40 mb-5 font-mono">
                                Free profile, real recruiters
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-success w-full font-mono uppercase tracking-wider text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus" />
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm text-[#e5e7eb]/30 mb-3">
                            Questions? Reach out directly.
                        </p>
                        <a
                            href="mailto:hello@employment-networks.com"
                            className="font-mono text-sm text-info/60 hover:text-info transition-colors"
                        >
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </ArticleFiveAnimator>
    );
}
