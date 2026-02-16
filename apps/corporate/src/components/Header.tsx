"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@splits-network/memphis-ui";
import { HeaderLogo } from "@splits-network/memphis-ui";

// ─── Nav Links Data ─────────────────────────────────────────────────────────
const NAV_LINKS = [
    { label: "For Recruiters", href: "#for-recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
    { label: "For Candidates", href: "#for-candidates", icon: "fa-duotone fa-regular fa-user" },
    { label: "For Companies", href: "#for-companies", icon: "fa-duotone fa-regular fa-building" },
    { label: "Contact", href: "#contact", icon: "fa-duotone fa-regular fa-envelope" },
];

// ─── Header Component ───────────────────────────────────────────────────────
export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            setMenuOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-dark overflow-hidden">
            {/* Memphis decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-2 right-12 w-6 h-6 rounded-full border-4 border-teal" />
                <div className="absolute top-3 right-32 w-4 h-4 rotate-45 bg-yellow" />
                <div className="absolute bottom-2 left-[40%] w-3 h-3 bg-coral" />
                <svg className="absolute top-1 left-[30%]" width="40" height="10" viewBox="0 0 40 10">
                    <polyline points="0,8 6,2 12,8 18,2 24,8 30,2 36,8"
                        fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            {/* Top announcement bar */}
            <div className="relative z-10 border-b-4 border-dark-lighter">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-coral flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-rocket text-[8px]"></i>
                                Join Free Today
                            </span>
                            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-handshake text-[8px]"></i>
                                Split-Fee Network
                            </span>
                        </div>
                        <a href="/status" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors">
                            System Status
                        </a>
                    </div>
                </div>
            </div>

            {/* Main header bar */}
            <div className="relative z-10 border-b-4 border-coral">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <HeaderLogo brand="employment" size="md" variant="light" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleSmoothScroll(e, link.href)}
                                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white border-4 border-transparent hover:border-coral hover:bg-coral/10 hover:-translate-y-0.5 transition-all"
                                >
                                    <i className={`${link.icon} text-[9px] text-coral`}></i>
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Desktop CTAs */}
                            <a
                                href="https://splits.network"
                                className="hidden md:flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-teal border-4 border-teal hover:bg-teal hover:text-dark hover:-translate-y-0.5 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[9px]"></i>
                                Sign In
                            </a>

                            <a
                                href="https://applicant.network"
                                className="hidden md:flex items-center gap-2 px-5 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white bg-coral border-4 border-coral hover:-translate-y-0.5 transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-bolt text-[9px]"></i>
                                Find Jobs
                            </a>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={`lg:hidden w-10 h-10 flex items-center justify-center border-4 transition-all ${
                                    menuOpen
                                        ? "border-teal bg-teal text-dark"
                                        : "border-coral bg-transparent text-coral"
                                }`}
                            >
                                <i className={`fa-duotone fa-regular ${menuOpen ? "fa-xmark" : "fa-bars"} text-sm`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="lg:hidden relative z-10 bg-dark border-t-4 border-dark-lighter">
                    <div className="container mx-auto px-4 py-4">
                        {/* Mobile nav links */}
                        <nav className="space-y-2 mb-4">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleSmoothScroll(e, link.href)}
                                    className="flex items-center gap-3 px-4 py-3 border-4 border-transparent hover:border-coral hover:bg-coral/10 transition-all"
                                >
                                    <i className={`${link.icon} text-xs text-coral`}></i>
                                    <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                        {link.label}
                                    </span>
                                </a>
                            ))}
                        </nav>

                        {/* Mobile CTAs */}
                        <div className="space-y-2 pt-4 border-t-4 border-dark-lighter">
                            <a
                                href="https://applicant.network"
                                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] text-white bg-coral border-4 border-coral"
                            >
                                <i className="fa-duotone fa-regular fa-bolt text-[10px]"></i>
                                Find Jobs
                            </a>
                            <a
                                href="https://splits.network"
                                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] text-teal border-4 border-teal"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[10px]"></i>
                                Sign In
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
