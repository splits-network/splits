"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Footer Data ─────────────────────────────────────────────────────────────

const footerSections = [
    {
        label: "PLATFORM",
        id: "MOD-PL",
        links: [
            { text: "Split-Fee Engine", href: "#" },
            { text: "Applicant Tracking", href: "#" },
            { text: "Network Routing", href: "#" },
            { text: "Analytics Core", href: "#" },
            { text: "AI Matching", href: "#" },
        ],
    },
    {
        label: "COMPANY",
        id: "MOD-CO",
        links: [
            { text: "About", href: "#" },
            { text: "Careers", href: "#" },
            { text: "Press", href: "#" },
            { text: "Contact", href: "#" },
            { text: "Partners", href: "#" },
        ],
    },
    {
        label: "RESOURCES",
        id: "MOD-RS",
        links: [
            { text: "Documentation", href: "#" },
            { text: "API Reference", href: "#" },
            { text: "Changelog", href: "#" },
            { text: "Status Page", href: "#" },
            { text: "Blog", href: "#" },
        ],
    },
    {
        label: "LEGAL",
        id: "MOD-LG",
        links: [
            { text: "Privacy Policy", href: "#" },
            { text: "Terms of Service", href: "#" },
            { text: "Cookie Policy", href: "#" },
            { text: "GDPR", href: "#" },
            { text: "Security", href: "#" },
        ],
    },
];

const socialLinks = [
    { icon: "fa-brands fa-linkedin-in", href: "#", label: "LinkedIn" },
    { icon: "fa-brands fa-x-twitter", href: "#", label: "X" },
    { icon: "fa-brands fa-github", href: "#", label: "GitHub" },
    { icon: "fa-brands fa-youtube", href: "#", label: "YouTube" },
];

const diagnostics = [
    { label: "Platform Status", value: "OPERATIONAL", status: "nominal" },
    { label: "API Latency", value: "< 45ms", status: "nominal" },
    { label: "Uptime (30d)", value: "99.97%", status: "nominal" },
    { label: "Active Users", value: "12,847", status: "nominal" },
];

const sampleContent = [
    {
        id: "DOC-001",
        title: "Getting Started with Split-Fee",
        description: "A comprehensive guide to setting up your first split-fee arrangement on the platform.",
        tag: "GUIDE",
    },
    {
        id: "DOC-002",
        title: "API Authentication",
        description: "Configure JWT-based authentication for secure API access to all platform services.",
        tag: "API",
    },
    {
        id: "DOC-003",
        title: "Recruiter Onboarding",
        description: "Step-by-step process for onboarding new recruiters into your organization network.",
        tag: "ONBOARDING",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FootersSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            // Sample content animation
            gsap.fromTo(
                ".bp-doc-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    stagger: 0.1,
                },
            );

            // Footer animations
            gsap.fromTo(
                ".bp-footer-newsletter",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".bp-footer",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".bp-footer-col",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: ".bp-footer-nav",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".bp-diag-row",
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    ease: "power3.out",
                    stagger: 0.06,
                    scrollTrigger: {
                        trigger: ".bp-footer-diagnostics",
                        start: "top 90%",
                    },
                },
            );

            gsap.fromTo(
                ".bp-footer-bottom",
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".bp-footer-bottom",
                        start: "top 95%",
                    },
                },
            );

            gsap.to(".bp-pulse-dot", {
                opacity: 0.3,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4]">
                {/* ══════════════════════════════════════════════════════════
                    SAMPLE CONTENT - Context above footer
                   ══════════════════════════════════════════════════════════ */}
                <div className="relative">
                    <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10 py-16">
                        <div className="mb-4">
                            <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-2">
                                // FOOTER SHOWCASE // INDUSTRIAL BLUEPRINT VARIANT
                            </div>
                            <div className="h-px bg-[#3b5ccc]/10 relative mb-8">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/30 rotate-45"></div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // DOCUMENTATION INDEX
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                Resource <span className="text-[#3b5ccc]">Library</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-px bg-[#3b5ccc]/10 mb-16">
                            {sampleContent.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="bp-doc-card bg-[#0a0e17] p-6 group relative opacity-0"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                            {doc.id}
                                        </span>
                                        <span className="font-mono text-[10px] text-[#14b8a6]/60 tracking-wider">
                                            [{doc.tag}]
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-2">
                                        {doc.title}
                                    </h3>
                                    <p className="text-xs text-[#c8ccd4]/40 leading-relaxed">
                                        {doc.description}
                                    </p>
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    FOOTER - Industrial Blueprint
                   ══════════════════════════════════════════════════════════ */}
                <footer className="bp-footer relative border-t border-[#3b5ccc]/10">
                    <div className="absolute inset-0 bp-grid-bg opacity-[0.03] pointer-events-none"></div>

                    {/* Newsletter Section */}
                    <div className="border-b border-[#3b5ccc]/10 relative z-10">
                        <div className="container mx-auto px-4 py-12">
                            <div className="bp-footer-newsletter max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6 opacity-0">
                                <div className="flex-1">
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-2">
                                        // SUBSCRIBE TO DISPATCHES
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        System Updates &amp; Intelligence
                                    </h3>
                                    <p className="text-xs text-[#c8ccd4]/40">
                                        Platform updates, industry analysis, and recruiting infrastructure insights. Monthly.
                                    </p>
                                </div>
                                <div className="flex gap-px w-full md:w-auto">
                                    <input
                                        type="email"
                                        placeholder="OPERATOR@EMAIL.COM"
                                        className="bg-[#0d1220] border border-[#3b5ccc]/20 border-r-0 text-[#c8ccd4] font-mono text-xs px-4 py-3 w-full md:w-64 focus:outline-none focus:border-[#3b5ccc]/50 placeholder:text-[#c8ccd4]/15 tracking-wider"
                                    />
                                    <button className="px-6 py-3 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc] flex-shrink-0">
                                        SUBSCRIBE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Grid */}
                    <div className="bp-footer-nav border-b border-[#3b5ccc]/10 relative z-10">
                        <div className="container mx-auto px-4 py-12">
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
                                {/* Brand column */}
                                <div className="bp-footer-col col-span-2 lg:col-span-1 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 border-2 border-[#3b5ccc] flex items-center justify-center">
                                            <span className="font-mono text-sm font-bold text-[#3b5ccc]">
                                                SN
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-mono text-xs font-bold text-white tracking-wider">
                                                SPLITS NETWORK
                                            </div>
                                            <div className="font-mono text-[8px] text-[#3b5ccc]/50 tracking-[0.2em]">
                                                EST. 2024
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#c8ccd4]/30 leading-relaxed mb-6 max-w-[200px]">
                                        Precision-engineered recruiting infrastructure for the connected era.
                                    </p>

                                    {/* Social links */}
                                    <div className="flex gap-2">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                aria-label={social.label}
                                                className="w-8 h-8 border border-[#3b5ccc]/20 flex items-center justify-center text-[#c8ccd4]/30 hover:text-[#3b5ccc] hover:border-[#3b5ccc]/40 transition-colors"
                                            >
                                                <i className={`${social.icon} text-xs`}></i>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Link columns */}
                                {footerSections.map((section) => (
                                    <div
                                        key={section.label}
                                        className="bp-footer-col opacity-0"
                                    >
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest mb-1">
                                            {section.id}
                                        </div>
                                        <div className="font-mono text-[11px] text-white tracking-widest mb-4">
                                            {section.label}
                                        </div>
                                        <div className="space-y-2.5">
                                            {section.links.map((link) => (
                                                <a
                                                    key={link.text}
                                                    href={link.href}
                                                    className="block font-mono text-[11px] text-[#c8ccd4]/40 hover:text-white tracking-wider transition-colors"
                                                >
                                                    <span className="text-[#3b5ccc]/30 mr-1.5">--</span>
                                                    {link.text}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Diagnostics strip */}
                    <div className="bp-footer-diagnostics border-b border-[#3b5ccc]/10 relative z-10">
                        <div className="container mx-auto px-4 py-6">
                            <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest mb-3">
                                // SYSTEM DIAGNOSTICS
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#3b5ccc]/10">
                                {diagnostics.map((diag) => (
                                    <div
                                        key={diag.label}
                                        className="bp-diag-row bg-[#0a0e17] px-4 py-3 flex items-center justify-between opacity-0"
                                    >
                                        <span className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider">
                                            {diag.label}
                                        </span>
                                        <span className="font-mono text-[10px] text-[#22c55e] tracking-wider">
                                            {diag.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="bp-footer-bottom relative z-10 opacity-0">
                        <div className="container mx-auto px-4 py-5">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4 font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">
                                    <span>
                                        &copy; 2026 EMPLOYMENT NETWORKS INC.
                                    </span>
                                    <span className="hidden md:inline text-[#3b5ccc]/20">|</span>
                                    <span>ALL RIGHTS RESERVED</span>
                                </div>

                                <div className="flex items-center gap-4 font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">
                                    <span>REF: SN-FTR07-2026</span>
                                    <span className="text-[#3b5ccc]/20">|</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                                        ALL SYSTEMS OPERATIONAL
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
