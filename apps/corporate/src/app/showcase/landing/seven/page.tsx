import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { BlueprintAnimator } from "./blueprint-animator";

export const metadata: Metadata = {
    title: "Engineered for Recruiting | Splits Network",
    description:
        "Splits Network is precision-engineered recruiting infrastructure. Split-fee marketplace, built-in ATS, and transparent pipelines for recruiters, companies, and candidates.",
    ...buildCanonical("/landing/seven"),
};

// ─── Technical Specification Data ────────────────────────────────────────────

const systemSpecs = [
    { label: "SYSTEM", value: "SPLITS NETWORK" },
    { label: "VERSION", value: "2.0.4" },
    { label: "STATUS", value: "OPERATIONAL" },
    { label: "UPTIME", value: "99.97%" },
];

const moduleSpecs = [
    {
        id: "MOD-001",
        name: "Split-Fee Engine",
        icon: "fa-duotone fa-regular fa-handshake",
        status: "ACTIVE",
        description:
            "Automated fee splitting with transparent calculations. Define terms once, apply everywhere.",
        specs: [
            "Multi-party split configurations",
            "Real-time payout tracking",
            "Automated invoicing",
        ],
    },
    {
        id: "MOD-002",
        name: "Applicant Tracking",
        icon: "fa-duotone fa-regular fa-table-columns",
        status: "ACTIVE",
        description:
            "Full pipeline visibility from submission to placement. Every stage tracked, every action logged.",
        specs: [
            "Kanban + list views",
            "Custom pipeline stages",
            "Bulk operations",
        ],
    },
    {
        id: "MOD-003",
        name: "Network Routing",
        icon: "fa-duotone fa-regular fa-network-wired",
        status: "ACTIVE",
        description:
            "Intelligent recruiter-to-role matching. Roles flow to the right specialists automatically.",
        specs: [
            "Niche-based routing",
            "Capacity management",
            "Performance scoring",
        ],
    },
    {
        id: "MOD-004",
        name: "Analytics Core",
        icon: "fa-duotone fa-regular fa-chart-mixed",
        status: "ACTIVE",
        description:
            "Real-time metrics and performance data. Every placement, submission, and interaction measured.",
        specs: [
            "Live dashboards",
            "Custom report builder",
            "Export to CSV/PDF",
        ],
    },
];

const metrics = [
    {
        value: 10000,
        suffix: "+",
        label: "ACTIVE LISTINGS",
        unit: "jobs",
    },
    {
        value: 2000,
        suffix: "+",
        label: "RECRUITERS",
        unit: "operators",
    },
    {
        value: 500,
        suffix: "+",
        label: "COMPANIES",
        unit: "clients",
    },
    {
        value: 95,
        suffix: "%",
        label: "RESPONSE RATE",
        unit: "< 48h",
    },
];

const processSteps = [
    {
        phase: "01",
        title: "INTAKE",
        description:
            "Company posts role with terms, fee structure, and requirements.",
        icon: "fa-duotone fa-regular fa-file-import",
        output: "Job specification published to network",
    },
    {
        phase: "02",
        title: "ROUTING",
        description:
            "System matches role to qualified recruiters by niche and capacity.",
        icon: "fa-duotone fa-regular fa-route",
        output: "Recruiter assignments dispatched",
    },
    {
        phase: "03",
        title: "PIPELINE",
        description:
            "Recruiters submit candidates. Full tracking from submission to interview.",
        icon: "fa-duotone fa-regular fa-diagram-project",
        output: "Candidate pipeline active",
    },
    {
        phase: "04",
        title: "PLACEMENT",
        description:
            "Hire confirmed. Fees calculated automatically. Payouts triggered.",
        icon: "fa-duotone fa-regular fa-circle-check",
        output: "Split-fee settlement complete",
    },
];

const userInterfaces = [
    {
        role: "RECRUITER",
        label: "Recruiter Terminal",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "text-primary",
        borderColor: "border-coral/30",
        features: [
            "Curated role feed matched to your niche",
            "Pipeline management with stage tracking",
            "Earnings dashboard with payout history",
            "Team collaboration and shared candidates",
        ],
        cta: {
            text: "Access Terminal",
            href: "https://splits.network/sign-up",
        },
    },
    {
        role: "COMPANY",
        label: "Company Console",
        icon: "fa-duotone fa-regular fa-building",
        color: "text-accent",
        borderColor: "border-yellow/30",
        features: [
            "Post roles to the entire recruiter network",
            "Real-time pipeline visibility per role",
            "Standardized terms across all recruiters",
            "Pay-on-hire with automated settlement",
        ],
        cta: { text: "Open Console", href: "https://splits.network/sign-up" },
    },
    {
        role: "CANDIDATE",
        label: "Candidate Portal",
        icon: "fa-duotone fa-regular fa-user",
        color: "text-secondary",
        borderColor: "border-secondary/30",
        features: [
            "Matched with specialized recruiters",
            "Real-time application status tracking",
            "Interview preparation resources",
            "100% free, always",
        ],
        cta: {
            text: "Enter Portal",
            href: "https://applicant.network/sign-up",
        },
    },
];

const diagnostics = [
    {
        label: "Avg. Time to First Submission",
        value: "< 72h",
        status: "NOMINAL",
    },
    { label: "Pipeline Visibility", value: "100%", status: "NOMINAL" },
    { label: "Fee Transparency", value: "100%", status: "NOMINAL" },
    { label: "Ghosting Rate", value: "0%", status: "OPTIMAL" },
    { label: "Recruiter Satisfaction", value: "4.8/5", status: "NOMINAL" },
    { label: "Avg. Placement Time", value: "23 days", status: "NOMINAL" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingSevenPage() {
    return (
        <BlueprintAnimator>
            {/* ══════════════════════════════════════════════════════════
                HERO - System Boot Sequence
               ══════════════════════════════════════════════════════════ */}
            <section className="bp-hero min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative overflow-hidden flex items-center">
                {/* Blueprint grid background */}
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                {/* Corner reference marks */}
                <div className="absolute top-6 left-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    REF: SN-LP07-2026
                </div>
                <div className="absolute top-6 right-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    SCALE: 1:1
                </div>
                <div className="absolute bottom-6 left-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    EMPLOYMENT NETWORKS INC.
                </div>
                <div className="absolute bottom-6 right-6 text-[10px] font-mono text-[#3b5ccc]/40 tracking-widest">
                    REV. 07
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto">
                        {/* System status bar */}
                        <div className="bp-status-bar flex flex-wrap gap-6 mb-12 font-mono text-xs opacity-0">
                            {systemSpecs.map((spec) => (
                                <div
                                    key={spec.label}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-[#3b5ccc]/60 uppercase">
                                        {spec.label}:
                                    </span>
                                    <span className="text-[#14b8a6]">
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                                <span className="text-[#22c55e]/80">LIVE</span>
                            </div>
                        </div>

                        {/* Main headline */}
                        <div className="mb-8">
                            <div className="bp-hero-label font-mono text-xs text-[#3b5ccc] tracking-[0.3em] uppercase mb-4 opacity-0">
                                // SYSTEM DESIGNATION
                            </div>
                            <h1 className="bp-hero-headline text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 opacity-0">
                                <span className="text-white">
                                    Precision-Engineered
                                </span>
                                <br />
                                <span className="text-[#3b5ccc]">
                                    Recruiting Infrastructure
                                </span>
                            </h1>
                            <p className="bp-hero-sub text-lg md:text-xl text-[#c8ccd4]/60 max-w-2xl leading-relaxed font-light opacity-0">
                                Split-fee marketplace, built-in ATS, and
                                transparent pipelines. Every component designed
                                for one purpose: placements that work for
                                everyone.
                            </p>
                        </div>

                        {/* Terminal-style CTA */}
                        <div className="bp-hero-cta flex flex-col sm:flex-row gap-4 mt-10 opacity-0">
                            <a
                                href="https://splits.network/sign-up"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-[#3b5ccc] text-white font-mono text-sm tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                            >
                                <span className="text-[#3b5ccc]/60">&gt;</span>
                                INITIALIZE_SESSION
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs"></i>
                            </a>
                            <a
                                href="#system-modules"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-[#c8ccd4] font-mono text-sm tracking-wider hover:bg-white/5 transition-colors border border-[#c8ccd4]/20"
                            >
                                <span className="text-[#3b5ccc]/60">&gt;</span>
                                VIEW_SPECIFICATIONS
                            </a>
                        </div>

                        {/* Blueprint decorative line */}
                        <div className="bp-divider-line mt-16 h-px bg-[#3b5ccc]/20 relative opacity-0">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                METRICS - System Diagnostics
               ══════════════════════════════════════════════════════════ */}
            <section className="bp-metrics-section bg-[#0d1220] text-[#c8ccd4] py-20 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-metrics-label font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-8 text-center opacity-0">
                        // SYSTEM METRICS
                    </div>

                    <div className="bp-metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#3b5ccc]/10 max-w-5xl mx-auto">
                        {metrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="bp-metric-cell bg-[#0d1220] p-8 text-center opacity-0"
                            >
                                <div
                                    className="bp-metric-value font-mono text-4xl md:text-5xl font-bold text-white mb-1"
                                    data-value={metric.value}
                                    data-suffix={metric.suffix}
                                >
                                    0{metric.suffix}
                                </div>
                                <div className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc] mb-1">
                                    {metric.label}
                                </div>
                                <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                    [{metric.unit}]
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                MODULES - System Architecture
               ══════════════════════════════════════════════════════════ */}
            <section
                id="system-modules"
                className="bp-modules-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden"
            >
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="bp-modules-heading mb-16 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // CORE MODULES
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                System Architecture
                            </h2>
                            <p className="text-[#c8ccd4]/50 max-w-xl">
                                Four interconnected modules. Each purpose-built,
                                independently scalable, collectively powerful.
                            </p>
                        </div>

                        <div className="bp-modules-grid grid md:grid-cols-2 gap-px bg-[#3b5ccc]/10">
                            {moduleSpecs.map((mod) => (
                                <div
                                    key={mod.id}
                                    className="bp-module-card bg-[#0a0e17] p-8 relative group opacity-0"
                                >
                                    {/* Module ID */}
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">
                                        {mod.id}
                                    </div>

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 border border-[#3b5ccc]/30 flex items-center justify-center">
                                                <i
                                                    className={`${mod.icon} text-lg text-[#3b5ccc]`}
                                                ></i>
                                            </div>
                                            <h3 className="font-bold text-white text-lg">
                                                {mod.name}
                                            </h3>
                                        </div>
                                        <span className="font-mono text-[10px] text-[#22c55e] tracking-wider">
                                            [{mod.status}]
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-[#c8ccd4]/50 mb-6 leading-relaxed">
                                        {mod.description}
                                    </p>

                                    {/* Specs list */}
                                    <div className="space-y-2">
                                        {mod.specs.map((spec) => (
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

                                    {/* Hover border accent */}
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                PROCESS - Operational Sequence
               ══════════════════════════════════════════════════════════ */}
            <section className="bp-process-section bg-[#0d1220] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="bp-process-heading mb-16 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // OPERATIONAL SEQUENCE
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Process Flow
                            </h2>
                            <p className="text-[#c8ccd4]/50 max-w-xl">
                                From intake to placement. Every step tracked,
                                every transition automated.
                            </p>
                        </div>

                        <div className="bp-process-steps space-y-0">
                            {processSteps.map((step, index) => (
                                <div
                                    key={step.phase}
                                    className="bp-process-step opacity-0"
                                >
                                    <div className="flex gap-6 md:gap-10 relative">
                                        {/* Phase number + connector line */}
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className="w-14 h-14 border-2 border-[#3b5ccc]/40 flex items-center justify-center bg-[#0d1220] relative z-10">
                                                <span className="font-mono text-lg font-bold text-[#3b5ccc]">
                                                    {step.phase}
                                                </span>
                                            </div>
                                            {index <
                                                processSteps.length - 1 && (
                                                <div className="w-px h-full bg-[#3b5ccc]/20 min-h-[60px]"></div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="pb-10 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <i
                                                    className={`${step.icon} text-[#3b5ccc]`}
                                                ></i>
                                                <h3 className="font-mono font-bold text-white tracking-wider">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-[#c8ccd4]/50 mb-3 leading-relaxed">
                                                {step.description}
                                            </p>
                                            <div className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider">
                                                OUTPUT: {step.output}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                INTERFACES - User Access Points
               ══════════════════════════════════════════════════════════ */}
            <section className="bp-interfaces-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="bp-interfaces-heading mb-16 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // USER INTERFACES
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Access Points
                            </h2>
                            <p className="text-[#c8ccd4]/50 max-w-xl">
                                Three purpose-built interfaces. Each optimized
                                for its operator. One connected system.
                            </p>
                        </div>

                        <div className="bp-interfaces-grid grid md:grid-cols-3 gap-6">
                            {userInterfaces.map((ui) => (
                                <div
                                    key={ui.role}
                                    className={`bp-interface-card border ${ui.borderColor} bg-[#0a0e17] p-8 relative opacity-0`}
                                >
                                    {/* Role tag */}
                                    <div className="font-mono text-[10px] tracking-[0.3em] text-[#c8ccd4]/30 uppercase mb-6">
                                        {ui.role}
                                    </div>

                                    {/* Icon + Label */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className={`w-10 h-10 border border-current ${ui.color} flex items-center justify-center opacity-60`}
                                        >
                                            <i
                                                className={`${ui.icon} text-lg`}
                                            ></i>
                                        </div>
                                        <h3 className="font-bold text-white">
                                            {ui.label}
                                        </h3>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-8">
                                        {ui.features.map((feature) => (
                                            <div
                                                key={feature}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <span
                                                    className={`font-mono text-xs ${ui.color} mt-0.5`}
                                                >
                                                    &gt;
                                                </span>
                                                <span className="text-[#c8ccd4]/60">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <a
                                        href={ui.cta.href}
                                        className={`inline-flex items-center gap-2 font-mono text-xs tracking-wider ${ui.color} hover:text-white transition-colors`}
                                    >
                                        [{ui.cta.text}]
                                        <i className="fa-duotone fa-regular fa-arrow-right text-[10px]"></i>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                DIAGNOSTICS - System Health
               ══════════════════════════════════════════════════════════ */}
            <section className="bp-diagnostics-section bg-[#0d1220] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="bp-diagnostics-heading mb-12 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // PERFORMANCE DIAGNOSTICS
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                System Health
                            </h2>
                        </div>

                        <div className="bp-diagnostics-table border border-[#3b5ccc]/20">
                            {/* Table header */}
                            <div className="grid grid-cols-3 gap-px bg-[#3b5ccc]/10 font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]/60 uppercase">
                                <div className="bg-[#0d1220] px-6 py-3">
                                    METRIC
                                </div>
                                <div className="bg-[#0d1220] px-6 py-3">
                                    VALUE
                                </div>
                                <div className="bg-[#0d1220] px-6 py-3">
                                    STATUS
                                </div>
                            </div>

                            {/* Table rows */}
                            {diagnostics.map((diag) => (
                                <div
                                    key={diag.label}
                                    className="bp-diag-row grid grid-cols-3 gap-px bg-[#3b5ccc]/10 opacity-0"
                                >
                                    <div className="bg-[#0d1220] px-6 py-4 text-sm text-[#c8ccd4]/60">
                                        {diag.label}
                                    </div>
                                    <div className="bg-[#0d1220] px-6 py-4 font-mono text-sm text-white">
                                        {diag.value}
                                    </div>
                                    <div className="bg-[#0d1220] px-6 py-4 font-mono text-[10px] tracking-wider">
                                        <span
                                            className={
                                                diag.status === "OPTIMAL"
                                                    ? "text-[#14b8a6]"
                                                    : "text-[#22c55e]"
                                            }
                                        >
                                            [{diag.status}]
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                CTA - System Access
               ══════════════════════════════════════════════════════════ */}
            <section className="bp-cta-section bg-[#0a0e17] text-[#c8ccd4] py-24 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                {/* Blueprint crosshair decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
                    <div className="absolute top-0 left-1/2 w-px h-full bg-[#3b5ccc]/[0.06]"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-[#3b5ccc]/[0.06]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-[#3b5ccc]/[0.06] rotate-45"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="bp-cta-content opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-6">
                                // INITIATE
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Ready to deploy?
                            </h2>
                            <p className="text-lg text-[#c8ccd4]/50 mb-10 max-w-lg mx-auto">
                                The recruiting infrastructure your team has been
                                waiting for. Built different. Engineered to
                                last.
                            </p>
                        </div>

                        <div className="bp-cta-buttons flex flex-col sm:flex-row gap-4 justify-center mb-12 opacity-0">
                            <a
                                href="https://splits.network/sign-up"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#3b5ccc] text-white font-mono text-sm tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                            >
                                <i className="fa-duotone fa-regular fa-rocket text-xs"></i>
                                DEPLOY_NOW
                            </a>
                            <a
                                href="mailto:hello@employment-networks.com"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent text-[#c8ccd4] font-mono text-sm tracking-wider hover:bg-white/5 transition-colors border border-[#c8ccd4]/20"
                            >
                                <i className="fa-duotone fa-regular fa-envelope text-xs"></i>
                                REQUEST_DEMO
                            </a>
                        </div>

                        <div className="bp-cta-footer font-mono text-xs text-[#c8ccd4]/30 opacity-0">
                            <div className="h-px bg-[#3b5ccc]/10 mb-6 max-w-xs mx-auto"></div>
                            hello@employment-networks.com
                        </div>
                    </div>
                </div>
            </section>
        </BlueprintAnimator>
    );
}
