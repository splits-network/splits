"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

// ── Nav Data ----------------------------------------------------------------

const navItems = [
    {
        label: "Platform",
        icon: "fa-grid-2",
        children: [
            { label: "Dashboard", icon: "fa-chart-mixed", desc: "Analytics overview" },
            { label: "Job Board", icon: "fa-briefcase", desc: "Browse open roles" },
            { label: "Candidates", icon: "fa-users", desc: "Talent pipeline" },
            { label: "Recruiters", icon: "fa-user-tie", desc: "Network directory" },
        ],
    },
    {
        label: "Network",
        icon: "fa-diagram-project",
        children: [
            { label: "Split Fees", icon: "fa-handshake", desc: "Fee arrangements" },
            { label: "Assignments", icon: "fa-clipboard-list", desc: "Active assignments" },
            { label: "Proposals", icon: "fa-file-signature", desc: "Submitted proposals" },
        ],
    },
    {
        label: "Companies",
        icon: "fa-building",
        children: [
            { label: "Directory", icon: "fa-buildings", desc: "Company listings" },
            { label: "Partnerships", icon: "fa-link", desc: "Active partnerships" },
        ],
    },
    { label: "Placements", icon: "fa-badge-check" },
    { label: "Reports", icon: "fa-chart-line" },
];

const userMenuItems = [
    { label: "Profile", icon: "fa-user" },
    { label: "Settings", icon: "fa-gear" },
    { label: "Billing", icon: "fa-credit-card" },
    { label: "Help Center", icon: "fa-circle-question" },
    { label: "Sign Out", icon: "fa-arrow-right-from-bracket" },
];

// ── Component ---------------------------------------------------------------

export default function HeadersNinePage() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Scroll listener for compact header
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Focus search when opened
    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
            gsap.fromTo(
                ".search-overlay",
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" },
            );
        }
    }, [searchOpen]);

    // Initial load animation
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
            containerRef.current.querySelector(".header-main"),
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        );
        gsap.fromTo(
            containerRef.current.querySelectorAll(".hero-content > *"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.3 },
        );
        gsap.fromTo(
            containerRef.current.querySelectorAll(".sample-card"),
            { opacity: 0, y: 25, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: "power3.out", delay: 0.6 },
        );
    }, []);

    // Dropdown animation
    useEffect(() => {
        if (!activeDropdown) return;
        const el = document.querySelector(`.dropdown-${activeDropdown}`);
        if (!el) return;
        gsap.fromTo(
            el,
            { opacity: 0, y: -8, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power3.out" },
        );
    }, [activeDropdown]);

    // ── Render ---------------------------------------------------------------
    return (
        <div ref={containerRef} className="min-h-screen bg-white">
            {/* Dotted grid background */}
            <div
                className="fixed inset-0 opacity-[0.06] pointer-events-none z-0"
                style={{
                    backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* ── HEADER ───────────────────────────────────────── */}
            <header
                className={`header-main sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${
                    scrolled
                        ? "border-b-2 border-[#233876]/10 shadow-[0_2px_20px_rgba(35,56,118,0.06)]"
                        : "border-b border-[#233876]/8"
                }`}
            >
                {/* Top bar */}
                <div className="border-b border-dashed border-[#233876]/8">
                    <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
                        <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase">
                            REF: HDR-09 // Employment Networks
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-[9px] text-[#233876]/25 hidden sm:inline">
                                System Status: Operational
                            </span>
                            <span className="w-1.5 h-1.5 bg-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Main header bar */}
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        className={`flex items-center justify-between transition-all duration-300 ${
                            scrolled ? "py-2.5" : "py-4"
                        }`}
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden w-9 h-9 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/40 transition-colors"
                            >
                                <i className={`fa-duotone fa-regular ${mobileOpen ? "fa-xmark" : "fa-bars"} text-sm`} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#233876] flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">S</span>
                                </div>
                                <div>
                                    <div className="font-bold text-[#0f1b3d] text-sm leading-tight">
                                        Splits Network
                                    </div>
                                    <div className="font-mono text-[8px] tracking-[0.2em] text-[#233876]/30 uppercase">
                                        Recruiting Platform
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() =>
                                        item.children && setActiveDropdown(item.label)
                                    }
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button
                                        className={`flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-wide transition-colors ${
                                            activeDropdown === item.label
                                                ? "text-[#233876] bg-[#233876]/5"
                                                : "text-[#0f1b3d]/50 hover:text-[#233876]"
                                        }`}
                                    >
                                        <i className={`fa-duotone fa-regular ${item.icon} text-[11px]`} />
                                        <span>{item.label}</span>
                                        {item.children && (
                                            <i className="fa-duotone fa-regular fa-chevron-down text-[8px] ml-0.5" />
                                        )}
                                    </button>

                                    {/* Dropdown */}
                                    {item.children && activeDropdown === item.label && (
                                        <div
                                            className={`dropdown-${item.label} absolute top-full left-0 mt-0 bg-white border-2 border-[#233876]/10 shadow-[0_8px_30px_rgba(35,56,118,0.08)] min-w-[260px] z-50`}
                                        >
                                            <div className="py-2">
                                                {item.children.map((child) => (
                                                    <button
                                                        key={child.label}
                                                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#233876]/5 transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 border-2 border-[#233876]/10 flex items-center justify-center group-hover:border-[#233876]/30 group-hover:bg-[#233876]/5 transition-colors">
                                                            <i className={`fa-duotone fa-regular ${child.icon} text-sm text-[#233876]/40 group-hover:text-[#233876]`} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-[#0f1b3d] group-hover:text-[#233876]">
                                                                {child.label}
                                                            </div>
                                                            <div className="font-mono text-[9px] text-[#233876]/30">
                                                                {child.desc}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="border-t border-dashed border-[#233876]/10 px-4 py-2">
                                                <span className="font-mono text-[8px] text-[#233876]/20 uppercase tracking-wider">
                                                    {item.label} Module // v9.0
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className={`w-9 h-9 border-2 flex items-center justify-center transition-colors ${
                                    searchOpen
                                        ? "border-[#233876] bg-[#233876] text-white"
                                        : "border-[#233876]/15 text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/40"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" />
                            </button>

                            {/* Notifications */}
                            <button className="relative w-9 h-9 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/40 transition-colors">
                                <i className="fa-duotone fa-regular fa-bell text-sm" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#233876] text-white font-mono text-[8px] flex items-center justify-center font-bold">
                                    3
                                </span>
                            </button>

                            {/* CTA */}
                            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#233876] text-white font-mono text-xs tracking-wide hover:bg-[#1a2a5c] transition-colors">
                                <i className="fa-duotone fa-regular fa-plus text-[10px]" />
                                Post Job
                            </button>

                            {/* User menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 border-2 border-[#233876]/15 hover:border-[#233876]/30 transition-colors"
                                >
                                    <div className="w-7 h-7 bg-[#233876]/8 flex items-center justify-center">
                                        <span className="font-bold text-[10px] text-[#233876]">
                                            JD
                                        </span>
                                    </div>
                                    <span className="hidden md:block font-mono text-xs text-[#0f1b3d]/60">
                                        J. Davis
                                    </span>
                                    <i className="fa-duotone fa-regular fa-chevron-down text-[8px] text-[#233876]/30" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border-2 border-[#233876]/10 shadow-[0_8px_30px_rgba(35,56,118,0.08)] min-w-[200px] z-50">
                                        <div className="px-4 py-3 border-b border-dashed border-[#233876]/10">
                                            <div className="font-medium text-sm text-[#0f1b3d]">
                                                Jordan Davis
                                            </div>
                                            <div className="font-mono text-[9px] text-[#233876]/30">
                                                Senior Recruiter // ORG-4291
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            {userMenuItems.map((item) => (
                                                <button
                                                    key={item.label}
                                                    className="w-full text-left px-4 py-2 flex items-center gap-3 text-sm text-[#0f1b3d]/60 hover:text-[#233876] hover:bg-[#233876]/5 transition-colors"
                                                >
                                                    <i className={`fa-duotone fa-regular ${item.icon} w-4 text-center text-xs`} />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-dashed border-[#233876]/10 px-4 py-2">
                                            <span className="font-mono text-[8px] text-[#233876]/20 uppercase tracking-wider">
                                                Session // Active
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search overlay */}
                {searchOpen && (
                    <div className="search-overlay border-t border-[#233876]/10 bg-white">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="relative max-w-2xl mx-auto">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#233876]/25" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search jobs, candidates, companies..."
                                    className="w-full pl-11 pr-20 py-3 bg-[#f7f8fa] border-2 border-[#233876]/10 font-mono text-sm text-[#0f1b3d] placeholder:text-[#233876]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <kbd className="px-2 py-0.5 bg-[#233876]/5 border border-[#233876]/10 font-mono text-[9px] text-[#233876]/30">
                                        ESC
                                    </kbd>
                                    <button
                                        onClick={() => {
                                            setSearchOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className="text-[#233876]/30 hover:text-[#233876] transition-colors"
                                    >
                                        <i className="fa-duotone fa-regular fa-xmark" />
                                    </button>
                                </div>
                            </div>
                            {/* Quick search suggestions */}
                            <div className="max-w-2xl mx-auto mt-3 flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[9px] text-[#233876]/25 uppercase tracking-wider">
                                    Recent:
                                </span>
                                {["Frontend Developer", "TechCorp", "Sarah Chen", "Remote roles"].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setSearchQuery(term)}
                                        className="px-2.5 py-1 bg-[#233876]/5 text-[#233876]/50 font-mono text-[10px] hover:bg-[#233876]/10 hover:text-[#233876] transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-[#233876]/10 bg-white">
                        <div className="px-6 py-4">
                            {navItems.map((item) => (
                                <div key={item.label} className="mb-1">
                                    <div className="flex items-center gap-2 px-3 py-2.5 text-[#0f1b3d]/60 hover:text-[#233876] hover:bg-[#233876]/5 transition-colors">
                                        <i className={`fa-duotone fa-regular ${item.icon} text-sm w-5 text-center`} />
                                        <span className="font-mono text-xs tracking-wide">
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.children && (
                                        <div className="ml-8 border-l-2 border-dashed border-[#233876]/10">
                                            {item.children.map((child) => (
                                                <button
                                                    key={child.label}
                                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-[#0f1b3d]/40 hover:text-[#233876] transition-colors"
                                                >
                                                    <i className={`fa-duotone fa-regular ${child.icon} text-[10px]`} />
                                                    {child.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="border-t border-dashed border-[#233876]/10 mt-3 pt-3">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#233876] text-white font-mono text-xs tracking-wide">
                                    <i className="fa-duotone fa-regular fa-plus text-[10px]" />
                                    Post Job
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ── SAMPLE PAGE CONTENT ─────────────────────────── */}
            <div className="relative z-10">
                {/* Hero */}
                <section className="max-w-7xl mx-auto px-6 py-16">
                    <div className="hero-content max-w-3xl">
                        <div className="font-mono text-[10px] tracking-[0.3em] text-[#233876]/30 uppercase mb-4">
                            REF: HDR-09 // Header Showcase // Clean Architecture
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-4 leading-tight">
                            Clean Architecture
                            <br />
                            <span className="text-[#233876]">Header System</span>
                        </h1>
                        <p className="text-lg text-[#0f1b3d]/50 mb-8 max-w-xl leading-relaxed">
                            A structured navigation system built on architectural precision. Every element serves a purpose, every interaction is intentional.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-[#233876] text-white font-mono text-xs tracking-wide hover:bg-[#1a2a5c] transition-colors">
                                <i className="fa-duotone fa-regular fa-arrow-right text-[10px]" />
                                Get Started
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 border-2 border-[#233876]/20 text-[#233876]/60 font-mono text-xs tracking-wide hover:border-[#233876]/40 hover:text-[#233876] transition-colors">
                                <i className="fa-duotone fa-regular fa-play text-[10px]" />
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </section>

                {/* Feature highlights */}
                <section className="max-w-7xl mx-auto px-6 pb-20">
                    <div className="border-t border-dashed border-[#233876]/10 pt-12">
                        <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-8">
                            Header Features
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    icon: "fa-compass",
                                    title: "Mega Navigation",
                                    desc: "Dropdown menus with structured sub-navigation and module references",
                                },
                                {
                                    icon: "fa-magnifying-glass",
                                    title: "Command Search",
                                    desc: "Expandable search bar with recent queries and keyboard shortcuts",
                                },
                                {
                                    icon: "fa-user-gear",
                                    title: "User Context",
                                    desc: "Authenticated user menu with role display and session info",
                                },
                                {
                                    icon: "fa-mobile",
                                    title: "Responsive",
                                    desc: "Collapsible mobile menu with nested navigation and CTA",
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="sample-card border-2 border-[#233876]/8 p-5 hover:border-[#233876]/20 transition-colors group"
                                >
                                    <div className="w-10 h-10 border-2 border-[#233876]/10 flex items-center justify-center mb-4 group-hover:border-[#233876]/30 group-hover:bg-[#233876]/5 transition-colors">
                                        <i className={`fa-duotone fa-regular ${feature.icon} text-lg text-[#233876]/40 group-hover:text-[#233876]`} />
                                    </div>
                                    <h3 className="font-bold text-sm text-[#0f1b3d] mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Specs panel */}
                <section className="max-w-7xl mx-auto px-6 pb-20">
                    <div className="border-2 border-[#233876]/8 p-6">
                        <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-6">
                            Technical Specifications
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Scroll Behavior", value: "Sticky + Compact" },
                                { label: "Navigation", value: "5 Sections + Dropdowns" },
                                { label: "Auth State", value: "Clerk JWT" },
                                { label: "Animations", value: "GSAP 3.x" },
                                { label: "Breakpoints", value: "sm / md / lg" },
                                { label: "Search", value: "Overlay + Recent" },
                                { label: "Notifications", value: "Badge Counter" },
                                { label: "Color System", value: "#233876 Primary" },
                            ].map((spec) => (
                                <div key={spec.label}>
                                    <div className="font-mono text-[9px] text-[#233876]/30 uppercase tracking-wider mb-1">
                                        {spec.label}
                                    </div>
                                    <div className="text-sm font-medium text-[#0f1b3d]">
                                        {spec.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-dashed border-[#233876]/10 mt-6 pt-4">
                            <span className="font-mono text-[8px] text-[#233876]/20 uppercase tracking-wider">
                                HDR-09 // Clean Architecture // v9.0
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
