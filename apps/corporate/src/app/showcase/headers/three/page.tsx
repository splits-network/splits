"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.35, normal: 0.6, slow: 0.9 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };
const S = { tight: 0.06, normal: 0.1 };

// ── Data ─────────────────────────────────────────────────────────────────────

const navItems = [
    { label: "Platform", href: "#" },
    { label: "Recruiters", href: "#" },
    { label: "Companies", href: "#" },
    { label: "Candidates", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "About", href: "#" },
];

const sampleContent = [
    {
        number: "01",
        title: "Split-Fee Marketplace",
        description: "Access curated roles that match your expertise. No cold outreach. No wasted time. Clear terms on every placement.",
    },
    {
        number: "02",
        title: "Integrated ATS",
        description: "Track every candidate and submission in one clean pipeline. Real-time status updates. Zero spreadsheet chaos.",
    },
    {
        number: "03",
        title: "Analytics Engine",
        description: "Data-driven decisions. Track placement velocity, response rates, and pipeline health in real time.",
    },
];

// ── Header Component ─────────────────────────────────────────────────────────

function SwissHeader({ variant, onMobileMenuToggle, mobileOpen }: {
    variant: "light" | "dark" | "transparent";
    onMobileMenuToggle?: () => void;
    mobileOpen?: boolean;
}) {
    const bgClass = variant === "dark"
        ? "bg-neutral text-neutral-content"
        : variant === "transparent"
            ? "bg-transparent text-base-content"
            : "bg-base-100 text-base-content";

    const borderClass = variant === "dark"
        ? "border-neutral-content/10"
        : "border-neutral/10";

    const mutedClass = variant === "dark"
        ? "text-neutral-content/40"
        : "text-base-content/40";

    const hoverClass = variant === "dark"
        ? "hover:text-neutral-content"
        : "hover:text-base-content";

    return (
        <header className={`${bgClass} relative`}>
            {/* Top accent line */}
            <div className={`h-[2px] ${variant === "dark" ? "bg-neutral-content/20" : "bg-neutral"}`} />

            <div className="container mx-auto px-6 lg:px-12">
                {/* Main header row */}
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${variant === "dark" ? "bg-neutral-content" : "bg-neutral"} flex items-center justify-center`}>
                            <span className={`text-xs font-black ${variant === "dark" ? "text-neutral" : "text-neutral-content"}`}>SN</span>
                        </div>
                        <div>
                            <div className="text-sm font-black tracking-tight leading-none">Splits</div>
                            <div className={`text-[9px] uppercase tracking-[0.25em] ${mutedClass} leading-none mt-0.5`}>Network</div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] ${mutedClass} ${hoverClass} transition-colors duration-200`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right side: Search + User + CTA */}
                    <div className="hidden lg:flex items-center gap-3">
                        {/* Search */}
                        <button className={`w-8 h-8 flex items-center justify-center ${mutedClass} ${hoverClass} transition-colors duration-200`}>
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" />
                        </button>

                        {/* User menu */}
                        <button className={`w-8 h-8 ${variant === "dark" ? "border border-neutral-content/20" : "border border-neutral/10"} flex items-center justify-center ${mutedClass} ${hoverClass} transition-colors duration-200`}>
                            <i className="fa-duotone fa-regular fa-user text-xs" />
                        </button>

                        {/* CTA */}
                        <a
                            href="#"
                            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                                variant === "dark"
                                    ? "bg-neutral-content text-neutral hover:bg-neutral-content/90"
                                    : "bg-neutral text-neutral-content hover:bg-neutral/90"
                            }`}
                        >
                            Get Started
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={onMobileMenuToggle}
                        className={`lg:hidden w-8 h-8 flex items-center justify-center ${mutedClass} ${hoverClass} transition-colors duration-200`}
                    >
                        <i className={`fa-duotone fa-regular ${mobileOpen ? "fa-xmark" : "fa-bars"} text-lg`} />
                    </button>
                </div>

                {/* Bottom rule */}
                <div className={`h-[1px] ${borderClass}`} />
            </div>

            {/* Mobile menu panel */}
            {mobileOpen && (
                <div className={`lg:hidden ${bgClass} border-b-2 ${borderClass}`}>
                    <div className="container mx-auto px-6 py-6">
                        <nav className="space-y-1 mb-6">
                            {navItems.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    className={`block px-3 py-3 text-xs font-bold uppercase tracking-[0.15em] ${mutedClass} ${hoverClass} transition-colors duration-200 border-b ${borderClass}`}
                                >
                                    <span className={`text-[10px] ${mutedClass} mr-3 font-mono`}>
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <button className={`flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] border ${borderClass} ${mutedClass} ${hoverClass} transition-colors duration-200 text-center`}>
                                <i className="fa-duotone fa-regular fa-magnifying-glass mr-2" />
                                Search
                            </button>
                            <a
                                href="#"
                                className={`flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-center transition-colors duration-200 ${
                                    variant === "dark"
                                        ? "bg-neutral-content text-neutral"
                                        : "bg-neutral text-neutral-content"
                                }`}
                            >
                                Get Started
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

// ── Expanded Header (with secondary nav) ─────────────────────────────────────

function SwissHeaderExpanded() {
    return (
        <header className="bg-base-100 text-base-content">
            {/* Top accent line */}
            <div className="h-[2px] bg-neutral" />

            {/* Utility bar */}
            <div className="border-b border-neutral/10">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between h-8">
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/30">
                                Employment Networks
                            </span>
                            <span className="text-base-content/10">|</span>
                            <a href="#" className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 hover:text-base-content transition-colors duration-200">
                                Splits Network
                            </a>
                            <a href="#" className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 hover:text-base-content transition-colors duration-200">
                                Applicant Network
                            </a>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <a href="#" className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 hover:text-base-content transition-colors duration-200">
                                <i className="fa-duotone fa-regular fa-headset mr-1" />
                                Support
                            </a>
                            <a href="#" className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 hover:text-base-content transition-colors duration-200">
                                Sign In
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main navigation bar */}
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral flex items-center justify-center">
                            <span className="text-sm font-black text-neutral-content">SN</span>
                        </div>
                        <div>
                            <div className="text-base font-black tracking-tight leading-none">Splits Network</div>
                            <div className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 leading-none mt-1">Recruiting Platform</div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                                    i === 0
                                        ? "text-base-content"
                                        : "text-base-content/40 hover:text-base-content"
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button className="w-9 h-9 border border-neutral/10 flex items-center justify-center text-base-content/30 hover:text-base-content hover:border-neutral transition-all duration-200">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" />
                        </button>
                        <button className="w-9 h-9 border border-neutral/10 flex items-center justify-center text-base-content/30 hover:text-base-content hover:border-neutral transition-all duration-200 relative">
                            <i className="fa-duotone fa-regular fa-bell text-sm" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral text-neutral-content text-[8px] font-black flex items-center justify-center">
                                3
                            </span>
                        </button>
                        <div className="w-9 h-9 bg-neutral/5 border border-neutral/10 flex items-center justify-center ml-1">
                            <span className="text-[10px] font-black text-base-content/40">JD</span>
                        </div>
                    </div>

                    {/* Mobile */}
                    <button className="lg:hidden text-base-content/40 hover:text-base-content transition-colors duration-200">
                        <i className="fa-duotone fa-regular fa-bars text-lg" />
                    </button>
                </div>
            </div>

            {/* Secondary navigation */}
            <div className="border-t border-b border-neutral/10 hidden lg:block">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-6 h-10">
                        {["Dashboard", "Jobs", "Candidates", "Applications", "Messages", "Analytics"].map((item, i) => (
                            <a
                                key={i}
                                href="#"
                                className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                                    i === 0
                                        ? "text-base-content border-b-2 border-neutral -mb-[1px] pb-[9px] pt-[11px]"
                                        : "text-base-content/30 hover:text-base-content"
                                }`}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ── Minimal Header ───────────────────────────────────────────────────────────

function SwissHeaderMinimal() {
    return (
        <header className="bg-base-100 text-base-content">
            <div className="h-[2px] bg-neutral" />
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-14">
                    {/* Logo mark only */}
                    <div className="flex items-center gap-6">
                        <div className="w-7 h-7 bg-neutral flex items-center justify-center">
                            <span className="text-[10px] font-black text-neutral-content">S</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.slice(0, 4).map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 hover:text-base-content transition-colors duration-200"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <a href="#" className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 hover:text-base-content transition-colors duration-200 px-3 py-1.5">
                            Sign In
                        </a>
                        <a href="#" className="bg-neutral text-neutral-content px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                            Join
                        </a>
                    </div>
                </div>
            </div>
            <div className="h-[1px] bg-neutral/10" />
        </header>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HeadersThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMobileOpen, setDarkMobileOpen] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Page title
            const tl = gsap.timeline({ defaults: { ease: E.precise } });

            tl.fromTo(
                $1(".page-number"),
                { opacity: 0, y: 60, skewY: 5 },
                { opacity: 1, y: 0, skewY: 0, duration: D.slow },
            );

            tl.fromTo(
                $1(".page-headline"),
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: D.normal },
                "-=0.4",
            );

            tl.fromTo(
                $1(".page-divider"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.normal, transformOrigin: "left center" },
                "-=0.3",
            );

            // Showcase sections
            $(".showcase-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.normal, ease: E.precise,
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content">
            {/* Page title */}
            <section className="border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12 pt-20 pb-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end mb-6">
                        <div className="col-span-12 lg:col-span-3">
                            <div className="page-number opacity-0 text-[6rem] sm:text-[8rem] lg:text-[10rem] font-black leading-none tracking-tighter text-neutral/10 select-none">
                                03
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-9 pb-2">
                            <div className="page-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-2">
                                    Component Showcase
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">
                                    Header
                                    <br />
                                    Variations
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="page-divider h-[2px] bg-neutral" style={{ transformOrigin: "left center" }} />
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 1 - Standard Light
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">01</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Default</p>
                            <h2 className="text-2xl font-black tracking-tight">Standard Light</h2>
                        </div>
                    </div>

                    {/* Preview container */}
                    <div className="border-2 border-neutral/10 overflow-hidden">
                        <SwissHeader
                            variant="light"
                            mobileOpen={mobileMenuOpen}
                            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                        />

                        {/* Sample content */}
                        <div className="p-8 lg:p-12 bg-base-100">
                            <div className="max-w-2xl">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 mb-3">
                                    Sample Page Content
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                    The standard header sits cleanly
                                    <br />
                                    above structured content.
                                </h3>
                                <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                                    Swiss grid precision. Every element aligned to purpose.
                                    No decoration without function.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 2 - Dark Inverted
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">02</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Inverted</p>
                            <h2 className="text-2xl font-black tracking-tight">Dark Variant</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral overflow-hidden">
                        <SwissHeader
                            variant="dark"
                            mobileOpen={darkMobileOpen}
                            onMobileMenuToggle={() => setDarkMobileOpen(!darkMobileOpen)}
                        />

                        <div className="p-8 lg:p-12 bg-neutral text-neutral-content">
                            <div className="max-w-2xl">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-content/30 mb-3">
                                    Dark Context
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                    High contrast for dark
                                    <br />
                                    backgrounds and hero sections.
                                </h3>
                                <p className="text-sm text-neutral-content/50 leading-relaxed max-w-lg">
                                    The inverted palette maintains readability while
                                    creating strong visual hierarchy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 3 - Expanded with Secondary Nav
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">03</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Full</p>
                            <h2 className="text-2xl font-black tracking-tight">Expanded Navigation</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral/10 overflow-hidden">
                        <SwissHeaderExpanded />

                        <div className="p-8 lg:p-12 bg-base-100">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] bg-neutral/10">
                                {sampleContent.map((item, i) => (
                                    <div key={i} className="bg-base-100 p-6">
                                        <span className="text-xl font-black tracking-tighter text-base-content/10 mb-3 block">{item.number}</span>
                                        <h4 className="text-sm font-black tracking-tight mb-2">{item.title}</h4>
                                        <p className="text-xs text-base-content/40 leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 4 - Minimal
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">04</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Reduced</p>
                            <h2 className="text-2xl font-black tracking-tight">Minimal Header</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral/10 overflow-hidden">
                        <SwissHeaderMinimal />

                        <div className="p-8 lg:p-12 bg-base-100">
                            <div className="max-w-2xl">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 mb-3">
                                    Minimal Context
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                    Maximum content space.
                                    <br />
                                    Minimum chrome.
                                </h3>
                                <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                                    When the content is the focus, the header steps back.
                                    Compact, functional, invisible until needed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 5 - Transparent / Hero Overlay
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">05</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Overlay</p>
                            <h2 className="text-2xl font-black tracking-tight">Transparent Header</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral overflow-hidden relative">
                        {/* Background image simulation */}
                        <div className="bg-neutral min-h-[400px] relative">
                            <div className="absolute inset-0">
                                <SwissHeader variant="dark" />
                            </div>

                            <div className="pt-32 pb-16 px-8 lg:px-12 text-neutral-content relative z-10">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-content/30 mb-4">
                                    Hero Section
                                </p>
                                <h3 className="text-4xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-6">
                                    The header
                                    <br />
                                    becomes part
                                    <br />
                                    of the story.
                                </h3>
                                <div className="h-[2px] bg-neutral-content/10 w-32 mb-6" />
                                <p className="text-sm text-neutral-content/40 leading-relaxed max-w-md">
                                    Transparent headers work with hero imagery,
                                    creating an immersive first impression while
                                    maintaining full navigation access.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
