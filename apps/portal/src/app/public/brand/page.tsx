import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { HeaderLogo } from "@splits-network/memphis-ui";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Brand Kit",
    description:
        "Brand assets, logos, color palette, and company information for journalists and partners covering Splits Network.",
    openGraph: {
        title: "Brand Kit | Splits Network",
        description:
            "Brand assets, logos, color palette, and company information for journalists and partners covering Splits Network.",
        url: "https://splits.network/public/brand",
    },
    ...buildCanonical("/public/brand"),
};

// ── Accent color cycling ────────────────────────────────────────────────────

const ACCENT = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
} as const;

type AccentKey = keyof typeof ACCENT;

// ── Data ────────────────────────────────────────────────────────────────────

const keyFacts = [
    { value: "2025", label: "FOUNDED", accent: "coral" as AccentKey },
    { value: "$0", label: "FOR COMPANIES TO POST ROLES", accent: "teal" as AccentKey },
    { value: "0-100%", label: "RECRUITER SHARE OF PLACEMENT FEES", accent: "yellow" as AccentKey },
    { value: "CLOUD-NATIVE", label: "MODERN, SCALABLE INFRASTRUCTURE", accent: "purple" as AccentKey },
];

const memphisColors = [
    { name: "CORAL", tailwind: "bg-coral", textClass: "text-dark", hex: "#FF6B6B", usage: "Primary actions, CTAs, highlights" },
    { name: "TEAL", tailwind: "bg-teal", textClass: "text-dark", hex: "#4ECDC4", usage: "Secondary actions, success states" },
    { name: "YELLOW", tailwind: "bg-yellow", textClass: "text-dark", hex: "#FFE66D", usage: "Warnings, highlights, accents" },
    { name: "PURPLE", tailwind: "bg-purple", textClass: "text-dark", hex: "#A78BFA", usage: "Info states, decorations" },
    { name: "DARK", tailwind: "bg-dark", textClass: "text-cream", hex: "#1A1A2E", usage: "Text, borders, high contrast" },
    { name: "CREAM", tailwind: "bg-cream", textClass: "text-dark", hex: "#F5F0EB", usage: "Backgrounds, surfaces" },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function BrandPage() {
    return (
        <div className="min-h-screen">
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[60vh] flex items-center bg-dark overflow-hidden">
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[4%] w-32 h-32 rounded-full border-[6px] border-coral opacity-25" />
                    <div className="absolute top-[15%] right-[6%] w-24 h-24 rotate-12 bg-teal opacity-20" />
                    <div className="absolute bottom-[20%] left-[8%] w-16 h-16 rounded-full bg-yellow opacity-20" />
                    <div className="absolute bottom-[12%] right-[10%] w-20 h-20 rotate-45 border-4 border-purple opacity-20" />
                    <div className="absolute top-[50%] right-[25%] opacity-15">
                        <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 25 }).map((_, i) => (
                                <div key={`dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-coral" />
                            ))}
                        </div>
                    </div>
                    <svg className="absolute bottom-[6%] left-[20%] opacity-15" width="140" height="35" viewBox="0 0 140 35">
                        <polyline
                            points="0,25 20,8 40,25 60,8 80,25 100,8 120,25 140,8"
                            fill="none"
                            className="stroke-teal"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-block mb-8">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-[0.2em] bg-coral text-dark border-4 border-coral">
                                <i className="fa-duotone fa-regular fa-palette"></i>
                                Media Resources
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-8 text-cream uppercase tracking-tight">
                            Brand{" "}
                            <span className="text-coral">Kit</span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-cream/70">
                            Assets, logos, color palette, and company information
                            for journalists and partners covering Splits Network.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/logo.svg"
                                download="splits-network-logo.svg"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-download"></i>
                                Download Logo
                            </a>
                            <a
                                href="mailto:press@splits.network"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-black uppercase tracking-wider border-4 border-cream bg-transparent text-cream transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Contact Press
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2. COMPANY OVERVIEW
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-12 text-center">
                            Company Overview
                        </h2>

                        <div className="grid lg:grid-cols-5 gap-12 mb-16">
                            <div className="lg:col-span-3">
                                <div className="border-l-4 border-coral pl-6 mb-8">
                                    <h3 className="text-2xl font-black uppercase text-dark mb-4">
                                        About Splits Network
                                    </h3>
                                    <p className="text-base text-dark/80 leading-relaxed">
                                        Splits Network is a modern recruiting marketplace platform
                                        designed specifically for split-fee placements. We connect
                                        specialized recruiters with companies seeking top talent,
                                        providing transparent fee structures, collaborative tools,
                                        and a built-in ATS to streamline the entire placement process.
                                    </p>
                                </div>

                                <div className="border-l-4 border-teal pl-6">
                                    <h3 className="text-2xl font-black uppercase text-dark mb-4">
                                        Boilerplate
                                    </h3>
                                    <div className="bg-dark p-6 border-4 border-dark">
                                        <p className="text-cream/90 italic leading-relaxed">
                                            Splits Network is a split-fee recruiting marketplace
                                            that connects specialized recruiters with companies
                                            seeking top talent. The platform provides transparent
                                            fee structures, collaborative ATS tools, and automated
                                            split tracking—eliminating the spreadsheets and email
                                            chaos traditionally associated with split placements.
                                            Founded by recruiting industry veterans, Splits Network
                                            is built specifically for collaborative recruiting,
                                            not retrofitted from general-purpose systems.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <h3 className="text-2xl font-black uppercase text-dark mb-6">
                                    Key Facts
                                </h3>
                                <div className="space-y-4">
                                    {keyFacts.map((fact, i) => (
                                        <div
                                            key={i}
                                            className={`border-4 border-dark p-5 bg-cream relative`}
                                        >
                                            <div className={`absolute top-0 left-0 w-2 h-full ${ACCENT[fact.accent].bg}`} />
                                            <div className={`text-3xl font-black ${ACCENT[fact.accent].text} mb-1 pl-2`}>
                                                {fact.value}
                                            </div>
                                            <div className="text-sm font-bold uppercase tracking-wider text-dark/60 pl-2">
                                                {fact.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. BRAND ASSETS — LOGO MARK
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-dark relative overflow-hidden">
                {/* Geometric decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[10%] right-[5%] w-20 h-20 rotate-45 bg-yellow opacity-10" />
                    <div className="absolute bottom-[15%] left-[3%] w-14 h-14 rounded-full border-4 border-teal opacity-15" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-cream mb-4 text-center">
                            Logo Mark
                        </h2>
                        <p className="text-center text-cream/60 text-base mb-12 uppercase tracking-wider font-bold">
                            Brand Mark + Wordmark System
                        </p>

                        {/* Primary logos — light vs dark */}
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            {/* Light background */}
                            <div className="border-4 border-cream bg-dark p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 bg-coral" />
                                    <h3 className="text-lg font-black uppercase tracking-wider text-cream">
                                        Light Background
                                    </h3>
                                </div>
                                <div className="bg-cream p-10 border-4 border-cream flex items-center justify-center min-h-40 mb-6">
                                    <HeaderLogo brand="splits" size="md" variant="dark" />
                                </div>
                                <p className="text-sm text-cream/50 uppercase tracking-wider font-bold">
                                    Use variant=&quot;dark&quot; on cream/light backgrounds
                                </p>
                            </div>

                            {/* Dark background */}
                            <div className="border-4 border-cream bg-dark p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 bg-teal" />
                                    <h3 className="text-lg font-black uppercase tracking-wider text-cream">
                                        Dark Background
                                    </h3>
                                </div>
                                <div className="bg-dark p-10 border-4 border-cream/30 flex items-center justify-center min-h-40 mb-6">
                                    <HeaderLogo brand="splits" size="md" variant="light" />
                                </div>
                                <p className="text-sm text-cream/50 uppercase tracking-wider font-bold">
                                    Use variant=&quot;light&quot; on dark backgrounds
                                </p>
                            </div>
                        </div>

                        {/* All three brands */}
                        <div className="mb-12">
                            <h3 className="text-xl font-black uppercase tracking-wider text-cream mb-6">
                                Brand Variants
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                {(["splits", "applicant", "employment"] as const).map((brand) => (
                                    <div key={brand} className="border-4 border-cream/30 p-6">
                                        <div className="bg-dark flex items-center justify-center py-8 mb-4">
                                            <HeaderLogo brand={brand} size="md" variant="light" />
                                        </div>
                                        <div className="text-sm font-black text-cream uppercase tracking-wider">
                                            brand=&quot;{brand}&quot;
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size variants */}
                        <div className="mb-12">
                            <h3 className="text-xl font-black uppercase tracking-wider text-cream mb-6">
                                Size Variants
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="border-4 border-cream/30 p-6">
                                    <div className="bg-dark flex items-center justify-center py-8 mb-4">
                                        <HeaderLogo brand="splits" size="md" variant="light" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-cream uppercase tracking-wider">
                                            size=&quot;md&quot;
                                        </span>
                                        <span className="text-sm text-cream/50">— Primary usage, headers, hero sections</span>
                                    </div>
                                </div>
                                <div className="border-4 border-cream/30 p-6">
                                    <div className="bg-dark flex items-center justify-center py-8 mb-4">
                                        <HeaderLogo brand="splits" size="sm" variant="light" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-cream uppercase tracking-wider">
                                            size=&quot;sm&quot;
                                        </span>
                                        <span className="text-sm text-cream/50">— Mobile headers, footers, compact spaces</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logo anatomy */}
                        <div className="border-4 border-cream/30 p-8 mb-12">
                            <h3 className="text-xl font-black uppercase tracking-wider text-cream mb-6">
                                Logo Anatomy
                            </h3>
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="bg-coral w-16 h-16 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-black text-dark">SN</span>
                                    </div>
                                    <div className="text-sm font-black text-cream uppercase tracking-wider mb-1">Brand Mark</div>
                                    <p className="text-sm text-cream/50">Initials in coral box with 4px dark border</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-4 h-4 rounded-full bg-teal mx-auto mb-4 mt-6" />
                                    <div className="text-sm font-black text-cream uppercase tracking-wider mb-1">Accent Dot</div>
                                    <p className="text-sm text-cream/50">Teal circle, brand-specific color</p>
                                </div>
                                <div className="text-center">
                                    <div className="mt-4 mb-4">
                                        <span className="text-2xl font-black text-cream tracking-tight">Splits</span>
                                    </div>
                                    <div className="text-sm font-black text-cream uppercase tracking-wider mb-1">Wordmark</div>
                                    <p className="text-sm text-cream/50">Font-black, uppercase tracking</p>
                                </div>
                                <div className="text-center">
                                    <div className="mt-5 mb-4">
                                        <span className="text-sm font-bold text-cream/60 uppercase tracking-[0.15em]">Network</span>
                                    </div>
                                    <div className="text-sm font-black text-cream uppercase tracking-wider mb-1">Subtitle</div>
                                    <p className="text-sm text-cream/50">Smaller, tracked, reduced opacity</p>
                                </div>
                            </div>
                        </div>

                        {/* Usage guidelines */}
                        <div className="border-4 border-cream/20 p-8">
                            <h3 className="text-lg font-black uppercase tracking-wider text-cream mb-4">
                                Usage Guidelines
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-teal flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-dark text-sm"></i>
                                    </div>
                                    <p className="text-cream/70 text-base">
                                        Use on solid backgrounds with sufficient contrast
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-teal flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-dark text-sm"></i>
                                    </div>
                                    <p className="text-cream/70 text-base">
                                        Maintain minimum clear space around the logo
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-coral flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-dark text-sm"></i>
                                    </div>
                                    <p className="text-cream/70 text-base">
                                        Do not distort, rotate, or alter logo colors
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Legacy SVG download */}
                        <div className="mt-8 border-4 border-cream/10 p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-black text-cream uppercase tracking-wider mb-1">Legacy SVG Logo</h4>
                                <p className="text-sm text-cream/40">For print and external media use</p>
                            </div>
                            <a
                                href="/logo.svg"
                                download="splits-network-logo.svg"
                                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wider border-4 border-coral bg-coral text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-download"></i>
                                Download SVG
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. TYPOGRAPHY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4 text-center">
                            Typography
                        </h2>
                        <p className="text-center text-dark/60 text-base mb-12 uppercase tracking-wider font-bold">
                            Type System &amp; Hierarchy
                        </p>

                        {/* Font families */}
                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                            <div className="border-4 border-dark p-8 bg-cream">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-coral flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-font text-dark text-sm"></i>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-wider text-dark">
                                        Primary
                                    </h3>
                                </div>
                                <p className="text-2xl font-black text-dark mb-3">
                                    System Sans-Serif
                                </p>
                                <div className="text-sm text-dark/50 font-mono leading-relaxed mb-4">
                                    ui-sans-serif, system-ui, sans-serif
                                </div>
                                <p className="text-sm text-dark/60">
                                    SF Pro (Mac), Segoe UI (Windows), Roboto (Android). Renders natively on every platform — no external font loading.
                                </p>
                                <div className="mt-4 border-t-4 border-dark/10 pt-4">
                                    <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">Used for:</span>
                                    <p className="text-sm text-dark/60 mt-1">All headings, body text, buttons, labels, navigation — every text element across the platform.</p>
                                </div>
                            </div>

                            <div className="border-4 border-dark p-8 bg-cream">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-teal flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-code text-dark text-sm"></i>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-wider text-dark">
                                        Monospace
                                    </h3>
                                </div>
                                <p className="text-2xl font-mono font-bold text-dark mb-3">
                                    System Monospace
                                </p>
                                <div className="text-sm text-dark/50 font-mono leading-relaxed mb-4">
                                    ui-monospace, monospace
                                </div>
                                <p className="text-sm text-dark/60">
                                    SF Mono (Mac), Cascadia Mono (Windows), Roboto Mono (Android). Used sparingly for technical content.
                                </p>
                                <div className="mt-4 border-t-4 border-dark/10 pt-4">
                                    <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">Used for:</span>
                                    <p className="text-sm text-dark/60 mt-1">Code snippets, technical values, data identifiers, monetary figures in some contexts.</p>
                                </div>
                            </div>

                            <div className="border-4 border-dark p-8 bg-cream">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-purple flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-dark text-sm"></i>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-wider text-dark">
                                        Logo Wordmark
                                    </h3>
                                </div>
                                <p className="text-2xl font-black text-dark mb-3">
                                    System Sans @ 900
                                </p>
                                <div className="text-sm text-dark/50 leading-relaxed mb-4">
                                    Same system stack, weight 900 (font-black), tight tracking
                                </div>
                                <p className="text-sm text-dark/60">
                                    The logo wordmark uses the same system sans-serif at maximum weight. No custom font is required — the brand mark is typography-driven, not font-dependent.
                                </p>
                                <div className="mt-4 border-t-4 border-dark/10 pt-4">
                                    <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">Note:</span>
                                    <p className="text-sm text-dark/60 mt-1">If reproducing the logo externally, use SF Pro Black or Segoe UI Bold at maximum available weight.</p>
                                </div>
                            </div>
                        </div>

                        {/* Type scale */}
                        <div className="border-4 border-dark p-8 bg-cream mb-8">
                            <h3 className="text-xl font-black uppercase text-dark mb-8">
                                Heading Scale
                            </h3>
                            <div className="space-y-6">
                                <div className="border-b-4 border-dark/10 pb-6">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-dark">Display</h4>
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">5xl-7xl / 900</span>
                                    </div>
                                    <p className="text-sm text-dark/50">Hero headlines, page titles. Always uppercase, tight tracking.</p>
                                </div>
                                <div className="border-b-4 border-dark/10 pb-6">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-dark">Heading 1</h4>
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">4xl-5xl / 900</span>
                                    </div>
                                    <p className="text-sm text-dark/50">Section headings, major content divisions.</p>
                                </div>
                                <div className="border-b-4 border-dark/10 pb-6">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className="text-2xl font-black uppercase text-dark">Heading 2</h4>
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">2xl / 900</span>
                                    </div>
                                    <p className="text-sm text-dark/50">Subsection headings, card titles.</p>
                                </div>
                                <div className="border-b-4 border-dark/10 pb-6">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className="text-xl font-black uppercase tracking-wider text-dark">Heading 3</h4>
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">xl / 900 / wide</span>
                                    </div>
                                    <p className="text-sm text-dark/50">Labels, field headers, toolbar titles. Wide letter-spacing.</p>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className="text-lg font-black uppercase tracking-wider text-dark">Heading 4</h4>
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">lg / 900 / wide</span>
                                    </div>
                                    <p className="text-sm text-dark/50">Minor headings, list group labels.</p>
                                </div>
                            </div>
                        </div>

                        {/* Body text */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="border-4 border-dark p-8 bg-cream">
                                <h3 className="text-xl font-black uppercase text-dark mb-6">
                                    Body Text
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">text-base (16px) — Default</span>
                                        </div>
                                        <p className="text-base text-dark/80 leading-relaxed">
                                            All body text uses 16px as the baseline. This is non-negotiable for readability and accessibility. Paragraphs, descriptions, form labels, and list items all use this size.
                                        </p>
                                    </div>
                                    <div className="border-t-4 border-dark/10 pt-4">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">text-sm (14px) — Secondary</span>
                                        </div>
                                        <p className="text-sm text-dark/70">
                                            Metadata, captions, bylines, and supporting content. Never the default paragraph size.
                                        </p>
                                    </div>
                                    <div className="border-t-4 border-dark/10 pt-4">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-sm font-bold text-dark/40 uppercase tracking-wider">text-xs (12px) — Afterthought</span>
                                        </div>
                                        <p className="text-xs text-dark/50">
                                            Timestamps, footnotes, copyright, version numbers only. Never for meaningful content.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-4 border-dark p-8 bg-cream">
                                <h3 className="text-xl font-black uppercase text-dark mb-6">
                                    Text Treatments
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider mb-3 block">Buttons &amp; CTAs</span>
                                        <div className="inline-flex items-center px-6 py-3 bg-coral border-4 border-dark">
                                            <span className="font-black uppercase tracking-wider text-dark">Font-Black Uppercase Tracked</span>
                                        </div>
                                    </div>
                                    <div className="border-t-4 border-dark/10 pt-4">
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider mb-3 block">Badges &amp; Labels</span>
                                        <div className="inline-flex items-center px-3 py-1 bg-teal border-4 border-dark">
                                            <span className="text-sm font-black uppercase tracking-[0.15em] text-dark">Tracked Small Caps</span>
                                        </div>
                                    </div>
                                    <div className="border-t-4 border-dark/10 pt-4">
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider mb-3 block">Links</span>
                                        <span className="text-base text-dark font-bold underline decoration-4 decoration-coral/30">
                                            Bold + 4px Underline
                                        </span>
                                    </div>
                                    <div className="border-t-4 border-dark/10 pt-4">
                                        <span className="text-sm font-bold text-dark/40 uppercase tracking-wider mb-3 block">Overline</span>
                                        <span className="text-sm font-black uppercase tracking-[0.2em] text-coral">
                                            Extra-Wide Tracked Label
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Font weight reference */}
                        <div className="border-4 border-dark p-8 bg-cream">
                            <h3 className="text-xl font-black uppercase text-dark mb-6">
                                Weight &amp; Style Rules
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-coral flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-black text-dark">9</span>
                                        </div>
                                        <span className="text-base font-black uppercase tracking-wider text-dark">font-black (900)</span>
                                    </div>
                                    <p className="text-sm text-dark/60 pl-11">Headlines, buttons, labels, CTAs. The primary weight for Memphis design.</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-teal flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-black text-dark">7</span>
                                        </div>
                                        <span className="text-base font-bold uppercase tracking-wider text-dark">font-bold (700)</span>
                                    </div>
                                    <p className="text-sm text-dark/60 pl-11">Emphasis within body text, link text, secondary labels.</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-yellow flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-black text-dark">4</span>
                                        </div>
                                        <span className="text-base font-normal uppercase tracking-wider text-dark">font-normal (400)</span>
                                    </div>
                                    <p className="text-sm text-dark/60 pl-11">Body paragraphs, descriptions, long-form content only.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. COLOR PALETTE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4 text-center">
                            Color Palette
                        </h2>
                        <p className="text-center text-dark/60 text-base mb-12 uppercase tracking-wider font-bold">
                            The Memphis Palette
                        </p>

                        {/* Primary color swatches */}
                        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                            {memphisColors.map((color) => (
                                <div key={color.name} className="border-4 border-dark">
                                    <div className={`${color.tailwind} h-28 flex items-center justify-center`}>
                                        <span className={`text-2xl font-black ${color.textClass}`}>
                                            {color.name}
                                        </span>
                                    </div>
                                    <div className="bg-cream p-4 border-t-4 border-dark">
                                        <div className="text-sm font-black text-dark uppercase tracking-wider mb-1">
                                            {color.hex}
                                        </div>
                                        <div className="text-sm text-dark/60">
                                            {color.usage}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Color combinations */}
                        <div className="border-4 border-dark p-8 bg-cream">
                            <h3 className="text-xl font-black uppercase text-dark mb-6">
                                Recommended Combinations
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="border-4 border-dark bg-coral p-6 text-center">
                                    <span className="font-black text-dark uppercase tracking-wider">Coral + Dark</span>
                                </div>
                                <div className="border-4 border-dark bg-teal p-6 text-center">
                                    <span className="font-black text-dark uppercase tracking-wider">Teal + Dark</span>
                                </div>
                                <div className="border-4 border-dark bg-dark p-6 text-center">
                                    <span className="font-black text-cream uppercase tracking-wider">Dark + Cream</span>
                                </div>
                                <div className="border-4 border-dark bg-yellow p-6 text-center">
                                    <span className="font-black text-dark uppercase tracking-wider">Yellow + Dark</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. PRODUCT SCREENSHOTS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-dark relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[8%] left-[6%] w-12 h-12 bg-purple opacity-15 rotate-45" />
                    <div className="absolute bottom-[10%] right-[8%] w-16 h-16 rounded-full border-4 border-yellow opacity-15" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-cream mb-4 text-center">
                            Product Screenshots
                        </h2>
                        <p className="text-center text-cream/60 text-base mb-12 uppercase tracking-wider font-bold">
                            High-Resolution Available on Request
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="border-4 border-cream bg-dark p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-yellow" />
                                    <h3 className="text-base font-black uppercase tracking-wider text-cream">
                                        Dashboard View
                                    </h3>
                                </div>
                                <div className="border-4 border-cream/20 aspect-video flex items-center justify-center overflow-hidden">
                                    <Image
                                        src="/screenshots/light/dashboard-light.png"
                                        alt="Dashboard Screenshot"
                                        width={640}
                                        height={360}
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                            </div>
                            <div className="border-4 border-cream bg-dark p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-purple" />
                                    <h3 className="text-base font-black uppercase tracking-wider text-cream">
                                        ATS Pipeline
                                    </h3>
                                </div>
                                <div className="border-4 border-cream/20 aspect-video flex items-center justify-center bg-dark">
                                    <div className="text-center">
                                        <i className="fa-duotone fa-regular fa-image text-5xl text-cream/20 mb-3"></i>
                                        <p className="text-sm text-cream/40 uppercase tracking-wider font-bold">Coming Soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <a
                                href="mailto:press@splits.network?subject=Screenshot%20Request"
                                className="inline-flex items-center gap-3 px-8 py-4 text-base font-black uppercase tracking-wider border-4 border-coral bg-coral text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-images"></i>
                                Request High-Res Screenshots
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. MEDIA CONTACT
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-cream relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[5%] right-[4%] w-16 h-16 rotate-12 border-4 border-coral opacity-15" />
                    <div className="absolute bottom-[8%] left-[6%] w-10 h-10 bg-teal opacity-10" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-12 text-center">
                            Media Contact
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            {/* Press */}
                            <div className="border-4 border-dark bg-cream p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-coral flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-newspaper text-dark"></i>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-wider text-dark">
                                        Press Inquiries
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <i className="fa-duotone fa-regular fa-envelope text-coral"></i>
                                        <a
                                            href="mailto:press@splits.network"
                                            className="text-base text-dark font-bold underline decoration-4 decoration-coral/30 hover:decoration-coral transition-colors"
                                        >
                                            press@splits.network
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="fa-duotone fa-regular fa-phone text-coral"></i>
                                        <span className="text-base text-dark/70">
                                            Available upon request
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Partnerships */}
                            <div className="border-4 border-dark bg-cream p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-teal flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-handshake text-dark"></i>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-wider text-dark">
                                        Partnership Inquiries
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <i className="fa-duotone fa-regular fa-envelope text-teal"></i>
                                        <a
                                            href="mailto:partnerships@splits.network"
                                            className="text-base text-dark font-bold underline decoration-4 decoration-teal/30 hover:decoration-teal transition-colors"
                                        >
                                            partnerships@splits.network
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="fa-duotone fa-regular fa-handshake text-teal"></i>
                                        <Link
                                            href="/partners"
                                            className="text-base text-dark font-bold underline decoration-4 decoration-teal/30 hover:decoration-teal transition-colors"
                                        >
                                            Partner Program
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center border-t-4 border-dark pt-12">
                            <p className="text-base text-dark/70 mb-8 max-w-2xl mx-auto">
                                For additional materials, interview requests, or custom
                                assets, please contact our press team.
                            </p>
                            <a
                                href="mailto:press@splits.network"
                                className="inline-flex items-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-dark bg-coral text-dark transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Contact Press Team
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}