"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Navigation Data ────────────────────────────────────────────────────── */

const NAV_ITEMS = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        children: [
            {
                label: "Split-Fee Marketplace",
                desc: "Browse and post split-fee opportunities",
                icon: "fa-duotone fa-regular fa-handshake",
            },
            {
                label: "Applicant Tracking",
                desc: "Manage candidates and pipelines",
                icon: "fa-duotone fa-regular fa-table-columns",
            },
            {
                label: "Recruiter Network",
                desc: "Connect with vetted recruiters",
                icon: "fa-duotone fa-regular fa-network-wired",
            },
            {
                label: "Analytics Dashboard",
                desc: "Real-time placement and pipeline metrics",
                icon: "fa-duotone fa-regular fa-chart-mixed",
            },
        ],
    },
    {
        label: "Solutions",
        icon: "fa-duotone fa-regular fa-lightbulb",
        children: [
            {
                label: "For Recruiters",
                desc: "Tools to grow your placement business",
                icon: "fa-duotone fa-regular fa-user-tie",
            },
            {
                label: "For Companies",
                desc: "Access a vetted recruiter network",
                icon: "fa-duotone fa-regular fa-building",
            },
            {
                label: "For Candidates",
                desc: "Track your applications in real time",
                icon: "fa-duotone fa-regular fa-user",
            },
            {
                label: "Enterprise",
                desc: "Custom solutions for large organizations",
                icon: "fa-duotone fa-regular fa-city",
            },
        ],
    },
    {
        label: "Resources",
        icon: "fa-duotone fa-regular fa-book-open",
        children: [
            {
                label: "Documentation",
                desc: "Guides and API reference",
                icon: "fa-duotone fa-regular fa-file-lines",
            },
            {
                label: "Blog",
                desc: "Industry insights and updates",
                icon: "fa-duotone fa-regular fa-pen-nib",
            },
            {
                label: "Help Center",
                desc: "FAQs and support articles",
                icon: "fa-duotone fa-regular fa-circle-question",
            },
        ],
    },
    { label: "Pricing", icon: "fa-duotone fa-regular fa-tag" },
];

/* ─── Sample Feature Cards ───────────────────────────────────────────────── */

const FEATURE_CARDS = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        desc: "Access curated roles and earn transparent splits on every placement you make through the network.",
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Integrated ATS",
        desc: "Track candidates, manage submissions, and monitor your pipeline from a single unified dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Placement Analytics",
        desc: "Real-time visibility into every stage of the placement lifecycle from submission to start date.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Verified Network",
        desc: "Every recruiter is vetted. Every company is verified. Trust is built into the platform from day one.",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "Instant Matching",
        desc: "AI-powered matching connects the right candidates with the right opportunities in seconds.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Transparent Earnings",
        desc: "Know exactly what you will earn before you submit a single candidate. No hidden fees, no surprises.",
    },
];

const HERO_IMG =
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format&fit=crop";

/* ═══════════════════════════════════════════════════════════════════════════
   CINEMATIC HEADER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function CinematicHeader() {
    const headerRef = useRef<HTMLElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                headerRef.current &&
                !headerRef.current.contains(e.target as Node)
            ) {
                setActiveDropdown(null);
                setUserMenuOpen(false);
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <header
            ref={headerRef}
            className={`cin-header fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                scrolled
                    ? "bg-neutral/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-white/[0.06]"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-18 lg:h-20">
                    {/* Logo */}
                    <a
                        href="#"
                        className="cin-header-logo flex items-center gap-3 group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/30 group-hover:scale-105">
                            <i className="fa-duotone fa-regular fa-split text-primary text-base" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-lg tracking-tight leading-none">
                                SPLITS
                            </span>
                            <span className="text-white/30 text-[9px] uppercase tracking-[0.25em] leading-none mt-0.5">
                                Network
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <div key={item.label} className="relative">
                                <button
                                    onMouseEnter={() =>
                                        item.children &&
                                        setActiveDropdown(item.label)
                                    }
                                    onMouseLeave={() => setActiveDropdown(null)}
                                    onClick={() =>
                                        !item.children &&
                                        setActiveDropdown(null)
                                    }
                                    className={`cin-nav-item flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        activeDropdown === item.label
                                            ? "text-white bg-white/[0.06]"
                                            : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                                >
                                    {item.label}
                                    {item.children && (
                                        <i
                                            className={`fa-regular fa-chevron-down text-[9px] transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </button>

                                {item.children &&
                                    activeDropdown === item.label && (
                                        <div
                                            onMouseEnter={() =>
                                                setActiveDropdown(item.label)
                                            }
                                            onMouseLeave={() =>
                                                setActiveDropdown(null)
                                            }
                                            className="absolute top-full left-0 mt-2 w-80 bg-neutral border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                                        >
                                            <div className="p-2">
                                                {item.children.map((child) => (
                                                    <a
                                                        key={child.label}
                                                        href="#"
                                                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.04] transition-colors group/item"
                                                    >
                                                        <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/15 transition-colors">
                                                            <i
                                                                className={`${child.icon} text-white/40 text-sm group-hover/item:text-primary transition-colors`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-white/80 text-sm font-medium group-hover/item:text-white transition-colors">
                                                                {child.label}
                                                            </p>
                                                            <p className="text-white/30 text-xs mt-0.5 leading-relaxed">
                                                                {child.desc}
                                                            </p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                            <div className="border-t border-white/[0.06] px-4 py-3 bg-white/[0.02]">
                                                <a
                                                    href="#"
                                                    className="text-xs text-primary/70 hover:text-primary font-medium flex items-center gap-1.5 transition-colors"
                                                >
                                                    View all{" "}
                                                    {item.label.toLowerCase()}
                                                    <i className="fa-regular fa-arrow-right text-[9px]" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setSearchOpen(!searchOpen);
                                    setUserMenuOpen(false);
                                }}
                                className={`cin-header-action btn btn-ghost btn-sm btn-square transition-all duration-200 ${
                                    searchOpen
                                        ? "text-primary bg-primary/10"
                                        : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                                }`}
                            >
                                <i className="fa-regular fa-magnifying-glass text-sm" />
                            </button>
                            {searchOpen && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-neutral border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 p-3">
                                    <div className="relative">
                                        <i className="fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                                        <input
                                            type="text"
                                            placeholder="Search jobs, candidates, recruiters..."
                                            autoFocus
                                            className="input input-sm w-full pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-coral/40"
                                        />
                                    </div>
                                    <div className="mt-2 px-1">
                                        <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2">
                                            Quick links
                                        </p>
                                        {[
                                            "Active Jobs",
                                            "My Candidates",
                                            "Placements",
                                        ].map((link) => (
                                            <a
                                                key={link}
                                                href="#"
                                                className="block text-xs text-white/40 hover:text-white py-1.5 transition-colors"
                                            >
                                                <i className="fa-regular fa-arrow-right text-[9px] mr-2 text-white/20" />
                                                {link}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button className="cin-header-action btn btn-ghost btn-sm btn-square text-white/40 hover:text-white hover:bg-white/[0.06] relative hidden sm:flex">
                            <i className="fa-regular fa-bell text-sm" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                        </button>

                        {/* User Menu */}
                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => {
                                    setUserMenuOpen(!userMenuOpen);
                                    setSearchOpen(false);
                                }}
                                className="cin-header-action flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                    MC
                                </div>
                                <span className="text-white/60 text-sm font-medium hidden md:inline">
                                    Marcus
                                </span>
                                <i
                                    className={`fa-regular fa-chevron-down text-[9px] text-white/30 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {userMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-neutral border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                                    <div className="p-3 border-b border-white/[0.06]">
                                        <p className="text-white/80 text-sm font-semibold">
                                            Marcus Chen
                                        </p>
                                        <p className="text-white/30 text-xs">
                                            marcus@recruiter.io
                                        </p>
                                    </div>
                                    <div className="p-1.5">
                                        {[
                                            {
                                                icon: "fa-regular fa-user",
                                                label: "Profile",
                                            },
                                            {
                                                icon: "fa-regular fa-gear",
                                                label: "Settings",
                                            },
                                            {
                                                icon: "fa-regular fa-credit-card",
                                                label: "Billing",
                                            },
                                            {
                                                icon: "fa-regular fa-circle-question",
                                                label: "Help & Support",
                                            },
                                        ].map((mi) => (
                                            <a
                                                key={mi.label}
                                                href="#"
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] text-sm transition-colors"
                                            >
                                                <i
                                                    className={`${mi.icon} w-4 text-center text-xs`}
                                                />
                                                {mi.label}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/[0.06] p-1.5">
                                        <a
                                            href="#"
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-error/60 hover:text-error hover:bg-error/5 text-sm transition-colors"
                                        >
                                            <i className="fa-regular fa-right-from-bracket w-4 text-center text-xs" />
                                            Sign Out
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <a
                            href="#"
                            className="cin-header-cta btn btn-primary btn-sm font-semibold border-0 shadow-lg shadow-primary/15 hidden md:inline-flex"
                        >
                            Get Started
                        </a>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="cin-header-action btn btn-ghost btn-sm btn-square text-white/60 hover:text-white lg:hidden"
                        >
                            <i
                                className={`fa-regular ${mobileOpen ? "fa-xmark" : "fa-bars"} text-lg transition-transform duration-200`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-neutral border-t border-white/[0.06] max-h-[80vh] overflow-y-auto">
                    <div className="p-4 border-b border-white/[0.04]">
                        <div className="relative">
                            <i className="fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input input-sm w-full pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
                            />
                        </div>
                    </div>
                    <div className="p-2">
                        {NAV_ITEMS.map((item) => (
                            <div key={item.label}>
                                <button
                                    onClick={() =>
                                        setActiveDropdown(
                                            activeDropdown === item.label
                                                ? null
                                                : item.label,
                                        )
                                    }
                                    className="w-full flex items-center justify-between px-4 py-3 text-white/70 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors"
                                >
                                    <span className="flex items-center gap-3 text-sm font-medium">
                                        <i
                                            className={`${item.icon} text-white/30 w-5 text-center`}
                                        />
                                        {item.label}
                                    </span>
                                    {item.children && (
                                        <i
                                            className={`fa-regular fa-chevron-down text-[10px] text-white/30 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </button>
                                {item.children &&
                                    activeDropdown === item.label && (
                                        <div className="ml-4 pl-4 border-l border-white/[0.06] mb-2">
                                            {item.children.map((child) => (
                                                <a
                                                    key={child.label}
                                                    href="#"
                                                    className="flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white/70 transition-colors"
                                                >
                                                    <i
                                                        className={`${child.icon} text-xs w-4 text-center`}
                                                    />
                                                    <div>
                                                        <p className="text-xs font-medium">
                                                            {child.label}
                                                        </p>
                                                        <p className="text-[10px] text-white/20 mt-0.5">
                                                            {child.desc}
                                                        </p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/[0.06] space-y-3">
                        <div className="flex items-center gap-3 px-2 mb-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                MC
                            </div>
                            <div>
                                <p className="text-white/70 text-sm font-medium">
                                    Marcus Chen
                                </p>
                                <p className="text-white/30 text-xs">
                                    Recruiter
                                </p>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="btn btn-primary btn-sm w-full font-semibold border-0"
                        >
                            Get Started
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function HeadersFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='cin-']"),
                    { opacity: 1, y: 0, x: 0 },
                );
                return;
            }

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                delay: 0.2,
            });

            tl.fromTo(
                ".cin-header-logo",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6 },
            );
            tl.fromTo(
                ".cin-nav-item",
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                0.2,
            );
            tl.fromTo(
                ".cin-header-action",
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06 },
                0.35,
            );
            tl.fromTo(
                ".cin-header-cta",
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.5 },
                0.4,
            );
            tl.fromTo(
                ".cin-hero-kicker",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6 },
                0.5,
            );
            tl.fromTo(
                ".cin-hero-headline",
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 1 },
                0.6,
            );
            tl.fromTo(
                ".cin-hero-sub",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7 },
                0.9,
            );
            tl.fromTo(
                ".cin-hero-cta-btn",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                1.1,
            );

            gsap.fromTo(
                ".cin-feature-card",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".cin-features-grid",
                        start: "top 80%",
                    },
                },
            );

            gsap.to(".cin-hero-bg", {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".cin-hero-section",
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-neutral">
            <CinematicHeader />

            {/* Hero Section */}
            <section className="cin-hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="cin-hero-bg absolute inset-0 w-full h-[130%] -top-[15%]">
                    <img
                        src={HERO_IMG}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </div>
                <div className="absolute inset-0 bg-neutral/80" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
                    <p className="cin-hero-kicker text-[10px] uppercase tracking-[0.35em] text-primary/70 font-medium mb-6 opacity-0">
                        Cinematic Editorial Header
                    </p>
                    <h1 className="cin-hero-headline text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] tracking-tight mb-8 opacity-0">
                        Scroll to see the
                        <br />
                        <span className="text-primary">header transform</span>
                    </h1>
                    <p className="cin-hero-sub text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 opacity-0">
                        The header transitions from transparent to frosted dark
                        glass as you scroll. Hover navigation items for
                        mega-menu dropdowns. Try search, notifications, and the
                        user menu.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#features"
                            className="cin-hero-cta-btn btn btn-primary btn-lg font-semibold border-0 shadow-xl shadow-primary/20 opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-down" />
                            Explore Features
                        </a>
                        <a
                            href="#"
                            className="cin-hero-cta-btn btn btn-lg font-semibold btn-outline border-white/20 text-white hover:bg-white/10 hover:border-white/40 opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-play" />
                            Watch Demo
                        </a>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
                    <i className="fa-regular fa-chevron-down text-lg" />
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-24 px-6 border-t border-white/[0.06]"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-medium mb-4">
                            Platform Features
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                            Everything you need to{" "}
                            <span className="text-primary">
                                recruit smarter
                            </span>
                        </h2>
                        <p className="text-white/40 max-w-xl mx-auto leading-relaxed">
                            A complete toolkit designed for modern recruiting
                            professionals who demand transparency and results.
                        </p>
                    </div>

                    <div className="cin-features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURE_CARDS.map((card, i) => (
                            <div
                                key={i}
                                className="cin-feature-card opacity-0 group p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
                            >
                                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <i
                                        className={`${card.icon} text-primary text-lg`}
                                    />
                                </div>
                                <h3 className="text-white font-bold text-base mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-white/35 text-sm leading-relaxed">
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="py-20 px-6 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium mb-4">
                        Header Showcase
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black text-white/60 tracking-tight mb-4">
                        Continue scrolling to observe the sticky header behavior
                    </h2>
                    <p className="text-white/25 max-w-lg mx-auto leading-relaxed mb-8">
                        The header remains fixed at the top, gaining a frosted
                        backdrop blur and bottom border when the page is
                        scrolled. Navigation dropdowns, search overlay, and user
                        menu are all fully interactive.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        {[
                            "Transparent on hero",
                            "Frosted on scroll",
                            "Mega menu dropdowns",
                            "Search overlay",
                            "User menu",
                        ].map((feat) => (
                            <div
                                key={feat}
                                className="flex items-center gap-2 text-white/20"
                            >
                                <i className="fa-duotone fa-regular fa-check-circle text-primary/50" />
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 px-6 border-t border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                value: "10,000+",
                                label: "Active Job Listings",
                                icon: "fa-duotone fa-regular fa-briefcase",
                            },
                            {
                                value: "2,000+",
                                label: "Network Recruiters",
                                icon: "fa-duotone fa-regular fa-users",
                            },
                            {
                                value: "95%",
                                label: "Response Rate",
                                icon: "fa-duotone fa-regular fa-chart-line",
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="text-center p-8 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                            >
                                <i
                                    className={`${stat.icon} text-primary/40 text-2xl mb-4`}
                                />
                                <div className="text-4xl font-black text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-white/30 text-sm">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
