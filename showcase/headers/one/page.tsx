"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Navigation Data ────────────────────────────────────────────────────── */

const navLinks = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        children: [
            {
                label: "For Recruiters",
                href: "#",
                icon: "fa-duotone fa-regular fa-user-tie",
            },
            {
                label: "For Companies",
                href: "#",
                icon: "fa-duotone fa-regular fa-building",
            },
            {
                label: "For Candidates",
                href: "#",
                icon: "fa-duotone fa-regular fa-user",
            },
            {
                label: "Integrations",
                href: "#",
                icon: "fa-duotone fa-regular fa-puzzle-piece",
            },
        ],
    },
    {
        label: "Solutions",
        icon: "fa-duotone fa-regular fa-lightbulb",
        children: [
            {
                label: "Split-Fee Recruiting",
                href: "#",
                icon: "fa-duotone fa-regular fa-handshake",
            },
            {
                label: "ATS & Pipeline",
                href: "#",
                icon: "fa-duotone fa-regular fa-chart-kanban",
            },
            {
                label: "AI Matching",
                href: "#",
                icon: "fa-duotone fa-regular fa-brain-circuit",
            },
            {
                label: "Analytics",
                href: "#",
                icon: "fa-duotone fa-regular fa-chart-mixed",
            },
        ],
    },
    { label: "Pricing", href: "#" },
    { label: "Resources", href: "#" },
    { label: "About", href: "#" },
];

const userMenu = {
    name: "Jordan Mitchell",
    initials: "JM",
    role: "Senior Recruiter",
    notifications: 3,
};

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function HeadersOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    /* ── Scroll detection ─────────────────────────────────────── */
    useGSAP(
        () => {
            if (!mainRef.current) return;

            ScrollTrigger.create({
                trigger: mainRef.current,
                start: "top top",
                end: "80px top",
                onLeave: () => setScrolled(true),
                onEnterBack: () => setScrolled(false),
            });
        },
        { scope: mainRef },
    );

    /* ── GSAP entrance animations ─────────────────────────────── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            /* Header bar entrance */
            gsap.fromTo(
                $1(".header-bar"),
                { opacity: 0, y: -30 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            );

            /* Logo */
            gsap.fromTo(
                $1(".header-logo"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    delay: 0.2,
                },
            );

            /* Nav links stagger */
            gsap.fromTo(
                $(".nav-link-item"),
                { opacity: 0, y: -10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                    delay: 0.3,
                },
            );

            /* Right side items */
            gsap.fromTo(
                $(".header-right-item"),
                { opacity: 0, x: 20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    delay: 0.4,
                },
            );

            /* Showcase hero */
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            heroTl
                .fromTo(
                    $1(".showcase-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, delay: 0.6 },
                )
                .fromTo(
                    $(".showcase-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".showcase-desc"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                );

            /* Sample content sections */
            $(".content-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                        },
                    },
                );
            });
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ═══════════════════════════════════════════════════════
                HEADER — Split-Screen Editorial Navigation
               ═══════════════════════════════════════════════════════ */}
            <header
                className={`header-bar fixed top-0 left-0 right-0 z-50 transition-all duration-300 opacity-0 ${
                    scrolled
                        ? "bg-base-100/95 backdrop-blur-md shadow-sm border-b border-base-300"
                        : "bg-transparent"
                }`}
            >
                {/* Top accent line */}
                <div className="h-1 bg-primary w-full" />

                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between h-16 lg:h-18">
                        {/* ── Left: Logo + Nav ────────────────── */}
                        <div className="flex items-center gap-10">
                            {/* Logo */}
                            <a
                                href="#"
                                className="header-logo flex items-center gap-3 opacity-0"
                            >
                                <div className="w-9 h-9 bg-primary flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-split text-primary-content text-lg" />
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-base font-black tracking-tight text-base-content">
                                        Splits
                                    </span>
                                    <span className="text-base font-light tracking-tight text-base-content/60 ml-0.5">
                                        Network
                                    </span>
                                </div>
                            </a>

                            {/* Desktop navigation */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <div key={link.label} className="relative">
                                        {link.children ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setActiveDropdown(
                                                            activeDropdown ===
                                                                link.label
                                                                ? null
                                                                : link.label,
                                                        )
                                                    }
                                                    className="nav-link-item opacity-0 flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
                                                >
                                                    {link.label}
                                                    <i
                                                        className={`fa-solid fa-chevron-down text-[9px] transition-transform ${
                                                            activeDropdown ===
                                                            link.label
                                                                ? "rotate-180"
                                                                : ""
                                                        }`}
                                                    />
                                                </button>

                                                {/* Dropdown */}
                                                {activeDropdown ===
                                                    link.label && (
                                                    <div className="absolute top-full left-0 mt-1 w-64 bg-base-100 border border-base-300 shadow-lg py-2 z-50">
                                                        <div className="px-4 py-2 border-b border-base-300 mb-1">
                                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                                                                {link.label}
                                                            </span>
                                                        </div>
                                                        {link.children.map(
                                                            (child) => (
                                                                <a
                                                                    key={
                                                                        child.label
                                                                    }
                                                                    href={
                                                                        child.href
                                                                    }
                                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
                                                                >
                                                                    <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                                                        <i
                                                                            className={`${child.icon} text-primary text-xs`}
                                                                        />
                                                                    </div>
                                                                    {
                                                                        child.label
                                                                    }
                                                                </a>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="nav-link-item opacity-0 px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* ── Right: Search, Notifications, User, CTA ─── */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="header-right-item opacity-0 relative">
                                <button
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="btn btn-ghost btn-sm btn-square"
                                >
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/60" />
                                </button>

                                {searchOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-base-100 border border-base-300 shadow-lg p-3 z-50">
                                        <div className="relative">
                                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
                                            <input
                                                type="text"
                                                placeholder="Search jobs, candidates, companies..."
                                                className="input input-sm w-full pl-9 bg-base-200 border-base-300 focus:border-coral focus:outline-none"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-base-300">
                                            <p className="text-[10px] uppercase tracking-widest text-base-content/30 mb-2">
                                                Quick Actions
                                            </p>
                                            {[
                                                {
                                                    label: "Browse open jobs",
                                                    icon: "fa-duotone fa-regular fa-briefcase",
                                                },
                                                {
                                                    label: "View my candidates",
                                                    icon: "fa-duotone fa-regular fa-users",
                                                },
                                                {
                                                    label: "Check placements",
                                                    icon: "fa-duotone fa-regular fa-trophy",
                                                },
                                            ].map((action) => (
                                                <a
                                                    key={action.label}
                                                    href="#"
                                                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                                                >
                                                    <i
                                                        className={`${action.icon} text-primary`}
                                                    />
                                                    {action.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <div className="header-right-item opacity-0 relative hidden sm:block">
                                <button className="btn btn-ghost btn-sm btn-square">
                                    <i className="fa-duotone fa-regular fa-bell text-base-content/60" />
                                </button>
                                {userMenu.notifications > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-content text-[9px] font-bold flex items-center justify-center rounded-full">
                                        {userMenu.notifications}
                                    </span>
                                )}
                            </div>

                            {/* User menu */}
                            <div className="header-right-item opacity-0 relative hidden sm:block">
                                <button
                                    onClick={() =>
                                        setUserMenuOpen(!userMenuOpen)
                                    }
                                    className="flex items-center gap-2 px-2 py-1 hover:bg-base-200 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                                        {userMenu.initials}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-xs font-bold leading-tight">
                                            {userMenu.name}
                                        </div>
                                        <div className="text-[10px] text-base-content/50">
                                            {userMenu.role}
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-down text-[8px] text-base-content/40 hidden md:block" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-56 bg-base-100 border border-base-300 shadow-lg py-2 z-50">
                                        <div className="px-4 py-3 border-b border-base-300">
                                            <div className="text-sm font-bold">
                                                {userMenu.name}
                                            </div>
                                            <div className="text-xs text-base-content/50">
                                                {userMenu.role}
                                            </div>
                                        </div>
                                        {[
                                            {
                                                label: "Dashboard",
                                                icon: "fa-duotone fa-regular fa-gauge-high",
                                            },
                                            {
                                                label: "My Profile",
                                                icon: "fa-duotone fa-regular fa-user",
                                            },
                                            {
                                                label: "Settings",
                                                icon: "fa-duotone fa-regular fa-gear",
                                            },
                                            {
                                                label: "Billing",
                                                icon: "fa-duotone fa-regular fa-credit-card",
                                            },
                                        ].map((item) => (
                                            <a
                                                key={item.label}
                                                href="#"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
                                            >
                                                <i
                                                    className={`${item.icon} text-xs w-4 text-center`}
                                                />
                                                {item.label}
                                            </a>
                                        ))}
                                        <div className="border-t border-base-300 mt-1 pt-1">
                                            <a
                                                href="#"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-error/70 hover:bg-error/10 hover:text-error transition-colors"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-right-from-bracket text-xs w-4 text-center" />
                                                Sign Out
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA button */}
                            <a
                                href="#"
                                className="header-right-item opacity-0 btn btn-primary btn-sm hidden md:flex"
                            >
                                <i className="fa-duotone fa-regular fa-plus" />
                                Post a Job
                            </a>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="header-right-item opacity-0 btn btn-ghost btn-sm btn-square lg:hidden"
                            >
                                <i
                                    className={`fa-duotone fa-regular ${
                                        mobileOpen ? "fa-xmark" : "fa-bars"
                                    } text-lg`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile menu ──────────────────────────────────── */}
                {mobileOpen && (
                    <div className="lg:hidden bg-base-100 border-t border-base-300 shadow-lg">
                        <div className="container mx-auto px-6 py-4">
                            {/* Search */}
                            <div className="relative mb-4">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="input input-sm w-full pl-9 bg-base-200 border-base-300"
                                />
                            </div>

                            {/* Nav */}
                            <nav className="space-y-1 mb-4">
                                {navLinks.map((link) => (
                                    <div key={link.label}>
                                        {link.children ? (
                                            <div>
                                                <button
                                                    onClick={() =>
                                                        setActiveDropdown(
                                                            activeDropdown ===
                                                                link.label
                                                                ? null
                                                                : link.label,
                                                        )
                                                    }
                                                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <i
                                                            className={`${link.icon} text-primary text-xs`}
                                                        />
                                                        {link.label}
                                                    </span>
                                                    <i
                                                        className={`fa-solid fa-chevron-down text-[9px] transition-transform ${
                                                            activeDropdown ===
                                                            link.label
                                                                ? "rotate-180"
                                                                : ""
                                                        }`}
                                                    />
                                                </button>
                                                {activeDropdown ===
                                                    link.label && (
                                                    <div className="pl-6 space-y-1 mb-2">
                                                        {link.children.map(
                                                            (child) => (
                                                                <a
                                                                    key={
                                                                        child.label
                                                                    }
                                                                    href={
                                                                        child.href
                                                                    }
                                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-base-content/60 hover:text-base-content"
                                                                >
                                                                    <i
                                                                        className={`${child.icon} text-xs text-primary`}
                                                                    />
                                                                    {
                                                                        child.label
                                                                    }
                                                                </a>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            {/* Mobile user + CTA */}
                            <div className="border-t border-base-300 pt-4 space-y-3">
                                <div className="flex items-center gap-3 px-3">
                                    <div className="w-9 h-9 bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                                        {userMenu.initials}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">
                                            {userMenu.name}
                                        </div>
                                        <div className="text-[10px] text-base-content/50">
                                            {userMenu.role}
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href="#"
                                    className="btn btn-primary btn-sm w-full"
                                >
                                    <i className="fa-duotone fa-regular fa-plus" />
                                    Post a Job
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ═══════════════════════════════════════════════════════
                HERO — Showcase description (Split-Screen Editorial)
               ═══════════════════════════════════════════════════════ */}
            <section className="relative min-h-[70vh] flex items-center bg-neutral text-neutral-content pt-24">
                {/* Diagonal accent panel */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />

                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20">
                    <div className="max-w-3xl">
                        <p className="showcase-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-5 opacity-0">
                            Header Component
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="showcase-word inline-block opacity-0">
                                Split-Screen
                            </span>{" "}
                            <span className="showcase-word inline-block opacity-0 text-primary">
                                Editorial
                            </span>{" "}
                            <br className="hidden md:block" />
                            <span className="showcase-word inline-block opacity-0">
                                Navigation.
                            </span>
                        </h1>

                        <p className="showcase-desc text-lg text-neutral-content/60 leading-relaxed max-w-xl opacity-0">
                            A bold, editorial-inspired navigation system. Clean
                            lines, sharp typography, and deliberate negative
                            space create a professional hierarchy. Features
                            dropdown menus with icon-labeled items, inline
                            search, notification badges, and a user profile menu
                            with role context.
                        </p>

                        {/* Feature badges */}
                        <div className="flex flex-wrap gap-3 mt-10">
                            {[
                                "Sticky Header",
                                "Scroll Backdrop Blur",
                                "Dropdown Menus",
                                "Inline Search",
                                "Notification Badge",
                                "User Menu",
                                "Mobile Drawer",
                                "CTA Button",
                            ].map((feat) => (
                                <span
                                    key={feat}
                                    className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-neutral-content/10 text-neutral-content/60"
                                >
                                    {feat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SAMPLE CONTENT — Demonstrates header in context
               ═══════════════════════════════════════════════════════ */}
            <section className="content-section py-24 bg-base-100 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        <div className="lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Open Positions
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-8">
                                Featured roles
                                <br />
                                this week.
                            </h2>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Senior Full-Stack Engineer",
                                        company: "TechCorp",
                                        location: "Remote",
                                        salary: "$180k - $220k",
                                        tags: ["React", "Node.js", "AWS"],
                                    },
                                    {
                                        title: "VP of Engineering",
                                        company: "DataFlow Inc",
                                        location: "San Francisco, CA",
                                        salary: "$250k - $300k",
                                        tags: ["Leadership", "Scale", "IPO"],
                                    },
                                    {
                                        title: "Product Manager",
                                        company: "InnovateCo",
                                        location: "Remote",
                                        salary: "$160k - $185k",
                                        tags: ["B2B SaaS", "PLG", "Analytics"],
                                    },
                                ].map((job, i) => (
                                    <div
                                        key={i}
                                        className="border-l-4 border-coral bg-base-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-base-content/60 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-duotone fa-regular fa-building text-xs" />
                                                    {job.company}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                                                    {job.salary}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {job.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm flex-shrink-0">
                                            View Role
                                            <i className="fa-duotone fa-regular fa-arrow-right" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-base-200 p-8 border-t-4 border-secondary">
                                <h3 className="text-xl font-black mb-4">
                                    Quick Stats
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        {
                                            label: "Active Jobs",
                                            value: "47",
                                            icon: "fa-duotone fa-regular fa-briefcase",
                                        },
                                        {
                                            label: "My Candidates",
                                            value: "23",
                                            icon: "fa-duotone fa-regular fa-users",
                                        },
                                        {
                                            label: "Interviews",
                                            value: "8",
                                            icon: "fa-duotone fa-regular fa-calendar-check",
                                        },
                                        {
                                            label: "Placements MTD",
                                            value: "3",
                                            icon: "fa-duotone fa-regular fa-trophy",
                                        },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                                <i
                                                    className={`${stat.icon} text-secondary`}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                                    {stat.label}
                                                </div>
                                                <div className="text-xl font-black">
                                                    {stat.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats section ────────────────────────────────── */}
            <section className="content-section py-24 bg-base-200 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Marketplace Activity
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            The network is growing.
                        </h2>
                        <p className="text-base-content/60 text-sm leading-relaxed mb-12">
                            Scroll down to see the header transition from
                            transparent to a frosted glass backdrop blur effect.
                            The editorial design maintains visual hierarchy at
                            every scroll position.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                {
                                    value: "2,847",
                                    label: "Recruiters",
                                    color: "text-primary",
                                },
                                {
                                    value: "518",
                                    label: "Companies",
                                    color: "text-secondary",
                                },
                                {
                                    value: "12,340",
                                    label: "Candidates",
                                    color: "text-accent",
                                },
                                {
                                    value: "1,892",
                                    label: "Placements",
                                    color: "text-success",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="bg-base-100 p-6 border-t-2 border-base-300"
                                >
                                    <div
                                        className={`text-3xl font-black ${stat.color} mb-1`}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-base-content/50">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Scroll behavior section ─────────────────────── */}
            <section className="content-section py-24 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                Header Behavior
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                Scroll to see the
                                <br />
                                sticky transition.
                            </h2>
                            <p className="text-lg opacity-60 leading-relaxed mb-8">
                                The header starts transparent against the dark
                                hero section, then transitions to a frosted
                                glass surface with subtle shadow as you scroll.
                                This ensures readability against any background
                                content while maintaining the editorial
                                aesthetic.
                            </p>
                            <div className="space-y-3">
                                {[
                                    "Transparent on dark hero sections",
                                    "Frosted glass on scroll with backdrop blur",
                                    "Subtle border and shadow for depth",
                                    "Primary accent line always visible at top",
                                ].map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-6 h-6 bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                            <i className="fa-duotone fa-regular fa-check text-secondary text-xs" />
                                        </div>
                                        <span className="text-sm opacity-80">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-neutral-content/5 p-10">
                            <div className="space-y-4">
                                <div className="h-3 bg-neutral-content/10 w-3/4" />
                                <div className="h-3 bg-neutral-content/10 w-full" />
                                <div className="h-3 bg-neutral-content/10 w-5/6" />
                                <div className="h-20 bg-neutral-content/5 mt-6" />
                                <div className="h-3 bg-neutral-content/10 w-2/3" />
                                <div className="h-3 bg-neutral-content/10 w-4/5" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Design notes section ────────────────────────── */}
            <section className="content-section py-24 bg-base-100 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Design Notes
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            Editorial details.
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    title: "Angular Geometry",
                                    body: "Square avatars, sharp card corners, and diagonal clip-paths reinforce the editorial aesthetic throughout every component.",
                                    icon: "fa-duotone fa-regular fa-diamond",
                                },
                                {
                                    title: "Typographic Scale",
                                    body: "Black weight headlines, semibold kickers with wide letter-spacing, and relaxed body text create clear reading hierarchy.",
                                    icon: "fa-duotone fa-regular fa-text",
                                },
                                {
                                    title: "Functional Color",
                                    body: "Primary for brand actions, secondary for informational context, accent for attention. No decorative color usage.",
                                    icon: "fa-duotone fa-regular fa-palette",
                                },
                                {
                                    title: "Progressive Disclosure",
                                    body: "Dropdown menus, search overlay, and user panel reveal content on demand without cluttering the navigation rail.",
                                    icon: "fa-duotone fa-regular fa-layer-group",
                                },
                            ].map((note) => (
                                <div key={note.title} className="flex gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <i
                                            className={`${note.icon} text-primary`}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base mb-1">
                                            {note.title}
                                        </h3>
                                        <p className="text-sm text-base-content/60 leading-relaxed">
                                            {note.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
