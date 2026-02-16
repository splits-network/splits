import Link from "next/link";
import type { Metadata } from "next";
import { portalFaqs } from "@/components/landing/sections/faq-data";

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: "The Challenge: Built for Splits | Splits Network",
    description:
        "Your ATS was not built for split-fee recruiting. Spreadsheets are not infrastructure. Splits Network is the platform purpose-built for transparent split placements, automated payouts, and real-time pipeline tracking.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

const ACCENT = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
};

const brokenTools = [
    {
        icon: "fa-duotone fa-regular fa-table-cells",
        title: "Spreadsheets",
        verdict: "Not Infrastructure",
        flaws: [
            "No audit trail on edits",
            "No automated fee calculations",
            "Impossible to share in real time",
            "One accidental delete kills your pipeline",
        ],
        stat: "43%",
        statLabel: "of split deals tracked in spreadsheets have data discrepancies",
        accent: "coral" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-envelope",
        title: "Email Chains",
        verdict: "Not a Pipeline",
        flaws: [
            "Candidate updates buried in threads",
            "No single source of truth",
            "CC chains break when people leave",
            "Zero visibility into deal stage",
        ],
        stat: "67%",
        statLabel: "of recruiters lose track of candidates across email threads",
        accent: "teal" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-laptop-code",
        title: "Generic ATS",
        verdict: "Not Built for Splits",
        flaws: [
            "No split-fee field in the data model",
            "No multi-party pipeline views",
            "Payment tracking is an afterthought",
            "Forces workarounds for every split deal",
        ],
        stat: "89%",
        statLabel: "of ATS platforms have zero native split-fee support",
        accent: "yellow" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-phone",
        title: "Phone Calls",
        verdict: "Not a Record",
        flaws: [
            "No written terms",
            "No timestamp on agreements",
            "Disputes become he-said-she-said",
            "Memory is not a contract",
        ],
        stat: "68%",
        statLabel: "of verbal split agreements end in fee disputes",
        accent: "purple" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Manual Invoicing",
        verdict: "Not Scalable",
        flaws: [
            "Average 52-day payment cycle",
            "No connection to placement data",
            "Fee calculation errors compound",
            "Chasing payments instead of placing candidates",
        ],
        stat: "52",
        statLabel: "days average payment cycle for manually invoiced splits",
        accent: "coral" as const,
    },
];

const versusData = [
    {
        capability: "Split-Fee Tracking",
        without: "Scattered across spreadsheets, emails, and sticky notes",
        with: "Native. Every split is a first-class object with terms, parties, and status",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Fee Transparency",
        without: "Verbal agreements. Different parties remember different numbers",
        with: "100% visible. Every party sees identical terms before any work begins",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Pipeline Visibility",
        without: "Black hole. Candidates vanish between submission and feedback",
        with: "Real-time shared pipeline. Every status change visible to all parties",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Candidate Ownership",
        without: "Whoever has the file. Disputes settled by volume, not evidence",
        with: "Timestamped attribution. Immutable record of who submitted whom and when",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Payment Distribution",
        without: "Manual invoicing. 52-day cycles. Constant follow-up calls",
        with: "Automatic calculation and distribution. Tied to verified placement outcomes",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Recruiter Network",
        without: "Your personal contacts. Limited to who you already know",
        with: "Built-in marketplace. Specialized recruiters find your roles automatically",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Clawback Terms",
        without: "Buried in contracts nobody reads. Surprise deductions months later",
        with: "Defined upfront. Locked at submission. Automated if triggered",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
    {
        capability: "Multi-Party Communication",
        without: "CC chains, phone tag, and forwarded PDFs nobody can find",
        with: "In-platform messaging tied to specific roles, candidates, and placements",
        iconOld: "fa-duotone fa-regular fa-xmark",
        iconNew: "fa-duotone fa-regular fa-check",
    },
];

const failureScenarios = [
    {
        icon: "fa-duotone fa-regular fa-ghost",
        title: "The Ghost Pipeline",
        description:
            "A recruiter submits three candidates for a VP of Sales role. The company goes quiet for six weeks. By the time they respond, all three candidates have accepted other offers. The recruiter spent 40 hours sourcing candidates for a role that never moved.",
        cost: "40 hours wasted. $0 earned.",
        accent: "coral" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-gavel",
        title: "The Disputed Fee",
        description:
            "Two recruiters both claim they submitted the same candidate. There is no timestamp. There is no system of record. The placement closes for $35,000 in fees. Both recruiters demand the full split. The company freezes payment while lawyers get involved.",
        cost: "$35,000 frozen. Relationship destroyed.",
        accent: "coral" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-calculator",
        title: "The Math Error",
        description:
            "A 75/25 split on a $28,000 fee should pay the recruiter $21,000. The company calculates it as 75% of the base fee before platform costs. The recruiter receives $16,800. The difference was never discussed because the terms were never written down.",
        cost: "$4,200 lost. No recourse.",
        accent: "coral" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-user-slash",
        title: "The Lost Candidate",
        description:
            "A strong candidate is submitted via email attachment. The hiring manager forwards it internally. Six months later, the company hires the candidate through a different channel. The recruiter who sourced them never gets notified and never gets paid.",
        cost: "$25,000+ in lost fees. Invisible theft.",
        accent: "coral" as const,
    },
];

const successScenarios = [
    {
        icon: "fa-duotone fa-regular fa-chart-gantt",
        title: "The Visible Pipeline",
        description:
            "A recruiter submits three candidates. The company reviews them within 48 hours because every submission triggers a notification. Status updates flow in real time. The recruiter knows exactly where each candidate stands. One gets hired in 23 days.",
        result: "23-day placement. Full visibility. Full payout.",
        accent: "teal" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-stamp",
        title: "The Settled Ownership",
        description:
            "Two recruiters submit the same candidate 12 hours apart. The platform timestamps both submissions. The first recruiter has immutable proof of priority. No dispute. No lawyers. The system resolves it before it becomes a problem.",
        result: "Resolved in seconds. Zero conflict.",
        accent: "teal" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        title: "The Exact Math",
        description:
            "A $28,000 placement fee splits 75/25. The platform calculates $21,000 for the recruiter. Both parties see identical numbers from the moment the role is posted. When the placement closes, payment distributes automatically.",
        result: "$21,000 paid. To the penny. On time.",
        accent: "teal" as const,
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "The Protected Submission",
        description:
            "Every candidate submission is recorded with a timestamp, recruiter ID, and role association. If the company hires that candidate through any channel within the agreement window, the platform flags it. The recruiter gets paid.",
        result: "Attribution enforced. Revenue protected.",
        accent: "teal" as const,
    },
];

const costOfNothing = [
    {
        metric: "$4,200",
        label: "Average Fee Lost per Disputed Split",
        detail: "When terms are verbal, the number that gets paid is always the number that favors the party writing the check.",
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        accent: "coral" as const,
    },
    {
        metric: "40 hrs",
        label: "Wasted on Ghost Pipelines per Quarter",
        detail: "Hours spent sourcing candidates for roles that go dark. No visibility means no ability to cut losses early.",
        icon: "fa-duotone fa-regular fa-clock",
        accent: "coral" as const,
    },
    {
        metric: "52 days",
        label: "Average Payment Cycle",
        detail: "Nearly two months between placement and payment. Manual invoicing turns cash flow into a guessing game.",
        icon: "fa-duotone fa-regular fa-calendar-xmark",
        accent: "coral" as const,
    },
    {
        metric: "3.2x",
        label: "Longer Time-to-Fill Without Collaboration",
        detail: "Solo recruiters working isolated job orders take 3.2x longer to fill roles than networked teams splitting the work.",
        icon: "fa-duotone fa-regular fa-hourglass-half",
        accent: "coral" as const,
    },
];

const switchSteps = [
    {
        step: "01",
        title: "Create Your Account",
        detail: "Pick your role: recruiter or company. Set up your profile in under 5 minutes. No contracts. No commitments.",
        icon: "fa-duotone fa-regular fa-user-plus",
        accent: "teal" as const,
    },
    {
        step: "02",
        title: "Post or Browse Roles",
        detail: "Companies post roles with fee and split terms. Recruiters browse the marketplace and pick roles that match their expertise.",
        icon: "fa-duotone fa-regular fa-briefcase",
        accent: "yellow" as const,
    },
    {
        step: "03",
        title: "Submit and Track",
        detail: "Submit candidates. Track every stage. See status updates in real time. No email chains. No phone tag. No guessing.",
        icon: "fa-duotone fa-regular fa-chart-gantt",
        accent: "purple" as const,
    },
    {
        step: "04",
        title: "Get Paid Automatically",
        detail: "Placement closes. Platform calculates the split. Payment distributes to the recruiter. Every dollar tracked. Every term honored.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        accent: "coral" as const,
    },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingFourPage() {
    return (
        <>
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO -- THE CHALLENGE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Large hollow coral circle */}
                    <div className="absolute top-[6%] left-[3%] w-40 h-40 rounded-full border-[6px] border-coral opacity-30" />
                    {/* Solid teal square -- rotated */}
                    <div className="absolute top-[14%] right-[8%] w-28 h-28 rotate-12 bg-teal opacity-20" />
                    {/* Yellow diamond */}
                    <div className="absolute bottom-[20%] left-[12%] w-20 h-20 rotate-45 bg-yellow opacity-25" />
                    {/* Purple rectangle */}
                    <div className="absolute top-[45%] right-[5%] w-36 h-14 -rotate-6 border-4 border-purple opacity-20" />
                    {/* Coral square hollow */}
                    <div className="absolute bottom-[10%] right-[15%] w-24 h-24 border-4 border-coral rotate-6 opacity-20" />
                    {/* Dot grid -- top right */}
                    <div className="absolute top-[10%] right-[30%] opacity-20">
                        <div className="grid grid-cols-5 gap-2.5">
                            {Array.from({ length: 25 }).map((_, i) => (
                                <div
                                    key={`dot-hero-${i}`}
                                    className="w-1.5 h-1.5 rounded-full bg-yellow"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag -- bottom */}
                    <svg
                        className="absolute bottom-[6%] left-[25%] opacity-20"
                        width="180"
                        height="40"
                        viewBox="0 0 180 40"
                    >
                        <polyline
                            points="0,30 22,10 44,30 66,10 88,30 110,10 132,30 154,10 180,30"
                            fill="none"
                            className="stroke-coral"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Plus sign */}
                    <svg
                        className="absolute top-[65%] left-[8%] opacity-20"
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                    >
                        <line x1="22" y1="5" x2="22" y2="39" className="stroke-teal" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="22" x2="39" y2="22" className="stroke-teal" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    {/* Small teal dots -- bottom right */}
                    <div className="absolute bottom-[30%] right-[25%] opacity-15">
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={`dot-hero-sm-${i}`}
                                    className="w-2 h-2 rounded-full bg-purple"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Challenge badge */}
                        <div className="inline-block mb-8">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white border-4 border-coral">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                                A Direct Challenge
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] mb-8 text-white uppercase tracking-tight">
                            Your Recruiting Tools
                            <br />
                            <span className="text-coral line-through decoration-4">
                                Were Not Built
                            </span>
                            <br />
                            <span className="relative inline-block mt-2">
                                <span className="text-teal">For Split-Fee.</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed text-white/70">
                            Spreadsheets are not infrastructure. Email is not a
                            pipeline. Your ATS has no concept of a split. Stop
                            forcing tools built for something else to do the one
                            thing that actually matters to your revenue.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/join"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-bolt" />
                                Take the Challenge
                            </Link>
                            <Link
                                href="#the-versus"
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-white/30 bg-transparent text-white transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-down" />
                                See the Evidence
                            </Link>
                        </div>

                        <div className="text-sm text-white/40 pt-10 uppercase tracking-wider font-bold">
                            89% of ATS platforms have zero native split-fee
                            support. We built the other 100%.
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

            {/* ═══════════════════════════════════════════════════════════════
                2. THE LINEUP -- TOOLS THAT FAIL YOU
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            The Lineup
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Five Tools Recruiters Use.{" "}
                            <span className="text-coral">
                                Zero Built for Splits.
                            </span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                            Every recruiter running split-fee deals uses at
                            least three of these. Every single one was designed
                            for something else. The result: workarounds stacked
                            on workarounds until the whole system collapses
                            under the weight of the first real dispute.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {brokenTools.map((tool, index) => (
                            <div
                                key={index}
                                className={`relative border-4 border-dark bg-white p-8 ${index === 4 ? "lg:col-start-2" : ""}`}
                            >
                                {/* Coral top bar -- danger color */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-coral" />
                                {/* X badge in corner */}
                                <div className="absolute top-0 right-0 w-14 h-14 bg-coral flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-xmark text-white text-2xl" />
                                </div>

                                <div className="w-14 h-14 flex items-center justify-center mb-4 border-4 border-coral">
                                    <i className={`${tool.icon} text-2xl text-coral`} />
                                </div>

                                <h3 className="font-black text-xl uppercase tracking-wide mb-1 text-dark">
                                    {tool.title}
                                </h3>
                                <p className="text-base font-black uppercase tracking-wider text-coral mb-4">
                                    {tool.verdict}
                                </p>

                                <ul className="space-y-2 mb-6">
                                    {tool.flaws.map((flaw, fi) => (
                                        <li
                                            key={fi}
                                            className="flex items-start gap-2 text-base text-dark/70"
                                        >
                                            <i className="fa-duotone fa-regular fa-xmark text-coral mt-1 flex-shrink-0" />
                                            {flaw}
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t-4 border-dark/10 pt-4">
                                    <div className="text-3xl font-black text-coral">
                                        {tool.stat}
                                    </div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                                        {tool.statLabel}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. PULL QUOTE -- THE DECLARATION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="relative inline-block">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-coral" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-teal" />
                            <div className="border-l-4 border-coral px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;Spreadsheets are not infrastructure.
                                    Email is not a pipeline. Phone calls are not
                                    contracts.{" "}
                                    <span className="text-teal">
                                        The split-fee relationship deserves its
                                        own platform.
                                    </span>{" "}
                                    We built it.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-4">
                                    -- The Splits Network Thesis
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. THE VERSUS -- THE CENTERPIECE
            ═══════════════════════════════════════════════════════════════ */}
            <section
                id="the-versus"
                className="py-24 bg-white overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            The Versus
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Side by Side.{" "}
                            <span className="text-teal">
                                No Contest.
                            </span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                            Eight capabilities that define whether a split
                            placement succeeds or fails. On the left: what
                            happens without purpose-built infrastructure. On the
                            right: what happens with it.
                        </p>
                    </div>

                    {/* Column headers */}
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-0 mb-0">
                            <div className="hidden md:block p-4 bg-dark border-4 border-dark">
                                <span className="font-black text-base uppercase tracking-wider text-white">
                                    Capability
                                </span>
                            </div>
                            <div className="hidden md:block p-4 bg-coral border-4 border-dark text-center">
                                <span className="font-black text-base uppercase tracking-wider text-white">
                                    <i className="fa-duotone fa-regular fa-xmark mr-2" />
                                    Without Splits Network
                                </span>
                            </div>
                            <div className="hidden md:block p-4 bg-teal border-4 border-dark text-center">
                                <span className="font-black text-base uppercase tracking-wider text-dark">
                                    <i className="fa-duotone fa-regular fa-check mr-2" />
                                    With Splits Network
                                </span>
                            </div>
                        </div>

                        {/* Rows */}
                        {versusData.map((row, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-0 border-b-4 border-dark/10 last:border-b-0"
                            >
                                {/* Capability */}
                                <div className="p-5 bg-dark/5 border-l-4 border-r-4 border-dark/10 md:border-r-0">
                                    <span className="font-black text-base uppercase tracking-wide text-dark">
                                        {row.capability}
                                    </span>
                                </div>
                                {/* Old way -- coral tinted */}
                                <div className="p-5 bg-coral/5 border-l-4 border-coral/20">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className={`${row.iconOld} text-white text-sm`} />
                                        </div>
                                        <p className="text-base text-dark/60 leading-relaxed">
                                            {row.without}
                                        </p>
                                    </div>
                                </div>
                                {/* New way -- teal tinted */}
                                <div className="p-5 bg-teal/5 border-l-4 border-teal/20 border-r-4 border-r-dark/10">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className={`${row.iconNew} text-dark text-sm`} />
                                        </div>
                                        <p className="text-base text-dark/90 leading-relaxed font-bold">
                                            {row.with}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Verdict bar */}
                    <div className="max-w-6xl mx-auto mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-0">
                            <div className="hidden md:block" />
                            <div className="p-4 bg-coral/10 border-4 border-coral text-center">
                                <span className="font-black text-base uppercase tracking-wider text-coral">
                                    0 / 8 capabilities
                                </span>
                            </div>
                            <div className="p-4 bg-teal/10 border-4 border-teal text-center">
                                <span className="font-black text-base uppercase tracking-wider text-teal">
                                    8 / 8 capabilities
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. WHAT BREAKS -- FAILURE SCENARIOS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            What Breaks
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Without Infrastructure,{" "}
                            <span className="text-coral">
                                Everything Breaks.
                            </span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                            These are not hypothetical scenarios. They happen
                            every week in split-fee recruiting. They happen
                            because the tools were never designed to prevent
                            them.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        {failureScenarios.map((scenario, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-dark bg-white p-8"
                            >
                                {/* Coral top bar */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-coral" />
                                {/* Coral corner */}
                                <div className="absolute top-0 right-0 w-10 h-10 bg-coral" />

                                <div className="w-14 h-14 flex items-center justify-center mb-4 border-4 border-coral">
                                    <i className={`${scenario.icon} text-2xl text-coral`} />
                                </div>

                                <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-dark">
                                    {scenario.title}
                                </h3>
                                <p className="text-base text-dark/70 leading-relaxed mb-4">
                                    {scenario.description}
                                </p>
                                <div className="border-t-4 border-coral/20 pt-4">
                                    <p className="font-black text-base uppercase tracking-wider text-coral">
                                        {scenario.cost}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. WHAT WORKS -- SUCCESS SCENARIOS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            What Works
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Same Scenarios.{" "}
                            <span className="text-teal">
                                Different Outcome.
                            </span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                            The same four situations -- with infrastructure
                            underneath them. Every failure from the previous
                            section is eliminated not by luck or good intentions
                            but by architecture.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        {successScenarios.map((scenario, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-dark bg-white p-8"
                            >
                                {/* Teal top bar */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-teal" />
                                {/* Teal corner */}
                                <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />

                                <div className="w-14 h-14 flex items-center justify-center mb-4 border-4 border-teal">
                                    <i className={`${scenario.icon} text-2xl text-teal`} />
                                </div>

                                <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-dark">
                                    {scenario.title}
                                </h3>
                                <p className="text-base text-dark/70 leading-relaxed mb-4">
                                    {scenario.description}
                                </p>
                                <div className="border-t-4 border-teal/20 pt-4">
                                    <p className="font-black text-base uppercase tracking-wider text-teal">
                                        {scenario.result}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. PULL QUOTE -- THE CONTRAST
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Old way quote */}
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 w-8 h-8 bg-coral" />
                                <div className="border-l-4 border-coral px-6 py-4">
                                    <p className="text-xl font-black uppercase tracking-tight text-white/40 leading-tight">
                                        &ldquo;We agreed to 75/25 on a phone
                                        call. Three months later, the check
                                        said 60/40. No paper trail. No
                                        recourse.&rdquo;
                                    </p>
                                    <p className="text-sm font-bold uppercase tracking-wider text-coral/60 mt-3">
                                        -- Every recruiter who trusted the old
                                        way
                                    </p>
                                </div>
                            </div>
                            {/* New way quote */}
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 w-8 h-8 bg-teal" />
                                <div className="border-l-4 border-teal px-6 py-4">
                                    <p className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                                        &ldquo;Terms locked before the first
                                        resume. Payment calculated
                                        automatically. Distributed on
                                        placement.{" "}
                                        <span className="text-teal">
                                            That is how infrastructure works.
                                        </span>
                                        &rdquo;
                                    </p>
                                    <p className="text-sm font-bold uppercase tracking-wider text-teal/60 mt-3">
                                        -- The Splits Network Standard
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                8. THE COST OF DOING NOTHING
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            The Cost of Inaction
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Doing Nothing Has a{" "}
                            <span className="text-coral">Price Tag.</span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-2xl mx-auto">
                            Every quarter you operate without split-fee
                            infrastructure, you lose money, time, and
                            candidates to problems that have already been
                            solved. These are not projections. They are
                            industry averages.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {costOfNothing.map((item, index) => (
                            <div
                                key={index}
                                className="relative border-4 border-dark bg-white p-8 text-center"
                            >
                                {/* Coral top bar */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-coral" />
                                {/* Corner accent */}
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-coral" />

                                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 border-4 border-coral">
                                    <i className={`${item.icon} text-2xl text-coral`} />
                                </div>
                                <div className="text-4xl font-black mb-2 text-coral">
                                    {item.metric}
                                </div>
                                <div className="font-black text-base uppercase tracking-wider text-dark mb-3">
                                    {item.label}
                                </div>
                                <p className="text-base text-dark/60 leading-relaxed">
                                    {item.detail}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Total cost callout */}
                    <div className="max-w-4xl mx-auto mt-12">
                        <div className="border-4 border-coral bg-coral/5 p-8 text-center">
                            <p className="text-lg font-black uppercase tracking-wider text-dark mb-2">
                                Add It Up
                            </p>
                            <p className="text-base text-dark/70 max-w-2xl mx-auto leading-relaxed">
                                A mid-volume recruiter doing 10 split placements
                                per year loses an estimated{" "}
                                <span className="font-black text-coral">
                                    $42,000+ annually
                                </span>{" "}
                                to fee disputes, wasted sourcing hours, and
                                delayed payments. That is not a cost of doing
                                business. That is the cost of not having
                                infrastructure.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                9. THE SWITCH -- HOW TO GET STARTED
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            The Switch
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            You Have Done the{" "}
                            <span className="text-teal">Hard Part.</span>
                            <br />
                            This Is the Easy Part.
                        </h2>
                        <p className="text-lg text-white/60 max-w-2xl mx-auto">
                            Years of recruiting. Hundreds of relationships.
                            Thousands of placements. You have built the
                            expertise. Now give it infrastructure.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {switchSteps.map((item) => (
                            <div
                                key={item.step}
                                className="relative border-4 border-white/20 bg-white/5 p-8"
                            >
                                {/* Color top bar */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[item.accent].bg}`}
                                />

                                {/* Step number */}
                                <div
                                    className={`w-16 h-16 ${ACCENT[item.accent].bg} border-4 border-dark flex items-center justify-center mb-4`}
                                >
                                    <span
                                        className={`text-2xl font-black ${item.accent === "teal" || item.accent === "yellow" ? "text-dark" : "text-white"}`}
                                    >
                                        {item.step}
                                    </span>
                                </div>

                                <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-white">
                                    {item.title}
                                </h3>
                                <p className="text-base text-white/60 leading-relaxed">
                                    {item.detail}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Time callout */}
                    <div className="max-w-3xl mx-auto mt-12 text-center">
                        <div className="inline-flex flex-col items-center gap-3 px-10 py-6 border-4 border-teal bg-teal/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-stopwatch text-dark text-xl" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-lg uppercase tracking-wider text-white">
                                        5 Minutes to Set Up.
                                    </p>
                                    <p className="text-base text-white/60">
                                        Your first split deal can be live
                                        before your coffee gets cold.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                10. FAQ -- STRAIGHT ANSWERS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                            No Deflection
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Questions You Are{" "}
                            <span className="text-purple">
                                Actually Asking
                            </span>
                        </h2>
                        <p className="text-lg text-dark/70">
                            Direct questions deserve direct answers. No
                            corporate doublespeak. No &ldquo;contact us for
                            more information.&rdquo;
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {portalFaqs.map((faq, index) => {
                            const accents = [
                                "coral",
                                "teal",
                                "yellow",
                                "purple",
                            ] as const;
                            const accent = accents[index % accents.length];
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
                11. THE CHALLENGE -- FINAL CTA
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-28 bg-dark overflow-hidden relative">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[6%] left-[5%] w-28 h-28 rotate-12 bg-coral opacity-15" />
                    <div className="absolute top-[10%] right-[8%] w-24 h-24 rounded-full border-4 border-teal opacity-15" />
                    <div className="absolute bottom-[15%] left-[10%] w-20 h-20 rounded-full bg-yellow opacity-15" />
                    <div className="absolute bottom-[10%] right-[6%] w-32 h-12 -rotate-6 bg-purple opacity-15" />
                    <div className="absolute top-[50%] left-[50%] w-16 h-16 rotate-45 border-4 border-coral opacity-10" />
                    <div className="absolute top-[35%] right-[30%] w-20 h-20 border-4 border-yellow rotate-12 opacity-10" />
                    {/* Zigzag */}
                    <svg
                        className="absolute bottom-[25%] left-[30%] opacity-15"
                        width="120"
                        height="30"
                        viewBox="0 0 120 30"
                    >
                        <polyline
                            points="0,25 15,5 30,25 45,5 60,25 75,5 90,25 105,5 120,25"
                            fill="none"
                            className="stroke-teal"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Plus */}
                    <svg
                        className="absolute top-[25%] left-[20%] opacity-15"
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                    >
                        <line x1="22" y1="5" x2="22" y2="39" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="22" x2="39" y2="22" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    {/* Dots */}
                    <div className="absolute top-[60%] right-[12%] opacity-10">
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div
                                    key={`dot-cta-${i}`}
                                    className="w-1.5 h-1.5 rounded-full bg-coral"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* The challenge */}
                    <div className="text-center mb-14 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-8">
                            The Challenge
                        </span>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            Run Your Next Split{" "}
                            <span className="text-teal">
                                Through the Platform.
                            </span>
                        </h2>
                        <p className="text-xl text-white/60 mb-4 max-w-3xl mx-auto">
                            One placement. That is all we ask. Post a role.
                            Submit a candidate. Watch the pipeline track itself.
                            Watch the fee calculate automatically. Watch the
                            payment distribute without a single invoice.
                        </p>
                        <p className="text-xl text-white/60 max-w-3xl mx-auto">
                            If it is not better in every measurable way than
                            whatever you are using now -- spreadsheets, email
                            chains, phone calls, sticky notes -- we will hear
                            about it. But we will not. Because the
                            infrastructure works.
                        </p>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-bolt" />
                            Accept the Challenge
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
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
                        {[
                            {
                                icon: "fa-duotone fa-regular fa-user-tie",
                                title: "Recruiters",
                                desc: "Browse roles with locked split terms. Submit candidates. Get paid on placement.",
                                link: "/join",
                                accent: "teal" as const,
                            },
                            {
                                icon: "fa-duotone fa-regular fa-building",
                                title: "Companies",
                                desc: "Post roles once. Activate a network of specialized recruiters. Pay on hire only.",
                                link: "/join",
                                accent: "coral" as const,
                            },
                            {
                                icon: "fa-duotone fa-regular fa-user",
                                title: "Candidates",
                                desc: "Get represented by recruiters competing to find your best fit. Your career, amplified.",
                                link: "https://applicant.network",
                                accent: "yellow" as const,
                            },
                        ].map((card, index) => (
                            <Link
                                key={index}
                                href={card.link}
                                className="border-4 border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10"
                            >
                                <div
                                    className={`w-12 h-12 ${ACCENT[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}
                                >
                                    <i
                                        className={`${card.icon} ${card.accent === "teal" || card.accent === "yellow" ? "text-dark" : "text-white"}`}
                                    />
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

                    {/* Final line */}
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="border-t-4 border-white/10 pt-8">
                            <p className="text-base text-white/40 uppercase tracking-wider font-bold">
                                The platform is live. The infrastructure
                                exists. The only question is whether you are
                                building on it or still duct-taping
                                spreadsheets together.
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
        </>
    );
}
