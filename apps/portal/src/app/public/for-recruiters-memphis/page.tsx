import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/lib/seo";
import { RecruitersAnimator } from "./recruiters-animator";

export const metadata: Metadata = {
    title: "For Recruiters | Splits Network",
    description:
        "Join thousands of recruiters earning more through collaborative split-fee placements. Transparent fees, integrated ATS, and unlimited earning potential on Splits Network.",
    openGraph: {
        title: "For Recruiters | Splits Network",
        description:
            "Join thousands of recruiters earning more through collaborative split-fee placements. Transparent fees, integrated ATS, and unlimited earning potential.",
        url: "https://splits.network/public/for-recruiters-memphis",
    },
    ...buildCanonical("/public/for-recruiters-memphis"),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    { value: "2,500+", label: "Active Recruiters" },
    { value: "$85M+", label: "Fees Distributed" },
    { value: "12,000+", label: "Successful Placements" },
    { value: "14 Days", label: "Avg. Time to First Placement" },
];

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-lock",
        text: "Roles locked inside agency silos you will never access",
    },
    {
        icon: "fa-duotone fa-regular fa-table-cells",
        text: "Spreadsheets, email chains, and fragmented candidate tracking",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        text: "Opaque fee structures where you discover your cut after the fact",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake-slash",
        text: "Split deals built on handshakes with no enforcement or tracking",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        text: "Payment disputes that drag out for months with no resolution",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-xmark",
        text: "Isolation. Working harder alone instead of earning more together",
    },
];

const features = [
    {
        icon: "fa-duotone fa-regular fa-store",
        title: "Split-Fee Marketplace",
        text: "Access curated roles that match your niche. Transparent fee terms on every listing. No cold outreach required.",
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Integrated ATS",
        text: "Track every candidate in one clean pipeline. Real-time status updates. Submissions, stages, and feedback in a single view.",
    },
    {
        icon: "fa-duotone fa-regular fa-messages",
        title: "Built-In Messaging",
        text: "Coordinate with hiring companies and partner recruiters directly. No more scattered email threads or missed context.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Analytics Dashboard",
        text: "Track placement velocity, pipeline health, and earnings in real time. Data-driven decisions, not guesswork.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Automated Payouts",
        text: "Fees calculated and distributed automatically on verified placement milestones. No invoicing. No chasing payments.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "AI-Powered Matching",
        text: "Surface the best candidate-job fits instantly. Reduce time-to-fill and increase placement success rates.",
    },
];

const howSteps = [
    {
        number: "01",
        title: "Join the Network",
        text: "Create your recruiter profile in five minutes. Choose your subscription tier and get verified.",
        icon: "fa-duotone fa-regular fa-user-check",
    },
    {
        number: "02",
        title: "Browse and Claim Roles",
        text: "Access the marketplace. Filter by industry, location, salary, and fee percentage. Opt in to roles that match your expertise.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        number: "03",
        title: "Submit and Earn",
        text: "Present quality candidates through the ATS. When placements close, fees are split automatically. You earn 20-40% based on your tier.",
        icon: "fa-duotone fa-regular fa-money-bill-wave",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForRecruitersMemphisPage() {
    return (
        <RecruitersAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[75vh] overflow-hidden flex items-center bg-dark">
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
                        <div className="hero-tag flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-cream">
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                For Recruiters
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                            Stop Recruiting{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Alone.</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>{" "}
                            Start Earning{" "}
                            <span className="text-teal">Together.</span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            The split-fee marketplace built for recruiters who refuse to leave
                            money on the table. Access roles you would never find alone. Submit
                            candidates through a real ATS. Get paid automatically when
                            placements close. No handshake deals. No spreadsheets. No excuses.
                        </p>

                        <div className="hero-cta opacity-0">
                            <Link href="/sign-up"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-sm transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                Start Recruiting Today
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="recruiters-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => {
                        const colors = [
                            "bg-coral text-cream",
                            "bg-teal text-cream",
                            "bg-yellow text-dark",
                            "bg-purple text-cream",
                        ];
                        return (
                            <div key={index}
                                className={`stat-block p-6 md:p-8 text-center opacity-0 ${colors[index]}`}>
                                <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PAIN POINTS — The Old Way
               ══════════════════════════════════════════════════════════════ */}
            <section className="pain-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="pain-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                Sound Familiar?
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                The Old Way Is{" "}
                                <span className="text-coral">Broken</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {painPoints.map((pain, index) => (
                                <div key={index}
                                    className="pain-item flex items-start gap-4 p-5 border-4 border-dark/10 opacity-0">
                                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-coral">
                                        <i className={`${pain.icon} text-cream`}></i>
                                    </div>
                                    <p className="text-base leading-relaxed text-dark/80">
                                        {pain.text}
                                    </p>
                                </div>
                            ))}
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
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                            Every recruiter has a candidate someone else needs.
                            Every company has a role someone else can fill.
                            The platform that connects them wins.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network
                            </span>
                        </div>
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FEATURES GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="features-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Platform
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Everything You Need.{" "}
                                <span className="text-teal">Nothing You Don&apos;t.</span>
                            </h2>
                        </div>

                        <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => {
                                const borderColors = [
                                    "border-coral",
                                    "border-teal",
                                    "border-purple",
                                    "border-yellow",
                                    "border-coral",
                                    "border-teal",
                                ];
                                const accentBg = [
                                    "bg-coral",
                                    "bg-teal",
                                    "bg-purple",
                                    "bg-yellow",
                                    "bg-coral",
                                    "bg-teal",
                                ];
                                const iconColor = [
                                    "text-cream",
                                    "text-cream",
                                    "text-cream",
                                    "text-dark",
                                    "text-cream",
                                    "text-cream",
                                ];
                                return (
                                    <div key={index}
                                        className={`feature-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${borderColors[index]}`}>
                                        <div className={`absolute top-0 right-0 w-10 h-10 ${accentBg[index]}`} />
                                        <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${borderColors[index]}`}>
                                            <i className={`${feature.icon} text-2xl ${iconColor[index] === "text-cream" ? borderColors[index].replace("border-", "text-") : "text-dark"}`}></i>
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/75">
                                            {feature.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS
               ══════════════════════════════════════════════════════════════ */}
            <section className="how-section py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="how-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Process
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                Three Steps.{" "}
                                <span className="text-yellow">Zero Complexity.</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {howSteps.map((step, index) => (
                                <div key={index}
                                    className="how-step relative p-8 border-4 border-cream/10 opacity-0">
                                    <div className="text-6xl font-black text-cream/10 mb-4 leading-none">
                                        {step.number}
                                    </div>
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 bg-yellow">
                                        <i className={`${step.icon} text-xl text-dark`}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-cream">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-cream/65">
                                        {step.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                COMPARISON — Old Way vs Split-Fee Way
               ══════════════════════════════════════════════════════════════ */}
            <section className="comparison-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                Compare
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Same Effort.{" "}
                                <span className="text-purple">Different Outcome.</span>
                            </h2>
                        </div>

                        <div className="comparison-grid grid md:grid-cols-2 gap-8">
                            {/* Old Way */}
                            <div className="comparison-card p-8 border-4 border-coral bg-white opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-coral">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-xl text-cream"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                        Solo Recruiting
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Cold outreach to companies who already have agencies",
                                        "Tracking candidates in spreadsheets and email threads",
                                        "Fee structures you discover after submitting",
                                        "Payment terms negotiated deal by deal",
                                        "Working harder but not earning more",
                                        "Competing against recruiters with larger networks",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                            <i className="fa-duotone fa-regular fa-xmark mt-0.5 flex-shrink-0 text-coral"></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* New Way */}
                            <div className="comparison-card p-8 border-4 border-teal bg-white opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-teal">
                                        <i className="fa-duotone fa-regular fa-rocket text-xl text-dark"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                        Splits Network
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Curated marketplace of roles with transparent fee terms",
                                        "Integrated ATS with real-time pipeline tracking",
                                        "Fee percentages visible before you opt into any role",
                                        "Automated payouts on verified placement milestones",
                                        "Collaborate with 2,500+ recruiters to fill faster",
                                        "AI-powered matching puts the right roles in front of you",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                            <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-teal"></i>
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
                SOCIAL PROOF
               ══════════════════════════════════════════════════════════════ */}
            <section className="proof-section py-16 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="proof-content max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-coral opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-coral">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                            $85 million in fees distributed.
                            12,000 successful placements.
                            2,500 recruiters who stopped working
                            alone and started earning more.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Splits Network, By The Numbers
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="cta-section relative py-24 overflow-hidden bg-dark">
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
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-cream">
                            Your Move
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-cream">
                            Ready To{" "}
                            <span className="text-coral">Earn More</span>{" "}
                            With Less Hustle?
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Join 2,500+ recruiters who replaced cold outreach with curated
                            marketplace access. Free to start. No lock-in. No risk.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link href="/sign-up"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-sm text-center transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-user-plus mr-2"></i>
                                Start Your Free Account
                            </Link>
                            <Link href="/public/transparency"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-yellow text-yellow text-sm text-center transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-chart-pie mr-2"></i>
                                See Fee Structure
                            </Link>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { value: "5 min", label: "From Signup to First Application", border: "border-coral" },
                            { value: "$0", label: "Start Completely Free", border: "border-yellow" },
                            { value: "$8,500+", label: "Average Monthly Earnings", border: "border-teal" },
                        ].map((stat, index) => (
                            <div key={index}
                                className={`cta-stat p-6 border-4 text-center opacity-0 ${stat.border}`}>
                                <div className="text-2xl md:text-3xl font-black text-cream mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-[0.12em] text-cream/60">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </RecruitersAnimator>
    );
}
