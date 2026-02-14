"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

// ─── Constants ──────────────────────────────────────────────────────────────
const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)" };

const NAV_LINKS = [
    { label: "Platform", href: "#", icon: "fa-duotone fa-regular fa-layer-group" },
    { label: "Recruiters", href: "#", icon: "fa-duotone fa-regular fa-hard-hat" },
    { label: "Companies", href: "#", icon: "fa-duotone fa-regular fa-compass-drafting" },
    { label: "Candidates", href: "#", icon: "fa-duotone fa-regular fa-user-helmet-safety" },
    { label: "Pricing", href: "#", icon: "fa-duotone fa-regular fa-tag" },
];

const SAMPLE_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        description: "Connect with recruiters and companies in a transparent fee-sharing ecosystem built on trust.",
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Built-in ATS",
        description: "Track every candidate from first contact through placement in one integrated system.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Analytics Engine",
        description: "Real-time dashboards that show pipeline health, recruiter performance, and revenue at a glance.",
    },
    {
        icon: "fa-duotone fa-regular fa-robot",
        title: "AI Matching",
        description: "Intelligent algorithms that connect the right candidates with the right roles automatically.",
    },
];

// ─── Page Component ─────────────────────────────────────────────────────────
export default function HeadersEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const tl = gsap.timeline({ defaults: { ease: E.smooth } });

            // Header elements animate in
            tl.fromTo(
                ".bp-hdr-logo",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.fast },
            );
            tl.fromTo(
                ".bp-hdr-nav-item",
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: D.fast, stagger: 0.05 },
                "-=0.15",
            );
            tl.fromTo(
                ".bp-hdr-action",
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.fast, stagger: 0.06 },
                "-=0.15",
            );
            tl.fromTo(
                ".bp-hdr-grid-line",
                { scaleX: 0 },
                { scaleX: 1, duration: D.build, stagger: 0.04, ease: E.smooth },
                "-=0.2",
            );

            // Hero content
            tl.fromTo(
                ".bp-hdr-hero-badge",
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-hdr-hero-title",
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-hdr-hero-sub",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-hdr-hero-cta",
                { opacity: 0, y: 15, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.fast, stagger: 0.08, ease: E.bounce },
                "-=0.15",
            );

            // Sample content
            tl.fromTo(
                ".bp-hdr-feature",
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.build, stagger: 0.1, ease: E.bounce },
                "-=0.1",
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: "#0a1628" }}>
            {/* Blueprint grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Corner dimension marks */}
            <div className="fixed top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />

            {/* ══════════════════════════════════════════════════════════════
                HEADER - Blueprint Construction
               ══════════════════════════════════════════════════════════════ */}
            <header className="relative z-20 border-b border-cyan-500/10" style={{ backgroundColor: "#081220" }}>
                {/* Thin accent line at very top */}
                <div className="h-[2px] w-full" style={{ backgroundColor: "#22d3ee" }} />

                <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
                    <div className="flex items-center justify-between h-16 lg:h-[72px]">
                        {/* ── Logo ── */}
                        <div className="bp-hdr-logo flex items-center gap-3 opacity-0">
                            <div
                                className="w-9 h-9 rounded-lg border border-cyan-500/30 flex items-center justify-center"
                                style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                            >
                                <i className="fa-duotone fa-regular fa-network-wired text-cyan-400 text-sm" />
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm leading-tight">Splits Network</div>
                                <div className="font-mono text-[8px] text-cyan-500/40 tracking-wider uppercase">
                                    Precision Recruiting
                                </div>
                            </div>
                        </div>

                        {/* ── Desktop Navigation ── */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="bp-hdr-nav-item flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-cyan-500/[0.05] transition-all duration-200 opacity-0"
                                >
                                    <i className={`${link.icon} text-cyan-500/40 text-xs`} />
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </nav>

                        {/* ── Actions ── */}
                        <div className="flex items-center gap-2">
                            {/* Search toggle */}
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="bp-hdr-action w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors opacity-0"
                                style={{ backgroundColor: "rgba(34,211,238,0.03)" }}
                            >
                                <i className={`fa-duotone fa-regular ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"} text-sm`} />
                            </button>

                            {/* User avatar */}
                            <button
                                className="bp-hdr-action w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold hover:border-cyan-400/40 transition-colors opacity-0"
                                style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                            >
                                EN
                            </button>

                            {/* CTA - Desktop */}
                            <a
                                href="#"
                                className="bp-hdr-action hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-900 font-semibold border-0 opacity-0"
                                style={{ backgroundColor: "#22d3ee" }}
                            >
                                <i className="fa-duotone fa-regular fa-hard-hat text-xs" />
                                Start Building
                            </a>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="bp-hdr-action lg:hidden w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors opacity-0"
                                style={{ backgroundColor: "rgba(34,211,238,0.03)" }}
                            >
                                <i className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-sm`} />
                            </button>
                        </div>
                    </div>

                    {/* ── Search bar (expandable) ── */}
                    {searchOpen && (
                        <div className="pb-4">
                            <div className="relative">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/40 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search roles, companies, recruiters..."
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                                    style={{ backgroundColor: "#0d1d33" }}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-cyan-500/30 border border-cyan-500/15 px-1.5 py-0.5 rounded">
                                    ESC
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Mobile Menu ── */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-cyan-500/10" style={{ backgroundColor: "#081220" }}>
                        <div className="container mx-auto px-4 py-4 space-y-1">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-cyan-500/[0.05] transition-colors"
                                >
                                    <i className={`${link.icon} text-cyan-500/40 text-sm w-5 text-center`} />
                                    <span>{link.label}</span>
                                </a>
                            ))}
                            <div className="pt-3 border-t border-cyan-500/10 mt-3">
                                <a
                                    href="#"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm text-slate-900 font-semibold"
                                    style={{ backgroundColor: "#22d3ee" }}
                                >
                                    <i className="fa-duotone fa-regular fa-hard-hat text-xs" />
                                    Start Building
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decorative blueprint grid lines below header */}
                <div className="relative h-[3px] overflow-hidden">
                    <div className="bp-hdr-grid-line absolute inset-0 origin-left" style={{ backgroundColor: "rgba(34,211,238,0.15)" }} />
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                HERO SECTION - Context for the header
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative z-10 py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
                {/* Animated horizontal grid lines */}
                <div className="absolute top-[25%] left-0 right-0 h-px bg-cyan-500/10 bp-hdr-grid-line origin-left" />
                <div className="absolute top-[50%] left-0 right-0 h-px bg-cyan-500/8 bp-hdr-grid-line origin-left" />
                <div className="absolute top-[75%] left-0 right-0 h-px bg-cyan-500/10 bp-hdr-grid-line origin-left" />

                <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bp-hdr-hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-compass-drafting text-xs" />
                            <span>HEADER SHOWCASE // BLUEPRINT v8</span>
                        </div>

                        <h1 className="bp-hdr-hero-title text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 text-white opacity-0">
                            Precision-Engineered{" "}
                            <span className="text-cyan-400">Navigation</span>
                        </h1>

                        <p className="bp-hdr-hero-sub text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light opacity-0">
                            A header built with architectural precision. Clean structure, clear hierarchy,
                            and blueprint-grade attention to every detail.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#"
                                className="bp-hdr-hero-cta btn btn-lg border-0 text-slate-900 font-bold shadow-lg shadow-cyan-500/25 opacity-0"
                                style={{ backgroundColor: "#22d3ee" }}
                            >
                                <i className="fa-duotone fa-regular fa-hard-hat" />
                                Start Building
                            </a>
                            <a
                                href="#"
                                className="bp-hdr-hero-cta btn btn-lg btn-outline border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-scroll" />
                                View Blueprint
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SAMPLE CONTENT - Shows header in context
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative z-10 py-20 overflow-hidden" style={{ backgroundColor: "#0d1d33" }}>
                <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
                    <div className="text-center mb-16">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                            Platform Architecture
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Built Block by Block
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Each component is engineered to work independently and in concert.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                        {SAMPLE_FEATURES.map((feature, i) => (
                            <div key={i} className="bp-hdr-feature group relative opacity-0">
                                {/* Isometric shadow */}
                                <div
                                    className="absolute inset-0 rounded-xl translate-y-1 translate-x-1"
                                    style={{ backgroundColor: "rgba(34,211,238,0.03)" }}
                                />
                                <div
                                    className="relative rounded-xl p-6 border border-cyan-500/15 transition-all duration-200 group-hover:border-cyan-400/30 group-hover:-translate-y-0.5"
                                    style={{ backgroundColor: "#0f2847" }}
                                >
                                    <div className="absolute top-3 right-3 font-mono text-[9px] text-cyan-500/20">
                                        L{i + 1}
                                    </div>
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30"
                                        style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                                    >
                                        <i className={`${feature.icon} text-xl text-cyan-400`} />
                                    </div>
                                    <h3 className="font-bold text-white text-sm mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
                                    <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: "#22d3ee", width: `${25 * (i + 1)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Spacer section to show scroll context */}
            <section className="relative z-10 py-16 text-center" style={{ backgroundColor: "#081220" }}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 justify-center">
                        <div className="flex-1 max-w-[100px] h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                        <span className="font-mono text-[10px] text-cyan-500/20 uppercase tracking-wider">
                            End of Header Showcase
                        </span>
                        <div className="flex-1 max-w-[100px] h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                    </div>
                </div>
            </section>
        </div>
    );
}
