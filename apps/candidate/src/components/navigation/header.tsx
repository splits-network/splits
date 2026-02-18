"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { HeaderLogo } from "@splits-network/memphis-ui";
import UserDropdown from "./user-dropdown";
import NotificationBell from "./notification-bell";

// ─── Nav Data ───────────────────────────────────────────────────────────────

const RESOURCE_LINKS = [
    {
        name: "Career Guides",
        href: "/public/resources/career-guides",
        icon: "fa-book",
        color: "coral",
    },
    {
        name: "Salary Insights",
        href: "/public/resources/salary-insights",
        icon: "fa-chart-line",
        color: "teal",
    },
    {
        name: "Interview Prep",
        href: "/public/resources/interview-prep",
        icon: "fa-user-tie",
        color: "yellow",
    },
    {
        name: "Success Stories",
        href: "/public/resources/success-stories",
        icon: "fa-star",
        color: "purple",
    },
    {
        name: "Resume Tips",
        href: "/public/resources/resume-tips",
        icon: "fa-file-alt",
        color: "coral",
    },
    {
        name: "Industry Trends",
        href: "/public/resources/industry-trends",
        icon: "fa-display-chart-up",
        color: "teal",
    },
];

const COMPANY_LINKS = [
    {
        name: "Browse All Companies",
        href: "/public/companies",
        icon: "fa-building",
    },
    {
        name: "Featured Employers",
        href: "/public/companies/featured",
        icon: "fa-crown",
    },
    {
        name: "Company Reviews",
        href: "/public/companies/reviews",
        icon: "fa-star",
    },
];

// ─── Memphis Header Component ──────────────────────────────────────────────

export default function Header() {
    const { isSignedIn } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Close dropdowns when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            if (
                headerRef.current &&
                !headerRef.current.contains(e.target as Node)
            ) {
                setActiveDropdown(null);
                setMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    return (
        <header
            ref={headerRef}
            className="sticky top-0 z-50 bg-dark"
        >
            {/* Memphis decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-2 right-12 w-6 h-6 rounded-full border-4 border-teal" />
                <div className="absolute top-3 right-32 w-4 h-4 rotate-45 bg-yellow" />
                <div className="absolute bottom-2 left-[40%] w-3 h-3 bg-coral" />
            </div>

            {/* Top announcement bar */}
            <div className="relative z-10 border-b-4 border-dark-lighter">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-coral flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-rocket text-[8px]"></i>
                                Find Your Dream Job
                            </span>
                            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-handshake text-[8px]"></i>
                                Expert Recruiters
                            </span>
                        </div>
                        <Link
                            href="/public/status"
                            className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors"
                        >
                            System Status
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main header bar */}
            <div className="relative z-10 border-b-4 border-coral">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <HeaderLogo
                                brand="applicant"
                                size="md"
                                variant="light"
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-2">
                            <Link
                                href="/public/how-it-works"
                                className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 border-transparent hover:border-teal hover:bg-teal/10 hover:-translate-y-0.5 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-circle-info text-[9px] text-teal"></i>
                                How It Works
                            </Link>

                            <Link
                                href="/public/jobs"
                                className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 border-transparent hover:border-coral hover:bg-coral/10 hover:-translate-y-0.5 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase text-[9px] text-coral"></i>
                                Find Jobs
                            </Link>

                            {/* Resources Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("resources")}
                                    className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 transition-all ${
                                        activeDropdown === "resources"
                                            ? "border-yellow bg-yellow/10"
                                            : "border-transparent hover:border-yellow hover:bg-yellow/10"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-book-open text-[9px] text-yellow"></i>
                                    Resources
                                    <i
                                        className={`fa-duotone fa-regular fa-chevron-down text-[8px] transition-transform ${
                                            activeDropdown === "resources"
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    ></i>
                                </button>

                                {activeDropdown === "resources" && (
                                    <div className="absolute top-full left-0 mt-2 bg-dark border-4 border-yellow min-w-[500px]">
                                        <div className="grid grid-cols-2 gap-2 p-4">
                                            {RESOURCE_LINKS.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
                                                    className={`flex items-center gap-3 p-3 border-4 border-transparent hover:border-${link.color} hover:bg-${link.color}/10 transition-all`}
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular fa-${link.icon} text-sm text-${link.color}`}
                                                    ></i>
                                                    <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                                        {link.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/public/marketplace"
                                className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 border-transparent hover:border-purple hover:bg-purple/10 hover:-translate-y-0.5 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-users text-[9px] text-purple"></i>
                                Find a Recruiter
                            </Link>

                            {/* Companies Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("companies")}
                                    className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 transition-all ${
                                        activeDropdown === "companies"
                                            ? "border-teal bg-teal/10"
                                            : "border-transparent hover:border-teal hover:bg-teal/10"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-building text-[9px] text-teal"></i>
                                    Companies
                                    <i
                                        className={`fa-duotone fa-regular fa-chevron-down text-[8px] transition-transform ${
                                            activeDropdown === "companies"
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    ></i>
                                </button>

                                {activeDropdown === "companies" && (
                                    <div className="absolute top-full left-0 mt-2 bg-dark border-4 border-teal min-w-[300px]">
                                        <div className="p-4 space-y-2">
                                            {COMPANY_LINKS.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
                                                    className="flex items-center gap-3 p-3 border-4 border-transparent hover:border-teal hover:bg-teal/10 transition-all"
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular fa-${link.icon} text-sm text-teal`}
                                                    ></i>
                                                    <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                                        {link.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {isSignedIn ? (
                                <>
                                    <Link
                                        href="/portal/dashboard"
                                        className="hidden md:flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 border-teal hover:bg-teal hover:text-dark hover:-translate-y-0.5 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-gauge text-[9px]"></i>
                                        Dashboard
                                    </Link>
                                    <NotificationBell />
                                    <UserDropdown />
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-in"
                                        className="hidden md:flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-teal border-4 border-teal hover:bg-teal hover:text-dark hover:-translate-y-0.5 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[9px]"></i>
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        className="hidden md:flex items-center gap-2 px-5 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white bg-coral border-4 border-coral hover:-translate-y-0.5 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-bolt text-[9px]"></i>
                                        Get Started
                                    </Link>
                                </>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={`lg:hidden w-10 h-10 flex items-center justify-center border-4 transition-all ${
                                    menuOpen
                                        ? "border-teal bg-teal text-dark"
                                        : "border-coral bg-transparent text-coral"
                                }`}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${menuOpen ? "fa-xmark" : "fa-bars"} text-sm`}
                                ></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="lg:hidden relative z-10 bg-dark border-t-4 border-dark-lighter">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="space-y-2">
                            <Link
                                href="/public/how-it-works"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 border-4 border-transparent hover:border-teal hover:bg-teal/10 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-circle-info text-xs text-teal"></i>
                                <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                    How It Works
                                </span>
                            </Link>

                            <Link
                                href="/public/jobs"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 border-4 border-transparent hover:border-coral hover:bg-coral/10 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase text-xs text-coral"></i>
                                <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                    Find Jobs
                                </span>
                            </Link>

                            <Link
                                href="/public/marketplace"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 border-4 border-transparent hover:border-purple hover:bg-purple/10 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-users text-xs text-purple"></i>
                                <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                    Find a Recruiter
                                </span>
                            </Link>

                            {isSignedIn && (
                                <>
                                    <div className="border-t-4 border-dark-lighter my-4" />
                                    <Link
                                        href="/portal/dashboard"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 border-4 border-transparent hover:border-teal hover:bg-teal/10 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-gauge text-xs text-teal"></i>
                                        <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                            Dashboard
                                        </span>
                                    </Link>
                                    <Link
                                        href="/portal/applications"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 border-4 border-transparent hover:border-coral hover:bg-coral/10 transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-file-lines text-xs text-coral"></i>
                                        <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                            Applications
                                        </span>
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Mobile CTAs */}
                        {!isSignedIn && (
                            <div className="space-y-2 pt-4 border-t-4 border-dark-lighter mt-4">
                                <Link
                                    href="/sign-up"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] text-white bg-coral border-4 border-coral"
                                >
                                    <i className="fa-duotone fa-regular fa-bolt text-[10px]"></i>
                                    Get Started
                                </Link>
                                <Link
                                    href="/sign-in"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] text-teal border-4 border-teal"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[10px]"></i>
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
