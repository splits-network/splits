import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ArticleNineAnimator } from "./article-nine-animator";

export const metadata: Metadata = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry | Employment Networks",
    description:
        "An in-depth look at how split-fee recruiting models are reshaping the hiring landscape, creating transparent partnerships, and building a more efficient ecosystem for recruiters, companies, and candidates.",
    ...buildCanonical("/articles/nine"),
};

// -- Article data -----------------------------------------------------------

const tableOfContents = [
    { num: "01", label: "The Old Guard" },
    { num: "02", label: "Enter Split-Fee" },
    { num: "03", label: "Architecture of Trust" },
    { num: "04", label: "The Three Stakeholders" },
    { num: "05", label: "Data & Outcomes" },
    { num: "06", label: "Looking Forward" },
];

const industryStats = [
    { value: "$28.4B", label: "U.S. Staffing Market" },
    { value: "73%", label: "Firms Using External Recruiters" },
    { value: "42", label: "Avg. Days to Fill a Role" },
    { value: "3.2x", label: "Cost of a Bad Hire vs. Salary" },
];

const splitFeeAdvantages = [
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Expanded Reach",
        desc: "Two specialized recruiters covering both the job order side and the candidate side doubles the effective network.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Aligned Incentives",
        desc: "Both parties earn only when a placement happens, eliminating wasted effort and misaligned goals.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Faster Time-to-Fill",
        desc: "Parallel sourcing from multiple specialized recruiters compresses hiring timelines significantly.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Reduced Risk",
        desc: "Companies pay only on successful placement. No retainers, no upfront commitments, no surprise invoices.",
    },
];

const outcomeMetrics = [
    { value: "68%", label: "Faster placements vs. traditional recruiting" },
    { value: "2.4x", label: "More candidates per role on average" },
    { value: "91%", label: "Recruiter satisfaction with split-fee terms" },
    { value: "35%", label: "Reduction in cost-per-hire for companies" },
];

// -- Page -------------------------------------------------------------------

export default function ArticleNinePage() {
    return (
        <ArticleNineAnimator>
            {/* ============================================================
                ARTICLE HERO
            ============================================================ */}
            <header className="art9-hero relative min-h-[70vh] flex items-end overflow-hidden bg-white">
                {/* Dotted grid background */}
                <div
                    className="absolute inset-0 opacity-[0.10]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Blueprint border frame */}
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/15 pointer-events-none" />

                {/* Corner marks */}
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">
                    ART-09
                </div>
                <div className="absolute top-8 left-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">
                    2026.02.14
                </div>

                <div className="container mx-auto px-6 relative z-10 pb-16 pt-32">
                    <div className="max-w-4xl">
                        {/* Category & metadata bar */}
                        <div className="art9-hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase border border-[#233876]/15 px-3 py-1">
                                Industry Analysis
                            </span>
                            <span className="font-mono text-xs text-[#233876]/30">
                                //
                            </span>
                            <span className="font-mono text-xs text-[#233876]/30">
                                12 min read
                            </span>
                            <span className="font-mono text-xs text-[#233876]/30">
                                //
                            </span>
                            <span className="font-mono text-xs text-[#233876]/30">
                                February 2026
                            </span>
                        </div>

                        <h1 className="art9-hero-title text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-[#0f1b3d] mb-8 opacity-0">
                            The Future of Recruiting:
                            <br />
                            <span className="text-[#233876]">
                                How Split-Fee Models Are
                                <br />
                                Changing The Industry
                            </span>
                        </h1>

                        <p className="art9-hero-excerpt text-lg md:text-xl text-[#0f1b3d]/50 max-w-2xl leading-relaxed mb-10 opacity-0">
                            The recruiting industry is undergoing a structural shift.
                            Split-fee models are replacing siloed processes with
                            transparent, collaborative networks that benefit every
                            participant in the hiring ecosystem.
                        </p>

                        {/* Author line */}
                        <div className="art9-hero-author flex items-center gap-4 opacity-0">
                            <div className="w-10 h-10 border-2 border-[#233876]/20 flex items-center justify-center bg-[#233876] text-white font-mono text-sm font-bold">
                                EN
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-[#0f1b3d]">
                                    Employment Networks Editorial
                                </div>
                                <div className="font-mono text-xs text-[#0f1b3d]/30">
                                    Research &amp; Analysis Division
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom rule */}
                <div className="art9-hero-rule absolute bottom-0 left-0 right-0 h-[2px] bg-[#233876]/10" />
            </header>

            {/* ============================================================
                TABLE OF CONTENTS
            ============================================================ */}
            <nav className="art9-toc relative py-10 bg-[#f7f8fa] border-b border-[#233876]/10">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-toc-label font-mono text-[10px] tracking-[0.3em] text-[#233876]/30 uppercase mb-4 opacity-0">
                            Contents
                        </div>
                        <div className="art9-toc-items flex flex-wrap gap-x-8 gap-y-2">
                            {tableOfContents.map((item, i) => (
                                <a
                                    key={i}
                                    href={`#section-${item.num}`}
                                    className="art9-toc-item flex items-center gap-2 text-sm text-[#0f1b3d]/40 hover:text-[#233876] transition-colors opacity-0"
                                >
                                    <span className="font-mono text-xs text-[#233876]/30">
                                        {item.num}
                                    </span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ============================================================
                SECTION 01 - THE OLD GUARD
            ============================================================ */}
            <section
                id="section-01"
                className="art9-section relative py-20 bg-white overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-[#233876]/4"
                            style={{ top: `${(i + 1) * 15}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-[#233876]/8 leading-none flex-shrink-0">
                                01
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">
                                    The Old Guard
                                </h2>
                                <div className="art9-section-line h-[2px] bg-[#233876]/10 w-24" />
                            </div>
                        </div>

                        <div className="art9-body space-y-6 opacity-0">
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                For decades, recruiting has operated on a fundamentally fragmented
                                model. Companies engage multiple agencies through bilateral contracts,
                                each with different terms, fee structures, and communication protocols.
                                Recruiters work in isolation, often duplicating effort across overlapping
                                candidate pools. Candidates navigate a maze of job boards, each
                                presenting the same roles under different guises.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                The result is an industry marked by inefficiency, opacity, and
                                misaligned incentives. Recruiters spend more time on administrative
                                overhead than on the work that matters: finding and placing great
                                talent. Companies lack visibility into who is actually working their
                                roles and how pipelines are progressing. Candidates are left in the
                                dark, wondering if their application even made it past the first gate.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                This fragmentation is not merely inconvenient. It is structurally
                                expensive. The average cost-per-hire in the United States continues
                                to climb, driven not by recruiter fees alone but by the systemic
                                friction embedded in how recruiting operates at every level.
                            </p>
                        </div>

                        {/* Industry stats grid */}
                        <div className="art9-stats grid grid-cols-2 md:grid-cols-4 gap-px bg-[#233876]/10 border border-[#233876]/10 mt-12 opacity-0">
                            {industryStats.map((stat, i) => (
                                <div key={i} className="bg-white px-5 py-6 text-center">
                                    <div className="font-mono text-2xl font-bold text-[#233876] mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#0f1b3d]/35 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECTION 02 - ENTER SPLIT-FEE
            ============================================================ */}
            <section
                id="section-02"
                className="art9-section relative py-20 bg-[#f7f8fa] overflow-hidden"
            >
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-[#233876]/8 leading-none flex-shrink-0">
                                02
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">
                                    Enter Split-Fee
                                </h2>
                                <div className="art9-section-line h-[2px] bg-[#233876]/10 w-24" />
                            </div>
                        </div>

                        <div className="art9-body space-y-6 opacity-0">
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                Split-fee recruiting is not a new concept, but its modern
                                incarnation looks nothing like the informal handshake deals of
                                the past. Today&apos;s split-fee model is a structured, technology-driven
                                framework that formalizes collaboration between recruiters, creating
                                a marketplace where specialization is an asset rather than a limitation.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                In a split-fee arrangement, one recruiter holds the job order
                                (the relationship with the hiring company) while another provides
                                the candidate. When a placement is made, the fee is divided according
                                to pre-agreed terms. This simple mechanism unlocks enormous value:
                                it allows recruiters to focus on what they do best while accessing
                                opportunities or talent pools they could never reach alone.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                The key innovation is not the fee split itself. It is the platform
                                infrastructure that makes split-fee recruiting scalable, transparent,
                                and trustworthy. Without clear terms, automated tracking, and
                                real-time visibility, split-fee arrangements collapse under the
                                weight of ambiguity. With the right architecture, they become the
                                most efficient recruiting model available.
                            </p>
                        </div>

                        {/* Pull quote */}
                        <div className="art9-pullquote my-14 opacity-0">
                            <div className="border-l-[3px] border-[#233876] pl-8 py-2">
                                <blockquote className="text-2xl md:text-3xl font-bold text-[#0f1b3d] leading-snug mb-4">
                                    &ldquo;The platform is the product. Without transparent
                                    infrastructure, split-fee recruiting is just another
                                    handshake deal.&rdquo;
                                </blockquote>
                                <cite className="font-mono text-xs text-[#233876]/40 tracking-wider uppercase not-italic">
                                    Employment Networks // Founding Principle
                                </cite>
                            </div>
                        </div>

                        {/* Advantages grid */}
                        <div className="art9-advantages grid md:grid-cols-2 gap-px bg-[#233876]/10 opacity-0">
                            {splitFeeAdvantages.map((adv, i) => (
                                <div key={i} className="art9-adv-card bg-white p-7">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center flex-shrink-0">
                                            <i className={`${adv.icon} text-[#233876]`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0f1b3d] text-sm mb-1">
                                                {adv.title}
                                            </h3>
                                            <p className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                                {adv.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                IMAGE BREAK - Overhead workspace
            ============================================================ */}
            <div className="art9-image-break relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
                    alt="Modern office workspace from above"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/65" />

                {/* Blueprint overlay lines */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-[#233876]" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-[#233876]" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-[#233876]" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-[#233876]" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="art9-image-text text-center px-6 opacity-0">
                        <div className="font-mono text-xs tracking-[0.3em] text-[#233876]/50 uppercase mb-3">
                            The New Standard
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f1b3d]">
                            Collaboration by Design
                        </h2>
                    </div>
                </div>
            </div>

            {/* ============================================================
                SECTION 03 - ARCHITECTURE OF TRUST
            ============================================================ */}
            <section
                id="section-03"
                className="art9-section relative py-20 bg-white overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 border-l border-dashed border-[#233876]/4"
                            style={{ left: `${(i + 1) * 11}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-[#233876]/8 leading-none flex-shrink-0">
                                03
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">
                                    Architecture of Trust
                                </h2>
                                <div className="art9-section-line h-[2px] bg-[#233876]/10 w-24" />
                            </div>
                        </div>

                        <div className="art9-body space-y-6 opacity-0">
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                The success of any split-fee platform depends on one thing above
                                all else: trust. Not the vague, aspirational trust of a mission
                                statement, but the structural trust embedded in how the system
                                works. When every term is visible, every pipeline is trackable, and
                                every fee is predetermined, trust becomes a feature of the architecture
                                itself.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                This is the core insight behind modern split-fee platforms. They do
                                not ask participants to trust each other on faith. They build systems
                                where trust is a natural consequence of transparency. Companies can
                                see exactly which recruiters are working their roles and how their
                                pipelines are progressing. Recruiters can see exact fee structures
                                before they opt into a role. Candidates can track their applications
                                in real time.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                This transparency creates a virtuous cycle. When participants trust
                                the system, they engage more deeply. When they engage more deeply,
                                outcomes improve. When outcomes improve, more participants join. The
                                network effect compounds, and the entire ecosystem becomes more
                                valuable for everyone in it.
                            </p>
                        </div>

                        {/* Blueprint-style diagram */}
                        <div className="art9-diagram mt-14 opacity-0">
                            <div className="border-2 border-[#233876]/10 p-8 relative bg-white">
                                {/* Corner marks */}
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                <div className="font-mono text-[10px] text-[#233876]/25 tracking-wider uppercase mb-6">
                                    Trust Architecture // Schematic
                                </div>

                                <div className="grid md:grid-cols-3 gap-px bg-[#233876]/10">
                                    {[
                                        {
                                            label: "Visibility Layer",
                                            icon: "fa-duotone fa-regular fa-eye",
                                            items: [
                                                "Real-time pipeline tracking",
                                                "Activity dashboards",
                                                "Status notifications",
                                            ],
                                        },
                                        {
                                            label: "Terms Layer",
                                            icon: "fa-duotone fa-regular fa-file-contract",
                                            items: [
                                                "Pre-set fee structures",
                                                "Clear split ratios",
                                                "Automated payouts",
                                            ],
                                        },
                                        {
                                            label: "Communication Layer",
                                            icon: "fa-duotone fa-regular fa-comments",
                                            items: [
                                                "In-platform messaging",
                                                "Feedback loops",
                                                "No ghosting guarantee",
                                            ],
                                        },
                                    ].map((layer, i) => (
                                        <div
                                            key={i}
                                            className="bg-white p-6"
                                        >
                                            <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center mb-4">
                                                <i className={`${layer.icon} text-[#233876]`} />
                                            </div>
                                            <div className="font-semibold text-[#0f1b3d] text-sm mb-3">
                                                {layer.label}
                                            </div>
                                            <ul className="space-y-2">
                                                {layer.items.map((item, j) => (
                                                    <li
                                                        key={j}
                                                        className="flex items-start gap-2 text-xs text-[#0f1b3d]/40 leading-relaxed"
                                                    >
                                                        <span className="w-1 h-1 rounded-full bg-[#233876]/25 mt-1.5 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECTION 04 - THE THREE STAKEHOLDERS
            ============================================================ */}
            <section
                id="section-04"
                className="art9-section relative py-20 bg-[#f7f8fa] overflow-hidden"
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-[#233876]/8 leading-none flex-shrink-0">
                                04
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">
                                    The Three Stakeholders
                                </h2>
                                <div className="art9-section-line h-[2px] bg-[#233876]/10 w-24" />
                            </div>
                        </div>

                        <div className="art9-body space-y-6 mb-14 opacity-0">
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                A split-fee ecosystem serves three distinct audiences, each with
                                different needs and motivations. The platform&apos;s architecture must
                                address all three simultaneously, creating value loops where each
                                participant&apos;s engagement improves outcomes for the others.
                            </p>
                        </div>

                        {/* Three stakeholder cards */}
                        <div className="art9-stakeholders grid md:grid-cols-3 gap-px bg-[#233876]/10">
                            {[
                                {
                                    role: "Recruiters",
                                    icon: "fa-duotone fa-regular fa-user-tie",
                                    platform: "Splits Network",
                                    points: [
                                        "Access curated job orders without cold outreach",
                                        "Choose roles that match their specialization",
                                        "Track submissions and placements in one pipeline",
                                        "See exact earnings before opting into any role",
                                    ],
                                },
                                {
                                    role: "Companies",
                                    icon: "fa-duotone fa-regular fa-building",
                                    platform: "Splits Network",
                                    points: [
                                        "Tap into a network of vetted, specialized recruiters",
                                        "Set terms once and apply them consistently",
                                        "Full visibility into every pipeline and recruiter",
                                        "Pay only when someone starts; no retainers",
                                    ],
                                },
                                {
                                    role: "Candidates",
                                    icon: "fa-duotone fa-regular fa-user",
                                    platform: "Applicant Network",
                                    points: [
                                        "Get matched with recruiters who advocate for them",
                                        "Track application status in real time",
                                        "Receive genuine feedback, not silence",
                                        "Completely free to use, always",
                                    ],
                                },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="art9-stakeholder-card bg-white p-8 opacity-0"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center">
                                            <i className={`${s.icon} text-[#233876]`} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#0f1b3d]">
                                                {s.role}
                                            </div>
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                {s.platform}
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="space-y-3">
                                        {s.points.map((point, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-2 text-sm text-[#0f1b3d]/50 leading-relaxed"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#233876]/20 mt-2 flex-shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Pull quote */}
                        <div className="art9-pullquote my-14 opacity-0">
                            <div className="border-l-[3px] border-[#233876] pl-8 py-2">
                                <blockquote className="text-2xl md:text-3xl font-bold text-[#0f1b3d] leading-snug mb-4">
                                    &ldquo;When each stakeholder wins, the ecosystem compounds.
                                    That is not idealism. It is architecture.&rdquo;
                                </blockquote>
                                <cite className="font-mono text-xs text-[#233876]/40 tracking-wider uppercase not-italic">
                                    Network Design Principle // 04
                                </cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECTION 05 - DATA & OUTCOMES
            ============================================================ */}
            <section
                id="section-05"
                className="art9-section relative py-20 bg-white overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-[#233876]/4"
                            style={{ top: `${(i + 1) * 15}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-[#233876]/8 leading-none flex-shrink-0">
                                05
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">
                                    Data &amp; Outcomes
                                </h2>
                                <div className="art9-section-line h-[2px] bg-[#233876]/10 w-24" />
                            </div>
                        </div>

                        <div className="art9-body space-y-6 opacity-0">
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                The data from early split-fee platform adopters paints a clear
                                picture. Structured collaboration does not just feel better; it
                                delivers measurably superior outcomes across every metric that
                                matters. Time-to-fill decreases because multiple specialized
                                recruiters work in parallel. Candidate quality improves because
                                recruiters can focus on their niche rather than stretching across
                                industries they do not know well.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                Companies report significant reductions in cost-per-hire, not
                                because individual recruiter fees are lower, but because the
                                efficiency of the system eliminates the hidden costs of
                                fragmentation: duplicated effort, slow pipelines, bad hires from
                                rushed processes, and the administrative burden of managing
                                multiple agency relationships.
                            </p>
                        </div>

                        {/* Outcome metrics */}
                        <div className="art9-outcomes grid grid-cols-2 md:grid-cols-4 gap-px bg-[#233876]/10 border border-[#233876]/10 mt-12 opacity-0">
                            {outcomeMetrics.map((m, i) => (
                                <div key={i} className="bg-white px-5 py-8 text-center">
                                    <div className="font-mono text-3xl md:text-4xl font-bold text-[#233876] mb-2">
                                        {m.value}
                                    </div>
                                    <div className="text-xs text-[#0f1b3d]/35 leading-relaxed max-w-[160px] mx-auto">
                                        {m.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECOND IMAGE BREAK
            ============================================================ */}
            <div className="art9-image-break relative h-[35vh] md:h-[45vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
                    alt="Team collaborating at a table from above"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/70" />

                <div className="absolute inset-0 pointer-events-none opacity-8">
                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-[#233876]" />
                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-[#233876]" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="art9-image-text text-center px-6 opacity-0">
                        <div className="font-mono text-xs tracking-[0.3em] text-[#233876]/50 uppercase mb-3">
                            Looking Ahead
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f1b3d]">
                            The Network Effect
                        </h2>
                    </div>
                </div>
            </div>

            {/* ============================================================
                SECTION 06 - LOOKING FORWARD
            ============================================================ */}
            <section
                id="section-06"
                className="art9-section relative py-20 bg-[#f7f8fa] overflow-hidden"
            >
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="art9-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-[#233876]/8 leading-none flex-shrink-0">
                                06
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">
                                    Looking Forward
                                </h2>
                                <div className="art9-section-line h-[2px] bg-[#233876]/10 w-24" />
                            </div>
                        </div>

                        <div className="art9-body space-y-6 opacity-0">
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                The split-fee model is still in its early innings. As platforms
                                mature and network effects compound, we expect several developments
                                to accelerate adoption. AI-powered matching will reduce the time
                                between a role being posted and the right recruiter engaging with it.
                                Automated compliance tools will handle the regulatory complexity that
                                currently slows down cross-border placements. And data analytics will
                                give companies unprecedented insight into their recruiting
                                performance.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                But the most significant shift will be cultural. As more recruiters
                                experience the benefits of structured collaboration, the old model of
                                isolated, competitive recruiting will look increasingly obsolete. The
                                recruiters who thrive in the next decade will be those who specialize
                                deeply and collaborate broadly, using platforms that make both
                                possible.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                For companies, the calculus is straightforward: a single platform
                                that provides access to a network of specialized recruiters, with
                                full transparency and pay-on-hire terms, is simply a better way to
                                fill roles. For candidates, a system that guarantees communication,
                                provides real advocacy, and costs nothing is an obvious upgrade from
                                the status quo.
                            </p>
                            <p className="text-[#0f1b3d]/60 leading-[1.85] text-base">
                                The future of recruiting is not a marginal improvement on the
                                existing system. It is a structural redesign. Split-fee platforms
                                represent the blueprint for that redesign: transparent, collaborative,
                                and built to serve every participant in the hiring ecosystem.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                CTA
            ============================================================ */}
            <section className="art9-cta relative py-24 bg-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Blueprint border */}
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="art9-cta-content max-w-3xl mx-auto text-center opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            Join the Ecosystem
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                            Ready to See the Blueprint in Action?
                        </h2>
                        <p className="text-lg text-[#0f1b3d]/50 mb-10 max-w-xl mx-auto">
                            Whether you recruit, hire, or job search, the split-fee
                            ecosystem was built for you.
                        </p>
                    </div>

                    <div className="art9-cta-cards grid md:grid-cols-3 gap-px bg-[#233876]/10 max-w-4xl mx-auto mb-14">
                        {[
                            {
                                role: "Recruiters",
                                icon: "fa-duotone fa-regular fa-user-tie",
                                sub: "Splits Network",
                                desc: "Join the marketplace. Access curated roles with transparent splits.",
                                href: "https://splits.network/sign-up",
                                cta: "Join Network",
                            },
                            {
                                role: "Companies",
                                icon: "fa-duotone fa-regular fa-building",
                                sub: "Splits Network",
                                desc: "Post roles to a network of specialized recruiters. Pay on hire.",
                                href: "https://splits.network/sign-up",
                                cta: "Post a Role",
                            },
                            {
                                role: "Candidates",
                                icon: "fa-duotone fa-regular fa-user",
                                sub: "Applicant Network",
                                desc: "Get matched with expert recruiters. Track everything. Free forever.",
                                href: "https://applicant.network/sign-up",
                                cta: "Create Profile",
                            },
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="art9-cta-card bg-white p-8 opacity-0"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center">
                                        <i className={`${card.icon} text-[#233876]`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            {card.role}
                                        </div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                            {card.sub}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-[#0f1b3d]/40 mb-6 leading-relaxed">
                                    {card.desc}
                                </p>
                                <a
                                    href={card.href}
                                    className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none w-full font-medium tracking-wide"
                                >
                                    {card.cta}
                                    <i className="fa-regular fa-arrow-right" />
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="art9-cta-footer text-center opacity-0">
                        <p className="text-sm text-[#0f1b3d]/30 mb-3">
                            Questions about this article or our platforms?
                        </p>
                        <a
                            href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 font-mono text-sm text-[#233876]/60 hover:text-[#233876] transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </ArticleNineAnimator>
    );
}
