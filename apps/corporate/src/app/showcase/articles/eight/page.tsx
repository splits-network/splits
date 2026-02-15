import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ArticleEightAnimator } from "./article-eight-animator";

export const metadata: Metadata = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry | Employment Networks",
    description:
        "An in-depth blueprint of how split-fee recruiting models are engineering the future of hiring through transparent partnerships, precision collaboration, and structural innovation.",
    ...buildCanonical("/articles/eight"),
};

// -- Article data -----------------------------------------------------------

const tableOfContents = [
    { num: "01", label: "Legacy Infrastructure" },
    { num: "02", label: "The Split-Fee Blueprint" },
    { num: "03", label: "Engineering Trust" },
    { num: "04", label: "Structural Roles" },
    { num: "05", label: "Performance Metrics" },
    { num: "06", label: "The Build Ahead" },
];

const industryStats = [
    { value: "$28.4B", label: "U.S. Staffing Market" },
    { value: "73%", label: "Firms Using External Recruiters" },
    { value: "42", label: "Avg. Days to Fill a Role" },
    { value: "3.2x", label: "Cost of a Bad Hire vs. Salary" },
];

const platformBlocks = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        desc: "A structured ecosystem where recruiters and companies collaborate on placements with pre-defined, transparent fee arrangements.",
        layer: 1,
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Integrated ATS",
        desc: "Every candidate tracked from first contact through placement, with full pipeline visibility for all stakeholders.",
        layer: 2,
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Analytics Engine",
        desc: "Real-time dashboards measuring pipeline health, time-to-fill, recruiter performance, and revenue forecasting.",
        layer: 3,
    },
    {
        icon: "fa-duotone fa-regular fa-robot",
        title: "AI Matching",
        desc: "Intelligent algorithms that connect the right candidates with the right roles based on skills, experience, and cultural fit.",
        layer: 4,
    },
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

const buildPhases = [
    {
        phase: "01",
        title: "Foundation",
        subtitle: "Establish the base structure",
        details: [
            "Create your company profile and define organizational needs",
            "Set fee structures, split ratios, and engagement terms",
            "Invite your recruiting team and configure access controls",
        ],
        icon: "fa-duotone fa-regular fa-layer-group",
    },
    {
        phase: "02",
        title: "Framework",
        subtitle: "Erect the pipeline structure",
        details: [
            "Post roles to the marketplace with clear specifications",
            "Specialized recruiters discover and claim matching roles",
            "Candidates begin flowing into your integrated ATS",
        ],
        icon: "fa-duotone fa-regular fa-sitemap",
    },
    {
        phase: "03",
        title: "Structure",
        subtitle: "Build collaborative workflows",
        details: [
            "Real-time submission tracking across all active pipelines",
            "Coordinated interview scheduling and feedback loops",
            "Transparent communication between all parties",
        ],
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        phase: "04",
        title: "Completion",
        subtitle: "Deliver and collect",
        details: [
            "Automated placement tracking from offer to start date",
            "Split-fee calculations handled by the platform",
            "Integrated billing with direct payout processing",
        ],
        icon: "fa-duotone fa-regular fa-flag-checkered",
    },
];

const outcomeMetrics = [
    { value: "68%", label: "Faster placements vs. traditional recruiting" },
    { value: "2.4x", label: "More candidates per role on average" },
    { value: "91%", label: "Recruiter satisfaction with split-fee terms" },
    { value: "35%", label: "Reduction in cost-per-hire for companies" },
];

// -- Page -------------------------------------------------------------------

export default function ArticleEightPage() {
    return (
        <ArticleEightAnimator>
            {/* ============================================================
                ARTICLE HERO - Blueprint Construction
            ============================================================ */}
            <header className="a8-hero relative min-h-[70vh] flex items-end overflow-hidden"
                style={{ backgroundColor: "#0a1628" }}>
                {/* Blueprint grid overlay */}
                <div className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Animated grid lines */}
                <div className="absolute top-[25%] left-0 right-0 h-px bg-cyan-500/20 a8-grid-line" />
                <div className="absolute top-[50%] left-0 right-0 h-px bg-cyan-500/15 a8-grid-line" />
                <div className="absolute top-[75%] left-0 right-0 h-px bg-cyan-500/20 a8-grid-line" />
                <div className="absolute left-[20%] top-0 bottom-0 w-px bg-cyan-500/10 a8-grid-line-v" />
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-cyan-500/15 a8-grid-line-v" />
                <div className="absolute left-[80%] top-0 bottom-0 w-px bg-cyan-500/10 a8-grid-line-v" />

                {/* Corner dimension marks */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
                <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-cyan-500/30" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-cyan-500/30" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30" />

                {/* Corner marks */}
                <div className="absolute top-8 right-10 font-mono text-[10px] text-cyan-500/30 tracking-wider">
                    ART-08
                </div>
                <div className="absolute top-8 left-10 font-mono text-[10px] text-cyan-500/30 tracking-wider">
                    2026.02.14
                </div>

                <div className="container mx-auto px-6 relative z-10 pb-16 pt-32">
                    <div className="max-w-4xl">
                        {/* Category & metadata bar */}
                        <div className="a8-hero-badge flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono">
                                <i className="fa-duotone fa-regular fa-compass-drafting text-xs" />
                                Industry Blueprint
                            </span>
                            <span className="font-mono text-xs text-cyan-500/30">//</span>
                            <span className="font-mono text-xs text-cyan-500/30">12 min read</span>
                            <span className="font-mono text-xs text-cyan-500/30">//</span>
                            <span className="font-mono text-xs text-cyan-500/30">February 2026</span>
                        </div>

                        <h1 className="a8-hero-title text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-white mb-8 opacity-0">
                            The Future of Recruiting:
                            <br />
                            <span className="text-cyan-400">
                                How Split-Fee Models Are
                                <br />
                                Changing The Industry
                            </span>
                        </h1>

                        <p className="a8-hero-excerpt text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10 opacity-0">
                            The recruiting industry is undergoing a structural redesign.
                            Split-fee models are replacing siloed processes with precision-engineered
                            networks built on transparency, collaboration, and measurable outcomes.
                        </p>

                        {/* Author line */}
                        <div className="a8-hero-author flex items-center gap-4 opacity-0">
                            <div className="w-10 h-10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-sm font-bold"
                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                EN
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-white">
                                    Employment Networks Editorial
                                </div>
                                <div className="font-mono text-xs text-cyan-500/40">
                                    Research &amp; Analysis Division
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom rule */}
                <div className="a8-hero-rule absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500/20" />
            </header>

            {/* ============================================================
                TABLE OF CONTENTS
            ============================================================ */}
            <nav className="a8-toc relative py-10 border-b border-cyan-500/10"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-toc-label font-mono text-[10px] tracking-[0.3em] text-cyan-500/40 uppercase mb-4 opacity-0">
                            Blueprint Contents
                        </div>
                        <div className="a8-toc-items flex flex-wrap gap-x-8 gap-y-2">
                            {tableOfContents.map((item, i) => (
                                <a key={i}
                                    href={`#section-${item.num}`}
                                    className="a8-toc-item flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors opacity-0">
                                    <span className="font-mono text-xs text-cyan-500/30">{item.num}</span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ============================================================
                SECTION 01 - LEGACY INFRASTRUCTURE
            ============================================================ */}
            <section id="section-01"
                className="a8-section relative py-20 overflow-hidden"
                style={{ backgroundColor: "#081220" }}>
                {/* Horizontal dashed construction lines */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-cyan-500/5"
                            style={{ top: `${(i + 1) * 15}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-cyan-500/10 leading-none flex-shrink-0">
                                01
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    Legacy Infrastructure
                                </h2>
                                <div className="a8-section-line h-[2px] bg-cyan-500/20 w-24" />
                            </div>
                        </div>

                        <div className="a8-body space-y-6 opacity-0">
                            <p className="text-slate-400 leading-[1.85] text-base">
                                For decades, recruiting has operated on a fundamentally fragmented
                                model. Companies engage multiple agencies through bilateral contracts,
                                each with different terms, fee structures, and communication protocols.
                                Recruiters work in isolation, often duplicating effort across overlapping
                                candidate pools. Candidates navigate a maze of job boards, each
                                presenting the same roles under different guises.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                The result is an industry marked by inefficiency, opacity, and
                                misaligned incentives. Recruiters spend more time on administrative
                                overhead than on the work that matters: finding and placing great
                                talent. Companies lack visibility into who is actually working their
                                roles and how pipelines are progressing. Candidates are left in the
                                dark, wondering if their application even made it past the first gate.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                This fragmentation is not merely inconvenient. It is structurally
                                expensive. The average cost-per-hire in the United States continues
                                to climb, driven not by recruiter fees alone but by the systemic
                                friction embedded in how recruiting operates at every level. The
                                old infrastructure was never designed for scale. It was assembled
                                piece by piece, without a blueprint.
                            </p>
                        </div>

                        {/* Industry stats grid - blueprint style */}
                        <div className="a8-stats grid grid-cols-2 md:grid-cols-4 gap-px mt-12 opacity-0"
                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                            {industryStats.map((stat, i) => (
                                <div key={i} className="px-5 py-6 text-center"
                                    style={{ backgroundColor: "#0d1d33" }}>
                                    <div className="font-mono text-2xl font-bold text-cyan-300 mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECTION 02 - THE SPLIT-FEE BLUEPRINT
            ============================================================ */}
            <section id="section-02"
                className="a8-section relative py-20 overflow-hidden"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-cyan-500/10 leading-none flex-shrink-0">
                                02
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    The Split-Fee Blueprint
                                </h2>
                                <div className="a8-section-line h-[2px] bg-cyan-500/20 w-24" />
                            </div>
                        </div>

                        <div className="a8-body space-y-6 opacity-0">
                            <p className="text-slate-400 leading-[1.85] text-base">
                                Split-fee recruiting is not a new concept, but its modern
                                incarnation looks nothing like the informal handshake deals of
                                the past. Today&apos;s split-fee model is a structured, technology-driven
                                framework that formalizes collaboration between recruiters, creating
                                a marketplace where specialization is an asset rather than a limitation.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                In a split-fee arrangement, one recruiter holds the job order
                                (the relationship with the hiring company) while another provides
                                the candidate. When a placement is made, the fee is divided according
                                to pre-agreed terms. This simple mechanism unlocks enormous value:
                                it allows recruiters to focus on what they do best while accessing
                                opportunities or talent pools they could never reach alone.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                The key innovation is not the fee split itself. It is the platform
                                infrastructure that makes split-fee recruiting scalable, transparent,
                                and trustworthy. Without clear terms, automated tracking, and
                                real-time visibility, split-fee arrangements collapse under the
                                weight of ambiguity. With the right architecture, they become the
                                most efficient recruiting model available.
                            </p>
                        </div>

                        {/* Pull quote - blueprint style */}
                        <div className="a8-pullquote my-14 opacity-0">
                            <div className="border-l-[3px] border-cyan-400 pl-8 py-2">
                                <blockquote className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">
                                    &ldquo;The platform is the product. Without transparent
                                    infrastructure, split-fee recruiting is just another
                                    handshake deal.&rdquo;
                                </blockquote>
                                <cite className="font-mono text-xs text-cyan-500/40 tracking-wider uppercase not-italic">
                                    Employment Networks // Founding Principle
                                </cite>
                            </div>
                        </div>

                        {/* Advantages grid - isometric card style */}
                        <div className="a8-blocks grid md:grid-cols-2 gap-4">
                            {splitFeeAdvantages.map((adv, i) => (
                                <div key={i} className="a8-block-card group relative opacity-0">
                                    {/* Isometric shadow */}
                                    <div className="absolute inset-0 rounded-xl translate-y-1 translate-x-1"
                                        style={{ backgroundColor: "rgba(34,211,238,0.05)" }} />
                                    <div className="relative rounded-xl p-6 border border-cyan-500/15 transition-all duration-300 group-hover:border-cyan-400/30"
                                        style={{ backgroundColor: "#0f2847" }}>
                                        <div className="flex items-start gap-4">
                                            <div className="a8-block-icon w-10 h-10 rounded-lg border border-cyan-500/30 flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                                <i className={`${adv.icon} text-cyan-400`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm mb-1">
                                                    {adv.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {adv.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                IMAGE BREAK - Architecture workspace
            ============================================================ */}
            <div className="a8-image-break relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
                    alt="Modern architectural office workspace from above"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,22,40,0.75)" }} />

                {/* Blueprint overlay lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-cyan-500" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-cyan-500" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-cyan-500" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-cyan-500" />
                </div>

                {/* Corner marks */}
                <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-cyan-500/40" />
                <div className="absolute top-6 right-6 w-10 h-10 border-r-2 border-t-2 border-cyan-500/40" />
                <div className="absolute bottom-6 left-6 w-10 h-10 border-l-2 border-b-2 border-cyan-500/40" />
                <div className="absolute bottom-6 right-6 w-10 h-10 border-r-2 border-b-2 border-cyan-500/40" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="a8-image-text text-center px-6 opacity-0">
                        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400/60 uppercase mb-3">
                            Structural Design
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                            Collaboration by Design
                        </h2>
                    </div>
                </div>
            </div>

            {/* ============================================================
                SECTION 03 - ENGINEERING TRUST
            ============================================================ */}
            <section id="section-03"
                className="a8-section relative py-20 overflow-hidden"
                style={{ backgroundColor: "#081220" }}>
                {/* Vertical construction lines */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div key={i}
                            className="absolute top-0 bottom-0 border-l border-dashed border-cyan-500/4"
                            style={{ left: `${(i + 1) * 11}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-cyan-500/10 leading-none flex-shrink-0">
                                03
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    Engineering Trust
                                </h2>
                                <div className="a8-section-line h-[2px] bg-cyan-500/20 w-24" />
                            </div>
                        </div>

                        <div className="a8-body space-y-6 opacity-0">
                            <p className="text-slate-400 leading-[1.85] text-base">
                                The success of any split-fee platform depends on one thing above
                                all else: trust. Not the vague, aspirational trust of a mission
                                statement, but the structural trust embedded in how the system
                                works. When every term is visible, every pipeline is trackable, and
                                every fee is predetermined, trust becomes a feature of the architecture
                                itself.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                This is the core insight behind modern split-fee platforms. They do
                                not ask participants to trust each other on faith. They build systems
                                where trust is a natural consequence of transparency. Companies can
                                see exactly which recruiters are working their roles and how their
                                pipelines are progressing. Recruiters can see exact fee structures
                                before they opt into a role. Candidates can track their applications
                                in real time.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                This transparency creates a virtuous cycle. When participants trust
                                the system, they engage more deeply. When they engage more deeply,
                                outcomes improve. When outcomes improve, more participants join. The
                                network effect compounds, and the entire ecosystem becomes more
                                valuable for everyone in it.
                            </p>
                        </div>

                        {/* Blueprint-style trust architecture diagram */}
                        <div className="a8-diagram mt-14 opacity-0">
                            <div className="border-2 border-cyan-500/15 p-8 relative"
                                style={{ backgroundColor: "#0d1d33" }}>
                                {/* Corner marks */}
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500/30" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-500/30" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-500/30" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500/30" />

                                <div className="font-mono text-[10px] text-cyan-500/30 tracking-wider uppercase mb-6">
                                    Trust Architecture // Schematic
                                </div>

                                <div className="grid md:grid-cols-3 gap-px"
                                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
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
                                        <div key={i} className="p-6"
                                            style={{ backgroundColor: "#0f2847" }}>
                                            <div className="w-10 h-10 rounded-lg border border-cyan-500/30 flex items-center justify-center mb-4"
                                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                                <i className={`${layer.icon} text-cyan-400`} />
                                            </div>
                                            <div className="font-semibold text-white text-sm mb-3">
                                                {layer.label}
                                            </div>
                                            <ul className="space-y-2">
                                                {layer.items.map((item, j) => (
                                                    <li key={j}
                                                        className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                                                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                                            style={{ backgroundColor: "#22d3ee" }} />
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
                SECTION 04 - STRUCTURAL ROLES
            ============================================================ */}
            <section id="section-04"
                className="a8-section relative py-20 overflow-hidden"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-cyan-500/10 leading-none flex-shrink-0">
                                04
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    Structural Roles
                                </h2>
                                <div className="a8-section-line h-[2px] bg-cyan-500/20 w-24" />
                            </div>
                        </div>

                        <div className="a8-body space-y-6 mb-14 opacity-0">
                            <p className="text-slate-400 leading-[1.85] text-base">
                                A split-fee ecosystem serves three distinct audiences, each with
                                different needs and motivations. Like a well-designed building,
                                every participant in the ecosystem serves a critical structural
                                function. The platform&apos;s architecture must address all three
                                simultaneously, creating value loops where each participant&apos;s
                                engagement improves outcomes for the others.
                            </p>
                        </div>

                        {/* Stakeholder cards - isometric blueprint style */}
                        <div className="a8-stakeholders grid md:grid-cols-3 gap-6"
                            style={{ perspective: "1200px" }}>
                            {[
                                {
                                    role: "Recruiters",
                                    tagline: "The skilled builders",
                                    icon: "fa-duotone fa-regular fa-hard-hat",
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
                                    tagline: "The project owners",
                                    icon: "fa-duotone fa-regular fa-compass-drafting",
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
                                    tagline: "The cornerstone",
                                    icon: "fa-duotone fa-regular fa-user-helmet-safety",
                                    platform: "Applicant Network",
                                    points: [
                                        "Get matched with recruiters who advocate for them",
                                        "Track application status in real time",
                                        "Receive genuine feedback, not silence",
                                        "Completely free to use, always",
                                    ],
                                },
                            ].map((s, i) => (
                                <div key={i}
                                    className="a8-stakeholder-card group opacity-0"
                                    style={{ transformStyle: "preserve-3d" }}>
                                    <div className="relative rounded-2xl p-8 border border-cyan-500/20 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:-translate-y-2"
                                        style={{ backgroundColor: "#0f2847" }}>
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                                            style={{ backgroundColor: "#22d3ee" }} />

                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-lg border border-cyan-500/30 flex items-center justify-center"
                                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                                <i className={`${s.icon} text-cyan-400`} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{s.role}</div>
                                                <div className="font-mono text-[10px] text-cyan-500/40 tracking-wider uppercase">
                                                    {s.platform}
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-3">
                                            {s.points.map((point, j) => (
                                                <li key={j}
                                                    className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                                        style={{ backgroundColor: "#22d3ee" }} />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Blueprint dimension line */}
                                        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-cyan-500/10">
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.2)" }} />
                                            <span className="text-xs font-mono text-cyan-500/30">
                                                {s.tagline}
                                            </span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.2)" }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pull quote */}
                        <div className="a8-pullquote my-14 opacity-0">
                            <div className="border-l-[3px] border-cyan-400 pl-8 py-2">
                                <blockquote className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">
                                    &ldquo;When each stakeholder wins, the ecosystem compounds.
                                    That is not idealism. It is architecture.&rdquo;
                                </blockquote>
                                <cite className="font-mono text-xs text-cyan-500/40 tracking-wider uppercase not-italic">
                                    Network Design Principle // 04
                                </cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECTION 05 - PERFORMANCE METRICS
            ============================================================ */}
            <section id="section-05"
                className="a8-section relative py-20 overflow-hidden"
                style={{ backgroundColor: "#081220" }}>
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-cyan-500/5"
                            style={{ top: `${(i + 1) * 15}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-cyan-500/10 leading-none flex-shrink-0">
                                05
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    Performance Metrics
                                </h2>
                                <div className="a8-section-line h-[2px] bg-cyan-500/20 w-24" />
                            </div>
                        </div>

                        <div className="a8-body space-y-6 opacity-0">
                            <p className="text-slate-400 leading-[1.85] text-base">
                                The data from early split-fee platform adopters paints a clear
                                picture. Structured collaboration does not just feel better; it
                                delivers measurably superior outcomes across every metric that
                                matters. Time-to-fill decreases because multiple specialized
                                recruiters work in parallel. Candidate quality improves because
                                recruiters can focus on their niche rather than stretching across
                                industries they do not know well.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                Companies report significant reductions in cost-per-hire, not
                                because individual recruiter fees are lower, but because the
                                efficiency of the system eliminates the hidden costs of
                                fragmentation: duplicated effort, slow pipelines, bad hires from
                                rushed processes, and the administrative burden of managing
                                multiple agency relationships.
                            </p>
                        </div>

                        {/* Outcome metrics - blueprint construction cards */}
                        <div className="a8-outcomes grid grid-cols-2 md:grid-cols-4 gap-px mt-12 opacity-0"
                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                            {outcomeMetrics.map((m, i) => (
                                <div key={i} className="px-5 py-8 text-center"
                                    style={{ backgroundColor: "#0d1d33" }}>
                                    <div className="font-mono text-3xl md:text-4xl font-bold text-cyan-300 mb-2">
                                        {m.value}
                                    </div>
                                    <div className="text-xs text-slate-500 leading-relaxed max-w-[160px] mx-auto">
                                        {m.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Platform building blocks */}
                        <div className="mt-16">
                            <div className="font-mono text-[10px] text-cyan-500/30 tracking-wider uppercase mb-6">
                                Platform Components // Assembly
                            </div>
                            <div className="a8-blocks grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                                style={{ perspective: "1000px" }}>
                                {platformBlocks.map((block, i) => (
                                    <div key={i}
                                        className="a8-block-card group relative opacity-0"
                                        style={{
                                            transform: "rotateX(5deg) rotateY(-5deg)",
                                            transformStyle: "preserve-3d",
                                        }}>
                                        {/* Isometric shadow */}
                                        <div className="absolute inset-0 rounded-xl translate-y-2 translate-x-2"
                                            style={{ backgroundColor: "rgba(34,211,238,0.05)" }} />
                                        <div className="relative rounded-xl p-5 border border-cyan-500/20 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:-translate-y-1"
                                            style={{ backgroundColor: "#0f2847" }}>
                                            {/* Layer indicator */}
                                            <div className="absolute top-3 right-3 text-xs font-mono text-cyan-500/30">
                                                L{block.layer}
                                            </div>
                                            <div className="a8-block-icon w-12 h-12 rounded-lg flex items-center justify-center mb-3 border border-cyan-500/30"
                                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                                <i className={`${block.icon} text-xl text-cyan-400`} />
                                            </div>
                                            <h3 className="font-bold text-sm mb-1 text-white">{block.title}</h3>
                                            <p className="text-slate-400 text-xs leading-relaxed">{block.desc}</p>
                                            {/* Construction progress bar */}
                                            <div className="mt-3 h-1 rounded-full overflow-hidden"
                                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                                <div className="h-full rounded-full"
                                                    style={{
                                                        backgroundColor: "#22d3ee",
                                                        width: `${25 * block.layer}%`,
                                                    }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                SECOND IMAGE BREAK
            ============================================================ */}
            <div className="a8-image-break relative h-[35vh] md:h-[45vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
                    alt="Team collaborating at a workspace"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,22,40,0.80)" }} />

                {/* Blueprint overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-15">
                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-cyan-500" />
                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-cyan-500" />
                </div>

                {/* Corner marks */}
                <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-cyan-500/40" />
                <div className="absolute bottom-6 right-6 w-10 h-10 border-r-2 border-b-2 border-cyan-500/40" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="a8-image-text text-center px-6 opacity-0">
                        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400/60 uppercase mb-3">
                            Looking Ahead
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                            The Network Effect
                        </h2>
                    </div>
                </div>
            </div>

            {/* ============================================================
                SECTION 06 - THE BUILD AHEAD
            ============================================================ */}
            <section id="section-06"
                className="a8-section relative py-20 overflow-hidden"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="a8-section-head flex items-start gap-6 mb-10 opacity-0">
                            <span className="font-mono text-5xl font-bold text-cyan-500/10 leading-none flex-shrink-0">
                                06
                            </span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    The Build Ahead
                                </h2>
                                <div className="a8-section-line h-[2px] bg-cyan-500/20 w-24" />
                            </div>
                        </div>

                        <div className="a8-body space-y-6 opacity-0">
                            <p className="text-slate-400 leading-[1.85] text-base">
                                The split-fee model is still in its early innings. As platforms
                                mature and network effects compound, we expect several developments
                                to accelerate adoption. AI-powered matching will reduce the time
                                between a role being posted and the right recruiter engaging with it.
                                Automated compliance tools will handle the regulatory complexity that
                                currently slows down cross-border placements. And data analytics will
                                give companies unprecedented insight into their recruiting
                                performance.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                But the most significant shift will be cultural. As more recruiters
                                experience the benefits of structured collaboration, the old model of
                                isolated, competitive recruiting will look increasingly obsolete. The
                                recruiters who thrive in the next decade will be those who specialize
                                deeply and collaborate broadly, using platforms that make both
                                possible.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                For companies, the calculus is straightforward: a single platform
                                that provides access to a network of specialized recruiters, with
                                full transparency and pay-on-hire terms, is simply a better way to
                                fill roles. For candidates, a system that guarantees communication,
                                provides real advocacy, and costs nothing is an obvious upgrade from
                                the status quo.
                            </p>
                            <p className="text-slate-400 leading-[1.85] text-base">
                                The future of recruiting is not a marginal improvement on the
                                existing system. It is a structural redesign. Split-fee platforms
                                represent the blueprint for that redesign: transparent, collaborative,
                                and precision-engineered to serve every participant in the hiring
                                ecosystem.
                            </p>
                        </div>

                        {/* Build phases - construction steps */}
                        <div className="a8-phases mt-14 relative">
                            <div className="font-mono text-[10px] text-cyan-500/30 tracking-wider uppercase mb-6">
                                Construction Phases // Process
                            </div>

                            {/* Vertical connector */}
                            <div className="hidden md:block absolute left-[39px] top-12 bottom-0 w-px bg-cyan-500/15" />

                            {buildPhases.map((step, index) => (
                                <div key={index} className="relative mb-10 last:mb-0">
                                    <div className="a8-phase-card flex gap-6 items-start opacity-0">
                                        {/* Phase number */}
                                        <div className="a8-phase-num flex-shrink-0 w-20 h-20 rounded-xl border-2 border-cyan-500/30 flex flex-col items-center justify-center opacity-0"
                                            style={{ backgroundColor: "rgba(34,211,238,0.08)" }}>
                                            <span className="text-cyan-400 font-mono text-xs">PHASE</span>
                                            <span className="text-cyan-300 font-bold text-xl">{step.phase}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 rounded-xl p-6 border border-cyan-500/15"
                                            style={{ backgroundColor: "#0f2847" }}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <i className={`${step.icon} text-xl text-cyan-400`} />
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">{step.title}</h3>
                                                    <p className="text-cyan-400/60 text-sm font-mono">{step.subtitle}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 ml-1">
                                                {step.details.map((detail, dIdx) => (
                                                    <div key={dIdx} className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: "#22d3ee" }} />
                                                        <span className="text-slate-400 text-sm">{detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                CTA - Blueprint Construction
            ============================================================ */}
            <section className="a8-cta relative py-24 overflow-hidden"
                style={{ backgroundColor: "#0a1628" }}>
                {/* Blueprint grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                {/* Corner dimension marks */}
                <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-cyan-500/20" />
                <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-cyan-500/20" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-cyan-500/20" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-cyan-500/20" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="a8-cta-content max-w-3xl mx-auto text-center mb-12 opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-cyan-500/40 uppercase block mb-4">
                            Join the Ecosystem
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Ready to Break Ground?
                        </h2>
                        <p className="text-lg text-slate-400 max-w-xl mx-auto">
                            Whether you recruit, hire, or job search, the split-fee
                            ecosystem was precision-engineered for you.
                        </p>
                    </div>

                    <div className="a8-cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">
                        {[
                            {
                                role: "Recruiters",
                                icon: "fa-duotone fa-regular fa-hard-hat",
                                sub: "Splits Network",
                                desc: "Join the marketplace. Access curated roles with transparent splits.",
                                href: "https://splits.network/sign-up",
                                cta: "Join Network",
                            },
                            {
                                role: "Companies",
                                icon: "fa-duotone fa-regular fa-compass-drafting",
                                sub: "Splits Network",
                                desc: "Post roles to a network of specialized recruiters. Pay on hire.",
                                href: "https://splits.network/sign-up",
                                cta: "Post a Role",
                            },
                            {
                                role: "Candidates",
                                icon: "fa-duotone fa-regular fa-user-helmet-safety",
                                sub: "Applicant Network",
                                desc: "Get matched with expert recruiters. Track everything. Free forever.",
                                href: "https://applicant.network/sign-up",
                                cta: "Create Profile",
                            },
                        ].map((card, i) => (
                            <div key={i}
                                className="a8-cta-card rounded-2xl p-6 border border-cyan-500/20 opacity-0"
                                style={{ backgroundColor: "#0f2847" }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-cyan-500/30"
                                        style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                        <i className={`${card.icon} text-xl text-cyan-400`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{card.role}</div>
                                        <div className="text-xs text-cyan-400/50 font-mono">{card.sub}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-6">{card.desc}</p>
                                <a href={card.href}
                                    className="btn btn-sm w-full border-0 text-slate-900 font-semibold"
                                    style={{ backgroundColor: "#22d3ee" }}>
                                    {card.cta}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="a8-cta-footer text-center opacity-0">
                        <p className="text-sm text-slate-500 mb-4">
                            Questions about this article or our platforms?
                        </p>
                        <a href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-colors font-mono text-sm">
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </ArticleEightAnimator>
    );
}
