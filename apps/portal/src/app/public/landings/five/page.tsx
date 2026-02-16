import Link from "next/link";
import type { Metadata } from "next";
import { portalFaqs } from "@/components/landing/sections/faq-data";
import { MemphisLandingAnimator } from "@/components/landing/landing-memphis-animator";

// ── Metadata ────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: "The Blueprint: Recruiting Infrastructure | Splits Network",
    description:
        "We didn't build a tool. We built infrastructure. Four layers -- Identity, Marketplace, Pipeline, Payments -- engineered to make split-fee recruiting transparent, trackable, and automatic.",
};

// ── Layer Data ───────────────────────────────────────────────────────────────────

const ACCENT_COLORS = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
};

const architectureLayers = [
    {
        number: "01",
        name: "Identity",
        color: "purple" as const,
        tagline: "WHO YOU ARE ON THE NETWORK",
        icon: "fa-duotone fa-regular fa-fingerprint",
        description:
            "Every participant enters the network with a verified identity. Organization profiles, recruiter specializations, placement history, and trust signals -- all structured, all queryable, all public to the parties that need them.",
        capabilities: [
            {
                label: "Organization Profiles",
                detail: "Company size, industry, hiring velocity, and fee preferences visible to all recruiters.",
                icon: "fa-duotone fa-regular fa-building",
            },
            {
                label: "Recruiter Specializations",
                detail: "Industry verticals, geographic coverage, and placement track record indexed for matching.",
                icon: "fa-duotone fa-regular fa-user-tie",
            },
            {
                label: "Trust Signals",
                detail: "Verified credentials, response rates, and placement completion ratios surfaced automatically.",
                icon: "fa-duotone fa-regular fa-shield-check",
            },
            {
                label: "Team Structure",
                detail: "Role-based access controls. Admins, hiring managers, and recruiters see exactly what they need.",
                icon: "fa-duotone fa-regular fa-sitemap",
            },
        ],
    },
    {
        number: "02",
        name: "Marketplace",
        color: "coral" as const,
        tagline: "WHERE SUPPLY MEETS DEMAND",
        icon: "fa-duotone fa-regular fa-store",
        description:
            "Roles are posted with locked terms. Recruiters browse, filter, and claim work that matches their specializations. The marketplace does the matchmaking that used to require a Rolodex and three phone calls.",
        capabilities: [
            {
                label: "Role Publishing",
                detail: "Post a role with title, salary, fee percentage, and split terms. All visible before a recruiter commits.",
                icon: "fa-duotone fa-regular fa-briefcase",
            },
            {
                label: "Recruiter Discovery",
                detail: "Companies browse recruiter profiles by specialty, geography, and track record. No cold outreach required.",
                icon: "fa-duotone fa-regular fa-magnifying-glass",
            },
            {
                label: "Locked Economics",
                detail: "Fee structures and split percentages are set at posting. No renegotiation after the first candidate is submitted.",
                icon: "fa-duotone fa-regular fa-lock",
            },
            {
                label: "Smart Matching",
                detail: "Recruiters are surfaced roles that align with their placement history, specialties, and geography.",
                icon: "fa-duotone fa-regular fa-bullseye-arrow",
            },
        ],
    },
    {
        number: "03",
        name: "Pipeline",
        color: "teal" as const,
        tagline: "THE OPERATIONAL BACKBONE",
        icon: "fa-duotone fa-regular fa-chart-gantt",
        description:
            "Every candidate submission, stage transition, interview, and offer is tracked in one shared pipeline. All parties see the same data in real time. No more email chains, no more status update calls, no more wondering where things stand.",
        capabilities: [
            {
                label: "Candidate Tracking",
                detail: "Every submission is timestamped and attributed. No disputes about who submitted whom, or when.",
                icon: "fa-duotone fa-regular fa-user-magnifying-glass",
            },
            {
                label: "Stage Management",
                detail: "Screen, interview, offer, hire -- each transition logged, each party notified, each deadline tracked.",
                icon: "fa-duotone fa-regular fa-list-check",
            },
            {
                label: "Real-Time Communication",
                detail: "In-platform messaging tied to specific roles, candidates, and submissions. Context never gets lost.",
                icon: "fa-duotone fa-regular fa-comments",
            },
            {
                label: "Activity Feed",
                detail: "A chronological record of every action on every placement. Fully auditable. Fully transparent.",
                icon: "fa-duotone fa-regular fa-timeline",
            },
        ],
    },
    {
        number: "04",
        name: "Payments",
        color: "yellow" as const,
        tagline: "THE FINANCIAL LAYER",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        description:
            "When a placement closes, the platform calculates every party's share and distributes funds automatically. Clawback terms are pre-defined. Payment schedules are visible. Every dollar is accounted for before the first resume is submitted.",
        capabilities: [
            {
                label: "Auto-Calculated Splits",
                detail: "Fee percentages, platform shares, and recruiter payouts computed instantly from locked terms.",
                icon: "fa-duotone fa-regular fa-calculator",
            },
            {
                label: "Payment Distribution",
                detail: "Funds flow to every party based on pre-agreed splits. No invoicing. No chasing. No ambiguity.",
                icon: "fa-duotone fa-regular fa-money-check-dollar",
            },
            {
                label: "Clawback Handling",
                detail: "Guarantee periods and clawback terms are defined at posting. If a placement falls through, adjustments are automatic.",
                icon: "fa-duotone fa-regular fa-rotate-left",
            },
            {
                label: "Financial Dashboard",
                detail: "Pipeline value, earned fees, pending payouts, and historical placements -- all in one view.",
                icon: "fa-duotone fa-regular fa-chart-pie",
            },
        ],
    },
];

const fullStackSteps = [
    {
        layer: "01",
        layerName: "Identity",
        color: "purple" as const,
        actor: "TechScale Inc.",
        action: "Creates verified company profile",
        detail: "Series B startup, 200 employees, hiring 12 engineers. Profile indexed for recruiter matching.",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        layer: "02",
        layerName: "Marketplace",
        color: "coral" as const,
        actor: "TechScale Inc.",
        action: "Posts Senior Backend Engineer role",
        detail: "$180K salary, 20% placement fee, 75/25 recruiter split. Terms locked. Marketplace activated.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        layer: "02",
        layerName: "Marketplace",
        color: "coral" as const,
        actor: "Sarah Chen, Recruiter",
        action: "Discovers the role and accepts terms",
        detail: "Specializes in backend engineering. 87% placement rate. Split terms reviewed and accepted.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        layer: "03",
        layerName: "Pipeline",
        color: "teal" as const,
        actor: "Sarah Chen",
        action: "Submits candidate Marcus Johnson",
        detail: "Resume uploaded, pre-screen completed. Submission timestamped: 2024-11-15 09:32 UTC.",
        icon: "fa-duotone fa-regular fa-user-plus",
    },
    {
        layer: "03",
        layerName: "Pipeline",
        color: "teal" as const,
        actor: "Platform",
        action: "Tracks interview stages in real time",
        detail: "Phone screen (passed) > Technical (passed) > Onsite (passed) > Offer extended. All parties notified at each stage.",
        icon: "fa-duotone fa-regular fa-chart-gantt",
    },
    {
        layer: "04",
        layerName: "Payments",
        color: "yellow" as const,
        actor: "Platform",
        action: "Candidate starts. Payment flows automatically.",
        detail: "$36K fee collected. $27K to Sarah. Deposited in 5 business days. Guarantee period: 90 days.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
    },
];

const specifications = [
    { metric: "FEE VISIBILITY", value: "100%", unit: "", description: "Every party sees every number before the first submission.", color: "coral" as const },
    { metric: "HIDDEN CLAWBACKS", value: "0", unit: "", description: "Terms locked at posting. No retroactive adjustments. Ever.", color: "teal" as const },
    { metric: "FASTER PLACEMENTS", value: "2.4", unit: "x", description: "Shared pipelines and real-time updates cut timelines by more than half.", color: "yellow" as const },
    { metric: "PAYMENT CYCLE", value: "5", unit: "days", description: "From placement confirmation to recruiter payout. Not weeks. Days.", color: "purple" as const },
    { metric: "PIPELINE SYNC", value: "<1", unit: "sec", description: "Stage transitions propagate to all parties in under one second.", color: "coral" as const },
    { metric: "CANDIDATE ATTRIBUTION", value: "100%", unit: "", description: "Every submission timestamped. Every contributor visible. No disputes.", color: "teal" as const },
    { metric: "TERM INTEGRITY", value: "0", unit: "changes", description: "Split terms are immutable after the first candidate is submitted.", color: "yellow" as const },
    { metric: "AUDIT TRAIL", value: "Every", unit: "action", description: "Full chronological record of every event on every placement.", color: "purple" as const },
];

// ── Page ────────────────────────────────────────────────────────────────────────

export default function LandingFivePage() {
    return (
        <MemphisLandingAnimator>
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO -- THE BLUEPRINT
            ═══════════════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis geometric decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Large hollow circle -- top left */}
                    <div className="memphis-shape absolute top-[6%] left-[3%] w-32 h-32 rounded-full border-[6px] border-purple opacity-0" />
                    {/* Solid coral block -- right */}
                    <div className="memphis-shape absolute top-[14%] right-[8%] w-24 h-24 rotate-12 bg-coral opacity-0" />
                    {/* Small teal circle -- bottom left */}
                    <div className="memphis-shape absolute bottom-[16%] left-[12%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    {/* Yellow rectangle */}
                    <div className="memphis-shape absolute top-[60%] right-[5%] w-28 h-10 -rotate-6 bg-yellow opacity-0" />
                    {/* Dot grid -- top right */}
                    <div className="memphis-shape absolute top-[10%] right-[28%] opacity-0">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-yellow"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Blueprint grid lines */}
                    <svg
                        className="memphis-shape absolute bottom-[10%] right-[35%] opacity-0"
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                    >
                        <line x1="0" y1="0" x2="0" y2="120" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="30" y1="0" x2="30" y2="120" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="60" y1="0" x2="60" y2="120" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="90" y1="0" x2="90" y2="120" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="120" y1="0" x2="120" y2="120" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="0" y1="0" x2="120" y2="0" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="0" y1="30" x2="120" y2="30" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="0" y1="60" x2="120" y2="60" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="0" y1="90" x2="120" y2="90" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                        <line x1="0" y1="120" x2="120" y2="120" className="stroke-purple" strokeWidth="2" opacity="0.3" />
                    </svg>
                    {/* Hollow coral square */}
                    <div className="memphis-shape absolute bottom-[30%] left-[6%] w-20 h-20 border-4 border-coral rotate-6 opacity-0" />
                    {/* Plus sign */}
                    <svg
                        className="memphis-shape absolute top-[45%] left-[25%] opacity-0"
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                    >
                        <line x1="22" y1="5" x2="22" y2="39" className="stroke-teal" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="22" x2="39" y2="22" className="stroke-teal" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Overline badge */}
                        <div className="hero-overline inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white border-4 border-purple">
                                <i className="fa-duotone fa-regular fa-compass-drafting"></i>
                                The Blueprint
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] mb-8 text-white uppercase tracking-tight opacity-0">
                            We Didn&apos;t Build
                            <br />
                            A Tool. We Built
                            <br />
                            <span className="relative inline-block mt-2">
                                <span className="text-purple">
                                    The Infrastructure.
                                </span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-purple" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed text-white/70 opacity-0">
                            Four layers. One system. Every split-fee placement
                            tracked from identity verification to payment
                            distribution. These are the blueprints.
                        </p>

                        <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/join"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Deploy Now
                            </Link>
                            <a
                                href="#architecture"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-white/30 bg-transparent text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-layer-group"></i>
                                Read the Blueprint
                            </a>
                        </div>

                        <div className="hero-tagline text-sm text-white/40 pt-10 opacity-0 uppercase tracking-wider font-bold">
                            Identity. Marketplace. Pipeline. Payments. Four
                            layers. Zero gaps.
                        </div>
                    </div>
                </div>

                {/* 4-color accent bar */}
                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-purple" />
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2. THE ARCHITECTURE -- LAYER OVERVIEW
            ═══════════════════════════════════════════════════════════════ */}
            <section
                id="architecture"
                className="problem-section py-24 bg-cream overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="problem-heading text-center mb-20 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-6">
                            System Architecture
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Four Layers.{" "}
                            <span className="text-purple">One System.</span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                            Every split-fee platform that came before failed
                            because it treated recruiting as a single problem.
                            It is not. It is four problems stacked on top of
                            each other. We built a layer for each one.
                        </p>
                    </div>

                    {/* Stacked Architecture Diagram */}
                    <div className="pain-cards max-w-4xl mx-auto space-y-0">
                        {architectureLayers.map((layer, index) => (
                            <div
                                key={index}
                                className="pain-card relative opacity-0"
                            >
                                <div className={`flex flex-col md:flex-row items-stretch border-4 border-dark ${index > 0 ? "-mt-1" : ""}`}>
                                    {/* Layer number block */}
                                    <div
                                        className={`${ACCENT_COLORS[layer.color].bg} flex items-center justify-center px-8 py-6 md:w-48 flex-shrink-0 border-b-4 md:border-b-0 md:border-r-4 border-dark`}
                                    >
                                        <div className="text-center">
                                            <div className={`text-5xl font-black font-mono ${layer.color === "yellow" || layer.color === "teal" ? "text-dark" : "text-white"}`}>
                                                {layer.number}
                                            </div>
                                            <div className={`text-base font-black uppercase tracking-wider mt-1 ${layer.color === "yellow" || layer.color === "teal" ? "text-dark/70" : "text-white/70"}`}>
                                                {layer.name}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Layer content */}
                                    <div className="flex-1 bg-white p-6 md:p-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <i className={`${layer.icon} text-xl ${ACCENT_COLORS[layer.color].text}`}></i>
                                            <span className={`text-sm font-black uppercase tracking-[0.15em] ${ACCENT_COLORS[layer.color].text}`}>
                                                {layer.tagline}
                                            </span>
                                        </div>
                                        <p className="text-base text-dark/70 leading-relaxed">
                                            {layer.description}
                                        </p>
                                    </div>
                                </div>
                                {/* Connector line between layers */}
                                {index < architectureLayers.length - 1 && (
                                    <div className="hidden md:flex justify-center">
                                        <div className="w-1 h-0 bg-dark/20" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom label */}
                    <div className="max-w-4xl mx-auto mt-8 text-center">
                        <p className="text-base font-black uppercase tracking-wider text-dark/40">
                            Each layer is independent. Together, they are the
                            infrastructure.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. PULL QUOTE -- ARCHITECTURE DECLARATION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="comparison-quote max-w-4xl mx-auto text-center opacity-0">
                        <div className="relative inline-block">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-purple" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-teal" />
                            <div className="border-l-4 border-purple px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;Previous split-fee platforms asked
                                    recruiters to trust each other. We built the
                                    system that makes{" "}
                                    <span className="text-purple">
                                        trust unnecessary.
                                    </span>{" "}
                                    Transparent infrastructure replaces
                                    handshake agreements.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-4">
                                    -- Splits Network Architecture Principle
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. LAYER 1: IDENTITY (PURPLE)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="how-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="how-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="inline-flex items-center justify-center w-14 h-14 bg-purple border-4 border-dark text-white font-black font-mono text-xl">
                                01
                            </span>
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white">
                                Layer One: Identity
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-dark">
                            Before You Trade,{" "}
                            <span className="text-purple">You Verify.</span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            The identity layer is the foundation. Every
                            organization, every recruiter, every team member
                            enters the network as a structured, verified entity.
                            No anonymous job boards. No faceless submissions.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {architectureLayers[0].capabilities.map(
                                (cap, index) => (
                                    <div
                                        key={index}
                                        className="how-step relative border-4 border-dark bg-cream p-6 opacity-0"
                                    >
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-purple" />
                                        <div className="flex items-start gap-4 pt-2">
                                            <div className="w-12 h-12 bg-purple/10 border-4 border-purple flex items-center justify-center flex-shrink-0">
                                                <i className={`${cap.icon} text-base text-purple`}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-2">
                                                    {cap.label}
                                                </h3>
                                                <p className="text-base text-dark/70 leading-relaxed">
                                                    {cap.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. LAYER 2: MARKETPLACE (CORAL)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="recruiters-section py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="recruiters-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="inline-flex items-center justify-center w-14 h-14 bg-coral border-4 border-coral text-white font-black font-mono text-xl">
                                02
                            </span>
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white">
                                Layer Two: Marketplace
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-white">
                            Supply Meets Demand.{" "}
                            <span className="text-coral">Terms Are Locked.</span>
                        </h2>
                        <p className="text-lg text-white/70">
                            The marketplace layer connects companies with roles
                            to fill and recruiters with candidates to place.
                            Economics are visible before anyone commits. This is
                            the engine that replaced the Rolodex.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="recruiters-benefits grid md:grid-cols-2 gap-6">
                            {architectureLayers[1].capabilities.map(
                                (cap, index) => (
                                    <div
                                        key={index}
                                        className="benefit-item relative border-4 border-white/20 bg-white/5 p-6 opacity-0"
                                    >
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-coral" />
                                        <div className="flex items-start gap-4 pt-2">
                                            <div className="benefit-icon w-12 h-12 bg-coral/20 border-4 border-coral flex items-center justify-center flex-shrink-0">
                                                <i className={`${cap.icon} text-base text-coral`}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-base uppercase tracking-wide text-white mb-2">
                                                    {cap.label}
                                                </h3>
                                                <p className="text-base text-white/70 leading-relaxed">
                                                    {cap.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. LAYER 3: PIPELINE (TEAL)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="companies-section py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="companies-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="inline-flex items-center justify-center w-14 h-14 bg-teal border-4 border-dark text-dark font-black font-mono text-xl">
                                03
                            </span>
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark">
                                Layer Three: Pipeline
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-dark">
                            Every Stage.{" "}
                            <span className="text-teal">Every Party.</span>{" "}
                            Real Time.
                        </h2>
                        <p className="text-lg text-dark/70">
                            The pipeline layer is the operational backbone.
                            Candidate submissions, interview stages, offer
                            decisions -- every transition is logged, every party
                            is notified, every deadline is tracked. The
                            black-hole pipeline is dead.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="companies-benefits grid md:grid-cols-2 gap-6">
                            {architectureLayers[2].capabilities.map(
                                (cap, index) => (
                                    <div
                                        key={index}
                                        className="benefit-item relative border-4 border-dark bg-white p-6 opacity-0"
                                    >
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-teal" />
                                        <div className="flex items-start gap-4 pt-2">
                                            <div className="benefit-icon w-12 h-12 bg-teal/10 border-4 border-teal flex items-center justify-center flex-shrink-0">
                                                <i className={`${cap.icon} text-base text-teal`}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-2">
                                                    {cap.label}
                                                </h3>
                                                <p className="text-base text-dark/70 leading-relaxed">
                                                    {cap.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. LAYER 4: PAYMENTS (YELLOW)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="money-section py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="money-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="inline-flex items-center justify-center w-14 h-14 bg-yellow border-4 border-dark text-dark font-black font-mono text-xl">
                                04
                            </span>
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-yellow text-dark">
                                Layer Four: Payments
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-white">
                            The Money Follows{" "}
                            <span className="text-yellow">The Math.</span>
                        </h2>
                        <p className="text-lg text-white/70">
                            The financial layer closes the loop. When a
                            placement is confirmed, the platform calculates
                            splits, distributes funds, and handles clawbacks --
                            all based on terms that were locked before the first
                            resume was submitted. No invoicing. No chasing. No
                            disputes.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="flow-cards grid md:grid-cols-2 gap-6">
                            {architectureLayers[3].capabilities.map(
                                (cap, index) => (
                                    <div
                                        key={index}
                                        className="flow-card relative border-4 border-white/20 bg-white/5 p-6 opacity-0"
                                    >
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-yellow" />
                                        <div className="flex items-start gap-4 pt-2">
                                            <div className="benefit-icon w-12 h-12 bg-yellow/20 border-4 border-yellow flex items-center justify-center flex-shrink-0">
                                                <i className={`${cap.icon} text-base text-yellow`}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-base uppercase tracking-wide text-white mb-2">
                                                    {cap.label}
                                                </h3>
                                                <p className="text-base text-white/70 leading-relaxed">
                                                    {cap.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Payment math example */}
                    <div className="breakdown-card max-w-4xl mx-auto mt-16 opacity-0">
                        <div className="border-4 border-white/20 bg-white/5 p-8 md:p-10">
                            <h3 className="text-xl font-black text-center mb-8 uppercase tracking-wide text-white">
                                Real Placement. Real Numbers.
                            </h3>
                            <div className="grid md:grid-cols-4 gap-6 mb-8">
                                {[
                                    { value: "$180K", label: "Candidate Salary", color: "purple" as const },
                                    { value: "$36K", label: "Placement Fee (20%)", color: "coral" as const },
                                    { value: "$27K", label: "Recruiter (75%)", color: "teal" as const },
                                    { value: "$9K", label: "Platform (25%)", color: "yellow" as const },
                                ].map((item, index) => (
                                    <div key={index} className="text-center">
                                        <div className={`text-4xl font-black font-mono mb-2 ${ACCENT_COLORS[item.color].text}`}>
                                            {item.value}
                                        </div>
                                        <div className="text-sm font-bold uppercase tracking-wider text-white/50">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t-4 border-white/10 pt-6">
                                <p className="text-center text-base font-black uppercase tracking-wider text-white/60">
                                    Every number locked at posting. Calculated
                                    at close. Distributed in 5 days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                8. THE FULL STACK -- ALL LAYERS IN ONE PLACEMENT
            ═══════════════════════════════════════════════════════════════ */}
            <section className="comparison-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="comparison-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-6">
                            The Full Stack
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-dark">
                            One Placement.{" "}
                            <span className="text-teal">All Four Layers.</span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            Watch a split-fee placement flow through every layer
                            of the infrastructure. From company profile to
                            recruiter payout -- start to finish, nothing hidden.
                        </p>
                    </div>

                    {/* Vertical timeline */}
                    <div className="comparison-table max-w-3xl mx-auto relative">
                        {/* Vertical connector line */}
                        <div className="absolute left-[27px] md:left-[31px] top-0 bottom-0 w-1 bg-dark/10" />

                        <div className="space-y-6">
                            {fullStackSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="comparison-row relative flex items-start gap-5 opacity-0"
                                >
                                    {/* Layer indicator dot */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div
                                            className={`w-14 h-14 md:w-16 md:h-16 ${ACCENT_COLORS[step.color].bg} border-4 border-dark flex items-center justify-center`}
                                        >
                                            <span className={`text-lg font-black font-mono ${step.color === "yellow" || step.color === "teal" ? "text-dark" : "text-white"}`}>
                                                {step.layer}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Step content */}
                                    <div className="flex-1 border-4 border-dark bg-cream p-5 md:p-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <i className={`${step.icon} ${ACCENT_COLORS[step.color].text}`}></i>
                                            <span className={`text-sm font-black uppercase tracking-wider ${ACCENT_COLORS[step.color].text}`}>
                                                {step.layerName} &mdash; {step.actor}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-wide text-dark mb-2">
                                            {step.action}
                                        </h3>
                                        <p className="text-base text-dark/60 leading-relaxed font-mono">
                                            {step.detail}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Convergence result */}
                        <div className="convergence-point mt-10 opacity-0">
                            <div className="border-4 border-dark bg-dark p-6 md:p-8 text-center">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    {(["purple", "coral", "teal", "yellow"] as const).map((color) => (
                                        <div
                                            key={color}
                                            className={`w-10 h-10 ${ACCENT_COLORS[color].bg} border-4 border-white/20`}
                                        />
                                    ))}
                                </div>
                                <p className="font-black text-lg uppercase tracking-wider text-white mb-2">
                                    All Four Layers. One Outcome.
                                </p>
                                <p className="text-base text-white/50 font-mono">
                                    Candidate placed. $27,000 to recruiter.
                                    Every step tracked. Every dollar accounted
                                    for.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                9. SPECIFICATIONS -- ENGINEERING METRICS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="metrics-section py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="metrics-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-6">
                            Specifications
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-dark">
                            Engineering{" "}
                            <span className="text-teal">Specs.</span>
                            <br />
                            Not Marketing Claims.
                        </h2>
                        <p className="text-lg text-dark/70">
                            These numbers are architectural decisions, not
                            aspirational goals. They are how the system is
                            built, how it performs, and what it guarantees.
                        </p>
                    </div>

                    <div className="metric-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {specifications.map((spec, index) => (
                            <div
                                key={index}
                                className="metric-card relative border-4 border-dark bg-white p-6 opacity-0"
                            >
                                {/* Top accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT_COLORS[spec.color].bg}`} />
                                {/* Corner accent */}
                                <div className={`absolute bottom-0 right-0 w-8 h-8 ${ACCENT_COLORS[spec.color].bg}`} />

                                <div className="font-mono text-sm font-bold uppercase tracking-wider text-dark/40 mb-3 pt-1">
                                    {spec.metric}
                                </div>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className={`text-4xl font-black font-mono ${ACCENT_COLORS[spec.color].text}`}>
                                        {spec.value}
                                    </span>
                                    {spec.unit && (
                                        <span className={`text-lg font-black font-mono ${ACCENT_COLORS[spec.color].text}`}>
                                            {spec.unit}
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-dark/60 leading-relaxed">
                                    {spec.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                10. FAQ -- TECHNICAL QUESTIONS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="faq-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            Documentation
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-dark">
                            Frequently Asked{" "}
                            <span className="text-coral">Questions</span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            The answers you need before you deploy. No
                            corporate deflection. Straight technical detail.
                        </p>
                    </div>
                    <div className="faq-items max-w-3xl mx-auto space-y-4">
                        {portalFaqs.map((faq, index) => {
                            const accents = [
                                "purple",
                                "coral",
                                "teal",
                                "yellow",
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
                11. CTA -- DEPLOY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="cta-section py-28 bg-dark overflow-hidden relative">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[4%] w-24 h-24 rotate-12 bg-purple opacity-20" />
                    <div className="absolute top-[12%] right-[6%] w-20 h-20 rounded-full border-4 border-coral opacity-20" />
                    <div className="absolute bottom-[18%] left-[8%] w-16 h-16 rounded-full bg-teal opacity-20" />
                    <div className="absolute bottom-[8%] right-[12%] w-28 h-10 -rotate-6 bg-yellow opacity-20" />
                    <div className="absolute top-[50%] left-[50%] w-20 h-20 rotate-45 border-4 border-purple opacity-10" />
                    {/* Blueprint grid */}
                    <svg
                        className="absolute top-[25%] right-[20%] opacity-10"
                        width="160"
                        height="160"
                        viewBox="0 0 160 160"
                    >
                        <line x1="0" y1="0" x2="0" y2="160" className="stroke-purple" strokeWidth="2" />
                        <line x1="40" y1="0" x2="40" y2="160" className="stroke-purple" strokeWidth="2" />
                        <line x1="80" y1="0" x2="80" y2="160" className="stroke-purple" strokeWidth="2" />
                        <line x1="120" y1="0" x2="120" y2="160" className="stroke-purple" strokeWidth="2" />
                        <line x1="160" y1="0" x2="160" y2="160" className="stroke-purple" strokeWidth="2" />
                        <line x1="0" y1="0" x2="160" y2="0" className="stroke-purple" strokeWidth="2" />
                        <line x1="0" y1="40" x2="160" y2="40" className="stroke-purple" strokeWidth="2" />
                        <line x1="0" y1="80" x2="160" y2="80" className="stroke-purple" strokeWidth="2" />
                        <line x1="0" y1="120" x2="160" y2="120" className="stroke-purple" strokeWidth="2" />
                        <line x1="0" y1="160" x2="160" y2="160" className="stroke-purple" strokeWidth="2" />
                    </svg>
                    {/* Zigzag */}
                    <svg
                        className="absolute bottom-[28%] left-[30%] opacity-15"
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
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-14 opacity-0 max-w-4xl mx-auto">
                        {/* Layer badges in a row */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {(
                                [
                                    { num: "01", color: "purple" as const },
                                    { num: "02", color: "coral" as const },
                                    { num: "03", color: "teal" as const },
                                    { num: "04", color: "yellow" as const },
                                ] as const
                            ).map((layer) => (
                                <div
                                    key={layer.num}
                                    className={`w-12 h-12 ${ACCENT_COLORS[layer.color].bg} border-4 border-white/20 flex items-center justify-center`}
                                >
                                    <span className={`text-sm font-black font-mono ${layer.color === "yellow" || layer.color === "teal" ? "text-dark" : "text-white"}`}>
                                        {layer.num}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            The Blueprints Are{" "}
                            <span className="text-purple">Finalized.</span>
                            <br />
                            The Infrastructure Is{" "}
                            <span className="text-teal">Live.</span>
                        </h2>
                        <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto">
                            Four layers built to solve the four problems that
                            have broken split-fee recruiting for decades.
                            Identity. Marketplace. Pipeline. Payments.
                        </p>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            The architecture is deployed. The network is
                            operational. The only question is whether you are
                            building on it or still operating without it.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/join"
                            className="cta-btn inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-rocket"></i>
                            Deploy Now
                        </Link>
                        <Link
                            href="/join"
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
                                desc: "Browse the marketplace. Claim roles. Submit candidates. Collect your split -- automatically.",
                                accent: "teal" as const,
                                href: "/join",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-building",
                                title: "Companies",
                                desc: "Post roles with locked terms. Tap the network. Pay only when someone starts.",
                                accent: "coral" as const,
                                href: "/join",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-user",
                                title: "Candidates",
                                desc: "Get represented by recruiters who compete to find you the right fit.",
                                accent: "yellow" as const,
                                href: "https://applicant.network",
                            },
                        ].map((card, index) => (
                            <Link
                                key={index}
                                href={card.href}
                                className="cta-btn border-4 border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10 opacity-0"
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
                            </Link>
                        ))}
                    </div>

                    <p className="cta-footer text-center text-sm opacity-0 max-w-xl mx-auto text-white/40 uppercase tracking-wider font-bold">
                        The blueprint is open. The infrastructure is live.
                        Deploy your recruiting operation on Splits Network.
                    </p>
                </div>

                {/* 4-color accent bar */}
                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-purple" />
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                </div>
            </section>
        </MemphisLandingAnimator>
    );
}
