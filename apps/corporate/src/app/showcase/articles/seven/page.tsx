import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ArticleSevenAnimator } from "./article-seven-animator";

export const metadata: Metadata = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry | Employment Networks",
    description:
        "Split-fee recruiting is rewriting the rules. Learn how collaborative models are replacing outdated agency practices and creating a more transparent, efficient hiring ecosystem.",
    ...buildCanonical("/articles/seven"),
};

// ─── Article Data ────────────────────────────────────────────────────────────

const systemSpecs = [
    { label: "PUBLICATION", value: "EMPLOYMENT NETWORKS" },
    { label: "CLASSIFICATION", value: "INDUSTRY ANALYSIS" },
    { label: "CLEARANCE", value: "PUBLIC" },
];

const keyStats = [
    { value: "73%", label: "RECRUITER COLLABORATION DEMAND", unit: "survey" },
    { value: "$4.7B", label: "PROJECTED MARKET SIZE", unit: "by 2027" },
    { value: "2.4x", label: "FASTER PLACEMENT RATE", unit: "vs. solo" },
    { value: "89%", label: "CANDIDATE SATISFACTION", unit: "increase" },
];

const timelineEvents = [
    {
        phase: "01",
        year: "2005",
        title: "THE OLD GUARD",
        description:
            "Recruiting firms operate in isolation. Split-fee deals happen over handshakes and fax machines. Trust is scarce, tracking is nonexistent.",
        icon: "fa-duotone fa-regular fa-fax",
        output: "Fragmented industry with zero collaboration infrastructure",
    },
    {
        phase: "02",
        year: "2012",
        title: "DIGITAL DISRUPTION",
        description:
            "LinkedIn and job boards reshape sourcing. But behind the scenes, recruiter-to-recruiter collaboration remains stuck in spreadsheets and email chains.",
        icon: "fa-duotone fa-regular fa-laptop",
        output: "Sourcing digitized but collaboration still analog",
    },
    {
        phase: "03",
        year: "2019",
        title: "PLATFORM THINKING",
        description:
            "The first split-fee marketplaces emerge. Recruiters start sharing roles digitally, but most platforms lack the tooling to manage the full lifecycle.",
        icon: "fa-duotone fa-regular fa-browser",
        output: "Early marketplace experiments with limited tooling",
    },
    {
        phase: "04",
        year: "2024",
        title: "THE CONNECTED ERA",
        description:
            "Modern platforms combine ATS, split-fee management, and candidate portals into unified ecosystems. Transparency becomes the competitive advantage.",
        icon: "fa-duotone fa-regular fa-network-wired",
        output: "Unified platforms with end-to-end transparency",
    },
    {
        phase: "05",
        year: "2026",
        title: "THE FUTURE IS NOW",
        description:
            "AI-powered matching, real-time analytics, and integrated payment flows make split-fee recruiting faster, fairer, and more profitable than ever.",
        icon: "fa-duotone fa-regular fa-microchip-ai",
        output: "AI-driven collaboration at scale",
    },
];

const benefits = [
    {
        id: "BNF-001",
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Expanded Reach",
        description:
            "Independent recruiters gain access to roles they would never see on their own. Companies get coverage from specialists across every niche.",
        specs: [
            "Cross-network role distribution",
            "Niche specialist matching",
            "Geographic coverage expansion",
        ],
    },
    {
        id: "BNF-002",
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Built-In Trust",
        description:
            "When terms are set upfront and visible to all parties, disputes drop and partnerships strengthen. Transparency is the foundation.",
        specs: [
            "Pre-agreed fee structures",
            "Immutable contract records",
            "Automated compliance tracking",
        ],
    },
    {
        id: "BNF-003",
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Faster Fills",
        description:
            "Multiple recruiters working the same role means faster candidate pipelines. Split-fee roles fill 2.4x faster on average.",
        specs: [
            "Parallel sourcing channels",
            "Real-time pipeline visibility",
            "Reduced time-to-hire metrics",
        ],
    },
    {
        id: "BNF-004",
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Candidate Experience",
        description:
            "When recruiters collaborate instead of compete, candidates get better representation, clearer communication, and fewer duplicate outreaches.",
        specs: [
            "Deduplicated candidate tracking",
            "Consistent communication flow",
            "Self-service status portal",
        ],
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ArticleSevenPage() {
    return (
        <ArticleSevenAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO - Article Header / Boot Sequence
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-hero min-h-[75vh] bg-[#0a0e17] text-[#c8ccd4] relative overflow-hidden flex items-center">
                {/* Blueprint grid background */}
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                {/* Corner reference marks */}
                <div className="bp-hero-ref absolute top-6 left-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest opacity-0">
                    REF: SN-ART07-2026
                </div>
                <div className="absolute top-6 right-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    DOC TYPE: ANALYSIS
                </div>
                <div className="absolute bottom-6 left-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    EMPLOYMENT NETWORKS INC.
                </div>
                <div className="absolute bottom-6 right-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block bp-pulse-dot mr-1"></span>
                    PUBLISHED
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto">
                        {/* System status bar */}
                        <div className="bp-hero-meta flex flex-wrap gap-6 mb-12 font-mono text-xs opacity-0">
                            {systemSpecs.map((spec) => (
                                <div key={spec.label} className="flex items-center gap-2">
                                    <span className="text-[#3b5ccc]/60 uppercase">
                                        {spec.label}:
                                    </span>
                                    <span className="text-[#14b8a6]">
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <span className="text-[#c8ccd4]/40">
                                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                    12 MIN READ
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#c8ccd4]/30">
                                    FEBRUARY 14, 2026
                                </span>
                            </div>
                        </div>

                        {/* Main headline */}
                        <div className="mb-8">
                            <h1 className="bp-hero-headline text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 opacity-0">
                                <span className="text-white">The Future of Recruiting:</span>
                                <br />
                                <span className="text-[#3b5ccc]">
                                    How Split-Fee Models
                                </span>
                                <br />
                                <span className="text-white">
                                    Are Changing The Industry
                                </span>
                            </h1>
                            <p className="bp-hero-sub text-lg md:text-xl text-[#c8ccd4]/60 max-w-2xl leading-relaxed font-light opacity-0">
                                The recruiting industry has operated the same way for
                                decades. Isolated firms, opaque fees, and candidates
                                caught in the middle. Split-fee models are rewriting
                                those rules -- here&apos;s how.
                            </p>
                        </div>

                        {/* Author byline */}
                        <div className="bp-hero-byline flex items-center gap-4 mt-10 opacity-0">
                            <div className="w-12 h-12 border border-[#3b5ccc]/40 flex items-center justify-center font-mono text-sm font-bold text-[#3b5ccc]">
                                EN
                            </div>
                            <div>
                                <div className="font-mono text-sm text-white tracking-wider">
                                    EMPLOYMENT NETWORKS EDITORIAL
                                </div>
                                <div className="font-mono text-[10px] text-[#c8ccd4]/40 tracking-wider">
                                    RESEARCH &amp; STRATEGY DIVISION
                                </div>
                            </div>
                        </div>

                        {/* Blueprint divider */}
                        <div className="bp-hero-divider mt-16 h-px bg-[#3b5ccc]/20 relative opacity-0">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS - System Metrics
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-stats-section bg-[#0d1220] text-[#c8ccd4] py-20 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-stats-label font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-8 text-center opacity-0">
                        // KEY METRICS
                    </div>

                    <div className="bp-stats-grid grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#3b5ccc]/10 max-w-5xl mx-auto">
                        {keyStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="bp-stat-cell bg-[#0d1220] p-8 text-center opacity-0"
                            >
                                <div className="font-mono text-3xl md:text-4xl font-bold text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc] mb-1">
                                    {stat.label}
                                </div>
                                <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                    [{stat.unit}]
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARTICLE BODY - Introduction
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-intro-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="bp-intro-content opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-6">
                                // SECTION 01: INTRODUCTION
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                                The Model Everyone&apos;s{" "}
                                <span className="text-[#3b5ccc]">Talking About</span>
                            </h2>

                            <div className="space-y-6 text-base leading-relaxed text-[#c8ccd4]/60">
                                <p>
                                    For most of its history, the recruiting industry has been
                                    a collection of isolated silos. Agency A works their
                                    clients. Agency B works theirs. An independent recruiter
                                    might know the perfect candidate for a role they&apos;ll
                                    never see -- because it&apos;s locked inside someone
                                    else&apos;s network.
                                </p>

                                <p>
                                    Split-fee recruiting changes that equation entirely.
                                    Instead of competing in darkness, recruiters collaborate in
                                    the open. One recruiter brings the role. Another brings the
                                    candidate. The fee is split according to pre-agreed terms.
                                    Everyone wins -- especially the candidate, who gets
                                    represented by the recruiter best positioned to advocate
                                    for them.
                                </p>

                                <p>
                                    It sounds simple. And conceptually, it is. But the
                                    execution has always been the hard part. Until now.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 1
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#0d1220] text-[#c8ccd4] py-16 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-pullquote max-w-4xl mx-auto border border-[#3b5ccc]/30 p-8 md:p-12 relative opacity-0">
                        {/* Corner accent */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#3b5ccc]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#3b5ccc]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#3b5ccc]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#3b5ccc]"></div>

                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">
                            EXCERPT // FIELD NOTE
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-6">
                            &ldquo;The best candidate for a role doesn&apos;t care which
                            recruiter found the listing. They care about getting hired.
                            Split-fee models make that happen faster.&rdquo;
                        </p>
                        <div className="h-px bg-[#3b5ccc]/20 mb-4"></div>
                        <span className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider">
                            SOURCE: INDUSTRY RESEARCH, 2026
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                COMPARISON - Old Way vs New Way
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-comparison-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="bp-comparison-heading mb-16 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // COMPARATIVE ANALYSIS
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                What Changed?{" "}
                                <span className="text-[#3b5ccc]">Everything.</span>
                            </h2>
                        </div>

                        <div className="bp-comparison-grid grid md:grid-cols-2 gap-px bg-[#3b5ccc]/10">
                            {/* Old Way */}
                            <div className="bp-comparison-card bg-[#0a0e17] p-8 relative group opacity-0">
                                <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-widest mb-4">
                                    LEGACY PROTOCOL
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 border border-[#ef4444]/40 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-lg text-[#ef4444]"></i>
                                    </div>
                                    <h3 className="font-bold text-white text-lg">
                                        The Old Way
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        "Recruiters hoard job orders and guard client relationships",
                                        "Split deals happen through personal networks and trust alone",
                                        "No standardized terms -- every deal is a negotiation",
                                        "Candidates get passed around with no visibility",
                                        "Payment disputes are common and resolution is painful",
                                        "Independent recruiters locked out of major opportunities",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <span className="font-mono text-xs text-[#ef4444]/60 mt-0.5">
                                                --
                                            </span>
                                            <span className="text-[#c8ccd4]/50">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#ef4444] group-hover:w-full transition-all duration-500"></div>
                            </div>

                            {/* New Way */}
                            <div className="bp-comparison-card bg-[#0a0e17] p-8 relative group opacity-0">
                                <div className="font-mono text-[10px] text-[#22c55e]/60 tracking-widest mb-4">
                                    CURRENT PROTOCOL
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 border border-[#22c55e]/40 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-rocket text-lg text-[#22c55e]"></i>
                                    </div>
                                    <h3 className="font-bold text-white text-lg">
                                        The New Way
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        "Roles shared openly on a marketplace for qualified recruiters",
                                        "Terms set upfront and visible to all parties before work begins",
                                        "Standardized contracts eliminate negotiation overhead",
                                        "Candidates track progress in real-time through their own portal",
                                        "Payments automated based on verified placement milestones",
                                        "Any recruiter with the right skills accesses the right opportunities",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <span className="font-mono text-xs text-[#22c55e]/60 mt-0.5">
                                                &gt;
                                            </span>
                                            <span className="text-[#c8ccd4]/70">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#22c55e] group-hover:w-full transition-all duration-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK - Blueprint overlay
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                    alt="Team collaborating in modern office"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: "400px" }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[#0a0e17]/85"></div>
                {/* Blueprint grid overlay */}
                <div className="absolute inset-0 bp-grid-bg opacity-[0.06]"></div>
                {/* Technical border frame */}
                <div className="absolute inset-4 md:inset-8 border border-[#3b5ccc]/30 pointer-events-none">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#3b5ccc]"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#3b5ccc]"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#3b5ccc]"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#3b5ccc]"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="bp-image-caption text-center max-w-3xl opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                            // OBSERVATION
                        </div>
                        <p className="text-2xl md:text-4xl font-bold text-white leading-tight">
                            Collaboration beats{" "}
                            <span className="text-[#3b5ccc]">competition</span>
                            {" "}-- every single time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE - Evolution Sequence
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-timeline-section bg-[#0d1220] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="bp-timeline-heading mb-16 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // HISTORICAL SEQUENCE
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                Evolution Log
                            </h2>
                            <p className="text-[#c8ccd4]/50 max-w-xl">
                                From isolated operations to connected ecosystems.
                                Every milestone tracked.
                            </p>
                        </div>

                        <div className="bp-timeline-items space-y-0">
                            {timelineEvents.map((event, index) => (
                                <div
                                    key={event.phase}
                                    className="bp-timeline-item opacity-0"
                                >
                                    <div className="flex gap-6 md:gap-10 relative">
                                        {/* Phase number + connector */}
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className="w-14 h-14 border-2 border-[#3b5ccc]/40 flex items-center justify-center bg-[#0d1220] relative z-10">
                                                <span className="font-mono text-lg font-bold text-[#3b5ccc]">
                                                    {event.phase}
                                                </span>
                                            </div>
                                            {index < timelineEvents.length - 1 && (
                                                <div className="w-px h-full bg-[#3b5ccc]/20 min-h-[60px]"></div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="pb-10 flex-1">
                                            <div className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider mb-1">
                                                YEAR: {event.year}
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <i className={`${event.icon} text-[#3b5ccc]`}></i>
                                                <h3 className="font-mono font-bold text-white tracking-wider">
                                                    {event.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-[#c8ccd4]/50 mb-3 leading-relaxed">
                                                {event.description}
                                            </p>
                                            <div className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider">
                                                OUTPUT: {event.output}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARTICLE BODY - Why It Works
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-why-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="bp-why-content opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-6">
                                // SECTION 02: ANALYSIS
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                                Why It{" "}
                                <span className="text-[#14b8a6]">Actually Works</span>
                            </h2>

                            <div className="space-y-6 text-base leading-relaxed text-[#c8ccd4]/60">
                                <p>
                                    The skeptics have a point -- split-fee recruiting has
                                    been tried before. Networks of recruiters sharing roles
                                    over email lists and LinkedIn groups have existed for
                                    years. Most of them fizzled. So what&apos;s different
                                    now?
                                </p>

                                <p>
                                    The answer is infrastructure. Previous split-fee attempts
                                    failed because they lacked the underlying technology to
                                    enforce transparency, track contributions, and automate
                                    payments. Recruiters had to trust each other blindly.
                                    Companies had no visibility. Candidates were an
                                    afterthought.
                                </p>

                                <p>
                                    Modern platforms solve this by treating the split-fee
                                    relationship as a first-class citizen. Every interaction
                                    is tracked. Every contribution is visible. Every payment
                                    is tied to a verified outcome. When the infrastructure
                                    handles trust, collaboration becomes the default instead
                                    of the exception.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#0d1220] text-[#c8ccd4] py-16 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-pullquote max-w-4xl mx-auto border border-[#14b8a6]/30 p-8 md:p-12 relative opacity-0">
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#14b8a6]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#14b8a6]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#14b8a6]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#14b8a6]"></div>

                        <div className="font-mono text-[10px] text-[#14b8a6]/40 tracking-widest mb-4">
                            EXCERPT // EDITORIAL NOTE
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-6">
                            &ldquo;Previous split-fee attempts failed because they lacked
                            infrastructure. When platforms handle trust, collaboration
                            becomes the default.&rdquo;
                        </p>
                        <div className="h-px bg-[#14b8a6]/20 mb-4"></div>
                        <span className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider">
                            SOURCE: EMPLOYMENT NETWORKS EDITORIAL
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS - Module Grid
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-benefits-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="bp-benefits-heading mb-16 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // BENEFIT MODULES
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                Everyone{" "}
                                <span className="text-[#3b5ccc]">Benefits</span>
                            </h2>
                            <p className="text-[#c8ccd4]/50 max-w-xl">
                                Four interconnected advantages. Each validated,
                                independently measurable, collectively transformative.
                            </p>
                        </div>

                        <div className="bp-benefits-grid grid md:grid-cols-2 gap-px bg-[#3b5ccc]/10">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.id}
                                    className="bp-benefit-card bg-[#0a0e17] p-8 relative group opacity-0"
                                >
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">
                                        {benefit.id}
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 border border-[#3b5ccc]/30 flex items-center justify-center">
                                                <i className={`${benefit.icon} text-lg text-[#3b5ccc]`}></i>
                                            </div>
                                            <h3 className="font-bold text-white text-lg">
                                                {benefit.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[#c8ccd4]/50 mb-6 leading-relaxed">
                                        {benefit.description}
                                    </p>

                                    <div className="space-y-2">
                                        {benefit.specs.map((spec) => (
                                            <div
                                                key={spec}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <span className="font-mono text-[#3b5ccc]/60 text-xs">
                                                    --
                                                </span>
                                                <span className="text-[#c8ccd4]/70">
                                                    {spec}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden" style={{ minHeight: "350px" }}>
                <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80"
                    alt="Modern workspace with technology"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: "350px" }}
                />
                <div className="absolute inset-0 bg-[#0a0e17]/85"></div>
                <div className="absolute inset-0 bp-grid-bg opacity-[0.06]"></div>
                <div className="absolute inset-4 md:inset-8 border border-[#3b5ccc]/30 pointer-events-none">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#3b5ccc]"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#3b5ccc]"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#3b5ccc]"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#3b5ccc]"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center py-20 px-8">
                    <div className="bp-image-caption-2 text-center max-w-3xl opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                            // OBSERVATION
                        </div>
                        <p className="text-xl md:text-3xl font-bold text-white leading-tight">
                            The platforms that win will be the ones that make{" "}
                            <span className="text-[#14b8a6]">transparency</span>{" "}
                            feel effortless.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARTICLE BODY - Looking Ahead
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-future-section bg-[#0d1220] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="bp-future-content opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-6">
                                // SECTION 03: PROJECTIONS
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                                What&apos;s{" "}
                                <span className="text-[#3b5ccc]">Next</span>
                            </h2>

                            <div className="space-y-6 text-base leading-relaxed text-[#c8ccd4]/60">
                                <p>
                                    The split-fee model is still early. Most of the
                                    recruiting industry hasn&apos;t adopted collaborative
                                    platforms yet. But the trajectory is clear. The firms and
                                    independent recruiters who embrace open collaboration now
                                    are building the networks that will dominate the next
                                    decade.
                                </p>

                                <p>
                                    AI will accelerate this shift. When platforms can
                                    automatically match the right recruiter to the right role
                                    based on track record, specialization, and network -- the
                                    friction that once made split-fee deals impractical
                                    disappears entirely. Matching becomes instant. Trust
                                    becomes data-driven.
                                </p>

                                <p>
                                    For candidates, this means better representation. When
                                    multiple specialized recruiters can advocate for a
                                    candidate rather than a single generalist, the quality of
                                    opportunities and communication improves dramatically.
                                    The data already shows an 89% increase in candidate
                                    satisfaction on collaborative platforms.
                                </p>

                                <p>
                                    The future of recruiting isn&apos;t solo. It&apos;s
                                    networked. It&apos;s transparent. And it&apos;s already
                                    here.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 3 - Final
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#0a0e17] text-[#c8ccd4] py-16 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-pullquote max-w-4xl mx-auto border border-[#3b5ccc]/30 p-8 md:p-12 relative opacity-0">
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#3b5ccc]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#3b5ccc]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#3b5ccc]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#3b5ccc]"></div>

                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">
                            EXCERPT // CONCLUSION
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-6">
                            &ldquo;The future of recruiting isn&apos;t solo. It&apos;s
                            networked. It&apos;s transparent. And it&apos;s already
                            here.&rdquo;
                        </p>
                        <div className="h-px bg-[#3b5ccc]/20 mb-4"></div>
                        <span className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-wider">
                            SOURCE: EMPLOYMENT NETWORKS, 2026
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA - System Access
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-cta-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                {/* Blueprint crosshair decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
                    <div className="absolute top-0 left-1/2 w-px h-full bg-[#3b5ccc]/[0.06]"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-[#3b5ccc]/[0.06]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-[#3b5ccc]/[0.06] rotate-45"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-cta-content text-center mb-16 opacity-0 max-w-4xl mx-auto">
                        <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-6">
                            // INITIATE
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Ready To See{" "}
                            <span className="text-[#3b5ccc]">Split-Fee</span>{" "}
                            In Action?
                        </h2>
                        <p className="text-lg text-[#c8ccd4]/50 mb-4 max-w-lg mx-auto">
                            Employment Networks powers the platforms making this
                            future real. Select your access point.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="bp-cta-card border border-[#3b5ccc]/30 bg-[#0a0e17] p-8 text-center opacity-0">
                            <div className="font-mono text-[10px] tracking-[0.3em] text-[#c8ccd4]/30 uppercase mb-6">
                                RECRUITER
                            </div>
                            <div className="w-12 h-12 mx-auto mb-4 border border-[#3b5ccc]/40 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-[#3b5ccc]"></i>
                            </div>
                            <h3 className="font-bold text-white mb-2">
                                Recruiter Terminal
                            </h3>
                            <p className="text-xs text-[#c8ccd4]/40 mb-6">
                                Access the split-fee marketplace
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#3b5ccc] text-white font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                            >
                                <span className="text-[#3b5ccc]/60">&gt;</span>
                                JOIN_NETWORK
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="bp-cta-card border border-[#14b8a6]/30 bg-[#0a0e17] p-8 text-center opacity-0">
                            <div className="font-mono text-[10px] tracking-[0.3em] text-[#c8ccd4]/30 uppercase mb-6">
                                COMPANY
                            </div>
                            <div className="w-12 h-12 mx-auto mb-4 border border-[#14b8a6]/40 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-xl text-[#14b8a6]"></i>
                            </div>
                            <h3 className="font-bold text-white mb-2">
                                Company Console
                            </h3>
                            <p className="text-xs text-[#c8ccd4]/40 mb-6">
                                Post roles, find vetted talent
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-transparent text-[#14b8a6] font-mono text-xs tracking-wider hover:bg-[#14b8a6]/10 transition-colors border border-[#14b8a6]/40"
                            >
                                <span className="text-[#14b8a6]/60">&gt;</span>
                                POST_ROLE
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="bp-cta-card border border-[#a78bfa]/30 bg-[#0a0e17] p-8 text-center opacity-0">
                            <div className="font-mono text-[10px] tracking-[0.3em] text-[#c8ccd4]/30 uppercase mb-6">
                                CANDIDATE
                            </div>
                            <div className="w-12 h-12 mx-auto mb-4 border border-[#a78bfa]/40 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user text-xl text-[#a78bfa]"></i>
                            </div>
                            <h3 className="font-bold text-white mb-2">
                                Candidate Portal
                            </h3>
                            <p className="text-xs text-[#c8ccd4]/40 mb-6">
                                Free profile, real recruiters
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-transparent text-[#a78bfa] font-mono text-xs tracking-wider hover:bg-[#a78bfa]/10 transition-colors border border-[#a78bfa]/40"
                            >
                                <span className="text-[#a78bfa]/60">&gt;</span>
                                CREATE_PROFILE
                            </a>
                        </div>
                    </div>

                    <div className="bp-cta-footer text-center opacity-0">
                        <div className="h-px bg-[#3b5ccc]/10 mb-6 max-w-xs mx-auto"></div>
                        <p className="text-sm text-[#c8ccd4]/30 mb-2 font-mono text-xs">
                            Want to learn more? Read our other articles or get in touch.
                        </p>
                        <a
                            href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[#3b5ccc] hover:text-white transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-envelope text-[10px]"></i>
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </ArticleSevenAnimator>
    );
}
