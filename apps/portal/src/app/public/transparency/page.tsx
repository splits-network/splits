import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { TransparencyAnimator } from "./transparency-animator";

export const metadata: Metadata = {
    title: "Transparency | Splits Network",
    description:
        "Radical transparency in recruiting. See exactly how fees are split, how data is handled, and why we believe openness builds trust. No hidden costs, no surprises.",
    openGraph: {
        title: "Transparency | Splits Network",
        description:
            "Radical transparency in recruiting. See exactly how fees are split, how data is handled, and why we believe openness builds trust.",
        url: "https://splits.network/public/transparency",
    },
    ...buildCanonical("/public/transparency"),
};

// ─── Page data ──────────────────────────────────────────────────────────────

const keyStats = [
    { value: "100%", label: "Fee Visibility", color: "#FF6B6B" },
    { value: "Real-Time", label: "Placement Tracking", color: "#4ECDC4" },
    { value: "Open", label: "Platform Economics", color: "#FFE66D" },
    { value: "Zero", label: "Hidden Costs", color: "#A78BFA" },
];

const oldWayItems = [
    "Opaque fees buried in fine print that recruiters never see",
    "Placement splits negotiated behind closed doors after the fact",
    "No visibility into where your candidates go or what happens next",
    "Platform economics hidden -- you never know the real take rate",
    "Payment timelines undefined, disputes common, resolution slow",
    "Recruiter performance data locked away and inaccessible",
];

const newWayItems = [
    "Every fee breakdown visible before you start working a role",
    "Split percentages set upfront by tier -- no surprises, no renegotiation",
    "Real-time tracking of every candidate through the full lifecycle",
    "Platform take rate published openly for every subscription tier",
    "Automated payouts tied to verified milestones with clear timelines",
    "Your performance stats, placement history, and earnings -- always accessible",
];

const shareFeatures = [
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Fee Breakdowns",
        text: "See exactly how placement fees are calculated and distributed across every role in a split. No guesswork, no hidden margins.",
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Recruiter Performance",
        text: "Your placement rate, average time-to-fill, candidate satisfaction scores, and earnings history -- all visible in your dashboard.",
        color: "#4ECDC4",
    },
    {
        icon: "fa-duotone fa-regular fa-route",
        title: "Placement Tracking",
        text: "Follow every candidate from submission to placement in real-time. Know exactly where things stand at every stage of the process.",
        color: "#FFE66D",
    },
    {
        icon: "fa-duotone fa-regular fa-coins",
        title: "Platform Economics",
        text: "Our take rates are published for every tier. Starter, Pro, Partner -- you always know what the platform earns and what you keep.",
        color: "#A78BFA",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "Contract Terms",
        text: "Standardized agreements mean every split deal has the same clear terms. No custom side deals, no ambiguity, no disputes.",
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Status Notifications",
        text: "Get notified at every milestone -- submission received, interview scheduled, offer extended, placement confirmed, payment processed.",
        color: "#4ECDC4",
    },
];

const privacyCommitments = [
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Data Minimization",
        text: "We collect only what we need to operate the platform. No surplus data harvesting, no selling information to third parties.",
    },
    {
        icon: "fa-duotone fa-regular fa-lock",
        title: "Encryption Everywhere",
        text: "All data is encrypted in transit and at rest. Your candidate information, financial details, and communications are protected at every layer.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Access Controls",
        text: "Role-based permissions ensure people only see what they need. Candidates control their own data visibility. Companies see only their roles.",
    },
    {
        icon: "fa-duotone fa-regular fa-trash-can-clock",
        title: "Data Retention",
        text: "Clear retention policies. When data is no longer needed, it is removed. You can request deletion of your account and data at any time.",
    },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TransparencyPage() {
    return (
        <TransparencyAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-hero relative min-h-[70vh] overflow-hidden flex items-center"
                style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full opacity-0"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full opacity-0"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 opacity-0"
                        style={{ backgroundColor: "#A78BFA" }} />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 opacity-0"
                        style={{ backgroundColor: "#FF6B6B" }} />
                    {/* Triangle */}
                    <div className="memphis-shape absolute top-[18%] left-[45%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "25px solid transparent",
                            borderRight: "25px solid transparent",
                            borderBottom: "43px solid #FFE66D",
                            transform: "rotate(-10deg)",
                        }} />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[20%] right-[45%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4ECDC4" }} />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    {/* Eye / transparency symbol */}
                    <svg className="memphis-shape absolute top-[35%] right-[6%] opacity-0" width="50" height="30" viewBox="0 0 50 30">
                        <ellipse cx="25" cy="15" rx="22" ry="12" fill="none" stroke="#4ECDC4" strokeWidth="3" />
                        <circle cx="25" cy="15" r="6" fill="#4ECDC4" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category tag */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                <i className="fa-duotone fa-regular fa-eye"></i>
                                Our Commitment
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em]"
                                style={{ color: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-shield-check mr-1"></i>
                                Trust First
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0"
                            style={{ color: "#FFFFFF" }}>
                            We Show{" "}
                            <span className="relative inline-block">
                                <span style={{ color: "#4ECDC4" }}>Our Work</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#4ECDC4" }} />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 opacity-0"
                            style={{ color: "rgba(255,255,255,0.7)" }}>
                            Recruiting has been opaque for too long. Hidden fees, unclear processes,
                            and black-box economics. We believe transparency isn&apos;t a feature --
                            it&apos;s the foundation everything else is built on.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className="stat-block p-6 md:p-8 text-center opacity-0"
                            style={{
                                backgroundColor: stat.color,
                                color: stat.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                            }}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTRO - Why Transparency Matters
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-intro py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="intro-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                style={{ color: "#1A1A2E" }}>
                                Why Transparency{" "}
                                <span style={{ color: "#FF6B6B" }}>Matters</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                The recruiting industry has operated behind closed doors for decades.
                                Fees are negotiated in private. Platform economics are hidden. Recruiters
                                do the work but rarely see the full picture of how their earnings are calculated.
                                Candidates are kept in the dark about who is representing them and why.
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                We built Splits Network on a different premise: that trust is earned through
                                visibility. When recruiters can see exactly how fees are split, when candidates
                                can track their own progress, and when companies know exactly what they are
                                paying for -- everyone makes better decisions.
                            </p>

                            <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                This page is our commitment in practice. Everything we share, how we handle
                                data, and what we believe about operating in the open.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 1
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#4ECDC4" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#4ECDC4" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#FFFFFF" }}>
                            Trust isn&apos;t built by telling people to trust you.
                            It&apos;s built by showing them everything and letting
                            them decide for themselves.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #4ECDC4" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
                                -- Splits Network Founding Principle
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10"
                            style={{ backgroundColor: "#4ECDC4" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TRANSPARENCY COMMITMENTS - Old Way vs New Way
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-comparison py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                The Shift
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Opacity vs{" "}
                                <span style={{ color: "#4ECDC4" }}>Openness</span>
                            </h2>
                        </div>

                        <div className="comparison-grid grid md:grid-cols-2 gap-8">
                            {/* Old Way */}
                            <div className="comparison-card p-8 border-4 opacity-0"
                                style={{ borderColor: "#FF6B6B", backgroundColor: "#FFFFFF" }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center"
                                        style={{ backgroundColor: "#FF6B6B" }}>
                                        <i className="fa-duotone fa-regular fa-eye-slash text-xl" style={{ color: "#FFFFFF" }}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        The Opaque Way
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {oldWayItems.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                            style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                            <i className="fa-duotone fa-regular fa-xmark mt-0.5 flex-shrink-0"
                                                style={{ color: "#FF6B6B" }}></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* New Way */}
                            <div className="comparison-card p-8 border-4 opacity-0"
                                style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center"
                                        style={{ backgroundColor: "#4ECDC4" }}>
                                        <i className="fa-duotone fa-regular fa-eye text-xl" style={{ color: "#1A1A2E" }}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        The Splits Way
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {newWayItems.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                            style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                            <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0"
                                                style={{ color: "#4ECDC4" }}></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
                <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80"
                    alt="Open collaborative workspace with transparent glass walls"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: "400px" }}
                />
                {/* Retro color overlay */}
                <div className="absolute inset-0" style={{ backgroundColor: "#1A1A2E", opacity: 0.75 }} />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 pointer-events-none"
                    style={{ borderColor: "#FFE66D" }} />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight"
                            style={{ color: "#FFFFFF" }}>
                            When everyone can see the{" "}
                            <span style={{ color: "#FFE66D" }}>whole picture</span>
                            , better decisions follow.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                WHAT WE SHARE - Transparency Features Grid
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-share py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="share-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Full Visibility
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                What We{" "}
                                <span style={{ color: "#FF6B6B" }}>Share</span>
                            </h2>
                        </div>

                        <div className="share-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shareFeatures.map((feature, index) => (
                                <div key={index}
                                    className="share-card relative p-6 md:p-8 border-4 opacity-0"
                                    style={{ borderColor: feature.color, backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: feature.color }} />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: feature.color }}>
                                        <i className={`${feature.icon} text-2xl`} style={{ color: feature.color }}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3"
                                        style={{ color: "#1A1A2E" }}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.75 }}>
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
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#FF6B6B" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#FF6B6B" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#1A1A2E" }}>
                            The platforms that hide their economics are the ones
                            with something to hide. We publish ours because we
                            are proud of them.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FF6B6B" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B6B" }}>
                                -- Splits Network Team
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#FF6B6B" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                DATA & PRIVACY
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-privacy py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="privacy-section opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                    style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                    Your Data
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                    style={{ color: "#FFFFFF" }}>
                                    Privacy &amp;{" "}
                                    <span style={{ color: "#FFE66D" }}>Protection</span>
                                </h2>
                                <p className="text-lg leading-relaxed mt-6 max-w-3xl mx-auto"
                                    style={{ color: "rgba(255,255,255,0.7)" }}>
                                    Transparency goes both ways. We are open about our business, and we are
                                    equally serious about protecting yours. Here is how we handle data.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {privacyCommitments.map((item, index) => (
                                    <div key={index}
                                        className="p-6 md:p-8 border-4"
                                        style={{ borderColor: "#FFE66D", backgroundColor: "rgba(255,255,255,0.03)" }}>
                                        <div className="w-12 h-12 flex items-center justify-center mb-4"
                                            style={{ backgroundColor: "#FFE66D" }}>
                                            <i className={`${item.icon} text-xl`} style={{ color: "#1A1A2E" }}></i>
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-wide mb-3"
                                            style={{ color: "#FFE66D" }}>
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed"
                                            style={{ color: "rgba(255,255,255,0.65)" }}>
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FINAL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#A78BFA" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#A78BFA" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#1A1A2E" }}>
                            Radical transparency is not a marketing strategy.
                            It is how we operate. Every fee, every process,
                            every decision -- visible by default.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #A78BFA" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#A78BFA" }}>
                                -- Splits Network, 2026
                            </span>
                        </div>
                        <div className="absolute top-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#A78BFA" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA SECTION - 3 Audience Cards
               ══════════════════════════════════════════════════════════════ */}
            <section className="transparency-cta relative py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6"
                            style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                            See For Yourself
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1]"
                            style={{ color: "#FFFFFF" }}>
                            Experience{" "}
                            <span style={{ color: "#4ECDC4" }}>Transparency</span>{" "}
                            First-Hand
                        </h2>
                        <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Join a platform where every fee is visible, every process is trackable,
                            and every commitment is backed by action.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FF6B6B", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FF6B6B" }}>
                                <i className="fa-duotone fa-regular fa-user-tie text-xl" style={{ color: "#FFFFFF" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                See your splits before you start
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FFE66D", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-building text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Companies
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Know exactly what you pay for
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#4ECDC4" }}>
                                <i className="fa-duotone fa-regular fa-user text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Candidates
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Track your journey in real-time
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                            Questions about our transparency commitments? We are always open.
                        </p>
                        <a href="mailto:hello@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm"
                            style={{ color: "#FFE66D" }}>
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </TransparencyAnimator>
    );
}
