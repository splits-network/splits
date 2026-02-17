"use client";

import {
    GeometricDecoration,
    SectionDivider,
    ColorBar,
    Badge,
} from "@splits-network/memphis-ui";

// ─── Helper: Class Label ─────────────────────────────────────────────────────
function ClassLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="block mt-2 text-xs font-mono text-cream/30 leading-relaxed">
            {children}
        </span>
    );
}

function ClassLabelDark({ children }: { children: React.ReactNode }) {
    return (
        <span className="block mt-2 text-xs font-mono text-dark/30 leading-relaxed">
            {children}
        </span>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TypographySixShowcase() {
    return (
        <div className="min-h-screen">
            {/* ══════════════════════════════════════════════════════════════
                COLOR BAR TOP
               ══════════════════════════════════════════════════════════════ */}
            <ColorBar height="h-2" />

            {/* ══════════════════════════════════════════════════════════════
                1. HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-24 relative overflow-hidden">
                {/* Geometric decorations */}
                <div className="absolute top-8 left-8">
                    <GeometricDecoration shape="circle" color="coral" size={48} />
                </div>
                <div className="absolute top-16 right-12">
                    <GeometricDecoration shape="triangle" color="yellow" size={36} />
                </div>
                <div className="absolute bottom-12 left-20">
                    <GeometricDecoration shape="square" color="teal" size={28} />
                </div>
                <div className="absolute bottom-8 right-24">
                    <GeometricDecoration shape="cross" color="purple" size={32} />
                </div>
                <div className="absolute top-1/2 right-1/4">
                    <GeometricDecoration shape="zigzag" color="coral" size={60} />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <Badge color="yellow" className="mb-8">
                            <i className="fa-duotone fa-regular fa-font mr-2" />
                            Designer Six Type Bible
                        </Badge>

                        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none text-white mb-6">
                            TYPO
                            <span className="text-coral">GRA</span>
                            PHY
                        </h1>

                        <p className="text-xl text-cream/70 max-w-2xl mx-auto leading-relaxed">
                            The definitive Memphis Design System type reference.
                            Every weight, every size, every color, every rule.
                        </p>
                    </div>
                </div>
            </section>

            <ColorBar height="h-1" />

            {/* ══════════════════════════════════════════════════════════════
                2. DISPLAY / HERO HEADLINES
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Display / Hero Headlines"
                            icon="fa-duotone fa-regular fa-heading"
                            accent="coral"
                            className="mb-12"
                        />

                        <div className="space-y-10">
                            {/* Coral */}
                            <div>
                                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-coral">
                                    RECRUITING REIMAGINED
                                </h2>
                                <ClassLabel>
                                    text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-coral
                                </ClassLabel>
                            </div>

                            {/* Teal */}
                            <div>
                                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-teal">
                                    SPLIT THE FEE
                                </h2>
                                <ClassLabel>
                                    text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-teal
                                </ClassLabel>
                            </div>

                            {/* Yellow */}
                            <div>
                                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-yellow">
                                    BOLD PLATFORMS
                                </h2>
                                <ClassLabel>
                                    text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-yellow
                                </ClassLabel>
                            </div>

                            {/* Purple */}
                            <div>
                                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-purple">
                                    ZERO FRICTION
                                </h2>
                                <ClassLabel>
                                    text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-purple
                                </ClassLabel>
                            </div>

                            {/* White */}
                            <div>
                                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-white">
                                    CONNECT EVERYTHING
                                </h2>
                                <ClassLabel>
                                    text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-white
                                </ClassLabel>
                            </div>

                            {/* Display with underline accent */}
                            <div>
                                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none text-white">
                                    Recruiting,{" "}
                                    <span className="relative inline-block">
                                        <span className="text-coral">Rewired</span>
                                        <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                    </span>
                                </h2>
                                <ClassLabel>
                                    Display with inline color accent + bottom border underline (h-2 bg-coral)
                                </ClassLabel>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. SECTION HEADERS (H1-H6)
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Section Headers H1-H6"
                            icon="fa-duotone fa-regular fa-list-ol"
                            accent="teal"
                            className="mb-12"
                        />

                        <div className="space-y-8">
                            {/* H1 */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-2 py-1">
                                        H1
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-dark">
                                    PRIMARY HEADING
                                </h1>
                                <ClassLabelDark>
                                    text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-dark
                                </ClassLabelDark>
                            </div>

                            {/* H2 */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-teal text-dark px-2 py-1">
                                        H2
                                    </span>
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-dark">
                                    SECONDARY HEADING
                                </h2>
                                <ClassLabelDark>
                                    text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-dark
                                </ClassLabelDark>
                            </div>

                            {/* H3 */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-yellow text-dark px-2 py-1">
                                        H3
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-dark">
                                    TERTIARY HEADING
                                </h3>
                                <ClassLabelDark>
                                    text-2xl md:text-3xl font-black uppercase tracking-wide text-dark
                                </ClassLabelDark>
                            </div>

                            {/* H4 */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-purple text-white px-2 py-1">
                                        H4
                                    </span>
                                </div>
                                <h4 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-dark">
                                    Quaternary Heading
                                </h4>
                                <ClassLabelDark>
                                    text-xl md:text-2xl font-bold uppercase tracking-wide text-dark
                                </ClassLabelDark>
                            </div>

                            {/* H5 */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-dark text-white px-2 py-1">
                                        H5
                                    </span>
                                </div>
                                <h5 className="text-lg font-bold uppercase tracking-wide text-dark">
                                    Quinary Heading
                                </h5>
                                <ClassLabelDark>
                                    text-lg font-bold uppercase tracking-wide text-dark
                                </ClassLabelDark>
                            </div>

                            {/* H6 */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-dark text-cream px-2 py-1">
                                        H6
                                    </span>
                                </div>
                                <h6 className="text-base font-bold uppercase tracking-wider text-dark">
                                    Senary Heading
                                </h6>
                                <ClassLabelDark>
                                    text-base font-bold uppercase tracking-wider text-dark
                                </ClassLabelDark>
                            </div>

                            {/* Rule note */}
                            <div className="border-l-4 border-coral pl-4">
                                <p className="text-sm font-bold text-dark">
                                    Rule: H1-H3 use <code className="text-xs font-mono bg-dark text-cream px-2 py-0.5">font-black uppercase</code>.
                                    H4-H6 use <code className="text-xs font-mono bg-dark text-cream px-2 py-0.5">font-bold</code> and may drop uppercase.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ColorBar height="h-1" />

            {/* ══════════════════════════════════════════════════════════════
                4. BODY TEXT
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Body Text"
                            icon="fa-duotone fa-regular fa-align-left"
                            accent="yellow"
                            className="mb-12"
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Dark background specimens */}
                            <div className="border-4 border-cream/20 p-8 space-y-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-yellow text-dark px-2 py-1">
                                        On Dark BG
                                    </span>
                                </div>

                                {/* Lead / Intro */}
                                <div>
                                    <p className="text-lg md:text-xl text-cream leading-relaxed">
                                        The split-fee marketplace that connects recruiters, companies, and candidates on one transparent platform.
                                    </p>
                                    <ClassLabel>
                                        text-lg md:text-xl text-cream leading-relaxed (Lead/Intro)
                                    </ClassLabel>
                                </div>

                                {/* Standard paragraph */}
                                <div>
                                    <p className="text-base text-cream/70 leading-relaxed">
                                        Modern platforms solve this by treating the split-fee relationship as a first-class citizen. Every interaction is tracked. Every contribution is visible. Every payment is tied to a verified outcome.
                                    </p>
                                    <ClassLabel>
                                        text-base text-cream/70 leading-relaxed (Standard Body)
                                    </ClassLabel>
                                </div>

                                {/* Small / Caption */}
                                <div>
                                    <p className="text-sm text-cream/40 leading-relaxed">
                                        Last updated Feb 14, 2026. All data reflects Q4 2025 benchmarks across the Employment Networks ecosystem.
                                    </p>
                                    <ClassLabel>
                                        text-sm text-cream/40 leading-relaxed (Small/Caption)
                                    </ClassLabel>
                                </div>
                            </div>

                            {/* Light background specimens */}
                            <div className="border-4 border-dark p-8 bg-cream space-y-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-dark text-cream px-2 py-1">
                                        On Light BG
                                    </span>
                                </div>

                                {/* Lead / Intro */}
                                <div>
                                    <p className="text-lg md:text-xl text-dark leading-relaxed">
                                        The split-fee marketplace that connects recruiters, companies, and candidates on one transparent platform.
                                    </p>
                                    <ClassLabelDark>
                                        text-lg md:text-xl text-dark leading-relaxed (Lead/Intro)
                                    </ClassLabelDark>
                                </div>

                                {/* Standard paragraph */}
                                <div>
                                    <p className="text-base text-dark/70 leading-relaxed">
                                        Modern platforms solve this by treating the split-fee relationship as a first-class citizen. Every interaction is tracked. Every contribution is visible. Every payment is tied to a verified outcome.
                                    </p>
                                    <ClassLabelDark>
                                        text-base text-dark/70 leading-relaxed (Standard Body)
                                    </ClassLabelDark>
                                </div>

                                {/* Small / Caption */}
                                <div>
                                    <p className="text-sm text-dark/40 leading-relaxed">
                                        Last updated Feb 14, 2026. All data reflects Q4 2025 benchmarks across the Employment Networks ecosystem.
                                    </p>
                                    <ClassLabelDark>
                                        text-sm text-dark/40 leading-relaxed (Small/Caption)
                                    </ClassLabelDark>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                5. LABELS & UI TEXT
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Labels & UI Text"
                            icon="fa-duotone fa-regular fa-tag"
                            accent="purple"
                            className="mb-12"
                        />

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Form Label */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-2 py-0.5 mb-4 inline-block">
                                    Form Label
                                </span>
                                <div className="mt-4">
                                    <label className="text-xs font-black uppercase tracking-wide text-dark block mb-2">
                                        Email Address
                                    </label>
                                    <div className="border-4 border-dark p-3 text-sm text-dark/50">
                                        name@company.com
                                    </div>
                                </div>
                                <ClassLabelDark>
                                    text-xs font-black uppercase tracking-wide text-dark
                                </ClassLabelDark>
                            </div>

                            {/* Button Text */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-teal text-dark px-2 py-0.5 mb-4 inline-block">
                                    Button Text
                                </span>
                                <div className="mt-4 space-y-3">
                                    <div className="bg-coral border-4 border-dark px-6 py-3 text-center">
                                        <span className="text-sm font-bold uppercase tracking-wider text-white">
                                            Join Network
                                        </span>
                                    </div>
                                    <div className="bg-dark border-4 border-dark px-6 py-3 text-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-cream">
                                            Learn More
                                        </span>
                                    </div>
                                </div>
                                <ClassLabelDark>
                                    text-sm font-bold uppercase tracking-wider (primary){"\n"}
                                    text-xs font-bold uppercase tracking-wider (secondary)
                                </ClassLabelDark>
                            </div>

                            {/* Nav Text */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-yellow text-dark px-2 py-0.5 mb-4 inline-block">
                                    Nav Text
                                </span>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold uppercase tracking-wider text-dark">
                                            Dashboard
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                            Jobs
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold uppercase tracking-wider text-dark/40">
                                            Settings
                                        </span>
                                    </div>
                                </div>
                                <ClassLabelDark>
                                    text-sm font-bold uppercase tracking-wider{"\n"}
                                    Active: text-coral | Inactive: text-dark/40
                                </ClassLabelDark>
                            </div>

                            {/* Tab Label */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-purple text-white px-2 py-0.5 mb-4 inline-block">
                                    Tab Labels
                                </span>
                                <div className="mt-4 flex border-b-4 border-dark">
                                    <span className="text-xs font-bold uppercase tracking-wider text-dark border-b-4 border-coral px-4 py-2 -mb-[4px]">
                                        Active
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-dark/40 px-4 py-2">
                                        Inactive
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-dark/40 px-4 py-2">
                                        Disabled
                                    </span>
                                </div>
                                <ClassLabelDark>
                                    text-xs font-bold uppercase tracking-wider{"\n"}
                                    Active border: border-b-4 border-coral
                                </ClassLabelDark>
                            </div>

                            {/* Badge Text */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-dark text-cream px-2 py-0.5 mb-4 inline-block">
                                    Badge Text
                                </span>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Badge color="coral">Active</Badge>
                                    <Badge color="teal">Open</Badge>
                                    <Badge color="yellow">Featured</Badge>
                                    <Badge color="purple">New</Badge>
                                    <Badge color="dark">Closed</Badge>
                                </div>
                                <ClassLabelDark>
                                    text-xs font-bold uppercase tracking-wider (Badge component){"\n"}
                                    Micro badges: text-[9px] or text-[10px] font-black uppercase
                                </ClassLabelDark>
                            </div>

                            {/* Tooltip / Helper Text */}
                            <div className="border-4 border-dark p-6 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-2 py-0.5 mb-4 inline-block">
                                    Tooltip / Helper
                                </span>
                                <div className="mt-4 space-y-3">
                                    <div className="bg-dark p-3 border-4 border-dark">
                                        <p className="text-xs text-cream/70">
                                            Split fee is calculated after placement confirmation
                                        </p>
                                    </div>
                                    <p className="text-xs text-dark/40">
                                        * Required field. Must be a valid email address.
                                    </p>
                                </div>
                                <ClassLabelDark>
                                    Tooltip: text-xs text-cream/70 (on dark bg){"\n"}
                                    Helper: text-xs text-dark/40 (on light bg)
                                </ClassLabelDark>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ColorBar height="h-1" />

            {/* ══════════════════════════════════════════════════════════════
                6. DATA & NUMBERS
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Data & Numbers"
                            icon="fa-duotone fa-regular fa-chart-bar"
                            accent="coral"
                            className="mb-12"
                        />

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {/* Large stat values */}
                            {[
                                { value: "10,000+", label: "Active Listings", color: "coral" as const },
                                { value: "$4.7B", label: "Market Size", color: "teal" as const },
                                { value: "2.4x", label: "Faster Fills", color: "yellow" as const },
                                { value: "95%", label: "Response Rate", color: "purple" as const },
                            ].map((stat) => (
                                <div key={stat.label} className={`border-4 border-${stat.color} p-6 text-center`}>
                                    <p className={`text-4xl md:text-5xl font-black text-${stat.color}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-cream/60 mt-2">
                                        {stat.label}
                                    </p>
                                    <ClassLabel>
                                        text-4xl md:text-5xl font-black text-{stat.color}
                                    </ClassLabel>
                                </div>
                            ))}
                        </div>

                        {/* Trend values with arrows */}
                        <div className="grid md:grid-cols-3 gap-6 mb-10">
                            <div className="border-4 border-cream/20 p-6">
                                <p className="text-xs font-black uppercase tracking-wide text-cream/40 mb-1">
                                    Revenue
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-black text-white">$12,400</span>
                                    <span className="text-sm font-bold text-teal">
                                        <i className="fa-duotone fa-regular fa-arrow-up mr-1" />
                                        +12.5%
                                    </span>
                                </div>
                                <ClassLabel>
                                    Value: text-3xl font-black text-white{"\n"}
                                    Trend up: text-sm font-bold text-teal
                                </ClassLabel>
                            </div>

                            <div className="border-4 border-cream/20 p-6">
                                <p className="text-xs font-black uppercase tracking-wide text-cream/40 mb-1">
                                    Churn Rate
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-black text-white">3.2%</span>
                                    <span className="text-sm font-bold text-coral">
                                        <i className="fa-duotone fa-regular fa-arrow-down mr-1" />
                                        -0.8%
                                    </span>
                                </div>
                                <ClassLabel>
                                    Value: text-3xl font-black text-white{"\n"}
                                    Trend down: text-sm font-bold text-coral
                                </ClassLabel>
                            </div>

                            <div className="border-4 border-cream/20 p-6">
                                <p className="text-xs font-black uppercase tracking-wide text-cream/40 mb-1">
                                    Updated
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-lg font-bold text-cream/70">Feb 14, 2026</span>
                                </div>
                                <p className="text-xs font-mono text-cream/30 mt-1">14:32:01 UTC</p>
                                <ClassLabel>
                                    Date: text-lg font-bold text-cream/70{"\n"}
                                    Timestamp: text-xs font-mono text-cream/30
                                </ClassLabel>
                            </div>
                        </div>

                        {/* Currency formatting */}
                        <div className="border-4 border-cream/20 p-6">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-cream/40 mb-4">
                                Currency Specimens
                            </p>
                            <div className="flex flex-wrap gap-8 items-baseline">
                                <div>
                                    <span className="text-5xl font-black text-yellow">$125K</span>
                                    <ClassLabel>text-5xl font-black text-yellow (placement value)</ClassLabel>
                                </div>
                                <div>
                                    <span className="text-3xl font-black text-teal">$18,750</span>
                                    <ClassLabel>text-3xl font-black text-teal (split fee)</ClassLabel>
                                </div>
                                <div>
                                    <span className="text-xl font-bold text-cream/70">$2,500/mo</span>
                                    <ClassLabel>text-xl font-bold text-cream/70 (subscription)</ClassLabel>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                7. MEMPHIS ACCENT TYPOGRAPHY
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Memphis Accent Typography"
                            icon="fa-duotone fa-regular fa-paintbrush"
                            accent="teal"
                            className="mb-12"
                        />

                        <div className="space-y-8">
                            {/* Border-left accent */}
                            <div className="border-4 border-dark p-8 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-2 py-0.5 mb-6 inline-block">
                                    Border-Left Accent
                                </span>

                                <div className="space-y-4 mt-4">
                                    <div className="border-l-4 border-coral pl-4">
                                        <p className="text-lg font-bold text-dark">
                                            Coral left accent with bold lead text. Used for callouts and important notes.
                                        </p>
                                    </div>
                                    <div className="border-l-4 border-teal pl-4">
                                        <p className="text-lg font-bold text-dark">
                                            Teal left accent. Used for success messages and positive callouts.
                                        </p>
                                    </div>
                                    <div className="border-l-4 border-yellow pl-4">
                                        <p className="text-lg font-bold text-dark">
                                            Yellow left accent. Used for warnings and highlighted information.
                                        </p>
                                    </div>
                                    <div className="border-l-4 border-purple pl-4">
                                        <p className="text-lg font-bold text-dark">
                                            Purple left accent. Used for tips and secondary information.
                                        </p>
                                    </div>
                                </div>
                                <ClassLabelDark>
                                    border-l-4 border-[color] pl-4 + text-lg font-bold text-dark
                                </ClassLabelDark>
                            </div>

                            {/* Border-bottom underline */}
                            <div className="border-4 border-dark p-8 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-teal text-dark px-2 py-0.5 mb-6 inline-block">
                                    Border-Bottom Underline
                                </span>

                                <div className="space-y-6 mt-4">
                                    <div>
                                        <span className="text-2xl font-black uppercase tracking-tight text-dark border-b-4 border-coral pb-1">
                                            CORAL UNDERLINE
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-black uppercase tracking-tight text-dark border-b-4 border-teal pb-1">
                                            TEAL UNDERLINE
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-black uppercase tracking-tight text-dark border-b-4 border-yellow pb-1">
                                            YELLOW UNDERLINE
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-black uppercase tracking-tight text-dark border-b-4 border-purple pb-1">
                                            PURPLE UNDERLINE
                                        </span>
                                    </div>
                                </div>
                                <ClassLabelDark>
                                    border-b-4 border-[color] pb-1 + font-black uppercase text-dark
                                </ClassLabelDark>
                            </div>

                            {/* Pull quotes */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Dark bg pull quote */}
                                <div className="bg-dark border-4 border-teal p-8 relative">
                                    <div className="absolute -top-6 left-6 text-6xl font-black leading-none text-teal">
                                        &ldquo;
                                    </div>
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight text-white mt-4">
                                        Split-fee models make hiring faster, fairer, and more profitable.
                                    </p>
                                    <div className="mt-4 pt-3 border-t-4 border-teal">
                                        <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                            -- Industry Research
                                        </span>
                                    </div>
                                    <ClassLabel>
                                        Pull Quote (dark): border-4 border-[color] + text-xl font-black uppercase text-white
                                    </ClassLabel>
                                </div>

                                {/* Light bg pull quote */}
                                <div className="bg-white border-4 border-coral p-8 relative">
                                    <div className="absolute -top-6 left-6 text-6xl font-black leading-none text-coral">
                                        &ldquo;
                                    </div>
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight text-dark mt-4">
                                        Transparency is the foundation of every great partnership.
                                    </p>
                                    <div className="mt-4 pt-3 border-t-4 border-coral">
                                        <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                            -- Employment Networks
                                        </span>
                                    </div>
                                    <ClassLabelDark>
                                        Pull Quote (light): border-4 border-[color] + text-xl font-black uppercase text-dark
                                    </ClassLabelDark>
                                </div>
                            </div>

                            {/* Category Labels */}
                            <div className="border-4 border-dark p-8 bg-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-purple text-white px-2 py-0.5 mb-6 inline-block">
                                    Category Labels
                                </span>

                                <div className="flex flex-wrap gap-6 mt-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-3 py-1">
                                            Industry Analysis
                                        </span>
                                        <ClassLabelDark>
                                            text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-3 py-1
                                        </ClassLabelDark>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-teal text-dark px-3 py-1">
                                            How It Works
                                        </span>
                                        <ClassLabelDark>
                                            text-[10px] font-black uppercase tracking-[0.2em] bg-teal text-dark px-3 py-1
                                        </ClassLabelDark>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-yellow text-dark px-3 py-1">
                                            Featured
                                        </span>
                                        <ClassLabelDark>
                                            text-[10px] font-black uppercase tracking-[0.2em] bg-yellow text-dark px-3 py-1
                                        </ClassLabelDark>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-purple text-white px-3 py-1">
                                            Timeline
                                        </span>
                                        <ClassLabelDark>
                                            text-[10px] font-black uppercase tracking-[0.2em] bg-purple text-white px-3 py-1
                                        </ClassLabelDark>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ColorBar height="h-1" />

            {/* ══════════════════════════════════════════════════════════════
                8. COLOR x WEIGHT MATRIX
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Color x Weight Matrix"
                            icon="fa-duotone fa-regular fa-table-cells"
                            accent="yellow"
                            className="mb-12"
                        />

                        {/* On dark background */}
                        <div className="mb-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow mb-6">
                                On Dark Background (bg-dark)
                            </p>
                            <div className="border-4 border-cream/20 overflow-hidden">
                                {/* Header row */}
                                <div className="grid grid-cols-5 bg-cream/10">
                                    <div className="p-3 text-[10px] font-black uppercase tracking-wider text-cream/50 border-b-4 border-cream/10">
                                        Color
                                    </div>
                                    {["font-normal", "font-medium", "font-bold", "font-black"].map((w) => (
                                        <div key={w} className="p-3 text-[10px] font-black uppercase tracking-wider text-cream/50 border-b-4 border-cream/10">
                                            {w.replace("font-", "")}
                                        </div>
                                    ))}
                                </div>

                                {/* Color rows */}
                                {[
                                    { name: "coral", twClass: "text-coral" },
                                    { name: "teal", twClass: "text-teal" },
                                    { name: "yellow", twClass: "text-yellow" },
                                    { name: "purple", twClass: "text-purple" },
                                    { name: "cream", twClass: "text-cream" },
                                    { name: "white", twClass: "text-white" },
                                ].map((color) => (
                                    <div key={color.name} className="grid grid-cols-5 border-b-4 border-cream/5 last:border-b-0">
                                        <div className="p-3 flex items-center gap-2">
                                            <div className={`w-3 h-3 bg-${color.name}`} />
                                            <span className="text-xs font-mono text-cream/40">{color.name}</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-normal ${color.twClass}`}>Memphis</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-medium ${color.twClass}`}>Memphis</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-bold ${color.twClass}`}>Memphis</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-black ${color.twClass}`}>Memphis</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* On light background */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow mb-6">
                                On Light Background (bg-cream)
                            </p>
                            <div className="border-4 border-dark bg-cream overflow-hidden">
                                {/* Header row */}
                                <div className="grid grid-cols-5 bg-dark/5">
                                    <div className="p-3 text-[10px] font-black uppercase tracking-wider text-dark/50 border-b-4 border-dark/10">
                                        Color
                                    </div>
                                    {["font-normal", "font-medium", "font-bold", "font-black"].map((w) => (
                                        <div key={w} className="p-3 text-[10px] font-black uppercase tracking-wider text-dark/50 border-b-4 border-dark/10">
                                            {w.replace("font-", "")}
                                        </div>
                                    ))}
                                </div>

                                {/* Color rows */}
                                {[
                                    { name: "coral", twClass: "text-coral" },
                                    { name: "teal", twClass: "text-teal" },
                                    { name: "yellow", twClass: "text-yellow" },
                                    { name: "purple", twClass: "text-purple" },
                                    { name: "dark", twClass: "text-dark" },
                                ].map((color) => (
                                    <div key={color.name} className="grid grid-cols-5 border-b-4 border-dark/5 last:border-b-0">
                                        <div className="p-3 flex items-center gap-2">
                                            <div className={`w-3 h-3 bg-${color.name}`} />
                                            <span className="text-xs font-mono text-dark/40">{color.name}</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-normal ${color.twClass}`}>Memphis</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-medium ${color.twClass}`}>Memphis</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-bold ${color.twClass}`}>Memphis</span>
                                        </div>
                                        <div className="p-3">
                                            <span className={`text-lg font-black ${color.twClass}`}>Memphis</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Yellow note */}
                                <div className="p-3 bg-yellow/10 border-t-4 border-dark/10">
                                    <p className="text-xs text-dark/50">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1" />
                                        <strong>Note:</strong> text-yellow on bg-cream has low contrast. Use only for decorative/non-essential text. Prefer text-dark for readability.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                9. OPACITY VARIANTS
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-cream py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Opacity Variants"
                            icon="fa-duotone fa-regular fa-eye"
                            accent="purple"
                            className="mb-12"
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* text-cream opacity on dark */}
                            <div className="bg-dark border-4 border-cream/20 p-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow mb-6">
                                    text-cream Opacity Scale (on bg-dark)
                                </p>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-lg font-bold text-cream">
                                            100% -- Primary content, headings, important text
                                        </p>
                                        <ClassLabel>text-cream (100%)</ClassLabel>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-cream/70">
                                            70% -- Body text, descriptions, secondary content
                                        </p>
                                        <ClassLabel>text-cream/70</ClassLabel>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-cream/40">
                                            40% -- Captions, timestamps, helper text
                                        </p>
                                        <ClassLabel>text-cream/40</ClassLabel>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-cream/15">
                                            15% -- Watermarks, decorative, barely visible
                                        </p>
                                        <ClassLabel>text-cream/15</ClassLabel>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t-4 border-cream/10">
                                    <p className="text-xs text-cream/30">
                                        Use 100% for primary content. 70% for body text. 40% for metadata. 15% for subtle decorative text.
                                    </p>
                                </div>
                            </div>

                            {/* text-dark opacity on cream */}
                            <div className="bg-cream border-4 border-dark p-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark mb-6">
                                    text-dark Opacity Scale (on bg-cream)
                                </p>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-lg font-bold text-dark">
                                            100% -- Primary content, headings, important text
                                        </p>
                                        <ClassLabelDark>text-dark (100%)</ClassLabelDark>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-dark/70">
                                            70% -- Body text, descriptions, secondary content
                                        </p>
                                        <ClassLabelDark>text-dark/70</ClassLabelDark>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-dark/40">
                                            40% -- Captions, timestamps, helper text
                                        </p>
                                        <ClassLabelDark>text-dark/40</ClassLabelDark>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-dark/15">
                                            15% -- Watermarks, decorative, barely visible
                                        </p>
                                        <ClassLabelDark>text-dark/15</ClassLabelDark>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t-4 border-dark/10">
                                    <p className="text-xs text-dark/30">
                                        Use 100% for primary content. 70% for body text. 40% for metadata. 15% for subtle decorative text.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Side-by-side comparison in practice */}
                        <div className="mt-8 grid md:grid-cols-2 gap-8">
                            <div className="bg-dark border-4 border-cream/20 p-6">
                                <h3 className="text-xl font-black uppercase tracking-tight text-cream mb-1">
                                    Senior Software Engineer
                                </h3>
                                <p className="text-sm text-cream/70 mb-1">
                                    TechCorp Inc. -- San Francisco, CA
                                </p>
                                <p className="text-xs text-cream/40">
                                    Posted 3 days ago -- 12 applicants
                                </p>
                            </div>
                            <div className="bg-white border-4 border-dark p-6">
                                <h3 className="text-xl font-black uppercase tracking-tight text-dark mb-1">
                                    Senior Software Engineer
                                </h3>
                                <p className="text-sm text-dark/70 mb-1">
                                    TechCorp Inc. -- San Francisco, CA
                                </p>
                                <p className="text-xs text-dark/40">
                                    Posted 3 days ago -- 12 applicants
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ColorBar height="h-1" />

            {/* ══════════════════════════════════════════════════════════════
                10. DO'S AND DON'TS
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <SectionDivider
                            label="Do's and Don'ts"
                            icon="fa-duotone fa-regular fa-check-double"
                            accent="coral"
                            className="mb-12"
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* DO's */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-teal text-dark px-3 py-1">
                                        <i className="fa-duotone fa-regular fa-check mr-2" />
                                        Do
                                    </span>
                                </div>

                                <div className="border-4 border-teal p-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                                        BOLD HEADLINES
                                    </h3>
                                    <p className="text-xs font-mono text-cream/30">
                                        font-black uppercase for H1-H3 headings
                                    </p>
                                </div>

                                <div className="border-4 border-teal p-6">
                                    <p className="text-base text-cream/70 leading-relaxed mb-2">
                                        Body text at 70% opacity provides comfortable reading contrast on dark backgrounds.
                                    </p>
                                    <p className="text-xs font-mono text-cream/30">
                                        text-cream/70 for body text on dark backgrounds
                                    </p>
                                </div>

                                <div className="border-4 border-teal p-6">
                                    <div className="flex gap-3">
                                        <Badge color="coral">Active</Badge>
                                        <Badge color="teal">Open</Badge>
                                        <Badge color="purple">New</Badge>
                                    </div>
                                    <p className="text-xs font-mono text-cream/30 mt-3">
                                        Use Memphis Badge component for status labels
                                    </p>
                                </div>

                                <div className="border-4 border-teal p-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-yellow text-dark px-3 py-1">
                                        Category Label
                                    </span>
                                    <p className="text-xs font-mono text-cream/30 mt-3">
                                        text-[10px] font-black uppercase tracking-[0.2em] for category labels
                                    </p>
                                </div>

                                <div className="border-4 border-teal p-6">
                                    <p className="text-4xl font-black text-coral mb-1">$12,400</p>
                                    <p className="text-xs font-black uppercase tracking-[0.15em] text-cream/40">
                                        Revenue This Month
                                    </p>
                                    <p className="text-xs font-mono text-cream/30 mt-3">
                                        font-black for stat values, font-black uppercase for labels
                                    </p>
                                </div>

                                <div className="border-4 border-teal p-6">
                                    <div className="border-l-4 border-coral pl-4">
                                        <p className="text-base font-bold text-white">
                                            Use border-l-4 with pl-4 for accent callouts.
                                        </p>
                                    </div>
                                    <p className="text-xs font-mono text-cream/30 mt-3">
                                        border-l-4 border-[color] pl-4 for callout accents
                                    </p>
                                </div>
                            </div>

                            {/* DON'Ts */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-coral text-white px-3 py-1">
                                        <i className="fa-duotone fa-regular fa-xmark mr-2" />
                                        Don&apos;t
                                    </span>
                                </div>

                                <div className="border-4 border-coral p-6 relative">
                                    <div className="absolute top-2 right-2">
                                        <i className="fa-duotone fa-regular fa-xmark text-coral text-lg" />
                                    </div>
                                    <h3 className="text-2xl font-normal text-white mb-2">
                                        Thin normal weight headings
                                    </h3>
                                    <p className="text-xs font-mono text-cream/30">
                                        Never use font-normal/font-medium for headings. Always font-black or font-bold.
                                    </p>
                                </div>

                                <div className="border-4 border-coral p-6 relative">
                                    <div className="absolute top-2 right-2">
                                        <i className="fa-duotone fa-regular fa-xmark text-coral text-lg" />
                                    </div>
                                    <p className="text-base text-cream leading-relaxed mb-2">
                                        Body text at full 100% cream is too bright and causes eye strain on dark backgrounds.
                                    </p>
                                    <p className="text-xs font-mono text-cream/30">
                                        Never use text-cream (100%) for body text on dark bg. Use text-cream/70.
                                    </p>
                                </div>

                                <div className="border-4 border-coral p-6 relative">
                                    <div className="absolute top-2 right-2">
                                        <i className="fa-duotone fa-regular fa-xmark text-coral text-lg" />
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="rounded-full bg-coral/20 text-coral text-xs px-3 py-1 font-normal">
                                            rounded pill
                                        </span>
                                        <span className="rounded-lg bg-teal/20 text-teal text-xs px-3 py-1 italic">
                                            italic soft
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono text-cream/30 mt-3">
                                        No rounded corners, no italics, no soft pastel badges. Use sharp corners + font-bold uppercase.
                                    </p>
                                </div>

                                <div className="border-4 border-coral p-6 relative">
                                    <div className="absolute top-2 right-2">
                                        <i className="fa-duotone fa-regular fa-xmark text-coral text-lg" />
                                    </div>
                                    <p className="text-sm text-yellow leading-relaxed mb-2">
                                        Yellow text on dark backgrounds for body paragraphs is hard to read.
                                    </p>
                                    <p className="text-xs font-mono text-cream/30">
                                        text-yellow is for accents and highlights only, never body text.
                                    </p>
                                </div>

                                <div className="border-4 border-coral p-6 relative">
                                    <div className="absolute top-2 right-2">
                                        <i className="fa-duotone fa-regular fa-xmark text-coral text-lg" />
                                    </div>
                                    <p className="text-3xl text-white mb-1">$12,400</p>
                                    <p className="text-sm text-cream/70">revenue this month</p>
                                    <p className="text-xs font-mono text-cream/30 mt-3">
                                        Stats missing font-black weight and uppercase label feel weak. Always use font-black for numbers.
                                    </p>
                                </div>

                                <div className="border-4 border-coral p-6 relative">
                                    <div className="absolute top-2 right-2">
                                        <i className="fa-duotone fa-regular fa-xmark text-coral text-lg" />
                                    </div>
                                    <p className="text-base text-white border-l-2 border-cream/20 pl-3 mb-2">
                                        Using thin 2px borders and muted colors weakens the Memphis aesthetic.
                                    </p>
                                    <p className="text-xs font-mono text-cream/30">
                                        Never use border-l-2. Memphis uses border-l-4 minimum with accent colors.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary rules */}
                        <div className="mt-12 border-4 border-yellow p-8">
                            <h3 className="text-xl font-black uppercase tracking-tight text-yellow mb-6">
                                <i className="fa-duotone fa-regular fa-list-check mr-2" />
                                Typography Rules Summary
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Headings H1-H3: font-black uppercase tracking-tight
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Headings H4-H6: font-bold, may drop uppercase
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Body text: text-cream/70 (dark bg) or text-dark/70 (light bg)
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Captions: text-cream/40 or text-dark/40
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Stats/numbers: font-black with accent colors
                                    </li>
                                </ul>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Category labels: text-[10px] font-black uppercase tracking-[0.2em]
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Borders always 4px minimum (border-4)
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        No shadows, no gradients, no rounded corners
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Only Memphis palette colors via Tailwind classes
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-cream/70">
                                        <i className="fa-duotone fa-regular fa-check text-teal mt-0.5 flex-shrink-0" />
                                        Zero hardcoded hex, zero inline style for visual properties
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOOTER COLOR BAR
               ══════════════════════════════════════════════════════════════ */}
            <ColorBar height="h-2" />

            {/* Footer */}
            <section className="bg-dark py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center gap-4 mb-4">
                        <GeometricDecoration shape="circle" color="coral" size={20} />
                        <GeometricDecoration shape="square" color="teal" size={20} />
                        <GeometricDecoration shape="triangle" color="yellow" size={20} />
                        <GeometricDecoration shape="cross" color="purple" size={20} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cream/30">
                        Memphis Design System -- Typography Reference -- Designer Six
                    </p>
                </div>
            </section>
        </div>
    );
}
