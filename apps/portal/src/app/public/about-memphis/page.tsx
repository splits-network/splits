import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { AboutAnimator } from "./about-animator";

export const metadata: Metadata = {
    title: "About Splits Network | The Split-Fee Recruiting Platform",
    description:
        "Splits Network was built from the ground up for split-fee recruiting. Transparent fees, tracked pipelines, automatic payouts. This is how collaborative recruiting should work.",
    ...buildCanonical("/public/about-memphis"),
};

// ── Accent color map ────────────────────────────────────────────────────────

const ACCENT = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
} as const;

type AccentKey = keyof typeof ACCENT;

// ── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    { value: "2.4x", label: "Faster placements via splits", accent: "coral" as AccentKey },
    { value: "$4.7B", label: "Split-fee market by 2027", accent: "teal" as AccentKey },
    { value: "89%", label: "Candidate satisfaction increase", accent: "yellow" as AccentKey },
    { value: "100%", label: "Fee transparency, always", accent: "purple" as AccentKey },
];

const coreValues = [
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Transparency",
        description:
            "Every fee, every split, every transaction is crystal clear. No hidden percentages. No mystery math. No surprise deductions. The same numbers on every screen.",
        accent: "coral" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Fairness",
        description:
            "Recruiters deserve the lion's share of placement fees. We take only what we need to run a sustainable platform. Your work, your money.",
        accent: "teal" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-lightbulb",
        title: "Simplicity",
        description:
            "Complex processes should feel simple. We hide the complexity so you can focus on what matters: making great placements, not wrestling with software.",
        accent: "yellow" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Community",
        description:
            "More than a platform. A network of recruiters who support and collaborate with each other. Your competitors become your partners.",
        accent: "purple" as AccentKey,
    },
];

const timelineEvents = [
    {
        year: "2024",
        title: "The Problem",
        text: "Split-fee recruiting existed for decades but the infrastructure didn't. Deals ran on handshakes, spreadsheets, and email threads. Disputes were common. Payments were slow. Good recruiters avoided splits entirely.",
        accent: "coral" as AccentKey,
    },
    {
        year: "2024",
        title: "The Build",
        text: "We started building Splits Network from the ground up. Not another general-purpose ATS with split-fee bolted on. A purpose-built platform where collaborative recruiting is the core, not an afterthought.",
        accent: "teal" as AccentKey,
    },
    {
        year: "2025",
        title: "The Launch",
        text: "Platform goes live with full ATS integration, transparent fee structures, automated payouts, and a candidate portal. Every feature designed around the split-fee workflow.",
        accent: "yellow" as AccentKey,
    },
    {
        year: "2026",
        title: "The Network Effect",
        text: "AI-powered matching connects the right recruiter to the right role automatically. Real-time analytics drive smarter decisions. The network grows and every new member makes it stronger for everyone.",
        accent: "purple" as AccentKey,
    },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function AboutMemphisPage() {
    return (
        <AboutAnimator>
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
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle */}
                    <svg className="memphis-shape absolute top-[18%] left-[45%] opacity-0" width="50" height="43" viewBox="0 0 50 43">
                        <polygon points="25,0 50,43 0,43" className="fill-yellow" transform="rotate(-10 25 21.5)" />
                    </svg>
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[20%] right-[45%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" className="stroke-yellow" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" className="stroke-yellow" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category badge */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-building"></i>
                                About Us
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-yellow">
                                <i className="fa-duotone fa-regular fa-rocket mr-1"></i>
                                Est. 2024
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            We Built The Platform{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Recruiting</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>{" "}
                            Was Missing
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            Split-fee recruiting existed for decades. The infrastructure
                            didn&apos;t. Splits Network is the purpose-built platform that
                            replaces handshake deals with tracked pipelines, transparent
                            economics, and automatic payouts.
                        </p>

                        {/* Founder badge */}
                        <div className="hero-badge flex items-center gap-4 opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center font-black text-lg bg-teal text-dark">
                                SN
                            </div>
                            <div>
                                <div className="font-bold uppercase tracking-wide text-sm text-white">
                                    Splits Network
                                </div>
                                <div className="text-xs uppercase tracking-wider text-cream/50">
                                    Built by recruiters, for recruiters
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${ACCENT[stat.accent].bg} ${stat.accent === "yellow" || stat.accent === "teal" ? "text-dark" : "text-white"}`}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MISSION SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-mission py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="mission-content opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                What We&apos;re{" "}
                                <span className="text-coral">Building</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                For most of its history, the recruiting industry treated split-fee
                                deals as a side hustle. An afterthought bolted onto ATS platforms
                                built for something else entirely. The result? Deals managed over
                                email. Terms negotiated on phone calls. Payments tracked in
                                spreadsheets that nobody trusts.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                Splits Network changes that equation. We built a platform from the
                                ground up where split-fee recruiting is the core use case, not a
                                feature checkbox. Every workflow, every screen, every data model is
                                designed around the reality of how collaborative placements actually
                                work.
                            </p>

                            <p className="text-lg leading-relaxed text-dark/80">
                                One recruiter brings the role. Another brings the candidate. The
                                fee is split according to pre-agreed, visible terms. Payments are
                                automated. Disputes are nearly nonexistent. Everyone wins --
                                especially the candidate.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            The best recruiters don&apos;t hoard opportunities.
                            They share them. And when the infrastructure supports
                            that instinct, everyone wins.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- The Splits Network Philosophy
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CORE VALUES
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-values py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="values-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                What We Believe
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Core{" "}
                                <span className="text-purple">Values</span>
                            </h2>
                        </div>

                        <div className="values-grid grid md:grid-cols-2 gap-6">
                            {coreValues.map((value, index) => (
                                <div key={index}
                                    className={`value-card relative p-6 md:p-8 border-4 ${ACCENT[value.accent].border} bg-white opacity-0`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${ACCENT[value.accent].bg}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${ACCENT[value.accent].border}`}>
                                        <i className={`${value.icon} text-2xl ${ACCENT[value.accent].text}`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {value.title}
                                    </h3>
                                    <p className="text-base leading-relaxed text-dark/75">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-timeline py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="timeline-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Timeline
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                How We{" "}
                                <span className="text-yellow">Got Here</span>
                            </h2>
                        </div>

                        <div className="timeline-items space-y-0">
                            {timelineEvents.map((event, index) => (
                                <div key={index}
                                    className="timeline-item flex gap-6 md:gap-8 opacity-0">
                                    {/* Year column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-16 md:w-20 py-2 text-center font-black text-lg md:text-xl ${ACCENT[event.accent].bg} ${event.accent === "yellow" || event.accent === "teal" ? "text-dark" : "text-white"}`}>
                                            {event.year}
                                        </div>
                                        {index < timelineEvents.length - 1 && (
                                            <div className={`w-1 flex-grow ${ACCENT[event.accent].bg} opacity-30`}
                                                 style={{ minHeight: "40px" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className={`font-black text-lg md:text-xl uppercase tracking-wide mb-2 ${ACCENT[event.accent].text}`}>
                                            {event.title}
                                        </h3>
                                        <p className="text-base leading-relaxed text-cream/65">
                                            {event.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                THE TEAM
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-team py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="team-content opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                Built by{" "}
                                <span className="text-teal">Recruiters</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                Splits Network wasn&apos;t built by outsiders looking in. It was built
                                by people who lived the problem. Years of managing split placements
                                across spreadsheets, losing track of candidates in email threads, and
                                dealing with unclear fee agreements. We didn&apos;t just understand the
                                frustration -- we were the frustrated ones.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                We saw talented recruiters avoiding split placements entirely. Not
                                because they didn&apos;t want to collaborate, but because the tools to
                                make it work didn&apos;t exist. Companies were equally frustrated, trying
                                to manage multiple external recruiters without a unified system.
                            </p>

                            <p className="text-lg leading-relaxed text-dark/80">
                                So we built the platform we wished we had. Purpose-built for splits.
                                Designed around real recruiting workflows. Backed by modern technology
                                that&apos;s fast, reliable, and scales with your business. No legacy
                                systems. No compromises. No feature that exists just to check a box.
                            </p>
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
                            We didn&apos;t bolt split-fee onto an existing ATS.
                            We started with split-fee and built the ATS around it.
                            That&apos;s the difference.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Splits Network Team
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" className="stroke-purple" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                            Join the Network
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Ready To See{" "}
                            <span className="text-coral">Split-Fee</span>{" "}
                            Done Right?
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Splits Network is the platform built for exactly this.
                            Pick your path and get started today.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 border-coral text-center opacity-0 bg-white/[0.03]">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-white"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Access the split-fee marketplace
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-coral border-coral text-white">
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 border-yellow text-center opacity-0 bg-white/[0.03]">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-yellow">
                                <i className="fa-duotone fa-regular fa-building text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Companies
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Post roles, find vetted talent
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-yellow border-yellow text-dark">
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 border-teal text-center opacity-0 bg-white/[0.03]">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-user text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Candidates
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Free profile, real recruiters
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-teal border-teal text-dark">
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-cream/50">
                            Want to learn more? Explore the platform or get in touch.
                        </p>
                        <a href="mailto:hello@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </AboutAnimator>
    );
}
