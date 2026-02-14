"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

// ── Footer Data -------------------------------------------------------------

const footerSections = [
    {
        title: "Platform",
        ref: "NAV-01",
        links: [
            { label: "Dashboard", icon: "fa-chart-mixed" },
            { label: "Job Board", icon: "fa-briefcase" },
            { label: "Candidates", icon: "fa-users" },
            { label: "Recruiters", icon: "fa-user-tie" },
            { label: "Companies", icon: "fa-building" },
        ],
    },
    {
        title: "Network",
        ref: "NAV-02",
        links: [
            { label: "Split Fees", icon: "fa-handshake" },
            { label: "Assignments", icon: "fa-clipboard-list" },
            { label: "Proposals", icon: "fa-file-signature" },
            { label: "Placements", icon: "fa-badge-check" },
            { label: "Referrals", icon: "fa-share-nodes" },
        ],
    },
    {
        title: "Resources",
        ref: "NAV-03",
        links: [
            { label: "Documentation", icon: "fa-book" },
            { label: "API Reference", icon: "fa-code" },
            { label: "Help Center", icon: "fa-circle-question" },
            { label: "Blog", icon: "fa-pen-nib" },
            { label: "Status Page", icon: "fa-signal-bars" },
        ],
    },
    {
        title: "Company",
        ref: "NAV-04",
        links: [
            { label: "About Us", icon: "fa-info-circle" },
            { label: "Careers", icon: "fa-rocket" },
            { label: "Press", icon: "fa-newspaper" },
            { label: "Contact", icon: "fa-envelope" },
            { label: "Partners", icon: "fa-link" },
        ],
    },
];

const legalLinks = [
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
    "GDPR",
    "Accessibility",
];

const socialLinks = [
    { label: "LinkedIn", icon: "fa-linkedin", handle: "@splitsnetwork" },
    { label: "Twitter", icon: "fa-x-twitter", handle: "@splits_net" },
    { label: "GitHub", icon: "fa-github", handle: "splits-network" },
    { label: "Discord", icon: "fa-discord", handle: "Splits Community" },
];

const metrics = [
    { label: "Active Recruiters", value: "12,400+", ref: "MET-01" },
    { label: "Companies", value: "3,200+", ref: "MET-02" },
    { label: "Placements", value: "48,000+", ref: "MET-03" },
    { label: "Network Volume", value: "$2.1B+", ref: "MET-04" },
];

// ── Component ---------------------------------------------------------------

export default function FootersNinePage() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSubscribe = () => {
        if (!email.trim() || !email.includes("@")) return;
        setSubscribed(true);
        setEmail("");
    };

    // Initial load animation
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
            containerRef.current.querySelectorAll(".content-block"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
        );

        // Footer animation on scroll
        const footer = containerRef.current.querySelector(".footer-main");
        if (!footer) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        gsap.fromTo(
                            footer.querySelectorAll(".footer-section"),
                            { opacity: 0, y: 25 },
                            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power3.out" },
                        );
                        gsap.fromTo(
                            footer.querySelectorAll(".footer-metric"),
                            { opacity: 0, scale: 0.95 },
                            { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "power3.out", delay: 0.3 },
                        );
                        gsap.fromTo(
                            footer.querySelector(".footer-bottom"),
                            { opacity: 0 },
                            { opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.5 },
                        );
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.1 },
        );
        observer.observe(footer);

        return () => observer.disconnect();
    }, []);

    // ── Render ---------------------------------------------------------------
    return (
        <div ref={containerRef} className="min-h-screen bg-white flex flex-col">
            {/* Dotted grid background */}
            <div
                className="fixed inset-0 opacity-[0.06] pointer-events-none z-0"
                style={{
                    backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* ── SAMPLE PAGE CONTENT (above footer for context) ── */}
            <div className="relative z-10 flex-1">
                {/* Page header */}
                <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
                    <div className="content-block">
                        <div className="font-mono text-[10px] tracking-[0.3em] text-[#233876]/30 uppercase mb-4">
                            REF: FTR-09 // Footer Showcase // Clean Architecture
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-4 leading-tight">
                            Clean Architecture
                            <br />
                            <span className="text-[#233876]">Footer System</span>
                        </h1>
                        <p className="text-lg text-[#0f1b3d]/50 max-w-xl leading-relaxed">
                            The foundation of every page. Structured navigation, brand presence, and user trust -- built with architectural precision.
                        </p>
                    </div>
                </section>

                {/* Sample content cards */}
                <section className="max-w-7xl mx-auto px-6 pb-12">
                    <div className="content-block border-t border-dashed border-[#233876]/10 pt-10">
                        <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-6">
                            Footer Features
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    icon: "fa-sitemap",
                                    title: "Structured Navigation",
                                    desc: "Four organized sections with iconographic links and module references",
                                },
                                {
                                    icon: "fa-envelope-open-text",
                                    title: "Newsletter Signup",
                                    desc: "Inline subscription form with validation and confirmation state",
                                },
                                {
                                    icon: "fa-share-nodes",
                                    title: "Social Presence",
                                    desc: "Platform links with handles and hover interactions",
                                },
                                {
                                    icon: "fa-chart-simple",
                                    title: "Network Metrics",
                                    desc: "At-a-glance platform statistics with reference codes",
                                },
                                {
                                    icon: "fa-scale-balanced",
                                    title: "Legal Compliance",
                                    desc: "Privacy, terms, cookies, GDPR, and accessibility links",
                                },
                                {
                                    icon: "fa-layer-group",
                                    title: "Multi-tier Layout",
                                    desc: "Newsletter banner, navigation grid, metrics bar, and legal baseline",
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="content-block border-2 border-[#233876]/8 p-5 hover:border-[#233876]/20 transition-colors group"
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
                <section className="max-w-7xl mx-auto px-6 pb-16">
                    <div className="content-block border-2 border-[#233876]/8 p-6">
                        <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-6">
                            Technical Specifications
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Layout", value: "4-Tier Stacked" },
                                { label: "Sections", value: "4 Nav Columns" },
                                { label: "Newsletter", value: "Inline Form" },
                                { label: "Social", value: "4 Platforms" },
                                { label: "Legal", value: "5 Policy Links" },
                                { label: "Metrics", value: "4 KPI Cards" },
                                { label: "Animations", value: "Intersection Observer" },
                                { label: "Color System", value: "#233876 on White" },
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
                                FTR-09 // Clean Architecture // v9.0
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── FOOTER ───────────────────────────────────────── */}
            <footer className="footer-main relative z-10 bg-white border-t-2 border-[#233876]/10">
                {/* Newsletter Banner */}
                <div className="footer-section border-b border-dashed border-[#233876]/10">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-2">
                                    REF: NWS-01 // Stay Connected
                                </div>
                                <h3 className="text-xl font-bold text-[#0f1b3d] mb-1">
                                    Network Intelligence
                                </h3>
                                <p className="text-sm text-[#0f1b3d]/40 max-w-md">
                                    Weekly insights on recruiting trends, platform updates, and marketplace opportunities delivered to your inbox.
                                </p>
                            </div>
                            <div className="w-full md:w-auto">
                                {subscribed ? (
                                    <div className="flex items-center gap-3 px-5 py-3 border-2 border-emerald-300 bg-emerald-50">
                                        <i className="fa-duotone fa-regular fa-check text-emerald-600" />
                                        <div>
                                            <div className="text-sm font-medium text-emerald-700">
                                                Subscribed
                                            </div>
                                            <div className="font-mono text-[9px] text-emerald-600/50">
                                                Confirmation sent // Check inbox
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                                            placeholder="you@company.com"
                                            className="w-full md:w-[280px] px-4 py-3 bg-[#f7f8fa] border-2 border-[#233876]/10 border-r-0 font-mono text-sm text-[#0f1b3d] placeholder:text-[#233876]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                        />
                                        <button
                                            onClick={handleSubscribe}
                                            className="flex items-center gap-2 px-5 py-3 bg-[#233876] text-white font-mono text-xs tracking-wide hover:bg-[#1a2a5c] transition-colors whitespace-nowrap"
                                        >
                                            <i className="fa-duotone fa-regular fa-paper-plane text-[10px]" />
                                            Subscribe
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Footer Navigation */}
                <div className="footer-section">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {/* Brand column */}
                            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
                                <div className="flex items-center gap-3 mb-4">
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
                                <p className="text-xs text-[#0f1b3d]/40 leading-relaxed mb-5 max-w-[200px]">
                                    The split-fee recruiting marketplace connecting recruiters, companies, and candidates.
                                </p>

                                {/* Social links */}
                                <div className="space-y-2">
                                    {socialLinks.map((social) => (
                                        <button
                                            key={social.label}
                                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-[#233876]/5 transition-colors group"
                                        >
                                            <i className={`fa-brands ${social.icon} w-4 text-center text-sm text-[#233876]/30 group-hover:text-[#233876]`} />
                                            <span className="font-mono text-[10px] text-[#0f1b3d]/40 group-hover:text-[#233876] transition-colors">
                                                {social.handle}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation columns */}
                            {footerSections.map((section) => (
                                <div key={section.title}>
                                    <div className="mb-4">
                                        <div className="font-mono text-[8px] tracking-[0.2em] text-[#233876]/20 uppercase mb-1">
                                            {section.ref}
                                        </div>
                                        <h4 className="font-bold text-sm text-[#0f1b3d]">
                                            {section.title}
                                        </h4>
                                    </div>
                                    <ul className="space-y-1">
                                        {section.links.map((link) => (
                                            <li key={link.label}>
                                                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-[#0f1b3d]/40 hover:text-[#233876] hover:bg-[#233876]/5 transition-colors group">
                                                    <i className={`fa-duotone fa-regular ${link.icon} w-3.5 text-center text-[10px] text-[#233876]/20 group-hover:text-[#233876]/60`} />
                                                    {link.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="border-t border-dashed border-[#233876]/10">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {metrics.map((metric) => (
                                <div
                                    key={metric.ref}
                                    className="footer-metric border-2 border-[#233876]/6 p-4 hover:border-[#233876]/15 transition-colors"
                                >
                                    <div className="font-mono text-[8px] tracking-[0.2em] text-[#233876]/20 uppercase mb-1">
                                        {metric.ref}
                                    </div>
                                    <div className="text-lg font-bold text-[#0f1b3d] mb-0.5">
                                        {metric.value}
                                    </div>
                                    <div className="font-mono text-[10px] text-[#233876]/30">
                                        {metric.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom border-t-2 border-[#233876]/10 bg-[#f7f8fa]">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Copyright */}
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] text-[#233876]/30">
                                    &copy; {new Date().getFullYear()} Splits Network, Inc.
                                </span>
                                <span className="hidden md:inline text-[#233876]/15">
                                    //
                                </span>
                                <span className="hidden md:inline font-mono text-[9px] text-[#233876]/20">
                                    All rights reserved
                                </span>
                            </div>

                            {/* Legal links */}
                            <div className="flex flex-wrap items-center gap-1">
                                {legalLinks.map((link, i) => (
                                    <span key={link} className="flex items-center">
                                        <button className="px-2 py-1 font-mono text-[10px] text-[#233876]/30 hover:text-[#233876] hover:bg-[#233876]/5 transition-colors">
                                            {link}
                                        </button>
                                        {i < legalLinks.length - 1 && (
                                            <span className="text-[#233876]/10 text-xs">/</span>
                                        )}
                                    </span>
                                ))}
                            </div>

                            {/* System info */}
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-emerald-500" />
                                <span className="font-mono text-[9px] text-[#233876]/20 uppercase tracking-wider">
                                    v9.0 // Clean Architecture
                                </span>
                            </div>
                        </div>

                        {/* Blueprint reference line */}
                        <div className="border-t border-dashed border-[#233876]/8 mt-4 pt-3 flex items-center justify-between">
                            <span className="font-mono text-[8px] text-[#233876]/15 uppercase tracking-[0.3em]">
                                FTR-09 // Employment Networks // Splits Network Platform
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[#233876]/10" />
                                <span className="w-1 h-1 bg-[#233876]/15" />
                                <span className="w-1 h-1 bg-[#233876]/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
