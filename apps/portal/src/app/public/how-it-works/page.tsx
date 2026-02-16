import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { HowItWorksAnimator } from "./how-it-works-animator";

export const metadata: Metadata = {
    title: "How It Works | Splits Network",
    description:
        "See how Splits Network connects recruiters and companies for split placements, from role setup and submissions through interviews, hires, and payout tracking.",
    openGraph: {
        title: "How It Works | Splits Network",
        description:
            "See how Splits Network connects recruiters and companies for split placements, from role setup and submissions through interviews, hires, and payout tracking.",
        url: "https://splits.network/public/how-it-works",
    },
    ...buildCanonical("/public/how-it-works"),
};

// ─── Accent Lookup ───────────────────────────────────────────────────────────

const ACCENT = {
    coral:  { bg: "bg-coral",   text: "text-coral",   border: "border-coral" },
    teal:   { bg: "bg-teal",    text: "text-teal",    border: "border-teal" },
    yellow: { bg: "bg-yellow",  text: "text-yellow",  border: "border-yellow" },
    purple: { bg: "bg-purple",  text: "text-purple",  border: "border-purple" },
} as const;

type Accent = keyof typeof ACCENT;

// ─── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    { value: "6", label: "Simple Steps to Placement", accent: "coral" as Accent },
    { value: "2.4x", label: "Faster Fills via Splits", accent: "teal" as Accent },
    { value: "75%+", label: "Recruiter Share (Pro Tier)", accent: "yellow" as Accent },
    { value: "$0", label: "Upfront Cost for Companies", accent: "purple" as Accent },
];

const processSteps = [
    {
        step: "01",
        title: "Company Posts a Role",
        text: "A hiring company creates a job listing on Splits Network with clear requirements, compensation range, and a set placement fee percentage. The role goes live on the marketplace, visible to qualified recruiters instantly.",
        icon: "fa-duotone fa-regular fa-briefcase",
        accent: "coral" as Accent,
        detail: "Fee structure, requirements, and expectations are transparent from day one.",
    },
    {
        step: "02",
        title: "Recruiters Apply to Work It",
        text: "Specialized recruiters browse available roles and apply to work the ones matching their expertise. Higher-tier subscribers get priority access, but every qualified recruiter has a shot.",
        icon: "fa-duotone fa-regular fa-hand-wave",
        accent: "teal" as Accent,
        detail: "No cold outreach. No guesswork. Just matched expertise meeting open demand.",
    },
    {
        step: "03",
        title: "Candidates Are Submitted",
        text: "Approved recruiters submit vetted candidates directly into the company's pipeline. Each submission includes a full profile, resume, and the recruiter's notes on fit. Real-time tracking begins immediately.",
        icon: "fa-duotone fa-regular fa-user-plus",
        accent: "yellow" as Accent,
        detail: "Every submission is tracked. Every interaction is logged. No black holes.",
    },
    {
        step: "04",
        title: "Interviews & Evaluation",
        text: "The company reviews candidates, schedules interviews, and moves them through hiring stages -- all within the platform. Recruiters get automatic status updates so they can keep candidates informed.",
        icon: "fa-duotone fa-regular fa-comments",
        accent: "purple" as Accent,
        detail: "Recruiters stay in the loop. Candidates stay engaged. Companies stay organized.",
    },
    {
        step: "05",
        title: "Placement Is Made",
        text: "When a candidate accepts an offer, the placement is logged with salary details. The platform verifies the hire and calculates the split automatically. No manual math. No disputes.",
        icon: "fa-duotone fa-regular fa-handshake",
        accent: "coral" as Accent,
        detail: "Verified placements mean verified payments. Trust is built into the system.",
    },
    {
        step: "06",
        title: "Split Payment Processed",
        text: "The placement fee is calculated and split according to pre-agreed terms. The recruiter receives their share, the platform takes its portion, and everything is tracked in a transparent earnings dashboard.",
        icon: "fa-duotone fa-regular fa-coins",
        accent: "teal" as Accent,
        detail: "Automatic calculations. Transparent breakdowns. Everyone sees the numbers.",
    },
];

const audienceCards = {
    recruiters: {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "For Recruiters",
        accent: "coral" as Accent,
        items: [
            "Browse open roles that match your specialization",
            "Submit candidates directly into company pipelines",
            "Track candidate progress in real-time",
            "Get paid automatically when placements close",
            "Higher tiers unlock better payout percentages",
            "Build your reputation with verified placement history",
        ],
    },
    companies: {
        icon: "fa-duotone fa-regular fa-building",
        title: "For Companies",
        accent: "teal" as Accent,
        items: [
            "Post roles for free -- pay only on successful hires",
            "Set your own fee percentages and terms upfront",
            "Receive submissions from specialized recruiters",
            "Manage your entire pipeline within the platform",
            "Automatic recruiter notifications at every stage",
            "Transparent fee calculations with no surprises",
        ],
    },
    candidates: {
        icon: "fa-duotone fa-regular fa-user",
        title: "For Candidates",
        accent: "yellow" as Accent,
        items: [
            "Get represented by recruiters who know your niche",
            "Track your application progress through a personal portal",
            "No duplicate outreach -- recruiters collaborate, not compete",
            "Better representation means better opportunities",
            "Free profile creation with real recruiter connections",
            "Clear communication throughout the entire process",
        ],
    },
};

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Total Transparency",
        text: "Every fee, every split, every status update is visible to all parties. No hidden costs, no surprise deductions, no ambiguity about where things stand.",
        accent: "coral" as Accent,
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Faster Placements",
        text: "Multiple specialized recruiters working the same role means deeper candidate pools and faster fills. Split-fee roles fill 2.4x faster on average.",
        accent: "teal" as Accent,
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Built-In Trust",
        text: "Pre-agreed terms, verified placements, and automated payments eliminate the disputes that plague traditional split-fee arrangements.",
        accent: "yellow" as Accent,
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Expanded Reach",
        text: "Independent recruiters access roles they would never see on their own. Companies get coverage from specialists across every niche and market.",
        accent: "purple" as Accent,
    },
    {
        icon: "fa-duotone fa-regular fa-robot",
        title: "AI-Powered Matching",
        text: "Smart algorithms connect the right recruiters to the right roles based on track record, specialization, and placement history.",
        accent: "coral" as Accent,
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Automated Payments",
        text: "No chasing invoices. No manual calculations. When a placement is verified, the split is calculated and payment is processed automatically.",
        accent: "teal" as Accent,
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
    return (
        <HowItWorksAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-hero relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle — CSS triangle uses border hack, keep inline */}
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
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag — SVG attrs stay inline */}
                    <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign — SVG attrs stay inline */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    {/* Extra shapes for How It Works page */}
                    <div className="memphis-shape absolute top-[35%] right-[5%] w-8 h-8 rounded-full border-[3px] border-yellow opacity-0" />
                    {/* Plus sign — SVG attrs stay inline */}
                    <svg className="memphis-shape absolute bottom-[8%] right-[15%] opacity-0" width="40" height="40" viewBox="0 0 40 40">
                        <line x1="20" y1="4" x2="20" y2="36" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
                        <line x1="4" y1="20" x2="36" y2="20" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category + read time */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                <i className="fa-duotone fa-regular fa-route"></i>
                                Process Guide
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-yellow">
                                <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                6 Steps to Placement
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            How Split-Fee Recruiting{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Actually Works</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            From posting a role to splitting the placement fee -- here is the
                            complete process, step by step. No mystery. No fine print.
                            Just a transparent path from open role to successful hire.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-stats py-0 overflow-hidden">
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
                ARTICLE BODY - Introduction
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-intro py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="intro-content opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                The Split Placement{" "}
                                <span className="text-coral">Model</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                Splits Network connects companies who need talent with specialized recruiters
                                who know where to find it. Instead of one agency trying to be everything,
                                multiple recruiters collaborate on a single role -- each bringing their
                                unique network and expertise to the table.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                One side posts the role with clear terms. The other side brings the
                                candidate. When a hire is made, the placement fee is split according
                                to pre-agreed percentages. Everyone sees the numbers. Everyone gets paid.
                                No backroom deals.
                            </p>

                            <p className="text-lg leading-relaxed text-dark/80">
                                Here is exactly how every step works, from the moment a role goes live
                                to the moment the payment hits your account.
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
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            The best recruiter for a role is the one who knows the
                            right candidate. Split-fee models let that recruiter
                            find that role -- every time.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- The Split-Fee Advantage
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PROCESS TIMELINE — THE STAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-timeline py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="timeline-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Step by Step
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                The{" "}
                                <span className="text-yellow">Complete Process</span>
                            </h2>
                        </div>

                        <div className="timeline-items relative space-y-0">
                            {/* Connecting line */}
                            <div className="timeline-connector absolute left-[39px] md:left-[49px] top-0 bottom-0 w-1 bg-yellow opacity-20" />

                            {processSteps.map((event, index) => (
                                <div key={index}
                                    className="timeline-item flex gap-6 md:gap-8 opacity-0 relative"
                                    style={{ paddingBottom: index < processSteps.length - 1 ? "0" : undefined }}>
                                    {/* Step number column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`step-number w-20 md:w-24 h-20 md:h-24 flex flex-col items-center justify-center relative z-10 opacity-0 ${ACCENT[event.accent].bg}`}>
                                            <div className={`text-2xl md:text-3xl font-black leading-none ${event.accent === "yellow" || event.accent === "teal" ? "text-dark" : "text-white"}`}>
                                                {event.step}
                                            </div>
                                            <i className={`${event.icon} text-xs md:text-sm mt-1 ${event.accent === "yellow" || event.accent === "teal" ? "text-dark" : "text-cream/70"}`}></i>
                                        </div>
                                        {index < processSteps.length - 1 && (
                                            <div className={`w-1 flex-grow ${ACCENT[event.accent].bg} opacity-30`}
                                                style={{ minHeight: "40px" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-10 md:pb-12 pt-2">
                                        <h3 className={`font-black text-xl md:text-2xl uppercase tracking-wide mb-3 ${ACCENT[event.accent].text}`}>
                                            {event.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed mb-4 text-cream/65">
                                            {event.text}
                                        </p>
                                        {/* Detail callout */}
                                        <div className={`inline-flex items-start gap-3 px-4 py-3 border-l-4 ${ACCENT[event.accent].border} bg-white/[0.03]`}>
                                            <i className={`fa-duotone fa-regular fa-arrow-right mt-0.5 flex-shrink-0 ${ACCENT[event.accent].text}`}></i>
                                            <span className={`text-xs md:text-sm font-bold uppercase tracking-wide ${ACCENT[event.accent].text}`}>
                                                {event.detail}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK — Collaboration photo with overlay
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden min-h-[400px]">
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                    alt="Team collaborating in modern office"
                    className="w-full h-full object-cover absolute inset-0 min-h-[400px]"
                />
                {/* Retro color overlay */}
                <div className="absolute inset-0 bg-dark opacity-75" />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 border-yellow pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-white">
                            One role. Multiple specialists.{" "}
                            <span className="text-yellow">Better outcomes</span>{" "}
                            for everyone involved.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOR EACH AUDIENCE — Recruiters vs Companies vs Candidates
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-audience py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="audience-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Your Perspective
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                How It Works{" "}
                                <span className="text-purple">For You</span>
                            </h2>
                        </div>

                        <div className="audience-grid grid md:grid-cols-3 gap-8">
                            {Object.values(audienceCards).map((card, idx) => (
                                <div key={idx}
                                    className={`audience-card p-8 border-4 bg-white opacity-0 ${ACCENT[card.accent].border}`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-12 h-12 flex items-center justify-center ${ACCENT[card.accent].bg}`}>
                                            <i className={`${card.icon} text-xl ${card.accent === "yellow" || card.accent === "teal" ? "text-dark" : "text-white"}`}></i>
                                        </div>
                                        <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                            {card.title}
                                        </h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {card.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                                <i className={`fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 ${ACCENT[card.accent].text}`}></i>
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
                PULL QUOTE 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-coral opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-coral">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                            When terms are set upfront, payments are automated,
                            and every interaction is tracked -- collaboration
                            becomes the default, not the exception.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Transparency by Design
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-benefits py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="benefits-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                The Upside
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Why This{" "}
                                <span className="text-teal">Works</span>
                            </h2>
                        </div>

                        <div className="benefits-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index}
                                    className={`benefit-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${ACCENT[benefit.accent].border}`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${ACCENT[benefit.accent].bg}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${ACCENT[benefit.accent].border}`}>
                                        <i className={`${benefit.icon} text-2xl ${ACCENT[benefit.accent].text}`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
                                        {benefit.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MONEY FLOW — Example Breakdown
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-money py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="money-content text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Show Me the Money
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Example{" "}
                                <span className="text-yellow">Placement Split</span>
                            </h2>
                        </div>

                        <div className="money-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="money-block p-5 text-center border-4 border-coral opacity-0">
                                <div className="text-2xl md:text-3xl font-black mb-1 text-coral">$120k</div>
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-dark/70">
                                    Candidate Salary
                                </div>
                            </div>
                            <div className="money-block p-5 text-center border-4 border-teal opacity-0">
                                <div className="text-2xl md:text-3xl font-black mb-1 text-teal">20%</div>
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-dark/70">
                                    Placement Fee
                                </div>
                            </div>
                            <div className="money-block p-5 text-center border-4 border-purple opacity-0">
                                <div className="text-2xl md:text-3xl font-black mb-1 text-purple">$24k</div>
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-dark/70">
                                    Total Fee
                                </div>
                            </div>
                            <div className="money-block p-5 text-center border-4 border-yellow opacity-0">
                                <div className="text-2xl md:text-3xl font-black mb-1 text-yellow">75%</div>
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-dark/70">
                                    Recruiter Share
                                </div>
                            </div>
                        </div>

                        {/* Split result */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="money-block p-6 border-4 border-teal bg-teal/5 text-center opacity-0">
                                <i className="fa-duotone fa-regular fa-user-tie text-3xl mb-2 text-teal"></i>
                                <div className="text-3xl md:text-4xl font-black mb-1 text-teal">$18,000</div>
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-dark/70">
                                    Recruiter Receives
                                </div>
                            </div>
                            <div className="money-block p-6 border-4 border-purple bg-purple/5 text-center opacity-0">
                                <i className="fa-duotone fa-regular fa-handshake text-3xl mb-2 text-purple"></i>
                                <div className="text-3xl md:text-4xl font-black mb-1 text-purple">$6,000</div>
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-dark/70">
                                    Platform Share
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 border-l-4 border-teal text-sm leading-relaxed text-dark/70">
                            <i className="fa-duotone fa-regular fa-info-circle mr-2 text-teal"></i>
                            Platform share covers infrastructure, support, payment processing, and continued development.
                            Your percentage increases with higher subscription tiers -- Partner tier earns 85%.
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
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            The future of recruiting is not solo.
                            It is networked. It is transparent.
                            And it starts with one role posted
                            to the right marketplace.
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
                CTA SECTION — 3 audience cards
               ══════════════════════════════════════════════════════════════ */}
            <section className="hiw-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    {/* Zigzag -- SVG attrs stay inline */}
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                            Get Started
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Ready To See It{" "}
                            <span className="text-coral">In Action?</span>
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Join Splits Network and experience the split-fee model for yourself.
                            Pick your path and start today.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 border-coral bg-white/[0.03] text-center opacity-0">
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
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-white text-center text-sm transition-transform hover:-translate-y-1">
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 border-yellow bg-white/[0.03] text-center opacity-0">
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
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 border-teal bg-white/[0.03] text-center opacity-0">
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
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-cream/50">
                            Questions? We are happy to walk you through it.
                        </p>
                        <a href="mailto:hello@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </HowItWorksAnimator>
    );
}
