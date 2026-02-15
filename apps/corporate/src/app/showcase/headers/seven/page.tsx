"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Navigation Data ─────────────────────────────────────────────────────────

const navLinks = [
    {
        label: "PLATFORM",
        href: "#",
        submenu: [
            { label: "Split-Fee Engine", href: "#", icon: "fa-duotone fa-regular fa-handshake" },
            { label: "Applicant Tracking", href: "#", icon: "fa-duotone fa-regular fa-table-columns" },
            { label: "Network Routing", href: "#", icon: "fa-duotone fa-regular fa-network-wired" },
            { label: "Analytics Core", href: "#", icon: "fa-duotone fa-regular fa-chart-mixed" },
        ],
    },
    { label: "NETWORK", href: "#" },
    { label: "PRICING", href: "#" },
    { label: "DOCS", href: "#" },
    { label: "CHANGELOG", href: "#" },
];

const sampleContent = [
    {
        id: "ANN-001",
        title: "Platform v2.1 Released",
        description: "New split-fee calculation engine with multi-party support and automated invoicing.",
        date: "FEB 14, 2026",
        tag: "RELEASE",
    },
    {
        id: "ANN-002",
        title: "AI Matching Now in Beta",
        description: "Intelligent recruiter-to-role matching based on niche, capacity, and performance history.",
        date: "FEB 10, 2026",
        tag: "BETA",
    },
    {
        id: "ANN-003",
        title: "Candidate Portal Redesign",
        description: "Completely rebuilt candidate experience with real-time application tracking and interview prep.",
        date: "FEB 07, 2026",
        tag: "UPDATE",
    },
    {
        id: "ANN-004",
        title: "Network Expansion: APAC",
        description: "Splits Network now supports recruiters and companies across the Asia-Pacific region.",
        date: "FEB 03, 2026",
        tag: "EXPANSION",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HeadersSevenPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                ".bp-nav-logo",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4 },
            );
            tl.fromTo(
                ".bp-nav-link",
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-nav-actions",
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.4 },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-showcase-label",
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
                "-=0.1",
            );
            tl.fromTo(
                ".bp-sample-card",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                "-=0.1",
            );

            gsap.to(".bp-pulse-dot", {
                opacity: 0.3,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4]">
                {/* ══════════════════════════════════════════════════════════
                    HEADER - Industrial Blueprint Navigation
                   ══════════════════════════════════════════════════════════ */}
                <header className="relative z-50 border-b border-[#3b5ccc]/10">
                    {/* Top micro bar */}
                    <div className="border-b border-[#3b5ccc]/[0.06]">
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between py-1.5 font-mono text-[9px] text-[#c8ccd4]/25 tracking-widest">
                                <span>EMPLOYMENT NETWORKS INC. // SPLITS NETWORK PLATFORM</span>
                                <div className="hidden md:flex items-center gap-4">
                                    <span>STATUS: OPERATIONAL</span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                                        LIVE
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main navigation */}
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="bp-nav-logo flex items-center gap-3 opacity-0">
                                <div className="w-9 h-9 border-2 border-[#3b5ccc] flex items-center justify-center">
                                    <span className="font-mono text-sm font-bold text-[#3b5ccc]">
                                        SN
                                    </span>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="font-mono text-sm font-bold text-white tracking-wider">
                                        SPLITS NETWORK
                                    </div>
                                    <div className="font-mono text-[8px] text-[#3b5ccc]/50 tracking-[0.3em]">
                                        RECRUITING INFRASTRUCTURE
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <div
                                        key={link.label}
                                        className="relative"
                                        onMouseEnter={() =>
                                            link.submenu && setActiveDropdown(link.label)
                                        }
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <a
                                            href={link.href}
                                            className="bp-nav-link flex items-center gap-1.5 px-4 py-2 font-mono text-[11px] tracking-widest text-[#c8ccd4]/60 hover:text-white transition-colors opacity-0"
                                        >
                                            {link.label}
                                            {link.submenu && (
                                                <i className="fa-duotone fa-regular fa-chevron-down text-[8px] text-[#3b5ccc]/40"></i>
                                            )}
                                        </a>

                                        {/* Dropdown */}
                                        {link.submenu && activeDropdown === link.label && (
                                            <div className="absolute top-full left-0 mt-0 w-72 bg-[#0d1220] border border-[#3b5ccc]/20 z-50">
                                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-4 py-2 border-b border-[#3b5ccc]/10">
                                                    // {link.label} MODULES
                                                </div>
                                                {link.submenu.map((sub) => (
                                                    <a
                                                        key={sub.label}
                                                        href={sub.href}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b5ccc]/5 transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 border border-[#3b5ccc]/20 flex items-center justify-center group-hover:border-[#3b5ccc]/40 transition-colors">
                                                            <i className={`${sub.icon} text-xs text-[#3b5ccc]/60`}></i>
                                                        </div>
                                                        <span className="font-mono text-[11px] text-[#c8ccd4]/60 group-hover:text-white tracking-wider transition-colors">
                                                            {sub.label}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            {/* Right actions */}
                            <div className="bp-nav-actions flex items-center gap-2 opacity-0">
                                {/* Search toggle */}
                                <button
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="w-9 h-9 border border-[#3b5ccc]/20 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white hover:border-[#3b5ccc]/40 transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-xs"></i>
                                </button>

                                {/* User menu */}
                                <div className="relative hidden md:block">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="w-9 h-9 border border-[#3b5ccc]/20 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white hover:border-[#3b5ccc]/40 transition-colors"
                                    >
                                        <i className="fa-duotone fa-regular fa-user text-xs"></i>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-[#0d1220] border border-[#3b5ccc]/20 z-50">
                                            <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-4 py-2 border-b border-[#3b5ccc]/10">
                                                // USER TERMINAL
                                            </div>
                                            <div className="p-4 border-b border-[#3b5ccc]/10">
                                                <div className="font-mono text-xs text-white">operator@splits.network</div>
                                                <div className="font-mono text-[9px] text-[#c8ccd4]/30 mt-0.5">ROLE: RECRUITER</div>
                                            </div>
                                            {["Dashboard", "Settings", "Billing", "Sign Out"].map((item) => (
                                                <a
                                                    key={item}
                                                    href="#"
                                                    className="block px-4 py-2.5 font-mono text-[11px] text-[#c8ccd4]/50 hover:text-white hover:bg-[#3b5ccc]/5 tracking-wider transition-colors"
                                                >
                                                    <span className="text-[#3b5ccc]/40 mr-2">&gt;</span>
                                                    {item}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CTA */}
                                <a
                                    href="#"
                                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                                >
                                    <span className="text-white/40">&gt;</span>
                                    DEPLOY
                                </a>

                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="lg:hidden w-9 h-9 border border-[#3b5ccc]/20 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white transition-colors"
                                >
                                    <i className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-xs`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search bar (expandable) */}
                    {searchOpen && (
                        <div className="border-t border-[#3b5ccc]/10">
                            <div className="container mx-auto px-4 py-3">
                                <div className="relative max-w-2xl">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#3b5ccc]/40 text-xs"></i>
                                    <input
                                        type="text"
                                        placeholder="SEARCH_QUERY..."
                                        autoFocus
                                        className="w-full bg-[#0d1220] border border-[#3b5ccc]/20 text-[#c8ccd4] font-mono text-xs pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#3b5ccc]/50 placeholder:text-[#c8ccd4]/20 tracking-wider"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-[#3b5ccc]/10 bg-[#0d1220]">
                            <div className="container mx-auto px-4 py-4">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest mb-3">
                                    // NAVIGATION
                                </div>
                                {navLinks.map((link) => (
                                    <div key={link.label}>
                                        <a
                                            href={link.href}
                                            className="block py-3 px-4 font-mono text-xs text-[#c8ccd4]/60 hover:text-white hover:bg-[#3b5ccc]/5 tracking-widest transition-colors border-b border-[#3b5ccc]/[0.06]"
                                        >
                                            <span className="text-[#3b5ccc]/40 mr-2">&gt;</span>
                                            {link.label}
                                        </a>
                                        {link.submenu?.map((sub) => (
                                            <a
                                                key={sub.label}
                                                href={sub.href}
                                                className="block py-2.5 pl-10 pr-4 font-mono text-[11px] text-[#c8ccd4]/40 hover:text-white hover:bg-[#3b5ccc]/5 tracking-wider transition-colors border-b border-[#3b5ccc]/[0.04]"
                                            >
                                                <i className={`${sub.icon} text-[10px] text-[#3b5ccc]/40 mr-2`}></i>
                                                {sub.label}
                                            </a>
                                        ))}
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <a
                                        href="#"
                                        className="block w-full text-center py-3 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest border border-[#3b5ccc]"
                                    >
                                        DEPLOY_NOW
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* ══════════════════════════════════════════════════════════
                    SAMPLE CONTENT - Contextual demonstration
                   ══════════════════════════════════════════════════════════ */}
                <div className="relative">
                    <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        {/* Showcase label */}
                        <div className="bp-showcase-label pt-12 pb-8 opacity-0">
                            <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-2">
                                // HEADER SHOWCASE // INDUSTRIAL BLUEPRINT VARIANT
                            </div>
                            <div className="h-px bg-[#3b5ccc]/10 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/30 rotate-45"></div>
                            </div>
                        </div>

                        {/* Sample content cards */}
                        <div className="pb-16">
                            <div className="mb-8">
                                <div className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                    // RECENT DISPATCHES
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    System <span className="text-[#3b5ccc]">Updates</span>
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-px bg-[#3b5ccc]/10">
                                {sampleContent.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bp-sample-card bg-[#0a0e17] p-6 group relative opacity-0"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                                {item.id}
                                            </span>
                                            <span className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider">
                                                [{item.tag}]
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-[#c8ccd4]/40 leading-relaxed mb-3">
                                            {item.description}
                                        </p>
                                        <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">
                                            {item.date}
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
