import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { CareersAnimator } from "./careers-animator";

export const metadata: Metadata = {
    title: "Careers at Splits Network | Build What Recruiting Deserves",
    description:
        "Join the team replacing recruiting infrastructure built twenty years ago. Remote-first, meaningful equity, and problems that matter.",
    ...buildCanonical("/public/careers-memphis"),
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
    { value: "100%", label: "Remote-First Team", accent: "coral" as AccentKey },
    { value: "12", label: "Engineers Shipping Weekly", accent: "teal" as AccentKey },
    { value: "$4.7B", label: "Market We Are Building For", accent: "yellow" as AccentKey },
    { value: "3x", label: "Revenue Growth Year Over Year", accent: "purple" as AccentKey },
];

const coreValues = [
    {
        icon: "fa-duotone fa-regular fa-rocket",
        title: "Ship It",
        description:
            "We deploy multiple times a day. We write tests, we review code, and we push to production. Perfection is a direction, not a destination. If it works and it is correct, it ships. If it needs iteration, it ships and then it improves.",
        accent: "coral" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Transparency Is The Product",
        description:
            "Our entire platform is built on the premise that visibility creates trust. We apply the same principle internally. Roadmaps are public. Metrics are shared. Decisions are documented. You will never wonder why something was built or why a direction changed.",
        accent: "teal" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Own The Outcome",
        description:
            "We hire people who take responsibility for results, not just tasks. You will own features end to end -- from problem definition through implementation, launch, and measurement. Nobody here waits for permission to solve a problem they can see.",
        accent: "yellow" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Build For The Recruiter",
        description:
            "Every decision gets filtered through one question: does this make the recruiter's day better? We talk to users constantly. We watch sessions. We read support tickets. The best product insights come from the people doing the work, not from conference rooms.",
        accent: "purple" as AccentKey,
    },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-globe",
        title: "Remote-First, Not Remote-Allowed",
        description:
            "Every process, every meeting, every decision is built for distributed teams. No headquarters advantage. No timezone favoritism. Your work speaks -- your location does not.",
        accent: "coral" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Meaningful Equity",
        description:
            "Early-stage equity with transparent terms. You are building something -- you should own a piece of it. We share the cap table context so you understand exactly what your grant means.",
        accent: "teal" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Learning Budget",
        description:
            "$2,500 per year for conferences, courses, books, and tools. Spend it on whatever makes you better at your craft. No approval process, no justification forms.",
        accent: "yellow" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Unlimited PTO (That People Actually Use)",
        description:
            "We track minimum time off, not maximum. Leadership takes real vacations and expects you to do the same. Burnout does not ship features.",
        accent: "purple" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-laptop",
        title: "Top-Tier Equipment",
        description:
            "Pick your setup. MacBook Pro, standing desk, monitor, peripherals -- whatever you need to do your best work. We ship it to your door.",
        accent: "coral" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-heart-pulse",
        title: "Health And Wellness",
        description:
            "Full medical, dental, and vision coverage. Mental health support included. We invest in the people building the platform, not just the platform itself.",
        accent: "teal" as AccentKey,
    },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function CareersMemphisPage() {
    return (
        <CareersAnimator>
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
                        {/* Badge */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                Join The Team
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            Build What Recruiting{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Deserves</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            The recruiting industry runs on infrastructure built twenty years ago.
                            We are replacing it. If you want to work on problems that matter --
                            transparency, collaboration, fairness -- this is where you start.
                        </p>

                        {/* CTA */}
                        <div className="hero-cta opacity-0">
                            <a href="#open-roles"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 text-sm transition-transform hover:-translate-y-1 bg-coral border-coral text-white">
                                View Open Roles
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="careers-stats py-0 overflow-hidden">
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
                MISSION SECTION — "THE PROBLEM IS INFRASTRUCTURE"
               ══════════════════════════════════════════════════════════════ */}
            <section className="careers-mission py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="mission-content opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                The Problem Is{" "}
                                <span className="text-coral">Infrastructure</span>
                            </h2>

                            <p className="text-base leading-relaxed mb-6 text-dark/80">
                                Split-fee recruiting is a $4.7 billion market operating on handshakes
                                and spreadsheets. Recruiters hoard job orders because the tools punish
                                collaboration. Companies work with single agencies because there is no
                                infrastructure to manage multiple partners transparently. Candidates get
                                caught in the middle, represented by whoever reached them first instead
                                of whoever represents them best.
                            </p>

                            <p className="text-base leading-relaxed mb-6 text-dark/80">
                                Splits Network exists to fix that. We built the platform that makes
                                split-fee recruiting a first-class workflow -- tracked, transparent, and
                                profitable for everyone involved. Every interaction is visible. Every
                                contribution is measured. Every payment is tied to a verified outcome.
                            </p>

                            <p className="text-base leading-relaxed text-dark/80">
                                This is not an incremental improvement to existing recruiting software.
                                This is new infrastructure for a model the industry has wanted for
                                decades but never had the technology to support. We are a small team
                                building something large, and we need people who see the same gap we do.
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
                            We did not set out to build another ATS. We set out to build
                            the infrastructure that makes collaboration more profitable
                            than isolation.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network founding team
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                VALUES GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="careers-values py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="values-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                What We Value
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                How We{" "}
                                <span className="text-purple">Work</span>
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
                OPEN ROLES
               ══════════════════════════════════════════════════════════════ */}
            <section id="open-roles" className="careers-roles py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="roles-content opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                    Open Positions
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Find Your{" "}
                                    <span className="text-coral">Role</span>
                                </h2>
                            </div>

                            <p className="text-base leading-relaxed mb-10 text-dark/80">
                                We are looking for people who build with conviction. Engineers who care
                                about the problem, not just the stack. Designers who think in systems.
                                Operators who treat every process as a product. If you have shipped real
                                software to real users and you want to do it at a company where your
                                work reaches an entire industry -- keep reading.
                            </p>

                            {/* Placeholder for dynamic job listings */}
                            <div className="border-4 border-dark/10 p-8 md:p-12 text-center">
                                <i className="fa-duotone fa-regular fa-briefcase text-4xl text-dark/20 mb-4"></i>
                                <p className="text-base font-bold uppercase tracking-wide text-dark/50 mb-2">
                                    No open roles right now
                                </p>
                                <p className="text-sm text-dark/40">
                                    Send your resume to{" "}
                                    <a href="mailto:careers@splits.network" className="text-coral font-bold uppercase tracking-wider">
                                        careers@splits.network
                                    </a>
                                    {" "}and we will reach out when a role fits.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="careers-benefits py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="benefits-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                The Upside
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                What You{" "}
                                <span className="text-teal">Get</span>
                            </h2>
                        </div>

                        <div className="benefits-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index}
                                    className={`benefit-card relative p-6 md:p-8 border-4 ${ACCENT[benefit.accent].border} bg-white opacity-0`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${ACCENT[benefit.accent].bg}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${ACCENT[benefit.accent].border}`}>
                                        <i className={`${benefit.icon} text-2xl ${ACCENT[benefit.accent].text}`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
                                        {benefit.description}
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
                            Small team. Large problem. No bureaucracy. Every engineer
                            here touches production code that reaches thousands of
                            recruiters within their first week.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Engineering at Splits Network
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="careers-cta relative py-24 overflow-hidden bg-dark">
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
                            Join Us
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            The Industry Is{" "}
                            <span className="text-coral">Moving</span>
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Split-fee recruiting is being rebuilt from the ground up. The teams
                            that build this infrastructure will define how an entire industry
                            operates for the next decade. We are hiring the people who want to
                            be part of that.
                        </p>
                        <a href="#open-roles"
                            className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 text-sm transition-transform hover:-translate-y-1 bg-coral border-coral text-white">
                            View Open Roles
                        </a>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-cream/50">
                            No open role that fits? Reach us at
                        </p>
                        <a href="mailto:careers@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            careers@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </CareersAnimator>
    );
}
