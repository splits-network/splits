import type { Metadata } from "next";
import { LandingFiveAnimator } from "./landing-five-animator";

export const metadata: Metadata = {
    title: "Data Observatory - See the Recruiting Ecosystem | Employment Networks",
    description:
        "Mission control for modern recruiting. See real-time data flows across recruiters, companies, and candidates in one connected observatory.",
};

// -- Stat counters for the observatory dashboard
const observatoryStats = [
    {
        value: 10847,
        suffix: "",
        label: "ACTIVE SIGNALS",
        icon: "fa-duotone fa-regular fa-signal-stream",
    },
    {
        value: 2431,
        suffix: "",
        label: "NETWORK NODES",
        icon: "fa-duotone fa-regular fa-circle-nodes",
    },
    {
        value: 98.7,
        suffix: "%",
        label: "UPTIME",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        value: 847,
        suffix: "",
        label: "LIVE PIPELINES",
        icon: "fa-duotone fa-regular fa-diagram-project",
    },
];

// -- Data feeds for the horizontal scroll-snap section
const dataFeeds = [
    {
        id: "recruiter-feed",
        title: "Recruiter Activity",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "text-info",
        borderColor: "border-info/30",
        bgColor: "bg-info/10",
        entries: [
            { label: "Submissions Today", value: "342", trend: "+12%" },
            { label: "Active Searches", value: "1,205", trend: "+8%" },
            { label: "Interviews Scheduled", value: "89", trend: "+23%" },
            { label: "Offers Extended", value: "34", trend: "+5%" },
        ],
    },
    {
        id: "company-feed",
        title: "Company Demand",
        icon: "fa-duotone fa-regular fa-building",
        color: "text-warning",
        borderColor: "border-warning/30",
        bgColor: "bg-warning/10",
        entries: [
            { label: "Open Roles", value: "2,847", trend: "+15%" },
            { label: "Avg. Time to Fill", value: "18d", trend: "-3d" },
            { label: "Response Rate", value: "94%", trend: "+2%" },
            { label: "New This Week", value: "156", trend: "+22%" },
        ],
    },
    {
        id: "candidate-feed",
        title: "Candidate Flow",
        icon: "fa-duotone fa-regular fa-users",
        color: "text-success",
        borderColor: "border-success/30",
        bgColor: "bg-success/10",
        entries: [
            { label: "Applications", value: "5,621", trend: "+18%" },
            { label: "Profile Views", value: "12,340", trend: "+31%" },
            { label: "Matches Made", value: "782", trend: "+14%" },
            { label: "Placements", value: "147", trend: "+9%" },
        ],
    },
    {
        id: "network-feed",
        title: "Network Health",
        icon: "fa-duotone fa-regular fa-heart-pulse",
        color: "text-error",
        borderColor: "border-error/30",
        bgColor: "bg-error/10",
        entries: [
            { label: "API Latency", value: "42ms", trend: "-8ms" },
            { label: "Events/sec", value: "1,247", trend: "+200" },
            { label: "Queue Depth", value: "12", trend: "-5" },
            { label: "Nodes Online", value: "24/24", trend: "100%" },
        ],
    },
];

// -- Orbital nodes for the constellation diagram
const constellationNodes = [
    {
        label: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "text-info",
        bg: "bg-info/20",
        border: "border-info/40",
        description: "Source candidates, manage pipelines, earn splits",
    },
    {
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        color: "text-warning",
        bg: "bg-warning/20",
        border: "border-warning/40",
        description: "Post roles, review talent, make hires",
    },
    {
        label: "Candidates",
        icon: "fa-duotone fa-regular fa-user",
        color: "text-success",
        bg: "bg-success/20",
        border: "border-success/40",
        description: "Apply, get matched, track progress",
    },
    {
        label: "AI Engine",
        icon: "fa-duotone fa-regular fa-microchip-ai",
        color: "text-accent",
        bg: "bg-accent/20",
        border: "border-yellow/40",
        description: "Smart matching, fraud detection, insights",
    },
];

// -- Observatory modules for the mission control grid
const observatoryModules = [
    {
        title: "Pipeline Tracker",
        icon: "fa-duotone fa-regular fa-chart-waterfall",
        description:
            "Real-time visualization of every candidate moving through every stage across all active roles.",
        stat: "2,847 active pipelines",
        color: "text-info",
        borderColor: "border-info/20",
    },
    {
        title: "Network Graph",
        icon: "fa-duotone fa-regular fa-diagram-project",
        description:
            "See how recruiters, companies, and candidates connect. Every relationship mapped in real time.",
        stat: "10,847 connections",
        color: "text-warning",
        borderColor: "border-warning/20",
    },
    {
        title: "Signal Intelligence",
        icon: "fa-duotone fa-regular fa-radar",
        description:
            "Market trends, salary benchmarks, and demand signals aggregated from across the entire network.",
        stat: "Updated every 30s",
        color: "text-success",
        borderColor: "border-success/20",
    },
    {
        title: "Anomaly Detection",
        icon: "fa-duotone fa-regular fa-sensor-triangle-exclamation",
        description:
            "AI-powered monitoring catches duplicate submissions, ghost applications, and suspicious patterns.",
        stat: "99.2% accuracy",
        color: "text-error",
        borderColor: "border-error/20",
    },
    {
        title: "Placement Telemetry",
        icon: "fa-duotone fa-regular fa-satellite-dish",
        description:
            "Track every placement from first contact to start date. Full lifecycle visibility for all parties.",
        stat: "147 this month",
        color: "text-accent",
        borderColor: "border-yellow/20",
    },
    {
        title: "Revenue Stream",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        description:
            "Split-fee calculations, payout schedules, and earnings projections updated in real time.",
        stat: "$2.4M processed",
        color: "text-info",
        borderColor: "border-info/20",
    },
];

// -- The "big picture" insights
const insights = [
    {
        metric: "3.2x",
        label: "Faster Placements",
        description: "Compared to traditional agency models",
        icon: "fa-duotone fa-regular fa-gauge-max",
    },
    {
        metric: "47%",
        label: "Cost Reduction",
        description: "Lower cost-per-hire through network effects",
        icon: "fa-duotone fa-regular fa-piggy-bank",
    },
    {
        metric: "94%",
        label: "Response Rate",
        description: "Candidates hear back within 48 hours",
        icon: "fa-duotone fa-regular fa-comments",
    },
    {
        metric: "12min",
        label: "Avg. Match Time",
        description: "From role posted to first qualified candidate",
        icon: "fa-duotone fa-regular fa-bolt",
    },
];

export default function LandingFivePage() {
    return (
        <LandingFiveAnimator>
            {/* ================================================================
                HERO - Mission Control Bootup
               ================================================================ */}
            <section className="observatory-hero min-h-screen bg-[#09090b] text-[#e5e7eb] relative overflow-hidden flex items-center">
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
                    <div className="max-w-5xl mx-auto">
                        {/* System status bar */}
                        <div className="hero-status flex items-center gap-3 mb-8 opacity-0">
                            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">
                                System Online
                            </span>
                            <span className="font-mono text-xs text-[#e5e7eb]/30 ml-auto">
                                v2.4.1 // data-observatory
                            </span>
                        </div>

                        {/* Main headline */}
                        <h1 className="hero-headline text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 opacity-0">
                            <span className="block text-[#e5e7eb]">
                                See the
                            </span>
                            <span className="block text-info">Big Picture</span>
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl text-[#e5e7eb]/60 mb-12 max-w-3xl leading-relaxed font-light opacity-0">
                            A recruiting ecosystem observatory. Real-time data
                            flows between recruiters, companies, and candidates
                            -- all visible from one mission control.
                        </p>

                        {/* Live stat counters */}
                        <div className="hero-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            {observatoryStats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="stat-card border border-[#27272a] bg-[#18181b]/80 rounded-lg p-4 opacity-0"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <i
                                            className={`${stat.icon} text-info text-sm`}
                                        />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40">
                                            {stat.label}
                                        </span>
                                    </div>
                                    <div
                                        className="stat-value font-mono text-2xl md:text-3xl font-bold text-[#e5e7eb]"
                                        data-value={stat.value}
                                        data-suffix={stat.suffix}
                                    >
                                        0{stat.suffix}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="hero-cta flex flex-col sm:flex-row gap-4 opacity-0">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-info btn-lg font-mono uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-satellite-dish" />
                                Enter the Observatory
                            </a>
                            <a
                                href="#data-feeds"
                                className="btn btn-outline border-[#27272a] text-[#e5e7eb]/70 btn-lg font-mono uppercase tracking-wider hover:bg-[#18181b] hover:border-info/50 hover:text-info"
                            >
                                <i className="fa-duotone fa-regular fa-chevron-down" />
                                Explore Data Feeds
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                DATA FEEDS - Horizontal Scroll-Snap
               ================================================================ */}
            <section
                id="data-feeds"
                className="feeds-section bg-[#09090b] text-[#e5e7eb] py-24 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="feeds-heading mb-12 opacity-0">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/60 block mb-3">
                            Live Telemetry
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Data Feeds
                        </h2>
                        <p className="text-lg text-[#e5e7eb]/50 max-w-2xl">
                            Scroll through real-time activity streams from every
                            corner of the network.
                        </p>
                    </div>
                </div>

                {/* Horizontal scroll container */}
                <div className="feeds-scroll-container overflow-x-auto pb-6 px-4 md:px-8">
                    <div className="feeds-track flex gap-6 w-max snap-x snap-mandatory">
                        {dataFeeds.map((feed) => (
                            <div
                                key={feed.id}
                                className={`feed-card snap-start w-[340px] md:w-[400px] border ${feed.borderColor} bg-[#18181b]/60 rounded-xl p-6 flex-shrink-0 opacity-0`}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className={`w-10 h-10 rounded-lg ${feed.bgColor} flex items-center justify-center`}
                                    >
                                        <i
                                            className={`${feed.icon} ${feed.color}`}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">
                                            {feed.title}
                                        </h3>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/30">
                                            streaming
                                        </span>
                                    </div>
                                    <span
                                        className={`ml-auto w-2 h-2 rounded-full ${feed.color.replace("text-", "bg-")} animate-pulse`}
                                    />
                                </div>

                                <div className="space-y-4">
                                    {feed.entries.map((entry, j) => (
                                        <div
                                            key={j}
                                            className="flex items-center justify-between border-b border-[#27272a]/50 pb-3 last:border-0 last:pb-0"
                                        >
                                            <span className="text-sm text-[#e5e7eb]/60">
                                                {entry.label}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-sm">
                                                    {entry.value}
                                                </span>
                                                <span className="font-mono text-xs text-success/80">
                                                    {entry.trend}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================
                CONSTELLATION - Orbital Network Diagram
               ================================================================ */}
            <section className="constellation-section bg-[#0a0a0c] text-[#e5e7eb] py-24 overflow-hidden relative">
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
                    <div className="constellation-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-warning/60 block mb-3">
                            Network Topology
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            The Constellation
                        </h2>
                        <p className="text-lg text-[#e5e7eb]/50 max-w-2xl mx-auto">
                            Four interconnected nodes forming one recruiting
                            ecosystem. Every action ripples across the network.
                        </p>
                    </div>

                    {/* Constellation diagram */}
                    <div className="constellation-grid grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {constellationNodes.map((node, i) => (
                            <div
                                key={i}
                                className={`constellation-node border ${node.border} bg-[#18181b]/40 rounded-xl p-6 opacity-0`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-14 h-14 rounded-xl ${node.bg} flex items-center justify-center flex-shrink-0`}
                                    >
                                        <i
                                            className={`${node.icon} text-xl ${node.color}`}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">
                                            {node.label}
                                        </h3>
                                        <p className="text-sm text-[#e5e7eb]/50">
                                            {node.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Connection indicator */}
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-[#27272a]" />
                                    <span className="font-mono text-[10px] text-[#e5e7eb]/20 uppercase tracking-wider">
                                        connected
                                    </span>
                                    <div className="h-px flex-1 bg-[#27272a]" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Central hub indicator */}
                    <div className="constellation-hub flex items-center justify-center mt-12 opacity-0">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-2 border-info/30 flex items-center justify-center bg-[#18181b]">
                                <i className="fa-duotone fa-regular fa-arrows-to-circle text-2xl text-info" />
                            </div>
                            <div className="absolute -inset-3 rounded-full border border-info/10 animate-ping" />
                        </div>
                        <div className="ml-6">
                            <div className="font-bold text-lg">
                                Employment Networks Hub
                            </div>
                            <div className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                Orchestrating all data flows
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                MISSION CONTROL - Observatory Modules Grid
               ================================================================ */}
            <section className="modules-section bg-[#09090b] text-[#e5e7eb] py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="modules-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/60 block mb-3">
                            Mission Control
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Observatory Modules
                        </h2>
                        <p className="text-lg text-[#e5e7eb]/50 max-w-2xl mx-auto">
                            Every dimension of the recruiting ecosystem,
                            monitored and visualized in real time.
                        </p>
                    </div>

                    <div className="modules-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {observatoryModules.map((mod, i) => (
                            <div
                                key={i}
                                className={`module-card border ${mod.borderColor} bg-[#18181b]/40 rounded-xl p-6 opacity-0`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <i
                                        className={`${mod.icon} text-xl ${mod.color}`}
                                    />
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
            </section>

            {/* ================================================================
                BIRDS-EYE INSIGHTS - The Big Picture Numbers
               ================================================================ */}
            <section className="insights-section bg-[#0a0a0c] text-[#e5e7eb] py-24 overflow-hidden relative">
                {/* Background image - network/aerial */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
                        alt=""
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-[#0a0a0c]/80" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="insights-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent/60 block mb-3">
                            Birds-Eye View
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            The Big Picture
                        </h2>
                        <p className="text-lg text-[#e5e7eb]/50 max-w-2xl mx-auto">
                            When you see the whole ecosystem at once, the impact
                            becomes clear.
                        </p>
                    </div>

                    <div className="insights-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {insights.map((insight, i) => (
                            <div
                                key={i}
                                className="insight-card border border-[#27272a] bg-[#18181b]/60 rounded-xl p-6 text-center opacity-0"
                            >
                                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <i
                                        className={`${insight.icon} text-xl text-accent`}
                                    />
                                </div>
                                <div className="font-mono text-3xl md:text-4xl font-bold text-accent mb-2">
                                    {insight.metric}
                                </div>
                                <div className="font-bold text-sm mb-1">
                                    {insight.label}
                                </div>
                                <div className="text-xs text-[#e5e7eb]/40">
                                    {insight.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================
                PLATFORMS - How to Access
               ================================================================ */}
            <section className="platforms-section bg-[#09090b] text-[#e5e7eb] py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="platforms-heading text-center mb-16 opacity-0">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/60 block mb-3">
                            Access Points
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Your Entry to the Network
                        </h2>
                        <p className="text-lg text-[#e5e7eb]/50 max-w-2xl mx-auto">
                            Two platforms, one connected ecosystem. Choose your
                            vantage point.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Splits Network */}
                        <div className="platform-panel border border-info/20 bg-[#18181b]/40 rounded-xl p-8 opacity-0">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src="/splits.png"
                                    alt="Splits Network"
                                    className="h-10"
                                />
                                <div>
                                    <div className="font-bold text-lg">
                                        Splits Network
                                    </div>
                                    <div className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                        Recruiters &amp; Companies
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Split-fee marketplace",
                                    "Built-in ATS with pipeline views",
                                    "Real-time analytics dashboard",
                                    "AI-powered matching",
                                ].map((item, j) => (
                                    <li
                                        key={j}
                                        className="platform-feature flex items-center gap-3 text-sm text-[#e5e7eb]/70 opacity-0"
                                    >
                                        <i className="fa-duotone fa-regular fa-terminal text-info text-xs" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-info w-full font-mono uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Launch Splits
                            </a>
                        </div>

                        {/* Applicant Network */}
                        <div className="platform-panel border border-success/20 bg-[#18181b]/40 rounded-xl p-8 opacity-0">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src="/applicant.png"
                                    alt="Applicant Network"
                                    className="h-10"
                                />
                                <div>
                                    <div className="font-bold text-lg">
                                        Applicant Network
                                    </div>
                                    <div className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">
                                        Job Seekers
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "One-click applications",
                                    "Recruiter matching system",
                                    "Real-time status tracking",
                                    "100% free forever",
                                ].map((item, j) => (
                                    <li
                                        key={j}
                                        className="platform-feature flex items-center gap-3 text-sm text-[#e5e7eb]/70 opacity-0"
                                    >
                                        <i className="fa-duotone fa-regular fa-terminal text-success text-xs" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-success w-full font-mono uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus" />
                                Launch Applicant
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================
                CTA - Final Observatory Call
               ================================================================ */}
            <section className="cta-section bg-[#09090b] text-[#e5e7eb] py-24 overflow-hidden relative">
                {/* Subtle top border accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-info/20" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content max-w-3xl mx-auto text-center opacity-0">
                        <div className="inline-flex items-center gap-2 border border-[#27272a] rounded-full px-4 py-2 mb-8">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">
                                All systems operational
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to see the
                            <br />
                            <span className="text-info">full picture?</span>
                        </h2>

                        <p className="text-lg text-[#e5e7eb]/50 mb-10 max-w-xl mx-auto">
                            Join the recruiting ecosystem that gives you
                            visibility, transparency, and data-driven
                            confidence.
                        </p>

                        <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-info btn-lg font-mono uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie" />
                                I&apos;m a Recruiter
                            </a>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-success btn-lg font-mono uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-user" />
                                I&apos;m a Candidate
                            </a>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-outline border-[#27272a] text-[#e5e7eb]/60 btn-lg font-mono uppercase tracking-wider hover:bg-[#18181b] hover:border-warning/50 hover:text-warning"
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                I&apos;m Hiring
                            </a>
                        </div>

                        <div className="cta-footer mt-12 opacity-0">
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
                </div>
            </section>
        </LandingFiveAnimator>
    );
}
