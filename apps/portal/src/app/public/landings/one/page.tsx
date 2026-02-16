import Link from "next/link";
import type { Metadata } from "next";
import { portalFaqs } from "@/components/landing/sections/faq-data";

export const metadata: Metadata = {
    title: "The Split-Fee Manifesto | Splits Network",
    description:
        "Recruiting is broken. Not the people -- the infrastructure. Split-fee recruiting replaces handshake deals with tracked pipelines, transparent economics, and automatic payouts. This is the manifesto.",
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

const manifestoStats = [
    { value: "68%", label: "OF SPLIT DEALS HAVE NO WRITTEN TERMS", accent: "coral" as AccentKey },
    { value: "$4.7B", label: "SPLIT-FEE MARKET BY 2027", accent: "teal" as AccentKey },
    { value: "2.4x", label: "FASTER PLACEMENTS WITH SHARED PIPELINES", accent: "yellow" as AccentKey },
    { value: "52", label: "DAYS AVG PAYMENT CYCLE (INDUSTRY)", accent: "purple" as AccentKey },
];

const infrastructureFailures = [
    {
        icon: "fa-duotone fa-regular fa-handshake-slash",
        title: "NOT A PEOPLE PROBLEM",
        body: "Recruiters are good at recruiting. The problem is that the infrastructure around split-fee collaboration was never built. Deals happen over phone calls. Terms live in email threads. Payments depend on memory and goodwill.",
        accent: "coral" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        title: "NOT A VISIBILITY PROBLEM",
        body: "Every ATS on the market tracks candidates. None of them track the split-fee relationship itself -- who brought the role, who submitted the candidate, what percentage was agreed to, when payment is due.",
        accent: "teal" as AccentKey,
    },
    {
        icon: "fa-duotone fa-regular fa-scale-unbalanced",
        title: "NOT A TRUST PROBLEM",
        body: "Trust between recruiters works fine when the stakes are low. But at $20K-$50K per placement, trust without enforcement is a liability. The industry needed rails. It got another spreadsheet template.",
        accent: "yellow" as AccentKey,
    },
];

const principles = [
    {
        number: "01",
        title: "TRANSPARENCY IS NON-NEGOTIABLE",
        body: "Every fee percentage, split ratio, and payout amount is visible to every party from the moment a role is posted. No back-channel conversations. No renegotiation after the fact. The same numbers on every screen.",
        icon: "fa-duotone fa-regular fa-eye",
        accent: "coral" as AccentKey,
    },
    {
        number: "02",
        title: "EVERY DOLLAR IS TRACKED",
        body: "From the company's placement fee to the recruiter's split payout, every dollar flows through a single auditable system. Invoicing is automatic. Distribution is automatic. Reconciliation is a dashboard, not a phone call.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        accent: "teal" as AccentKey,
    },
    {
        number: "03",
        title: "YOUR RELATIONSHIPS ARE YOURS",
        body: "The recruiter who submits a candidate owns that relationship. The platform coordinates the placement process -- tracking, communication, payment -- but it never inserts itself between a recruiter and their candidate.",
        icon: "fa-duotone fa-regular fa-shield-check",
        accent: "yellow" as AccentKey,
    },
    {
        number: "04",
        title: "TERMS ARE LOCKED BEFORE WORK BEGINS",
        body: "Split percentages, clawback windows, and guarantee periods are defined when the role is posted and accepted before the first resume is submitted. Not after. Not during. Before.",
        icon: "fa-duotone fa-regular fa-lock",
        accent: "purple" as AccentKey,
    },
    {
        number: "05",
        title: "CONTRIBUTION IS VISIBLE",
        body: "Every submission, every interview, every status change is timestamped and attributed. When it is time to pay out, the record speaks for itself. No disputes about who did what.",
        icon: "fa-duotone fa-regular fa-chart-gantt",
        accent: "coral" as AccentKey,
    },
];

const economicsBreakdown = [
    { label: "CANDIDATE SALARY", value: "$150,000", accent: "coral" as AccentKey },
    { label: "PLACEMENT FEE (20%)", value: "$30,000", accent: "teal" as AccentKey },
    { label: "RECRUITER SPLIT (75%)", value: "$22,500", accent: "yellow" as AccentKey },
    { label: "PLATFORM (25%)", value: "$7,500", accent: "purple" as AccentKey },
];

const recruiterReasons = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "CURATED ROLES, NOT COLD CALLS",
        body: "Every role on the platform has pre-agreed terms, a verified company, and a locked split percentage. Browse by specialization, geography, or fee range. The marketplace brings work to you.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "ECONOMICS YOU CAN SEE",
        body: "Know your exact payout before submitting a single resume. $150K role at 20% with a 75/25 split means $22,500 in your account. The math is public. The terms are final.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        title: "ONE DASHBOARD, EVERY DEAL",
        body: "Track every candidate across every active split in one view. No spreadsheets. No email chains. Status updates flow in real time. You know where things stand without asking.",
    },
    {
        icon: "fa-duotone fa-regular fa-rocket",
        title: "SCALE WITHOUT OVERHEAD",
        body: "The network provides the roles. You provide the talent. No office lease, no cold outreach campaigns, no admin staff. Just placements and revenue.",
    },
];

const companyReasons = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        title: "ONE ROLE, DOZENS OF RECRUITERS",
        body: "Post once and specialized recruiters across every niche start sourcing. No individual contracts. No vendor management spreadsheets. The platform is the vendor.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "REAL-TIME PIPELINE VISIBILITY",
        body: "See who is working your role, how many candidates are in play, and where each one stands. This is not a weekly status email. It is a live dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "STANDARDIZED TERMS, ZERO NEGOTIATION",
        body: "Set your fee percentage and split ratio once. Those terms apply to every recruiter who works the role. Consistent. Non-negotiable. Clear.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        title: "PAY ON PLACEMENT. PERIOD.",
        body: "No retainers. No deposits. No invoices until a candidate starts. The platform calculates every split and distributes every payment. You write one check.",
    },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingOnePage() {
    const faqAccents: AccentKey[] = ["coral", "teal", "yellow", "purple"];

    return (
        <div className="min-h-screen">
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO -- THE MANIFESTO OPENS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[100vh] flex items-center bg-dark overflow-hidden">
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Large hollow coral circle -- top left */}
                    <div className="absolute top-[6%] left-[3%] w-40 h-40 rounded-full border-[6px] border-coral opacity-30" />
                    {/* Solid teal block -- right side */}
                    <div className="absolute top-[18%] right-[8%] w-28 h-28 rotate-12 bg-teal opacity-20" />
                    {/* Small yellow circle -- mid left */}
                    <div className="absolute top-[52%] left-[6%] w-16 h-16 rounded-full bg-yellow opacity-25" />
                    {/* Purple rotated square -- bottom right */}
                    <div className="absolute bottom-[15%] right-[5%] w-24 h-24 rotate-45 border-4 border-purple opacity-20" />
                    {/* Coral diamond -- center left */}
                    <div className="absolute top-[72%] left-[20%] w-14 h-14 rotate-45 bg-coral opacity-15" />
                    {/* Dot grid -- top right area */}
                    <div className="absolute top-[10%] right-[30%] opacity-15">
                        <div className="grid grid-cols-6 gap-2.5">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div
                                    key={`hero-dot-${i}`}
                                    className="w-1.5 h-1.5 rounded-full bg-yellow"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag -- bottom center */}
                    <svg
                        className="absolute bottom-[8%] left-[25%] opacity-15"
                        width="160"
                        height="40"
                        viewBox="0 0 160 40"
                    >
                        <polyline
                            points="0,30 20,10 40,30 60,10 80,30 100,10 120,30 140,10 160,30"
                            fill="none"
                            className="stroke-teal"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Plus sign -- right mid */}
                    <svg
                        className="absolute top-[40%] right-[18%] opacity-20"
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                    >
                        <line x1="24" y1="6" x2="24" y2="42" className="stroke-coral" strokeWidth="4" strokeLinecap="round" />
                        <line x1="6" y1="24" x2="42" y2="24" className="stroke-coral" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    {/* Hollow yellow square -- bottom left */}
                    <div className="absolute bottom-[28%] left-[10%] w-20 h-20 border-4 border-yellow rotate-6 opacity-15" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Overline badge */}
                        <div className="inline-block mb-10">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white border-4 border-coral">
                                <i className="fa-duotone fa-regular fa-scroll"></i>
                                A Manifesto for Recruiting
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black leading-[0.9] mb-10 text-white uppercase tracking-tight">
                            The Rules{" "}
                            <span className="text-coral line-through decoration-4">Changed.</span>
                            <br />
                            <span className="relative inline-block mt-3">
                                <span className="text-teal">Most People</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                            </span>
                            <br />
                            Haven&apos;t Noticed Yet.
                        </h1>

                        <p className="text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed text-white/70">
                            Split-fee recruiting has operated on handshakes, blind trust,
                            and untracked economics for decades. We did not build a better
                            handshake. We built the infrastructure that makes handshakes
                            unnecessary.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link
                                href="/join"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Join as Recruiter
                            </Link>
                            <Link
                                href="/join"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post a Role
                            </Link>
                        </div>

                        <p className="text-sm text-white/30 uppercase tracking-[0.15em] font-bold">
                            This is not a pitch. It is a declaration of how recruiting works now.
                        </p>
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

            {/* ═══════════════════════════════════════════════════════════════
                2. STATS BAR -- THE SIGNAL
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-white py-16 border-b-4 border-dark">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {manifestoStats.map((stat, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-dark p-6 text-center"
                            >
                                {/* Color top bar */}
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[stat.accent].bg}`} />
                                <div className={`text-4xl md:text-5xl font-black mb-2 ${ACCENT[stat.accent].text}`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. THE PROBLEM ISN'T RECRUITING. IT'S INFRASTRUCTURE.
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-6">
                            The Real Problem
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            The Problem Isn&apos;t{" "}
                            <span className="text-coral">Recruiting.</span>
                            <br />
                            It&apos;s Infrastructure.
                        </h2>
                        <p className="text-lg text-dark/70 max-w-3xl mx-auto leading-relaxed">
                            Every failed split-fee deal has the same root cause. Not bad
                            recruiters. Not difficult clients. The infrastructure to manage
                            a multi-party placement simply did not exist. So people used
                            email, spreadsheets, and verbal agreements. And they got exactly
                            the results those tools produce.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {infrastructureFailures.map((item, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-dark bg-white p-8"
                            >
                                {/* Color top bar */}
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[item.accent].bg}`} />
                                {/* Corner accent */}
                                <div className={`absolute top-0 right-0 w-12 h-12 ${ACCENT[item.accent].bg}`} />
                                <div className={`w-14 h-14 flex items-center justify-center mb-5 border-4 ${ACCENT[item.accent].border}`}>
                                    <i className={`${item.icon} text-2xl ${ACCENT[item.accent].text}`}></i>
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-wide mb-4 text-dark">
                                    {item.title}
                                </h3>
                                <p className="text-base leading-relaxed text-dark/70">
                                    {item.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. PULL QUOTE -- THE CONVICTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="relative inline-block">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-coral" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-teal" />
                            <div className="border-l-4 border-yellow px-8 py-6">
                                <p className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;We did not build a better way to shake hands.
                                    We built a system that makes the handshake{" "}
                                    <span className="text-yellow">irrelevant.</span>&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-6">
                                    -- The Splits Network Manifesto
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. OUR PRINCIPLES -- THE FOUNDATION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            Our Principles
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Five Convictions.{" "}
                            <span className="text-teal">Zero Compromises.</span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-3xl mx-auto leading-relaxed">
                            These are not aspirational values printed on a poster in a
                            conference room. These are architectural decisions baked into
                            every line of code, every API endpoint, every database table.
                            The platform enforces them so people do not have to.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-6">
                        {principles.map((principle) => (
                            <div
                                key={principle.number}
                                className="relative border-4 border-dark bg-cream p-8 md:p-10"
                            >
                                {/* Color left bar */}
                                <div className={`absolute top-0 left-0 bottom-0 w-2 ${ACCENT[principle.accent].bg}`} />
                                {/* Corner number block */}
                                <div className={`absolute top-0 right-0 w-16 h-16 ${ACCENT[principle.accent].bg} flex items-center justify-center`}>
                                    <span className={`font-black text-xl ${principle.accent === "yellow" || principle.accent === "teal" ? "text-dark" : "text-white"}`}>
                                        {principle.number}
                                    </span>
                                </div>

                                <div className="flex items-start gap-6 pr-12">
                                    <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center border-4 ${ACCENT[principle.accent].border}`}>
                                        <i className={`${principle.icon} text-xl ${ACCENT[principle.accent].text}`}></i>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-dark">
                                            {principle.title}
                                        </h3>
                                        <p className="text-base leading-relaxed text-dark/70">
                                            {principle.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. THE ECONOMICS -- FOLLOW THE MONEY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-yellow text-dark mb-6">
                            The Economics
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Show Me the{" "}
                            <span className="text-yellow">Money.</span>
                            <br />
                            All of It.
                        </h2>
                        <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
                            No mystery math. No buried clauses. Here is exactly how a
                            $150,000 placement flows through the system. Every party sees
                            these numbers before the deal starts and after it closes.
                        </p>
                    </div>

                    {/* Flow diagram */}
                    <div className="max-w-5xl mx-auto mb-16">
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                            {/* Company */}
                            <div className="border-4 border-white/20 bg-coral text-white w-full lg:w-64 p-8 text-center">
                                <div className="w-16 h-16 bg-white/20 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-building text-2xl"></i>
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">Company</h3>
                                <p className="text-base text-white/80">Pays $30,000</p>
                                <p className="text-xs text-white/50 mt-1">20% of $150K salary</p>
                            </div>
                            {/* Arrow */}
                            <div className="hidden lg:flex items-center justify-center w-16">
                                <svg className="w-full h-8 text-white/40" viewBox="0 0 60 32">
                                    <path d="M0 16 L44 16 L34 6 M44 16 L34 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="lg:hidden flex items-center justify-center h-10">
                                <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-white/40"></i>
                            </div>
                            {/* Platform */}
                            <div className="border-4 border-white/20 bg-teal text-dark w-full lg:w-64 p-8 text-center">
                                <div className="w-16 h-16 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-diagram-project text-2xl"></i>
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">Platform</h3>
                                <p className="text-base text-dark/80">Retains $7,500</p>
                                <p className="text-xs text-dark/50 mt-1">25% platform share</p>
                            </div>
                            {/* Arrow */}
                            <div className="hidden lg:flex items-center justify-center w-16">
                                <svg className="w-full h-8 text-white/40" viewBox="0 0 60 32">
                                    <path d="M0 16 L44 16 L34 6 M44 16 L34 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="lg:hidden flex items-center justify-center h-10">
                                <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-white/40"></i>
                            </div>
                            {/* Recruiter */}
                            <div className="border-4 border-white/20 bg-yellow text-dark w-full lg:w-64 p-8 text-center">
                                <div className="w-16 h-16 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-user-tie text-2xl"></i>
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">Recruiter</h3>
                                <p className="text-base text-dark/80">Receives $22,500</p>
                                <p className="text-xs text-dark/50 mt-1">75% recruiter share</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown card */}
                    <div className="max-w-4xl mx-auto">
                        <div className="border-4 border-white/20 bg-white/5 p-8 md:p-10">
                            <h3 className="text-xl font-black text-center mb-8 uppercase tracking-wide text-white">
                                Real Placement. Real Numbers. Real Payout.
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                {economicsBreakdown.map((item, index) => (
                                    <div key={index} className="text-center">
                                        <div className={`text-3xl md:text-4xl font-black mb-2 ${ACCENT[item.accent].text}`}>
                                            {item.value}
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-white/50">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t-4 border-white/10 pt-6">
                                <p className="text-center text-base font-black uppercase tracking-wider text-white/70">
                                    That $22,500 is locked before the first resume is submitted. Not after. Not during.{" "}
                                    <span className="text-yellow">Before.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. PULL QUOTE -- THE BUILDER
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="relative inline-block">
                            <div className="absolute -top-5 -left-5 w-10 h-10 bg-teal" />
                            <div className="absolute -bottom-5 -right-5 w-10 h-10 bg-purple" />
                            <div className="border-l-4 border-teal px-8 py-4">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark leading-tight">
                                    &ldquo;Modern platforms solve this by treating the split-fee
                                    relationship as a{" "}
                                    <span className="text-teal">first-class citizen.</span>{" "}
                                    Every interaction is tracked. Every contribution is visible.
                                    Every payment is tied to a verified outcome.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-dark/40 mt-4">
                                    -- The Architecture Behind the Manifesto
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                8. FOR THOSE WHO BUILD -- RECRUITERS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
                        <div>
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                                For Those Who Build
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white uppercase tracking-tight">
                                You Are Not a{" "}
                                <span className="text-coral line-through decoration-4">Salesperson.</span>
                                <br />
                                You Are a{" "}
                                <span className="text-teal">Builder.</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 leading-relaxed">
                                Every placement you make changes someone&apos;s career trajectory
                                and a company&apos;s growth story. That work deserves infrastructure
                                that tracks your contribution, locks your economics, and pays
                                you without a single follow-up email.
                            </p>

                            <div className="space-y-6">
                                {recruiterReasons.map((reason, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-teal/20 border-4 border-teal flex items-center justify-center flex-shrink-0">
                                            <i className={`${reason.icon} text-base text-teal`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-base uppercase tracking-wide text-white mb-1">
                                                {reason.title}
                                            </h4>
                                            <p className="text-base text-white/70 leading-relaxed">
                                                {reason.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Link
                                    href="/join"
                                    className="inline-flex items-center gap-3 px-8 py-4 font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket"></i>
                                    Join the Network
                                </Link>
                            </div>
                        </div>

                        {/* Recruiter dashboard mockup */}
                        <div className="relative">
                            <div className="border-4 border-white/20 bg-white/5 p-6">
                                {/* Window chrome */}
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b-4 border-white/10">
                                    <div className="w-3 h-3 rounded-full bg-coral" />
                                    <div className="w-3 h-3 rounded-full bg-yellow" />
                                    <div className="w-3 h-3 rounded-full bg-teal" />
                                    <span className="ml-3 text-xs font-mono text-white/40">
                                        splits.network/pipeline
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-white/40 uppercase tracking-wider font-bold">
                                            Your Pipeline
                                        </div>
                                        <div className="font-black text-lg text-white">
                                            Active Split Deals
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 text-sm font-black uppercase bg-teal text-dark">
                                        4 roles
                                    </span>
                                </div>
                                {/* Dashboard rows */}
                                <div className="space-y-3 mb-4">
                                    {[
                                        { title: "Senior Engineer", company: "TechCorp", status: "Interviewing", split: "$22.5K", accentKey: "teal" as AccentKey },
                                        { title: "Product Manager", company: "ScaleUp Inc", status: "Offer Stage", split: "$18K", accentKey: "yellow" as AccentKey },
                                        { title: "VP of Sales", company: "GrowthCo", status: "Submitted", split: "$37.5K", accentKey: "coral" as AccentKey },
                                        { title: "Data Scientist", company: "DataFlow", status: "Screening", split: "$24K", accentKey: "purple" as AccentKey },
                                    ].map((role, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 border-4 border-white/10"
                                        >
                                            <div>
                                                <div className="font-bold text-sm text-white">{role.title}</div>
                                                <div className="text-xs text-white/50">{role.company}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white/60">{role.split}</span>
                                                <span className={`px-2 py-1 text-xs font-bold ${ACCENT[role.accentKey].bg} ${role.accentKey === "teal" || role.accentKey === "yellow" ? "text-dark" : "text-white"}`}>
                                                    {role.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Earnings summary */}
                                <div className="border-t-4 border-white/10 pt-4">
                                    <div className="flex items-center justify-between p-4 border-4 border-teal/30 bg-teal/5">
                                        <div>
                                            <div className="text-xs text-white/40 uppercase tracking-wider font-bold">
                                                Pipeline Value
                                            </div>
                                            <div className="text-3xl font-black text-teal">
                                                $102,000
                                            </div>
                                            <div className="text-xs text-white/40 mt-1">
                                                across 4 active splits
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 bg-teal/10 border-4 border-teal/30 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-chart-line-up text-xl text-teal"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Memphis accent shapes around the dashboard */}
                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-coral" />
                            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-yellow" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                9. FOR THOSE WHO HIRE -- COMPANIES
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
                        {/* Company dashboard mockup */}
                        <div className="relative order-2 lg:order-1">
                            <div className="border-4 border-dark bg-white p-6">
                                {/* Window chrome */}
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b-4 border-dark/10">
                                    <div className="w-3 h-3 rounded-full bg-coral" />
                                    <div className="w-3 h-3 rounded-full bg-yellow" />
                                    <div className="w-3 h-3 rounded-full bg-teal" />
                                    <span className="ml-3 text-xs font-mono text-dark/40">
                                        splits.network/hiring
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-dark/40 uppercase tracking-wider font-bold">
                                            Hiring Dashboard
                                        </div>
                                        <div className="font-black text-lg text-dark">
                                            Open Roles
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 text-sm font-black uppercase bg-coral text-white">
                                        3 active
                                    </span>
                                </div>
                                <div className="space-y-3 mb-4">
                                    {[
                                        { title: "Backend Engineer", location: "San Francisco, CA", candidates: 7, recruiters: 4, fee: "20%", accentKey: "teal" as AccentKey },
                                        { title: "Sales Director", location: "Remote", candidates: 3, recruiters: 2, fee: "25%", accentKey: "yellow" as AccentKey },
                                        { title: "Head of Product", location: "New York, NY", candidates: 11, recruiters: 6, fee: "22%", accentKey: "coral" as AccentKey },
                                    ].map((role, index) => (
                                        <div
                                            key={index}
                                            className="p-3 border-4 border-dark/10"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-sm text-dark">{role.title}</div>
                                                    <div className="text-xs text-dark/50">{role.location}</div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-bold ${ACCENT[role.accentKey].bg} ${role.accentKey === "teal" || role.accentKey === "yellow" ? "text-dark" : "text-white"}`}>
                                                    {role.candidates} candidates
                                                </span>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-0.5 border-4 border-dark/10 font-bold text-dark/60">
                                                    {role.recruiters} recruiters
                                                </span>
                                                <span className="px-2 py-0.5 border-4 border-dark/10 font-bold text-dark/60">
                                                    {role.fee} fee
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-4 border-dark/10 pt-4">
                                    <div className="flex items-center justify-between p-4 border-4 border-coral/30 bg-coral/5">
                                        <div>
                                            <div className="text-xs text-dark/40 uppercase tracking-wider font-bold">
                                                Total Candidates
                                            </div>
                                            <div className="text-3xl font-black text-coral">21</div>
                                            <div className="text-xs text-dark/40 mt-1">
                                                from 12 recruiters across 3 roles
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 bg-coral/10 border-4 border-coral/30 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-users text-xl text-coral"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Memphis accent shapes */}
                            <div className="absolute -top-4 -left-4 w-8 h-8 bg-teal" />
                            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-purple" />
                        </div>

                        <div className="order-1 lg:order-2">
                            <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                                For Those Who Hire
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-dark uppercase tracking-tight">
                                Stop Managing{" "}
                                <span className="text-coral line-through decoration-4">Vendors.</span>
                                <br />
                                Start Managing{" "}
                                <span className="text-teal">Outcomes.</span>
                            </h2>
                            <p className="text-lg text-dark/70 mb-10 leading-relaxed">
                                You have twelve recruiter relationships, twelve different contracts,
                                twelve different fee structures, and twelve different ways of tracking
                                candidates. What you need is one platform that treats all of it as a
                                single, visible, enforceable system.
                            </p>

                            <div className="space-y-6">
                                {companyReasons.map((reason, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-coral/10 border-4 border-coral flex items-center justify-center flex-shrink-0">
                                            <i className={`${reason.icon} text-base text-coral`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-base uppercase tracking-wide text-dark mb-1">
                                                {reason.title}
                                            </h4>
                                            <p className="text-base text-dark/70 leading-relaxed">
                                                {reason.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Link
                                    href="/join"
                                    className="inline-flex items-center gap-3 px-8 py-4 font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    Post a Role
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                10. THE OLD WAY VS THE BUILT WAY -- COMPARISON
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                            The Comparison
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            The Old Way Is{" "}
                            <span className="text-coral line-through decoration-4">Familiar.</span>
                            <br />
                            It Is Also{" "}
                            <span className="text-purple">Broken.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Old Way */}
                        <div className="border-4 border-dark bg-coral/5 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-coral border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-ban text-white text-lg"></i>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                    The Old Way
                                </h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Split terms negotiated over phone calls",
                                    "Candidate tracking scattered across email threads",
                                    "Payment timelines measured in months, not days",
                                    "Disputes resolved by whoever has the louder voice",
                                    "Pipeline visibility: ask and hope for an answer",
                                    "Recruiter contribution: invisible until invoice time",
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-xmark text-white text-sm"></i>
                                        </div>
                                        <span className="text-base text-dark/70 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* The Built Way */}
                        <div className="border-4 border-dark bg-teal/5 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-teal border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-check text-dark text-lg"></i>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                    The Built Way
                                </h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Split terms locked in the platform before work begins",
                                    "Every candidate tracked in one shared pipeline",
                                    "Payment distributed automatically at placement close",
                                    "Disputes prevented by timestamped attribution",
                                    "Pipeline visibility: real-time, always, for everyone",
                                    "Recruiter contribution: logged, measured, paid",
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-check text-dark text-sm"></i>
                                        </div>
                                        <span className="text-base text-dark/70 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Pull quote */}
                    <div className="max-w-3xl mx-auto mt-14 text-center">
                        <p className="text-xl md:text-2xl font-black uppercase tracking-wide text-dark/60 leading-tight">
                            &ldquo;Built for split placements. Not retrofitted. Not bolted on.{" "}
                            <span className="text-teal">Built.</span>&rdquo;
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                11. FOR CANDIDATES -- THE THIRD PARTY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-purple overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-white text-dark mb-6">
                                    For Candidates
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white uppercase tracking-tight">
                                    Your Career.{" "}
                                    <span className="text-yellow">Represented.</span>
                                </h2>
                                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                                    In the split-fee model, recruiters compete to find you the
                                    right fit -- not just any fit. Multiple specialists work
                                    across multiple opportunities, which means better matches,
                                    faster responses, and advocates who understand your space.
                                </p>
                                <Link
                                    href="https://applicant.network"
                                    className="inline-flex items-center gap-3 px-8 py-4 font-black uppercase tracking-wider border-4 border-yellow bg-yellow text-dark transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-user"></i>
                                    Explore Opportunities
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-users",
                                        title: "MULTIPLE ADVOCATES",
                                        body: "Specialized recruiters pitch you to roles that match your expertise. More advocates means more interviews, more offers, better outcomes.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-message-check",
                                        title: "CLEAR COMMUNICATION",
                                        body: "When the platform tracks every submission, you get real updates. Not silence. Not ghosting. Status changes in real time.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-shield-halved",
                                        title: "YOUR DATA, YOUR CONTROL",
                                        body: "Your profile, your resume, your preferences. Recruiters see what you choose to share. The platform protects the rest.",
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 border-4 border-white/20 bg-white/10 p-5"
                                    >
                                        <div className="w-10 h-10 bg-yellow flex items-center justify-center flex-shrink-0">
                                            <i className={`${item.icon} text-base text-dark`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wide text-white mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-base text-white/70 leading-relaxed">
                                                {item.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                12. FAQ -- STRAIGHT ANSWERS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            Straight Answers
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Questions You&apos;re{" "}
                            <span className="text-coral">Actually</span> Asking
                        </h2>
                        <p className="text-lg text-dark/70">
                            No fluff. No corporate deflection. Here is how it works.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {portalFaqs.map((faq, index) => {
                            const accent = faqAccents[index % faqAccents.length];
                            return (
                                <div
                                    key={index}
                                    className="border-4 border-dark"
                                >
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-5 font-black text-base uppercase tracking-wide text-dark bg-white hover:bg-cream transition-colors">
                                            {faq.question}
                                            <span
                                                className={`w-10 h-10 flex items-center justify-center flex-shrink-0 font-black text-xl transition-transform group-open:rotate-45 ${ACCENT[accent].bg} ${accent === "yellow" || accent === "teal" ? "text-dark" : "text-white"}`}
                                            >
                                                +
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-5 border-t-4 border-dark/10">
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
                13. THE MANIFESTO'S CLOSING -- THE DECLARATION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-28 bg-dark overflow-hidden relative">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[4%] w-24 h-24 rotate-12 bg-coral opacity-20" />
                    <div className="absolute top-[12%] right-[6%] w-20 h-20 rounded-full border-4 border-teal opacity-20" />
                    <div className="absolute bottom-[18%] left-[8%] w-16 h-16 rounded-full bg-yellow opacity-20" />
                    <div className="absolute bottom-[8%] right-[12%] w-28 h-10 -rotate-6 bg-purple opacity-20" />
                    <div className="absolute top-[50%] left-[50%] w-20 h-20 rotate-45 border-4 border-coral opacity-10" />
                    {/* Zigzag */}
                    <svg
                        className="absolute bottom-[28%] left-[30%] opacity-15"
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
                    {/* Plus sign */}
                    <svg
                        className="absolute top-[30%] right-[22%] opacity-15"
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                    >
                        <line x1="22" y1="5" x2="22" y2="39" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="22" x2="39" y2="22" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    {/* Dot grid */}
                    <div className="absolute top-[65%] right-[8%] opacity-10">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div
                                    key={`cta-dot-${i}`}
                                    className="w-2 h-2 rounded-full bg-teal"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-14 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            The Infrastructure Is{" "}
                            <span className="text-coral">Live.</span>
                            <br />
                            The Manifesto Is{" "}
                            <span className="text-teal">Written.</span>
                        </h2>
                        <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto leading-relaxed">
                            Every day you track splits in spreadsheets is a day a
                            candidate takes another offer. Every handshake deal
                            without a paper trail is a payment at risk. Every verbal
                            agreement is a lawsuit waiting to happen.
                        </p>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                            The question is not whether recruiting infrastructure will
                            replace the old way. It already has. The only question is
                            whether you are on it.
                        </p>
                    </div>

                    {/* Primary CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as Recruiter
                        </Link>
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post a Role
                        </Link>
                    </div>

                    {/* Three-path micro-CTA cards */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                        {[
                            {
                                icon: "fa-duotone fa-regular fa-user-tie",
                                title: "Recruiters",
                                desc: "Browse roles. Submit candidates. Collect your split. Every term locked before you start.",
                                accent: "teal" as AccentKey,
                                href: "/join",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-building",
                                title: "Companies",
                                desc: "Post roles. Tap the network. Pay on placement only. One platform, zero vendor chaos.",
                                accent: "coral" as AccentKey,
                                href: "/join",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-user",
                                title: "Candidates",
                                desc: "Get represented by recruiters who compete to find your best fit. Not just any fit.",
                                accent: "yellow" as AccentKey,
                                href: "https://applicant.network",
                            },
                        ].map((card, index) => (
                            <Link
                                key={index}
                                href={card.href}
                                className="border-4 border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10"
                            >
                                <div
                                    className={`w-12 h-12 ${ACCENT[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}
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

                    <p className="text-center text-sm max-w-xl mx-auto text-white/30 uppercase tracking-wider font-bold">
                        The manifesto is not a promise. It is a description of what already
                        exists. Join the recruiters and companies running transparent split
                        placements today.
                    </p>
                </div>

                {/* 4-color accent bar */}
                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                    <div className="flex-1 bg-purple" />
                </div>
            </section>
        </div>
    );
}
