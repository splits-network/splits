"use client";

import Link from "next/link";
import { HeaderLogo } from "@splits-network/memphis-ui";

// ─── Footer Links Data ──────────────────────────────────────────────────────
const PRODUCT_LINKS = [
    { label: "Splits Network", href: "https://splits.network", icon: "fa-duotone fa-regular fa-handshake" },
    { label: "Applicant Network", href: "https://applicant.network", icon: "fa-duotone fa-regular fa-user-check" },
];

const COMPANY_LINKS = [
    { label: "About Us", href: "#about", icon: "fa-duotone fa-regular fa-building" },
    { label: "Contact", href: "/contact", icon: "fa-duotone fa-regular fa-envelope" },
    { label: "System Status", href: "/status", icon: "fa-duotone fa-regular fa-heartbeat" },
];

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/privacy-policy", icon: "fa-duotone fa-regular fa-shield-check" },
    { label: "Terms of Service", href: "/terms-of-service", icon: "fa-duotone fa-regular fa-file-contract" },
    { label: "Cookie Policy", href: "/cookie-policy", icon: "fa-duotone fa-regular fa-cookie-bite" },
];

const SOCIAL_LINKS = [
    { label: "Twitter", href: "https://twitter.com", icon: "fa-brands fa-twitter" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "fa-brands fa-linkedin" },
    { label: "Facebook", href: "https://facebook.com", icon: "fa-brands fa-facebook" },
    { label: "Instagram", href: "https://instagram.com", icon: "fa-brands fa-instagram" },
];

// ─── Footer Component ───────────────────────────────────────────────────────
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-dark overflow-hidden">
            {/* Memphis decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="absolute top-8 right-[15%] w-12 h-12 rounded-full border-4 border-coral" />
                <div className="absolute top-24 right-[8%] w-8 h-8 rotate-45 bg-teal" />
                <div className="absolute bottom-12 left-[20%] w-6 h-6 bg-yellow" />
                <div className="absolute top-16 left-[30%] w-10 h-10 rounded-full border-4 border-purple" />
                <svg className="absolute bottom-20 right-[40%]" width="60" height="20" viewBox="0 0 60 20">
                    <polyline points="0,15 8,5 16,15 24,5 32,15 40,5 48,15 56,5"
                        fill="none" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            {/* Main footer content */}
            <div className="relative z-10 border-t-4 border-coral">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div>
                            <div className="mb-4">
                                <HeaderLogo brand="employment" size="md" variant="light" />
                            </div>
                            <p className="text-xs font-medium text-white/60 leading-relaxed max-w-xs">
                                Building the future of recruiting through innovative split-fee collaboration.
                            </p>
                        </div>

                        {/* Products Column */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-coral mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-coral" />
                                Products
                            </h3>
                            <nav className="space-y-2">
                                {PRODUCT_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-2 text-xs font-bold text-white/70 hover:text-teal transition-colors"
                                    >
                                        <i className={`${link.icon} text-[9px] text-teal group-hover:scale-110 transition-transform`}></i>
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-teal mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-teal" />
                                Company
                            </h3>
                            <nav className="space-y-2">
                                {COMPANY_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group flex items-center gap-2 text-xs font-bold text-white/70 hover:text-yellow transition-colors"
                                    >
                                        <i className={`${link.icon} text-[9px] text-yellow group-hover:scale-110 transition-transform`}></i>
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Legal Column */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-yellow mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow" />
                                Legal
                            </h3>
                            <nav className="space-y-2">
                                {LEGAL_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group flex items-center gap-2 text-xs font-bold text-white/70 hover:text-purple transition-colors"
                                    >
                                        <i className={`${link.icon} text-[9px] text-purple group-hover:scale-110 transition-transform`}></i>
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t-4 border-dark-lighter">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Copyright */}
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                                © {currentYear} Employment Networks, Inc.
                            </p>

                            {/* Social Links */}
                            <div className="flex items-center gap-3">
                                {SOCIAL_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.label}
                                        className="w-10 h-10 flex items-center justify-center border-4 border-white/20 hover:border-coral hover:bg-coral/10 hover:-translate-y-0.5 transition-all"
                                    >
                                        <i className={`${link.icon} text-sm text-white/60 hover:text-coral transition-colors`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
