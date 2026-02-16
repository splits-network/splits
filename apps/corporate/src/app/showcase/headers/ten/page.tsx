"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── nav items ─── */

const navLinks = [
    { label: "Dashboard", href: "#", icon: "fa-grid-2" },
    { label: "Roles", href: "#", icon: "fa-briefcase" },
    { label: "Network", href: "#", icon: "fa-diagram-project" },
    { label: "Placements", href: "#", icon: "fa-handshake" },
    { label: "Analytics", href: "#", icon: "fa-chart-mixed" },
];

const userMenu = [
    { label: "Profile", icon: "fa-user-gear" },
    { label: "Settings", icon: "fa-gear" },
    { label: "Notifications", icon: "fa-bell", badge: 7 },
    { label: "Help", icon: "fa-circle-question" },
    { label: "Sign Out", icon: "fa-arrow-right-from-bracket" },
];

/* ─── notification feed ─── */

const notifications = [
    {
        id: 1,
        text: "New split agreement from Marcus Webb",
        time: "2m ago",
        icon: "fa-handshake",
        type: "success",
    },
    {
        id: 2,
        text: "3 new applications for DevOps Engineer",
        time: "15m ago",
        icon: "fa-file-circle-plus",
        type: "info",
    },
    {
        id: 3,
        text: "Placement confirmed: Senior Designer at TechCorp",
        time: "1h ago",
        icon: "fa-check-circle",
        type: "success",
    },
    {
        id: 4,
        text: "Invoice #1247 payment received",
        time: "2h ago",
        icon: "fa-credit-card",
        type: "info",
    },
    {
        id: 5,
        text: "Candidate James Rodriguez updated profile",
        time: "3h ago",
        icon: "fa-user-pen",
        type: "neutral",
    },
];

/* ─── sample page content ─── */

const sampleCards = [
    { title: "Active Jobs", value: "47", trend: "+12%", icon: "fa-briefcase" },
    {
        title: "Applications",
        value: "1,234",
        trend: "+8.3%",
        icon: "fa-file-lines",
    },
    { title: "Placements", value: "23", trend: "+4%", icon: "fa-handshake" },
    {
        title: "Revenue",
        value: "$234K",
        trend: "+15.2%",
        icon: "fa-dollar-sign",
    },
];

/* ─── component ─── */

export default function HeadersTen() {
    const mainRef = useRef<HTMLDivElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    /* ─── scroll detection ─── */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ─── close dropdowns on outside click ─── */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".user-dropdown-zone"))
                setUserDropdownOpen(false);
            if (!target.closest(".notif-dropdown-zone")) setNotifOpen(false);
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    /* ─── GSAP ─── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.fromTo(
                ".header-logo",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5 },
            )
                .fromTo(
                    ".header-nav-item",
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 },
                    "-=0.3",
                )
                .fromTo(
                    ".header-action",
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08 },
                    "-=0.2",
                )
                .fromTo(
                    ".header-scanline",
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8 },
                    "-=0.4",
                );

            gsap.fromTo(
                ".status-pulse",
                { scale: 0.7, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                },
            );

            gsap.fromTo(
                ".sample-card",
                { opacity: 0, y: 30, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    delay: 0.8,
                    ease: "power2.out",
                },
            );

            gsap.fromTo(
                ".content-section",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    delay: 1.0,
                    ease: "power3.out",
                },
            );
        },
        { scope: mainRef },
    );

    /* ─── mobile menu animation ─── */
    useEffect(() => {
        if (mobileMenuOpen) {
            gsap.fromTo(
                ".mobile-nav-item",
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.06,
                    ease: "power2.out",
                },
            );
        }
    }, [mobileMenuOpen]);

    /* ─── search overlay animation ─── */
    useEffect(() => {
        if (searchOpen) {
            gsap.fromTo(
                ".search-overlay-inner",
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
            );
        }
    }, [searchOpen]);

    return (
        <div
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content"
        >
            {/* ═══ HEADER ═══ */}
            <header
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                    scrolled
                        ? "bg-base-200/95 backdrop-blur-md border-b border-base-content/5 shadow-sm"
                        : "bg-base-200 border-b border-base-content/5"
                }`}
            >
                {/* Top status bar */}
                <div className="border-b border-base-content/[0.03]">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-7">
                        <div className="flex items-center gap-3">
                            <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                            <span className="font-mono text-[9px] uppercase tracking-wider text-base-content/20">
                                All Systems Operational
                            </span>
                            <span className="text-base-content/10 hidden sm:inline">
                                |
                            </span>
                            <span className="font-mono text-[9px] text-base-content/15 hidden sm:inline">
                                Region: US-East
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[9px] text-base-content/15 uppercase tracking-wider hidden sm:inline">
                                v2.4.0
                            </span>
                            <span className="text-base-content/10 hidden sm:inline">
                                |
                            </span>
                            <span className="font-mono text-[9px] text-base-content/15 uppercase tracking-wider">
                                Last sync: 4s ago
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main header bar */}
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex items-center h-14 gap-4">
                        {/* Logo */}
                        <div className="header-logo flex items-center gap-3 flex-shrink-0">
                            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-coral/20">
                                <i className="fa-duotone fa-regular fa-terminal text-sm" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-mono text-sm font-bold tracking-tight leading-none">
                                    Splits
                                </p>
                                <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25 leading-none mt-0.5">
                                    Mission Control
                                </p>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="hidden md:block w-[1px] h-6 bg-base-content/5" />

                        {/* Desktop navigation */}
                        <nav className="hidden md:flex items-center gap-1 flex-1">
                            {navLinks.map((link, idx) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => e.preventDefault()}
                                    className={`header-nav-item flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
                                        idx === 0
                                            ? "text-primary bg-primary/5 border-b-2 border-coral"
                                            : "text-base-content/40 hover:text-base-content/70 hover:bg-base-300/50 border-b-2 border-transparent"
                                    }`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${link.icon} text-[11px]`}
                                    />
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Search trigger */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="header-action w-9 h-9 flex items-center justify-center text-base-content/30 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-coral/10 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" />
                            </button>

                            {/* Notifications */}
                            <div className="notif-dropdown-zone relative">
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="header-action relative w-9 h-9 flex items-center justify-center text-base-content/30 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-coral/10 transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-bell text-sm" />
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-error text-error-content font-mono text-[8px] font-bold rounded-full">
                                        7
                                    </span>
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-base-200 border border-base-content/5 shadow-xl z-50">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/5">
                                            <span className="font-mono text-xs font-bold uppercase tracking-wider">
                                                // notifications
                                            </span>
                                            <button className="font-mono text-[10px] text-primary hover:text-primary/70 transition-colors uppercase tracking-wider">
                                                Mark all read
                                            </button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className="flex items-start gap-3 px-4 py-3 border-b border-base-content/[0.03] hover:bg-base-300/30 transition-colors cursor-pointer"
                                                >
                                                    <div
                                                        className={`w-7 h-7 flex-shrink-0 flex items-center justify-center ${
                                                            n.type === "success"
                                                                ? "bg-success/10 text-success border border-success/20"
                                                                : n.type ===
                                                                    "info"
                                                                  ? "bg-primary/10 text-primary border border-coral/20"
                                                                  : "bg-base-content/5 text-base-content/30 border border-base-content/10"
                                                        }`}
                                                    >
                                                        <i
                                                            className={`fa-duotone fa-regular ${n.icon} text-[10px]`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-mono text-[11px] text-base-content/60 leading-relaxed">
                                                            {n.text}
                                                        </p>
                                                        <span className="font-mono text-[9px] text-base-content/20">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-2.5 border-t border-base-content/5">
                                            <button className="font-mono text-[10px] text-primary hover:text-primary/70 transition-colors uppercase tracking-wider">
                                                View all notifications
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Separator */}
                            <div className="w-[1px] h-6 bg-base-content/5 hidden sm:block" />

                            {/* User menu */}
                            <div className="user-dropdown-zone relative">
                                <button
                                    onClick={() =>
                                        setUserDropdownOpen(!userDropdownOpen)
                                    }
                                    className="header-action flex items-center gap-2.5 px-2 py-1.5 hover:bg-base-300/50 transition-colors"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-warning/10 text-warning border border-warning/20 font-mono text-[10px] font-bold">
                                        SC
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="font-mono text-xs font-bold text-base-content/70 leading-none">
                                            Sarah Chen
                                        </p>
                                        <p className="font-mono text-[9px] text-base-content/25 leading-none mt-0.5">
                                            Admin
                                        </p>
                                    </div>
                                    <i
                                        className={`fa-duotone fa-regular fa-chevron-down text-[9px] text-base-content/20 hidden lg:block transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-base-200 border border-base-content/5 shadow-xl z-50">
                                        <div className="px-4 py-3 border-b border-base-content/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-warning/10 text-warning border border-warning/20 font-mono text-xs font-bold">
                                                    SC
                                                </div>
                                                <div>
                                                    <p className="font-mono text-xs font-bold">
                                                        Sarah Chen
                                                    </p>
                                                    <p className="font-mono text-[9px] text-base-content/30">
                                                        sarah@splits.network
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            {userMenu.map((item) => (
                                                <button
                                                    key={item.label}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-base-300/50 transition-colors group"
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular ${item.icon} w-4 text-center text-base-content/20 group-hover:text-primary transition-colors text-xs`}
                                                    />
                                                    <span className="flex-1 font-mono text-xs text-base-content/50 group-hover:text-base-content/70">
                                                        {item.label}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="font-mono text-[9px] font-bold bg-error text-error-content px-1.5 py-0.5 leading-none rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="md:hidden w-9 h-9 flex items-center justify-center text-base-content/40 hover:text-primary hover:bg-primary/5 transition-colors border border-transparent hover:border-coral/10"
                            >
                                <i
                                    className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-sm`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scanline accent */}
                <div className="header-scanline h-[1px] bg-primary/30 origin-left" />

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-base-content/5 bg-base-200">
                        <nav className="px-4 py-3">
                            {navLinks.map((link, idx) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => e.preventDefault()}
                                    className={`mobile-nav-item flex items-center gap-3 px-3 py-3 font-mono text-xs uppercase tracking-wider transition-colors border-l-2 ${
                                        idx === 0
                                            ? "text-primary bg-primary/5 border-coral"
                                            : "text-base-content/40 hover:text-base-content/70 hover:bg-base-300/30 border-transparent"
                                    }`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${link.icon} w-4 text-center`}
                                    />
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* ═══ SEARCH OVERLAY ═══ */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
                    <div
                        className="absolute inset-0 bg-base-300/80 backdrop-blur-sm"
                        onClick={() => setSearchOpen(false)}
                    />
                    <div className="search-overlay-inner relative z-10 w-full max-w-2xl mx-4 bg-base-200 border border-base-content/5 shadow-2xl">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-base-content/5">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-primary text-sm" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search jobs, candidates, recruiters, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent font-mono text-sm text-base-content placeholder:text-base-content/20 focus:outline-none"
                                onKeyDown={(e) =>
                                    e.key === "Escape" && setSearchOpen(false)
                                }
                            />
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-base-content/15 bg-base-content/5 px-1.5 py-0.5">
                                    ESC
                                </span>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="p-4">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/20 mb-3">
                                // quick_access
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {
                                        icon: "fa-briefcase",
                                        label: "Browse Open Roles",
                                        count: "47",
                                    },
                                    {
                                        icon: "fa-users",
                                        label: "Search Candidates",
                                        count: "2.4K",
                                    },
                                    {
                                        icon: "fa-user-tie",
                                        label: "Find Recruiters",
                                        count: "186",
                                    },
                                    {
                                        icon: "fa-building",
                                        label: "Company Directory",
                                        count: "89",
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => setSearchOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 bg-base-300/50 border border-base-content/5 hover:border-coral/20 transition-colors text-left group"
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${item.icon} text-sm text-base-content/20 group-hover:text-primary transition-colors`}
                                        />
                                        <div className="flex-1">
                                            <span className="font-mono text-xs text-base-content/50 group-hover:text-base-content/70">
                                                {item.label}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-base-content/20">
                                            {item.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ SAMPLE PAGE CONTENT ═══ */}
            <div className="pt-[5.75rem]">
                {/* Hero section */}
                <section className="relative px-6 pt-10 pb-10">
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    />
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[2px] bg-primary w-24" />
                        </div>
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">
                            sys.dashboard &gt; mission_control v2.0
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-3">
                            <span>Mission </span>
                            <span className="text-primary">Control</span>
                        </h1>
                        <p className="text-base-content/40 font-mono text-sm max-w-lg">
                            Real-time recruiting operations dashboard. Monitor
                            placements, track splits, and manage your network.
                        </p>
                    </div>
                    <div className="absolute top-8 right-6 w-10 h-10 border-r-2 border-t-2 border-coral/20" />
                </section>

                {/* KPI Cards */}
                <section className="px-6 py-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {sampleCards.map((card, idx) => (
                            <div
                                key={card.title}
                                className="sample-card relative p-6 bg-base-200 border border-base-content/5 hover:border-coral/20 transition-colors duration-300"
                            >
                                <span className="absolute top-3 right-3 font-mono text-xs text-base-content/10">
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-coral/20">
                                        <i
                                            className={`fa-duotone fa-regular ${card.icon} text-lg`}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/40 mb-1">
                                            {card.title}
                                        </p>
                                        <p className="font-mono text-3xl font-black tracking-tight">
                                            {card.value}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-base-content/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                    <span className="font-mono text-xs font-bold text-success">
                                        {card.trend}
                                    </span>
                                    <span className="font-mono text-[10px] text-base-content/30">
                                        vs last month
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Content sections */}
                <section className="px-6 py-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Activity Feed */}
                        <div className="content-section lg:col-span-2 bg-base-200 border border-base-content/5 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-1">
                                        // activity.feed
                                    </p>
                                    <h3 className="font-mono text-lg font-bold">
                                        Recent Activity
                                    </h3>
                                </div>
                                <button className="font-mono text-[10px] uppercase tracking-wider text-primary hover:text-primary/70 transition-colors px-3 py-1.5 border border-coral/20 hover:bg-primary/5">
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    {
                                        icon: "fa-handshake",
                                        text: "Split agreement signed for Senior React Developer",
                                        time: "12m ago",
                                        user: "MW",
                                    },
                                    {
                                        icon: "fa-file-circle-plus",
                                        text: "New application: Staff Backend Engineer at Notion",
                                        time: "28m ago",
                                        user: "SY",
                                    },
                                    {
                                        icon: "fa-check-circle",
                                        text: "Placement confirmed: Data Scientist at AnalyticsPro",
                                        time: "1h ago",
                                        user: "JR",
                                    },
                                    {
                                        icon: "fa-plus-circle",
                                        text: "New job posted: VP of Engineering - $250k-$320k",
                                        time: "2h ago",
                                        user: "LP",
                                    },
                                    {
                                        icon: "fa-split",
                                        text: "Split proposal received for ML Engineer role - 60/40",
                                        time: "3h ago",
                                        user: "PS",
                                    },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3 bg-base-300/30 border border-base-content/[0.03] hover:border-base-content/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-coral/20 flex-shrink-0">
                                            <i
                                                className={`fa-duotone fa-regular ${item.icon} text-xs`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-xs text-base-content/60">
                                                {item.text}
                                            </p>
                                            <span className="font-mono text-[9px] text-base-content/20">
                                                {item.time}
                                            </span>
                                        </div>
                                        <div className="w-7 h-7 flex items-center justify-center bg-base-content/5 font-mono text-[9px] text-base-content/30 font-bold flex-shrink-0">
                                            {item.user}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="content-section bg-base-200 border border-base-content/5 p-6">
                            <div className="mb-6">
                                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-1">
                                    // quick.actions
                                </p>
                                <h3 className="font-mono text-lg font-bold">
                                    Actions
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {[
                                    {
                                        icon: "fa-plus-circle",
                                        label: "Post New Job",
                                        desc: "Publish a role to the network",
                                    },
                                    {
                                        icon: "fa-inbox",
                                        label: "Review Applications",
                                        desc: "12 awaiting review",
                                    },
                                    {
                                        icon: "fa-comments",
                                        label: "Message Recruiters",
                                        desc: "3 unread conversations",
                                    },
                                    {
                                        icon: "fa-chart-line",
                                        label: "View Analytics",
                                        desc: "Performance breakdown",
                                    },
                                    {
                                        icon: "fa-file-contract",
                                        label: "Draft Agreement",
                                        desc: "Create split contract",
                                    },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        className="w-full flex items-center gap-3 p-3 bg-base-300/30 border border-base-content/[0.03] hover:border-coral/20 transition-colors text-left group"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center bg-primary/5 text-primary/40 group-hover:bg-primary/10 group-hover:text-primary border border-coral/10 group-hover:border-coral/20 transition-colors">
                                            <i
                                                className={`fa-duotone fa-regular ${action.icon} text-xs`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-xs font-bold text-base-content/60 group-hover:text-base-content/80">
                                                {action.label}
                                            </p>
                                            <p className="font-mono text-[10px] text-base-content/25">
                                                {action.desc}
                                            </p>
                                        </div>
                                        <i className="fa-duotone fa-regular fa-chevron-right text-[10px] text-base-content/10 group-hover:text-primary/40 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-20" />
            </div>
        </div>
    );
}
