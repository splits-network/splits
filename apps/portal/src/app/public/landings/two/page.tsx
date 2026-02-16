import Link from "next/link";
import type { Metadata } from "next";
import { portalFaqs } from "@/components/landing/sections/faq-data";

// ── Metadata ────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: "The Recruiting Observatory | Splits Network",
    description:
        "Mission control for split-fee recruiting. Real-time pipeline visibility, automated fee distribution, and full-spectrum network intelligence. See everything. Miss nothing.",
    openGraph: {
        title: "SEE EVERYTHING. MISS NOTHING.",
        description:
            "The split-fee recruiting command center: 2,847 active recruiters, 1,200+ open roles, and every placement tracked in real time.",
        url: "https://splits.network/landings/two",
    },
};

// ── Data ────────────────────────────────────────────────────────────────────────

const ACCENT = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
} as const;

const systemStatus = [
    {
        label: "ACTIVE RECRUITERS",
        value: "2,847",
        delta: "+127 this month",
        icon: "fa-duotone fa-regular fa-user-tie",
        accent: "teal" as const,
    },
    {
        label: "OPEN ROLES",
        value: "1,243",
        delta: "across 38 industries",
        icon: "fa-duotone fa-regular fa-briefcase",
        accent: "coral" as const,
    },
    {
        label: "PLACEMENTS THIS QUARTER",
        value: "412",
        delta: "94% within 45 days",
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        accent: "yellow" as const,
    },
    {
        label: "FEE VOLUME PROCESSED",
        value: "$8.7M",
        delta: "avg $21.1K per placement",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        accent: "purple" as const,
    },
];

const operationsPanels = [
    {
        metric: "100%",
        title: "FEE TRANSPARENCY",
        description:
            "Every dollar is visible before, during, and after the placement closes. Both parties see the same numbers. Always.",
        icon: "fa-duotone fa-regular fa-eye",
        accent: "coral" as const,
        statusLabel: "ENFORCED",
    },
    {
        metric: "2.4x",
        title: "PIPELINE VELOCITY",
        description:
            "Shared pipelines and parallel sourcing compress placement timelines. Multiple recruiters working a role means the right candidate surfaces faster.",
        icon: "fa-duotone fa-regular fa-gauge-max",
        accent: "teal" as const,
        statusLabel: "MEASURED",
    },
    {
        metric: "< 72h",
        title: "PAYMENT CLEARANCE",
        description:
            "Placement closes. Fee is calculated. Payment is distributed. No chasing invoices. No 52-day payment cycles. Automated.",
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        accent: "yellow" as const,
        statusLabel: "AUTOMATED",
    },
    {
        metric: "0",
        title: "HIDDEN CLAWBACKS",
        description:
            "Guarantee terms are locked at submission. If the terms say 90 days, they mean 90 days. No retroactive deductions. No surprises.",
        icon: "fa-duotone fa-regular fa-shield-check",
        accent: "purple" as const,
        statusLabel: "LOCKED",
    },
    {
        metric: "38",
        title: "INDUSTRY VERTICALS",
        description:
            "Tech, healthcare, finance, manufacturing, legal, executive -- the network spans every major vertical. Your specialty has a marketplace.",
        icon: "fa-duotone fa-regular fa-sitemap",
        accent: "coral" as const,
        statusLabel: "INDEXED",
    },
    {
        metric: "1",
        title: "UNIFIED PLATFORM",
        description:
            "Roles, candidates, pipelines, payments, communication, analytics. One login. One dashboard. One source of truth for every active split.",
        icon: "fa-duotone fa-regular fa-grid-2",
        accent: "teal" as const,
        statusLabel: "OPERATIONAL",
    },
];

const signalComparison = {
    withSplits: [
        {
            signal: "Which recruiters are actively sourcing your role",
            icon: "fa-duotone fa-regular fa-signal-stream",
        },
        {
            signal: "Exactly how many candidates are in each pipeline stage",
            icon: "fa-duotone fa-regular fa-chart-gantt",
        },
        {
            signal: "Your precise payout before you submit a single resume",
            icon: "fa-duotone fa-regular fa-calculator",
        },
        {
            signal: "Real-time status of every placement from submission to start date",
            icon: "fa-duotone fa-regular fa-timeline",
        },
        {
            signal: "Automated payment distribution with complete audit trail",
            icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        },
        {
            signal: "Timestamped candidate ownership with zero ambiguity",
            icon: "fa-duotone fa-regular fa-stamp",
        },
    ],
    withoutSplits: [
        {
            signal: "Whether anyone is actually working the role you sent out",
            icon: "fa-duotone fa-regular fa-question",
        },
        {
            signal: "Where your candidates stand after submission",
            icon: "fa-duotone fa-regular fa-ghost",
        },
        {
            signal: "What your actual payout will be when the check arrives",
            icon: "fa-duotone fa-regular fa-dice",
        },
        {
            signal: "If the placement closed or if everyone just went silent",
            icon: "fa-duotone fa-regular fa-volume-slash",
        },
        {
            signal: "When -- or if -- the invoice will be paid",
            icon: "fa-duotone fa-regular fa-hourglass-clock",
        },
        {
            signal: "Who actually submitted the candidate first",
            icon: "fa-duotone fa-regular fa-handshake-slash",
        },
    ],
};

const deploymentPhases = [
    {
        phase: "01",
        codename: "INITIALIZE",
        title: "Create Your Profile",
        description:
            "Set up your account, define your recruiting specialties, and configure your split preferences. The platform calibrates to your expertise from day one.",
        duration: "5 minutes",
        icon: "fa-duotone fa-regular fa-terminal",
        accent: "coral" as const,
    },
    {
        phase: "02",
        codename: "CONNECT",
        title: "Enter the Marketplace",
        description:
            "Browse open roles matched to your verticals. Review fee structures, split terms, and company profiles before committing to anything.",
        duration: "Immediate access",
        icon: "fa-duotone fa-regular fa-satellite-dish",
        accent: "teal" as const,
    },
    {
        phase: "03",
        codename: "EXECUTE",
        title: "Submit and Track",
        description:
            "Submit candidates to roles with pre-agreed terms. Track every stage of the pipeline in real time. No black holes. No email chains.",
        duration: "First submission in hours",
        icon: "fa-duotone fa-regular fa-rocket-launch",
        accent: "yellow" as const,
    },
    {
        phase: "04",
        codename: "COLLECT",
        title: "Placement Closes. Payment Flows.",
        description:
            "The candidate starts. The fee is calculated automatically. Your share hits your account. Every dollar tracked. Every transaction visible.",
        duration: "Automated payout",
        icon: "fa-duotone fa-regular fa-vault",
        accent: "purple" as const,
    },
];

const ecosystemNodes = [
    {
        role: "COMPANIES",
        tagline: "Post roles. Set terms. Watch the network fill them.",
        stats: [
            { label: "Avg. recruiters per role", value: "8" },
            { label: "Avg. candidates per role", value: "14" },
            { label: "Cost to post", value: "$0" },
        ],
        icon: "fa-duotone fa-regular fa-building",
        accent: "coral" as const,
        cta: "Post a Role",
        href: "/join",
    },
    {
        role: "PLATFORM",
        tagline: "The infrastructure layer. Tracking. Payments. Truth.",
        stats: [
            { label: "Pipeline stages tracked", value: "12" },
            { label: "Fee calculations", value: "Auto" },
            { label: "Payment distribution", value: "Auto" },
        ],
        icon: "fa-duotone fa-regular fa-diagram-project",
        accent: "yellow" as const,
        cta: "See How It Works",
        href: "#operations",
    },
    {
        role: "RECRUITERS",
        tagline: "Browse. Source. Submit. Collect. Repeat.",
        stats: [
            { label: "Avg. payout per placement", value: "$21.1K" },
            { label: "Active roles available", value: "1,243" },
            { label: "Split locked before submit", value: "Always" },
        ],
        icon: "fa-duotone fa-regular fa-user-tie",
        accent: "teal" as const,
        cta: "Join the Network",
        href: "/join",
    },
];

// ── Page ────────────────────────────────────────────────────────────────────────

export default function LandingTwoPage() {
    return (
        <main>
            {/* ═══════════════════════════════════════════════════════════════════
                1. HERO — COMMAND CENTER BOOTUP
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Large hollow circle — top left */}
                    <div className="absolute top-[6%] left-[3%] w-40 h-40 rounded-full border-4 border-teal opacity-20" />
                    {/* Solid coral square — top right */}
                    <div className="absolute top-[10%] right-[8%] w-20 h-20 rotate-12 bg-coral opacity-15" />
                    {/* Small yellow dot — left center */}
                    <div className="absolute top-[45%] left-[6%] w-10 h-10 rounded-full bg-yellow opacity-20" />
                    {/* Purple rectangle — bottom right */}
                    <div className="absolute bottom-[15%] right-[5%] w-32 h-8 -rotate-6 bg-purple opacity-15" />
                    {/* Hollow coral diamond — center left */}
                    <div className="absolute top-[65%] left-[15%] w-16 h-16 rotate-45 border-4 border-coral opacity-15" />
                    {/* Dot grid — top center-right */}
                    <div className="absolute top-[8%] right-[30%] opacity-15">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-teal"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag — bottom left */}
                    <svg
                        className="absolute bottom-[10%] left-[25%] opacity-15"
                        width="120"
                        height="30"
                        viewBox="0 0 120 30"
                    >
                        <polyline
                            points="0,25 15,5 30,25 45,5 60,25 75,5 90,25 105,5 120,25"
                            fill="none"
                            className="stroke-yellow"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Plus sign — right center */}
                    <svg
                        className="absolute top-[55%] right-[20%] opacity-15"
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                    >
                        <line
                            x1="18" y1="4" x2="18" y2="32"
                            className="stroke-purple"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <line
                            x1="4" y1="18" x2="32" y2="18"
                            className="stroke-purple"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* System status indicator */}
                        <div className="inline-flex items-center gap-3 mb-10">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal" />
                            </span>
                            <span className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-teal">
                                NETWORK OPERATIONAL
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] mb-8 text-white uppercase tracking-tight">
                            See Everything.
                            <br />
                            <span className="text-teal">Miss Nothing.</span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/70">
                            Split-fee recruiting has operated in the dark for decades.
                            Candidates vanish. Payments drift. Pipelines go silent.
                            Splits Network is the command center that makes every
                            placement visible, every dollar trackable, and every
                            recruiter accountable.
                        </p>

                        {/* Terminal-style system readout */}
                        <div className="max-w-2xl mx-auto mb-12 border-4 border-white/10 bg-white/5 p-6 text-left font-mono">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b-4 border-white/5">
                                <div className="w-3 h-3 rounded-full bg-coral" />
                                <div className="w-3 h-3 rounded-full bg-yellow" />
                                <div className="w-3 h-3 rounded-full bg-teal" />
                                <span className="ml-3 text-xs text-white/30 tracking-wider">
                                    splits.network/observatory
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-white/40">
                                    <span className="text-teal">$</span> network.status
                                </p>
                                <p className="text-white/70">
                                    <span className="text-teal">&gt;</span> Active recruiters: <span className="text-teal font-bold">2,847</span>
                                </p>
                                <p className="text-white/70">
                                    <span className="text-coral">&gt;</span> Open roles: <span className="text-coral font-bold">1,243</span>
                                </p>
                                <p className="text-white/70">
                                    <span className="text-yellow">&gt;</span> Placements this quarter: <span className="text-yellow font-bold">412</span>
                                </p>
                                <p className="text-white/70">
                                    <span className="text-purple">&gt;</span> Fee volume processed: <span className="text-purple font-bold">$8.7M</span>
                                </p>
                                <p className="text-white/40 mt-3">
                                    <span className="text-teal">$</span> network.join --role=recruiter
                                </p>
                                <p className="text-teal">
                                    &gt; Signal received. Deploying access...
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/join"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-satellite-dish" />
                                Join the Network
                            </Link>
                            <Link
                                href="/join"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                Post a Role
                            </Link>
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

            {/* ═══════════════════════════════════════════════════════════════════
                2. LIVE STATUS BAR — NETWORK TELEMETRY
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-4">
                            <i className="fa-duotone fa-regular fa-wave-pulse" />
                            Live Network Telemetry
                        </span>
                        <p className="text-base text-dark/60 font-mono">
                            Real-time indicators. Not marketing estimates.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {systemStatus.map((stat, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-dark bg-white p-6"
                            >
                                {/* Color bar top */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[stat.accent].bg}`}
                                />
                                {/* Live indicator dot */}
                                <div className="absolute top-4 right-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ACCENT[stat.accent].bg} opacity-75`} />
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${ACCENT[stat.accent].bg}`} />
                                    </span>
                                </div>
                                <div className={`w-12 h-12 ${ACCENT[stat.accent].bg} border-4 border-dark flex items-center justify-center mb-4`}>
                                    <i className={`${stat.icon} ${stat.accent === "teal" || stat.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>
                                <div className="text-xs font-mono font-bold uppercase tracking-wider text-dark/40 mb-1">
                                    {stat.label}
                                </div>
                                <div className={`text-4xl font-black font-mono mb-1 ${ACCENT[stat.accent].text}`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm font-bold text-dark/50">
                                    {stat.delta}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                3. PULL QUOTE — THE OBSERVATORY DECLARATION
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="relative inline-block">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-teal" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-coral" />
                            <div className="border-l-4 border-teal px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;The recruiting industry doesn&apos;t have a
                                    talent problem. It has a{" "}
                                    <span className="text-teal">visibility</span>{" "}
                                    problem. Every failed placement traces back to the
                                    same root cause: someone couldn&apos;t see what was
                                    happening.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-4">
                                    -- The Observatory Thesis
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                4. THE NETWORK MAP — THREE-PARTY ECOSYSTEM
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-white py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            Network Topology
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Three Parties.{" "}
                            <span className="text-coral">One Platform.</span>
                            <br />
                            Zero Blind Spots.
                        </h2>
                        <p className="text-lg text-dark/70">
                            Companies bring roles. Recruiters bring candidates. The
                            platform tracks everything between those two points --
                            submissions, interviews, offers, placements, and payments.
                            Everyone sees the same data.
                        </p>
                    </div>

                    {/* Connection flow arrows for desktop */}
                    <div className="hidden lg:flex items-center justify-center gap-0 max-w-6xl mx-auto mb-4">
                        <div className="flex-1" />
                        <svg width="80" height="40" viewBox="0 0 80 40" className="text-dark flex-shrink-0">
                            <path
                                d="M0 20 L60 20 L50 10 M60 20 L50 30"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="flex-1" />
                        <svg width="80" height="40" viewBox="0 0 80 40" className="text-dark flex-shrink-0">
                            <path
                                d="M0 20 L60 20 L50 10 M60 20 L50 30"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="flex-1" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {ecosystemNodes.map((node, index) => (
                            <div
                                key={index}
                                className={`relative border-4 border-dark bg-cream p-8`}
                            >
                                {/* Color bar */}
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[node.accent].bg}`} />
                                {/* Corner accent */}
                                <div className={`absolute top-0 right-0 w-14 h-14 ${ACCENT[node.accent].bg} flex items-center justify-center`}>
                                    <i className={`${node.icon} text-lg ${node.accent === "teal" || node.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>

                                <div className={`text-sm font-mono font-black uppercase tracking-[0.2em] ${ACCENT[node.accent].text} mb-3`}>
                                    {node.role}
                                </div>
                                <p className="text-base text-dark/70 mb-6 leading-relaxed">
                                    {node.tagline}
                                </p>

                                {/* Stats grid */}
                                <div className="space-y-3 mb-6">
                                    {node.stats.map((s, si) => (
                                        <div
                                            key={si}
                                            className="flex items-center justify-between py-2 border-b-4 border-dark/5"
                                        >
                                            <span className="text-sm font-bold text-dark/50 uppercase tracking-wide">
                                                {s.label}
                                            </span>
                                            <span className={`text-lg font-black font-mono ${ACCENT[node.accent].text}`}>
                                                {s.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={node.href}
                                    className={`inline-flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-wider border-4 ${ACCENT[node.accent].border} ${ACCENT[node.accent].bg} ${node.accent === "teal" || node.accent === "yellow" ? "text-dark" : "text-white"} transition-transform hover:-translate-y-1`}
                                >
                                    {node.cta}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Candidate flow callout */}
                    <div className="max-w-4xl mx-auto mt-12 border-4 border-dark bg-dark p-8 text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user text-dark" />
                            </div>
                            <span className="text-lg font-black uppercase tracking-wider text-white">
                                Candidates
                            </span>
                        </div>
                        <p className="text-base text-white/70 mb-4 max-w-2xl mx-auto">
                            Candidates flow through the system represented by the
                            recruiter best positioned to advocate for them. They get
                            matched to roles by professionals who compete on fit -- not
                            on who has the biggest database.
                        </p>
                        <Link
                            href="https://applicant.network"
                            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-yellow hover:text-white transition-colors"
                        >
                            Visit Applicant Network
                            <i className="fa-duotone fa-regular fa-arrow-up-right" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                5. OPERATIONS PANELS — SYSTEM CAPABILITIES
            ═══════════════════════════════════════════════════════════════════ */}
            <section id="operations" className="bg-dark py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            Operations Dashboard
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Six Systems.{" "}
                            <span className="text-teal">All Operational.</span>
                        </h2>
                        <p className="text-lg text-white/60">
                            Each panel represents a core system running inside Splits
                            Network. These are not features on a roadmap. They are
                            infrastructure in production.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {operationsPanels.map((panel, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-white/10 bg-white/5 p-8"
                            >
                                {/* Status label top-right */}
                                <div className="absolute top-0 right-0">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${ACCENT[panel.accent].bg} ${panel.accent === "teal" || panel.accent === "yellow" ? "text-dark" : "text-white"}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-dark/30" />
                                        {panel.statusLabel}
                                    </span>
                                </div>

                                {/* Icon */}
                                <div className={`w-14 h-14 border-4 ${ACCENT[panel.accent].border} flex items-center justify-center mb-5`}>
                                    <i className={`${panel.icon} text-xl ${ACCENT[panel.accent].text}`} />
                                </div>

                                {/* Big metric */}
                                <div className={`text-4xl font-black font-mono mb-2 ${ACCENT[panel.accent].text}`}>
                                    {panel.metric}
                                </div>

                                {/* Title */}
                                <h3 className="font-black text-base uppercase tracking-wider text-white mb-3">
                                    {panel.title}
                                </h3>

                                {/* Description */}
                                <p className="text-base text-white/60 leading-relaxed">
                                    {panel.description}
                                </p>

                                {/* Bottom color line */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${ACCENT[panel.accent].bg}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                6. SIGNAL INTELLIGENCE — VISIBILITY COMPARISON
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                            Signal Intelligence
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            What You <span className="text-teal">See</span> vs.
                            <br />
                            What You&apos;re{" "}
                            <span className="text-coral line-through decoration-4">
                                Blind To
                            </span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            The difference between a successful split and a failed one
                            is information. Here is what the Observatory gives you --
                            and what you lose without it.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* WITH Splits Network */}
                        <div className="border-4 border-dark bg-white p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-teal border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-signal-stream text-dark" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-wider text-dark">
                                        With Splits Network
                                    </h3>
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal">
                                        FULL SIGNAL
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {signalComparison.withSplits.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 py-3 border-b-4 border-dark/5 last:border-b-0"
                                    >
                                        <div className="w-8 h-8 bg-teal/10 border-4 border-teal/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className={`${item.icon} text-xs text-teal`} />
                                        </div>
                                        <span className="text-base text-dark/80 leading-relaxed">
                                            {item.signal}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t-4 border-teal">
                                <p className="font-black text-sm uppercase tracking-wider text-teal font-mono">
                                    SIGNAL STRENGTH: 100%
                                </p>
                            </div>
                        </div>

                        {/* WITHOUT Splits Network */}
                        <div className="border-4 border-dark/20 bg-white p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-coral/20 border-4 border-coral/40 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-signal-slash text-coral" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-wider text-dark/50">
                                        Without It
                                    </h3>
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral">
                                        SIGNAL LOST
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {signalComparison.withoutSplits.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 py-3 border-b-4 border-dark/5 last:border-b-0"
                                    >
                                        <div className="w-8 h-8 bg-coral/5 border-4 border-dark/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className={`${item.icon} text-xs text-dark/30`} />
                                        </div>
                                        <span className="text-base text-dark/40 leading-relaxed">
                                            {item.signal}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t-4 border-coral/30">
                                <p className="font-black text-sm uppercase tracking-wider text-coral/60 font-mono">
                                    SIGNAL STRENGTH: 0%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                7. PULL QUOTE — DATA DECLARATION
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-white py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="relative inline-block">
                            <div className="absolute -top-5 -left-5 w-10 h-10 bg-yellow" />
                            <div className="absolute -bottom-5 -right-5 w-10 h-10 bg-purple" />
                            <div className="border-l-4 border-yellow px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark leading-tight">
                                    &ldquo;Every failed split placement shares the same
                                    autopsy: somebody couldn&apos;t see what was{" "}
                                    <span className="text-coral">happening.</span> The
                                    Observatory was built so that never happens
                                    again.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-dark/40 mt-4">
                                    -- First Principle of Signal Architecture
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                8. DEPLOYMENT SEQUENCE — HOW TO GET STARTED
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-yellow text-dark mb-6">
                            Deployment Sequence
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Four Phases.{" "}
                            <span className="text-yellow">Fully Operational.</span>
                        </h2>
                        <p className="text-lg text-white/60">
                            Getting into the network is not an enterprise sales cycle.
                            It is a deployment sequence. Initialize. Connect. Execute.
                            Collect.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {deploymentPhases.map((phase, index) => (
                                <div
                                    key={index}
                                    className="relative border-4 border-white/10 bg-white/5 p-8"
                                >
                                    {/* Phase number block */}
                                    <div className="flex items-start gap-5">
                                        <div className={`flex-shrink-0 w-16 h-16 ${ACCENT[phase.accent].bg} border-4 border-dark flex flex-col items-center justify-center`}>
                                            <span className={`text-2xl font-black font-mono ${phase.accent === "teal" || phase.accent === "yellow" ? "text-dark" : "text-white"}`}>
                                                {phase.phase}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-xs font-mono font-bold uppercase tracking-[0.2em] ${ACCENT[phase.accent].text}`}>
                                                    {phase.codename}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-wide text-white mb-2">
                                                {phase.title}
                                            </h3>
                                            <p className="text-base text-white/60 leading-relaxed mb-3">
                                                {phase.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <i className={`fa-duotone fa-regular fa-clock text-sm ${ACCENT[phase.accent].text}`} />
                                                <span className="text-sm font-mono font-bold text-white/40">
                                                    {phase.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom accent */}
                                    <div className={`absolute bottom-0 left-0 w-1/3 h-1 ${ACCENT[phase.accent].bg}`} />
                                </div>
                            ))}
                        </div>

                        {/* Convergence CTA */}
                        <div className="mt-12 text-center">
                            <div className="inline-flex flex-col items-center gap-4 px-10 py-8 border-4 border-teal/30 bg-teal/5">
                                <div className="flex items-center gap-3">
                                    {(["coral", "teal", "yellow", "purple"] as const).map((color) => (
                                        <div
                                            key={color}
                                            className={`w-8 h-8 ${ACCENT[color].bg}`}
                                        />
                                    ))}
                                </div>
                                <p className="font-black text-base uppercase tracking-wider text-white">
                                    Total deployment time: under 10 minutes.
                                </p>
                                <p className="text-sm font-mono text-white/40">
                                    No contracts. No demos. No &ldquo;let me check with my manager.&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                9. THE MATH — FOLLOW THE MONEY
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-white py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            Financial Telemetry
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Every Dollar.{" "}
                            <span className="text-coral">Tracked.</span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            No mystery math. No buried clauses. The financial layer of
                            Splits Network is fully transparent. Every party sees the
                            same numbers before the deal starts and after it closes.
                        </p>
                    </div>

                    {/* Flow diagram */}
                    <div className="max-w-5xl mx-auto mb-12">
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                            <div className="border-4 border-dark bg-coral text-white w-full lg:w-64 p-8 text-center">
                                <div className="w-14 h-14 bg-white/20 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-building text-xl" />
                                </div>
                                <h3 className="font-black text-lg uppercase mb-1">Company</h3>
                                <p className="text-base text-white/80 font-mono">Pays $30,000</p>
                                <p className="text-xs text-white/50 mt-1 font-mono">20% of $150K salary</p>
                            </div>
                            <div className="hidden lg:flex items-center justify-center w-16">
                                <svg className="w-full h-8 text-dark" viewBox="0 0 60 32">
                                    <path
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
                                <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-dark" />
                            </div>
                            <div className="border-4 border-dark bg-yellow text-dark w-full lg:w-64 p-8 text-center">
                                <div className="w-14 h-14 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-diagram-project text-xl" />
                                </div>
                                <h3 className="font-black text-lg uppercase mb-1">Platform</h3>
                                <p className="text-base text-dark/80 font-mono">Retains $7,500</p>
                                <p className="text-xs text-dark/50 mt-1 font-mono">25% platform share</p>
                            </div>
                            <div className="hidden lg:flex items-center justify-center w-16">
                                <svg className="w-full h-8 text-dark" viewBox="0 0 60 32">
                                    <path
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
                                <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-dark" />
                            </div>
                            <div className="border-4 border-dark bg-teal text-dark w-full lg:w-64 p-8 text-center">
                                <div className="w-14 h-14 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-user-tie text-xl" />
                                </div>
                                <h3 className="font-black text-lg uppercase mb-1">Recruiter</h3>
                                <p className="text-base text-dark/80 font-mono">Receives $22,500</p>
                                <p className="text-xs text-dark/50 mt-1 font-mono">75% recruiter share</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown card */}
                    <div className="max-w-4xl mx-auto">
                        <div className="border-4 border-dark bg-cream p-8 md:p-10">
                            <h3 className="text-lg font-black text-center mb-8 uppercase tracking-wider text-dark font-mono">
                                PLACEMENT TELEMETRY // REAL NUMBERS
                            </h3>
                            <div className="grid md:grid-cols-4 gap-6 mb-8">
                                {[
                                    { value: "$150K", label: "Candidate Salary", accent: "coral" as const },
                                    { value: "$30K", label: "Placement Fee (20%)", accent: "teal" as const },
                                    { value: "$22.5K", label: "Recruiter (75%)", accent: "yellow" as const },
                                    { value: "$7.5K", label: "Platform (25%)", accent: "purple" as const },
                                ].map((item, index) => (
                                    <div key={index} className="text-center">
                                        <div className={`text-3xl md:text-4xl font-black font-mono mb-2 ${ACCENT[item.accent].text}`}>
                                            {item.value}
                                        </div>
                                        <div className="text-sm font-bold uppercase tracking-wider text-dark/60">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t-4 border-dark pt-6">
                                <p className="text-center text-base font-black uppercase tracking-wider text-dark/80">
                                    That $22,500 is locked before the first resume is submitted. Not after. Not during. Before.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                10. FAQ — STRAIGHT ANSWERS
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-6">
                            Signal Decoded
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Questions.{" "}
                            <span className="text-teal">Direct Answers.</span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            No deflection. No &ldquo;contact sales for more
                            information.&rdquo; Every question gets the same answer
                            regardless of who is asking.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {portalFaqs.map((faq, index) => {
                            const accents = ["coral", "teal", "yellow", "purple"] as const;
                            const accent = accents[index % accents.length];
                            return (
                                <div
                                    key={index}
                                    className="border-4 border-dark"
                                >
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-5 font-black text-base uppercase tracking-wide text-dark bg-white hover:bg-cream transition-colors">
                                            <span className="flex items-center gap-3">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 ${ACCENT[accent].bg} ${accent === "teal" || accent === "yellow" ? "text-dark" : "text-white"} font-mono text-sm font-black flex-shrink-0`}>
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                {faq.question}
                                            </span>
                                            <span
                                                className={`w-10 h-10 flex items-center justify-center flex-shrink-0 font-black text-xl transition-transform group-open:rotate-45 ${ACCENT[accent].bg} ${accent === "yellow" || accent === "teal" ? "text-dark" : "text-white"}`}
                                            >
                                                +
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-5 border-t-4 border-dark/5">
                                            <p className="text-base leading-relaxed text-dark/70 pt-4 pl-11">
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

            {/* ═══════════════════════════════════════════════════════════════════
                11. FINAL TRANSMISSION — CTA
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-28 overflow-hidden relative">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[6%] left-[5%] w-24 h-24 rotate-12 bg-teal opacity-15" />
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-coral opacity-20" />
                    <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rounded-full bg-yellow opacity-15" />
                    <div className="absolute bottom-[10%] right-[6%] w-28 h-8 -rotate-6 bg-purple opacity-15" />
                    <div className="absolute top-[45%] right-[35%] w-14 h-14 rotate-45 border-4 border-yellow opacity-10" />
                    {/* Dot grid */}
                    <div className="absolute bottom-[30%] left-[30%] opacity-10">
                        <div className="grid grid-cols-5 gap-2.5">
                            {Array.from({ length: 25 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-teal"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Plus sign */}
                    <svg
                        className="absolute top-[35%] left-[20%] opacity-15"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                    >
                        <line
                            x1="20" y1="4" x2="20" y2="36"
                            className="stroke-coral"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <line
                            x1="4" y1="20" x2="36" y2="20"
                            className="stroke-coral"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* System transmission header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal" />
                            </span>
                            <span className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-teal">
                                FINAL TRANSMISSION
                            </span>
                        </div>
                    </div>

                    <div className="text-center mb-14 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            The Network Is{" "}
                            <span className="text-teal">Live.</span>
                            <br />
                            Your Signal Is{" "}
                            <span className="text-coral">Expected.</span>
                        </h2>
                        <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto">
                            2,847 recruiters are sourcing. 1,243 roles are open. $8.7M
                            in fees have been processed this quarter. The
                            infrastructure is running. The data is flowing.
                        </p>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            The only question is whether your placements are being
                            tracked in the Observatory -- or lost in someone&apos;s
                            inbox.
                        </p>
                    </div>

                    {/* Primary CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-satellite-dish" />
                            Join the Network
                        </Link>
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-building" />
                            Post a Role
                        </Link>
                    </div>

                    {/* Three-path micro-CTA */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                        {[
                            {
                                icon: "fa-duotone fa-regular fa-user-tie",
                                title: "Recruiters",
                                desc: "Browse roles. Submit candidates. Track your pipeline. Collect your split.",
                                accent: "teal" as const,
                                href: "/join",
                                metric: "2,847 active",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-building",
                                title: "Companies",
                                desc: "Post roles with locked terms. The network does the sourcing. Pay on placement only.",
                                accent: "coral" as const,
                                href: "/join",
                                metric: "1,243 open roles",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-user",
                                title: "Candidates",
                                desc: "Get represented by recruiters who compete to find your right fit. Your career, amplified.",
                                accent: "yellow" as const,
                                href: "https://applicant.network",
                                metric: "412 placements/quarter",
                            },
                        ].map((card, index) => (
                            <Link
                                key={index}
                                href={card.href}
                                className="group border-4 border-white/10 bg-white/5 p-6 text-center transition-all hover:border-white/20 hover:bg-white/10"
                            >
                                <div className={`w-12 h-12 ${ACCENT[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${card.icon} ${card.accent === "teal" || card.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>
                                <h3 className="font-black text-base uppercase tracking-wider text-white mb-1">
                                    {card.title}
                                </h3>
                                <p className={`text-xs font-mono font-bold uppercase tracking-wider ${ACCENT[card.accent].text} mb-3`}>
                                    {card.metric}
                                </p>
                                <p className="text-base text-white/50">
                                    {card.desc}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* Terminal-style footer */}
                    <div className="max-w-xl mx-auto text-center">
                        <div className="border-4 border-white/5 bg-white/5 p-4 font-mono text-sm text-white/30">
                            <p>
                                <span className="text-teal">$</span> observatory.status
                            </p>
                            <p className="text-white/50 mt-1">
                                &gt; All systems operational. Awaiting your signal.
                            </p>
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
        </main>
    );
}
