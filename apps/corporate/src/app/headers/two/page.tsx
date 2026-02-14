"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Navigation Data ────────────────────────────────────────────────────────── */

const navLinks = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        children: [
            { label: "For Recruiters", desc: "Expand your reach with split-fee partnerships", icon: "fa-duotone fa-regular fa-user-tie" },
            { label: "For Companies", desc: "Access a curated network of specialist recruiters", icon: "fa-duotone fa-regular fa-building" },
            { label: "For Candidates", desc: "Get matched with opportunities that fit", icon: "fa-duotone fa-regular fa-user" },
            { label: "Integrations", desc: "Connect with your existing tools and workflows", icon: "fa-duotone fa-regular fa-puzzle-piece" },
        ],
    },
    {
        label: "Solutions",
        icon: "fa-duotone fa-regular fa-lightbulb",
        children: [
            { label: "Split-Fee Recruiting", desc: "Collaborative placements with shared fees", icon: "fa-duotone fa-regular fa-handshake" },
            { label: "Talent Marketplace", desc: "Browse and bid on open assignments", icon: "fa-duotone fa-regular fa-store" },
            { label: "Enterprise Search", desc: "Dedicated multi-recruiter campaigns", icon: "fa-duotone fa-regular fa-magnifying-glass-chart" },
            { label: "Analytics Suite", desc: "Real-time pipeline and performance insights", icon: "fa-duotone fa-regular fa-chart-mixed" },
        ],
    },
    { label: "Pricing", icon: "fa-duotone fa-regular fa-tag" },
    { label: "Resources", icon: "fa-duotone fa-regular fa-book-open" },
    { label: "About", icon: "fa-duotone fa-regular fa-circle-info" },
];

const notifications = [
    { id: 1, text: "New split proposal from Diana Foster", time: "2m ago", unread: true },
    { id: 2, text: "Marcus Chen accepted your candidate submission", time: "15m ago", unread: true },
    { id: 3, text: "Interview scheduled: James Park at Meridian Corp", time: "1h ago", unread: false },
];

/* ─── Sample Content Data ────────────────────────────────────────────────────── */

const features = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Partnerships",
        desc: "Connect with specialist recruiters and share fees on successful placements. Expand your reach without expanding your overhead.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Real-Time Analytics",
        desc: "Track pipeline performance, placement velocity, and partner ROI with a comprehensive analytics dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "AI-Powered Matching",
        desc: "Our intelligent matching engine connects the right recruiters with the right roles based on specialization and track record.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Verified Network",
        desc: "Every recruiter on the platform is vetted and verified. Work with confidence knowing your partners are legitimate professionals.",
    },
];

const stats = [
    { value: "2,400+", label: "Active Recruiters" },
    { value: "$47M", label: "Placements Made" },
    { value: "94%", label: "Partner Satisfaction" },
    { value: "18 days", label: "Avg. Time to Fill" },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function HeadersTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    /* ─── Animations ─────────────────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            gsap.from("[data-topbar]", {
                y: -20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
            });

            gsap.from("[data-header-item]", {
                y: -15,
                opacity: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: "power2.out",
                delay: 0.2,
            });

            gsap.from("[data-hero-text]", {
                y: 50,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
                delay: 0.5,
            });

            gsap.from("[data-stat]", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-stats]",
                    start: "top 85%",
                },
            });

            gsap.from("[data-feature]", {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-features]",
                    start: "top 80%",
                },
            });

            gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
                gsap.from(line, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 90%",
                    },
                });
            });

            ScrollTrigger.create({
                start: "top -80",
                onUpdate: (self) => {
                    setScrolled(self.progress > 0);
                },
            });
        },
        { scope: containerRef },
    );

    /* ─── Render ─────────────────────────────────────────────────────────────── */

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* ═══════════════════════════════════════════════════════════════════
                HEADER
            ═══════════════════════════════════════════════════════════════════ */}

            {/* ─── Announcement Top Bar ──────────────────────────────────────── */}
            <div data-topbar className="bg-base-content text-base-100">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] tracking-wide">
                        <i className="fa-duotone fa-regular fa-sparkles text-secondary text-xs" />
                        <span className="opacity-80">
                            New: AI-powered candidate matching is now live.
                        </span>
                        <a href="#" className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1">
                            Learn more
                        </a>
                    </div>
                    <button className="text-base-100/50 hover:text-base-100/80 transition-colors text-xs">
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>
            </div>

            {/* ─── Main Header ───────────────────────────────────────────────── */}
            <header
                className={`sticky top-0 z-50 border-b transition-all duration-300 ${
                    scrolled
                        ? "border-base-300 bg-base-100/95 backdrop-blur-md shadow-sm"
                        : "border-base-200 bg-base-100"
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="flex items-center justify-between h-16 md:h-[72px]">
                        {/* Logo */}
                        <div data-header-item className="flex items-center gap-3 shrink-0">
                            <div className="w-9 h-9 bg-base-content rounded-lg flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-split text-base-100 text-sm" />
                            </div>
                            <div className="leading-none">
                                <span className="text-base font-bold tracking-tight text-base-content">
                                    Splits
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 block -mt-0.5 font-medium">
                                    Network
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <div
                                    key={link.label}
                                    className="relative"
                                    onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button
                                        data-header-item
                                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                            activeDropdown === link.label
                                                ? "text-base-content bg-base-200/60"
                                                : "text-base-content/60 hover:text-base-content hover:bg-base-200/40"
                                        }`}
                                    >
                                        {link.label}
                                        {link.children && (
                                            <i
                                                className={`fa-duotone fa-regular fa-chevron-down text-[9px] transition-transform duration-200 ${
                                                    activeDropdown === link.label ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {/* Dropdown */}
                                    {link.children && activeDropdown === link.label && (
                                        <div className="absolute top-full left-0 pt-2 w-[340px]">
                                            <div className="bg-base-100 border border-base-300 rounded-xl shadow-lg p-2">
                                                {link.children.map((child) => (
                                                    <a
                                                        key={child.label}
                                                        href="#"
                                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200/60 transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-lg bg-base-200/60 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 transition-colors">
                                                            <i className={`${child.icon} text-sm text-base-content/40 group-hover:text-secondary transition-colors`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-base-content group-hover:text-secondary transition-colors">
                                                                {child.label}
                                                            </p>
                                                            <p className="text-xs text-base-content/40 mt-0.5 leading-relaxed">
                                                                {child.desc}
                                                            </p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right Section */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <button
                                data-header-item
                                onClick={() => setSearchOpen(!searchOpen)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                                    searchOpen
                                        ? "bg-base-200 text-base-content"
                                        : "text-base-content/40 hover:text-base-content/70 hover:bg-base-200/50"
                                }`}
                            >
                                <i className={`fa-duotone fa-regular ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"} text-sm`} />
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    data-header-item
                                    onClick={() => {
                                        setNotificationsOpen(!notificationsOpen);
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-base-content/40 hover:text-base-content/70 hover:bg-base-200/50 transition-colors relative"
                                >
                                    <i className="fa-duotone fa-regular fa-bell text-sm" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
                                </button>

                                {notificationsOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-[360px] bg-base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between">
                                            <span className="text-sm font-bold text-base-content">Notifications</span>
                                            <span className="text-[10px] uppercase tracking-[0.15em] text-secondary font-semibold">2 new</span>
                                        </div>
                                        {notifications.map((n) => (
                                            <a
                                                key={n.id}
                                                href="#"
                                                className={`flex items-start gap-3 px-4 py-3 hover:bg-base-200/40 transition-colors ${
                                                    n.unread ? "bg-secondary/5" : ""
                                                }`}
                                            >
                                                {n.unread ? (
                                                    <span className="w-2 h-2 bg-secondary rounded-full mt-1.5 shrink-0" />
                                                ) : (
                                                    <span className="w-2 shrink-0" />
                                                )}
                                                <div>
                                                    <p className={`text-sm ${n.unread ? "font-semibold text-base-content" : "text-base-content/60"}`}>
                                                        {n.text}
                                                    </p>
                                                    <p className="text-[10px] text-base-content/30 mt-0.5">{n.time}</p>
                                                </div>
                                            </a>
                                        ))}
                                        <div className="px-4 py-2.5 border-t border-base-200">
                                            <a href="#" className="text-xs font-semibold text-secondary hover:underline">
                                                View all notifications
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div data-header-item className="hidden md:block w-px h-6 bg-base-300 mx-1" />

                            {/* CTA Buttons */}
                            <a
                                data-header-item
                                href="#"
                                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors"
                            >
                                Sign In
                            </a>
                            <a
                                data-header-item
                                href="#"
                                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Get Started
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </a>

                            {/* User Menu */}
                            <div className="relative hidden lg:block">
                                <button
                                    data-header-item
                                    onClick={() => {
                                        setUserMenuOpen(!userMenuOpen);
                                        setNotificationsOpen(false);
                                    }}
                                    className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary hover:bg-secondary/20 transition-colors ml-1"
                                >
                                    AW
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-[240px] bg-base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-base-200">
                                            <p className="text-sm font-bold text-base-content">Alexandra Whitfield</p>
                                            <p className="text-[11px] text-base-content/40">Senior Talent Partner</p>
                                        </div>
                                        {[
                                            { icon: "fa-duotone fa-regular fa-user", label: "Profile" },
                                            { icon: "fa-duotone fa-regular fa-gear", label: "Settings" },
                                            { icon: "fa-duotone fa-regular fa-credit-card", label: "Billing" },
                                            { icon: "fa-duotone fa-regular fa-circle-question", label: "Help Center" },
                                        ].map((item) => (
                                            <a
                                                key={item.label}
                                                href="#"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/60 hover:text-base-content hover:bg-base-200/40 transition-colors"
                                            >
                                                <i className={`${item.icon} text-sm w-4 text-center`} />
                                                {item.label}
                                            </a>
                                        ))}
                                        <div className="border-t border-base-200">
                                            <a
                                                href="#"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-error/70 hover:text-error hover:bg-error/5 transition-colors"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-right-from-bracket text-sm w-4 text-center" />
                                                Sign Out
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                data-header-item
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200/50 transition-colors"
                            >
                                <i className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-base`} />
                            </button>
                        </div>
                    </div>

                    {/* Expandable Search Bar */}
                    {searchOpen && (
                        <div className="pb-4 border-t border-base-200 pt-3">
                            <div className="relative max-w-2xl mx-auto">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search jobs, candidates, recruiters, companies..."
                                    autoFocus
                                    className="w-full pl-11 pr-4 py-3 bg-base-200/50 border border-base-300 rounded-xl text-sm focus:outline-none focus:border-secondary/50 transition-colors placeholder:text-base-content/30"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <kbd className="px-2 py-0.5 bg-base-300/50 rounded text-[10px] text-base-content/30 font-mono">ESC</kbd>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-base-200 bg-base-100">
                        <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <div key={link.label}>
                                    <a
                                        href="#"
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200/50 transition-colors"
                                    >
                                        <i className={`${link.icon} text-base-content/30 w-5 text-center`} />
                                        {link.label}
                                        {link.children && (
                                            <i className="fa-duotone fa-regular fa-chevron-right text-[10px] text-base-content/20 ml-auto" />
                                        )}
                                    </a>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-base-200 mt-2 space-y-2">
                                <a href="#" className="block w-full text-center px-4 py-2.5 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors">
                                    Sign In
                                </a>
                                <a href="#" className="block w-full text-center px-4 py-3 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ═══════════════════════════════════════════════════════════════════
                SAMPLE PAGE CONTENT
            ═══════════════════════════════════════════════════════════════════ */}

            {/* Hero */}
            <section className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="max-w-3xl">
                        <p data-hero-text className="text-[11px] uppercase tracking-[0.4em] text-secondary font-semibold mb-5">
                            The Recruiting Network
                        </p>
                        <h2 data-hero-text className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-base-content leading-[0.95] mb-6">
                            Recruiting is better
                            <br />
                            <span className="text-base-content/30">together.</span>
                        </h2>
                        <p data-hero-text className="text-lg md:text-xl text-base-content/50 leading-relaxed max-w-xl mb-10">
                            Join the network where recruiters collaborate on split-fee placements, companies access top talent faster, and everyone wins.
                        </p>
                        <div data-hero-text className="flex flex-wrap gap-3">
                            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                Start Free Trial
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </a>
                            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 border border-base-300 text-base-content/60 text-sm font-semibold rounded-lg hover:border-base-content/30 hover:text-base-content transition-colors">
                                <i className="fa-duotone fa-regular fa-play text-xs" />
                                Watch Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div data-divider className="h-px bg-base-300" />
            </div>

            {/* Stats */}
            <section data-stats className="py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} data-stat className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-base-content tracking-tight">{stat.value}</p>
                                <p className="text-[11px] uppercase tracking-[0.2em] text-base-content/40 mt-2 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div data-divider className="h-px bg-base-300" />
            </div>

            {/* Features */}
            <section data-features className="py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="mb-12">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/30 font-semibold mb-3">Why Splits Network</p>
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">Built for modern recruiting.</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feat) => (
                            <div key={feat.title} data-feature className="p-6 border border-base-200 rounded-xl hover:border-base-300 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-base-200/60 flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                                    <i className={`${feat.icon} text-base-content/40 group-hover:text-secondary transition-colors`} />
                                </div>
                                <h4 className="text-base font-bold text-base-content mb-2">{feat.title}</h4>
                                <p className="text-sm text-base-content/45 leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="py-16" />
        </div>
    );
}
