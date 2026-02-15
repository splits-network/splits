"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Memphis Color Palette ──────────────────────────────────────────────────
const M = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    navy: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
    darkGray: "#2D2D44",
};

// ─── Animation constants ────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.5)",
    pop: "back.out(2.0)",
    snappy: "power3.out",
};
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };

// ─── Nav Data ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: "Platform", icon: "fa-duotone fa-regular fa-grid-2", color: M.coral, hasDropdown: true },
    { label: "Network", icon: "fa-duotone fa-regular fa-circle-nodes", color: M.teal, hasDropdown: true },
    { label: "Pricing", icon: "fa-duotone fa-regular fa-tag", color: M.yellow, hasDropdown: false },
    { label: "Resources", icon: "fa-duotone fa-regular fa-books", color: M.purple, hasDropdown: true },
    { label: "Company", icon: "fa-duotone fa-regular fa-building", color: M.coral, hasDropdown: true },
];

const PLATFORM_DROPDOWN = [
    { icon: "fa-duotone fa-regular fa-briefcase", label: "ATS", desc: "Track every candidate", color: M.coral },
    { icon: "fa-duotone fa-regular fa-handshake", label: "Split Fees", desc: "Fair, transparent splits", color: M.teal },
    { icon: "fa-duotone fa-regular fa-chart-mixed", label: "Analytics", desc: "Real-time insights", color: M.yellow },
    { icon: "fa-duotone fa-regular fa-messages", label: "Messaging", desc: "Built-in communication", color: M.purple },
    { icon: "fa-duotone fa-regular fa-robot", label: "AI Matching", desc: "Smart candidate pairing", color: M.coral },
    { icon: "fa-duotone fa-regular fa-file-invoice-dollar", label: "Billing", desc: "Automated payouts", color: M.teal },
];

// ─── Sample Page Content ────────────────────────────────────────────────────
const FEATURES = [
    { icon: "fa-duotone fa-regular fa-bolt", title: "Lightning Fast", text: "Sub-second load times across the entire platform. Built for speed, designed for scale.", color: M.coral },
    { icon: "fa-duotone fa-regular fa-shield-check", title: "Bank-Grade Security", text: "SOC 2 compliant with end-to-end encryption. Your data is safe with us.", color: M.teal },
    { icon: "fa-duotone fa-regular fa-chart-line-up", title: "Powerful Analytics", text: "Real-time dashboards, custom reports, and AI-powered insights for your recruiting pipeline.", color: M.yellow },
    { icon: "fa-duotone fa-regular fa-users-gear", title: "Team Collaboration", text: "Built-in tools for seamless teamwork. Share candidates, split fees, and close together.", color: M.purple },
];

// ─── Desktop Header Component ───────────────────────────────────────────────
function DesktopHeader() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="desktop-header relative overflow-hidden"
            style={{ backgroundColor: M.navy, borderBottom: `5px solid ${M.coral}` }}>

            {/* Memphis background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="memphis-deco absolute top-2 right-12 w-8 h-8 rounded-full border-[3px] opacity-20"
                    style={{ borderColor: M.teal }} />
                <div className="memphis-deco absolute top-4 right-32 w-5 h-5 rotate-45 opacity-15"
                    style={{ backgroundColor: M.yellow }} />
                <div className="memphis-deco absolute top-1 left-[35%] opacity-15"
                    style={{
                        width: 0, height: 0,
                        borderLeft: "7px solid transparent",
                        borderRight: "7px solid transparent",
                        borderBottom: `12px solid ${M.purple}`,
                        transform: "rotate(20deg)",
                    }} />
                <svg className="memphis-deco absolute bottom-1 left-[55%] opacity-15" width="50" height="12" viewBox="0 0 50 12">
                    <polyline points="0,10 7,2 14,10 21,2 28,10 35,2 42,10 49,2"
                        fill="none" stroke={M.coral} strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="memphis-deco absolute bottom-2 right-[45%] opacity-10">
                    <div className="grid grid-cols-3 gap-1.5">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: M.teal }} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 lg:px-10" style={{ borderBottom: `3px solid ${M.darkGray}` }}>
                    <div className="flex items-center gap-2 py-1.5">
                        {[
                            { text: "Recruiters: Join Free", color: M.coral, icon: "fa-duotone fa-regular fa-arrow-right" },
                            { text: "Split-Fee Marketplace", color: M.teal, icon: "fa-duotone fa-regular fa-handshake" },
                        ].map((item, i) => (
                            <span key={i} className="top-bar-item flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1"
                                style={{ color: item.color }}>
                                <i className={`${item.icon} text-[8px]`}></i>
                                {item.text}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                        <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-80"
                            style={{ color: "rgba(255,255,255,0.4)" }}>
                            Help Center
                        </a>
                        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                        <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-80"
                            style={{ color: "rgba(255,255,255,0.4)" }}>
                            Contact
                        </a>
                    </div>
                </div>

                {/* Main nav bar */}
                <div className="flex items-center justify-between px-6 lg:px-10 py-3.5">
                    {/* Logo */}
                    <div className="nav-logo flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 flex items-center justify-center border-[3px]"
                                style={{ borderColor: M.coral, backgroundColor: M.coral }}>
                                <span className="text-lg font-black" style={{ color: M.white }}>S</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                                style={{ backgroundColor: M.teal }} />
                        </div>
                        <div>
                            <div className="text-base font-black uppercase tracking-[0.15em] leading-none" style={{ color: M.white }}>
                                Splits
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: M.coral }}>
                                Network
                            </div>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <div key={item.label} className="relative"
                                onMouseEnter={() => item.hasDropdown ? setActiveDropdown(item.label) : null}
                                onMouseLeave={() => setActiveDropdown(null)}>
                                <button className="nav-item flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] border-[3px] transition-all hover:-translate-y-0.5"
                                    style={{
                                        borderColor: activeDropdown === item.label ? item.color : "transparent",
                                        backgroundColor: activeDropdown === item.label ? `${item.color}12` : "transparent",
                                        color: activeDropdown === item.label ? item.color : M.white,
                                    }}>
                                    <i className={`${item.icon} text-[10px]`} style={{ color: item.color }}></i>
                                    {item.label}
                                    {item.hasDropdown && (
                                        <i className="fa-solid fa-chevron-down text-[8px] opacity-50"></i>
                                    )}
                                </button>

                                {/* Dropdown (show for Platform) */}
                                {item.label === "Platform" && activeDropdown === "Platform" && (
                                    <div className="absolute top-full left-0 mt-1 w-[340px] border-[4px] z-50"
                                        style={{ borderColor: M.coral, backgroundColor: M.navy }}>
                                        <div className="p-2">
                                            <div className="px-3 py-2 mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                                    style={{ color: M.coral }}>
                                                    Platform Tools
                                                </span>
                                            </div>
                                            {PLATFORM_DROPDOWN.map((dd, i) => (
                                                <a key={i} href="#"
                                                    className="flex items-center gap-3 px-3 py-2.5 transition-all hover:translate-x-1"
                                                    style={{ borderLeft: "3px solid transparent" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = dd.color)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = "transparent")}>
                                                    <div className="w-9 h-9 flex items-center justify-center border-[2px] flex-shrink-0"
                                                        style={{ borderColor: dd.color }}>
                                                        <i className={`${dd.icon} text-sm`} style={{ color: dd.color }}></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black uppercase tracking-wide" style={{ color: M.white }}>
                                                            {dd.label}
                                                        </div>
                                                        <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                            {dd.desc}
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                        <div className="h-1" style={{ backgroundColor: M.coral }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="nav-action w-10 h-10 flex items-center justify-center border-[3px] transition-all hover:-translate-y-0.5"
                                style={{
                                    borderColor: searchOpen ? M.teal : M.darkGray,
                                    color: searchOpen ? M.teal : "rgba(255,255,255,0.5)",
                                }}>
                                <i className={`fa-duotone fa-regular ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"} text-sm`}></i>
                            </button>
                            {searchOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[300px] border-[3px] p-3 z-50"
                                    style={{ borderColor: M.teal, backgroundColor: M.navy }}>
                                    <input type="text" placeholder="SEARCH..."
                                        autoFocus
                                        className="w-full px-3 py-2 border-[2px] text-xs font-bold uppercase tracking-wider outline-none placeholder:opacity-30"
                                        style={{ borderColor: M.teal, backgroundColor: "rgba(255,255,255,0.03)", color: M.white }} />
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button className="nav-action relative w-10 h-10 flex items-center justify-center border-[3px] transition-all hover:-translate-y-0.5"
                            style={{ borderColor: M.darkGray, color: "rgba(255,255,255,0.5)" }}>
                            <i className="fa-duotone fa-regular fa-bell text-sm"></i>
                            <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[8px] font-black"
                                style={{ backgroundColor: M.coral, color: M.white }}>
                                3
                            </div>
                        </button>

                        {/* Sign In */}
                        <a href="#" className="nav-cta-secondary hidden md:flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] border-[3px] transition-all hover:-translate-y-0.5"
                            style={{ borderColor: M.purple, color: M.purple }}>
                            <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[10px]"></i>
                            Sign In
                        </a>

                        {/* Primary CTA */}
                        <a href="#" className="nav-cta-primary flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] border-[3px] transition-all hover:-translate-y-0.5"
                            style={{ borderColor: M.coral, backgroundColor: M.coral, color: M.white }}>
                            <i className="fa-duotone fa-regular fa-rocket text-[10px]"></i>
                            Get Started
                        </a>

                        {/* User menu (logged-in state preview) */}
                        <div className="nav-user hidden xl:flex items-center gap-2 pl-3 ml-1"
                            style={{ borderLeft: `3px solid ${M.darkGray}` }}>
                            <div className="w-9 h-9 flex items-center justify-center border-[2px] text-[10px] font-black"
                                style={{ borderColor: M.teal, backgroundColor: M.teal, color: M.navy }}>
                                JD
                            </div>
                            <i className="fa-solid fa-chevron-down text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}></i>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// ─── Mobile Header Component ────────────────────────────────────────────────
function MobileHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    return (
        <header className="mobile-header relative overflow-hidden"
            style={{ backgroundColor: M.navy, borderBottom: `5px solid ${M.teal}` }}>

            {/* Memphis decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-2 right-6 w-6 h-6 rounded-full border-[2px] opacity-20"
                    style={{ borderColor: M.coral }} />
                <div className="absolute bottom-2 left-[40%] w-4 h-4 rotate-45 opacity-15"
                    style={{ backgroundColor: M.yellow }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 flex items-center justify-center border-[3px]"
                            style={{ borderColor: M.coral, backgroundColor: M.coral }}>
                            <span className="text-sm font-black" style={{ color: M.white }}>S</span>
                        </div>
                        <div>
                            <div className="text-sm font-black uppercase tracking-[0.12em] leading-none" style={{ color: M.white }}>
                                Splits
                            </div>
                            <div className="text-[8px] font-bold uppercase tracking-[0.25em]" style={{ color: M.coral }}>
                                Network
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 flex items-center justify-center border-[2px]"
                            style={{ borderColor: M.darkGray, color: "rgba(255,255,255,0.5)" }}>
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-xs"></i>
                        </button>
                        <button className="relative w-9 h-9 flex items-center justify-center border-[2px]"
                            style={{ borderColor: M.darkGray, color: "rgba(255,255,255,0.5)" }}>
                            <i className="fa-duotone fa-regular fa-bell text-xs"></i>
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center text-[7px] font-black"
                                style={{ backgroundColor: M.coral, color: M.white }}>
                                3
                            </div>
                        </button>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-9 h-9 flex items-center justify-center border-[3px] transition-all"
                            style={{
                                borderColor: menuOpen ? M.teal : M.coral,
                                backgroundColor: menuOpen ? M.teal : "transparent",
                                color: menuOpen ? M.navy : M.coral,
                            }}>
                            <i className={`fa-duotone fa-regular ${menuOpen ? "fa-xmark" : "fa-bars"} text-sm`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="px-4 pb-4" style={{ borderTop: `3px solid ${M.darkGray}` }}>
                        <nav className="py-3 space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <div key={item.label}>
                                    <button
                                        onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 border-[2px] transition-all"
                                        style={{
                                            borderColor: expandedItem === item.label ? item.color : "transparent",
                                            backgroundColor: expandedItem === item.label ? `${item.color}10` : "transparent",
                                        }}>
                                        <div className="flex items-center gap-2.5">
                                            <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
                                            <span className="text-xs font-black uppercase tracking-[0.12em]"
                                                style={{ color: expandedItem === item.label ? item.color : M.white }}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.hasDropdown && (
                                            <i className={`fa-solid fa-chevron-${expandedItem === item.label ? "up" : "down"} text-[8px]`}
                                                style={{ color: "rgba(255,255,255,0.3)" }}></i>
                                        )}
                                    </button>
                                    {item.label === "Platform" && expandedItem === "Platform" && (
                                        <div className="ml-4 mt-1 space-y-1 pb-2">
                                            {PLATFORM_DROPDOWN.map((dd, i) => (
                                                <a key={i} href="#" className="flex items-center gap-2.5 px-3 py-2 transition-all"
                                                    style={{ borderLeft: `2px solid ${dd.color}` }}>
                                                    <i className={`${dd.icon} text-[10px]`} style={{ color: dd.color }}></i>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: M.white }}>
                                                        {dd.label}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Mobile CTAs */}
                        <div className="space-y-2 pt-3" style={{ borderTop: `3px solid ${M.darkGray}` }}>
                            <a href="#" className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] border-[3px]"
                                style={{ borderColor: M.coral, backgroundColor: M.coral, color: M.white }}>
                                <i className="fa-duotone fa-regular fa-rocket text-[10px]"></i>
                                Get Started Free
                            </a>
                            <a href="#" className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] border-[3px]"
                                style={{ borderColor: M.purple, color: M.purple }}>
                                <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[10px]"></i>
                                Sign In
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function HeadersSixPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Memphis decorations
            gsap.fromTo(
                $(".memphis-deco"),
                { opacity: 0, scale: 0, rotation: -90 },
                { opacity: 0.2, scale: 1, rotation: 0, duration: D.slow, ease: E.elastic, stagger: { each: S.tight, from: "random" }, delay: 0.3 },
            );

            // Desktop header
            const deskTl = gsap.timeline({ defaults: { ease: E.smooth } });
            deskTl.fromTo($1(".desktop-header"), { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: D.slow, ease: E.bounce });
            deskTl.fromTo($(".top-bar-item"), { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: D.fast, stagger: S.tight }, "-=0.3");
            deskTl.fromTo($1(".nav-logo"), { x: -30, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: D.normal, ease: E.pop }, "-=0.3");
            deskTl.fromTo($(".nav-item"), { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: D.fast, stagger: S.tight, ease: E.bounce }, "-=0.2");
            deskTl.fromTo($(".nav-action"), { scale: 0, rotation: -15 }, { scale: 1, rotation: 0, duration: D.fast, stagger: S.tight, ease: E.elastic }, "-=0.2");
            deskTl.fromTo($1(".nav-cta-secondary"), { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: D.fast, ease: E.snappy }, "-=0.2");
            deskTl.fromTo($1(".nav-cta-primary"), { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: D.normal, ease: E.bounce }, "-=0.2");
            deskTl.fromTo($1(".nav-user"), { x: 15, opacity: 0 }, { x: 0, opacity: 1, duration: D.fast }, "-=0.2");

            // Section labels
            gsap.fromTo(
                $(".section-label"),
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: D.normal, ease: E.smooth, stagger: 0.3, delay: 0.8 },
            );

            // Mobile header
            gsap.fromTo(
                $1(".mobile-header"),
                { y: -40, opacity: 0 },
                { y: 0, opacity: 1, duration: D.slow, ease: E.bounce, delay: 0.6 },
            );

            // Feature cards
            gsap.fromTo(
                $(".feature-card"),
                { y: 40, opacity: 0, scale: 0.9, rotation: -2 },
                { y: 0, opacity: 1, scale: 1, rotation: 0, duration: D.normal, ease: E.bounce, stagger: S.loose, delay: 1.0 },
            );

            // Sample content blocks
            gsap.fromTo(
                $(".sample-block"),
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: D.normal, ease: E.smooth, stagger: S.normal, delay: 1.2 },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: M.cream }}>

            {/* ═══════════════════════════════════════════
                SHOWCASE TITLE
               ═══════════════════════════════════════════ */}
            <div className="py-10 text-center" style={{ backgroundColor: M.navy }}>
                <div className="inline-block px-4 py-1.5 border-[3px] mb-4"
                    style={{ borderColor: M.coral }}>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: M.coral }}>
                        Header Showcase
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3" style={{ color: M.white }}>
                    Retro <span style={{ color: M.coral }}>Memphis</span> Header
                </h1>
                <p className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Bold borders, geometric shapes, flat colors, loud typography
                </p>
            </div>

            {/* ═══════════════════════════════════════════
                DESKTOP HEADER
               ═══════════════════════════════════════════ */}
            <div className="px-4 md:px-8 py-10">
                <div className="section-label flex items-center gap-3 mb-4 opacity-0">
                    <div className="w-8 h-8 flex items-center justify-center border-[3px]"
                        style={{ borderColor: M.teal, backgroundColor: M.teal }}>
                        <i className="fa-duotone fa-regular fa-desktop text-xs" style={{ color: M.navy }}></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: M.navy }}>
                        Desktop Version
                    </span>
                    <div className="flex-1 h-[3px]" style={{ backgroundColor: M.teal }} />
                </div>

                <div className="border-[4px]" style={{ borderColor: M.navy }}>
                    <DesktopHeader />

                    {/* Sample content below header */}
                    <div className="p-6 md:p-10" style={{ backgroundColor: M.white }}>
                        <div className="max-w-5xl mx-auto">
                            <div className="sample-block text-center mb-10 opacity-0">
                                <span className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] mb-3"
                                    style={{ backgroundColor: M.coral, color: M.white }}>
                                    Why Splits Network
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2" style={{ color: M.navy }}>
                                    Everything You Need to <span style={{ color: M.coral }}>Recruit</span>
                                </h2>
                                <p className="text-sm" style={{ color: M.navy, opacity: 0.5 }}>
                                    A complete platform for modern recruiting teams
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {FEATURES.map((f, i) => (
                                    <div key={i} className="feature-card p-5 border-[3px] opacity-0"
                                        style={{ borderColor: f.color }}>
                                        <div className="w-12 h-12 flex items-center justify-center border-[3px] mb-3"
                                            style={{ borderColor: f.color }}>
                                            <i className={`${f.icon} text-lg`} style={{ color: f.color }}></i>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-wide mb-2" style={{ color: M.navy }}>
                                            {f.title}
                                        </h3>
                                        <p className="text-xs leading-relaxed" style={{ color: M.navy, opacity: 0.6 }}>
                                            {f.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                MOBILE HEADER
               ═══════════════════════════════════════════ */}
            <div className="px-4 md:px-8 py-10">
                <div className="section-label flex items-center gap-3 mb-4 opacity-0">
                    <div className="w-8 h-8 flex items-center justify-center border-[3px]"
                        style={{ borderColor: M.purple, backgroundColor: M.purple }}>
                        <i className="fa-duotone fa-regular fa-mobile text-xs" style={{ color: M.white }}></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: M.navy }}>
                        Mobile Version
                    </span>
                    <div className="flex-1 h-[3px]" style={{ backgroundColor: M.purple }} />
                </div>

                <div className="max-w-[400px]">
                    <div className="border-[4px]" style={{ borderColor: M.navy }}>
                        <MobileHeader />

                        {/* Mobile sample content */}
                        <div className="p-4" style={{ backgroundColor: M.white }}>
                            {[
                                { title: "Find Top Talent", color: M.coral, icon: "fa-duotone fa-regular fa-magnifying-glass" },
                                { title: "Track Your Pipeline", color: M.teal, icon: "fa-duotone fa-regular fa-chart-mixed" },
                                { title: "Close More Placements", color: M.yellow, icon: "fa-duotone fa-regular fa-handshake" },
                            ].map((item, i) => (
                                <div key={i} className="sample-block flex items-center gap-3 p-3 mb-2 border-[2px] opacity-0"
                                    style={{ borderColor: item.color }}>
                                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: item.color }}>
                                        <i className={`${item.icon} text-xs`} style={{ color: item.color === M.yellow ? M.navy : M.white }}></i>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wide" style={{ color: M.navy }}>
                                        {item.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                DESIGN DETAILS
               ═══════════════════════════════════════════ */}
            <div className="px-4 md:px-8 pb-16">
                <div className="section-label flex items-center gap-3 mb-4 opacity-0">
                    <div className="w-8 h-8 flex items-center justify-center border-[3px]"
                        style={{ borderColor: M.yellow, backgroundColor: M.yellow }}>
                        <i className="fa-duotone fa-regular fa-swatchbook text-xs" style={{ color: M.navy }}></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: M.navy }}>
                        Design Details
                    </span>
                    <div className="flex-1 h-[3px]" style={{ backgroundColor: M.yellow }} />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Geometric Shapes",
                            items: ["Circle border accents", "Rotated square decorations", "Triangle markers", "Zigzag line patterns", "Dot grid patterns"],
                            color: M.coral,
                            icon: "fa-duotone fa-regular fa-shapes",
                        },
                        {
                            title: "Typography System",
                            items: ["All-caps headings", "Ultra-wide letter-spacing", "Heavy 900 weight throughout", "9-12px micro labels", "Tracking-based hierarchy"],
                            color: M.teal,
                            icon: "fa-duotone fa-regular fa-text",
                        },
                        {
                            title: "Interaction Style",
                            items: ["Hover lift (-translate-y)", "Border color transitions", "Background fill on active", "Scale bounce on enter", "Color-coded role states"],
                            color: M.purple,
                            icon: "fa-duotone fa-regular fa-hand-pointer",
                        },
                    ].map((section, i) => (
                        <div key={i} className="sample-block p-5 border-[3px] opacity-0"
                            style={{ borderColor: section.color, backgroundColor: M.white }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 flex items-center justify-center"
                                    style={{ backgroundColor: section.color }}>
                                    <i className={`${section.icon} text-xs`} style={{ color: section.color === M.yellow ? M.navy : M.white }}></i>
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: M.navy }}>
                                    {section.title}
                                </span>
                            </div>
                            <ul className="space-y-1.5">
                                {section.items.map((item, j) => (
                                    <li key={j} className="flex items-center gap-2 text-[11px]" style={{ color: M.navy, opacity: 0.7 }}>
                                        <div className="w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: section.color }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
