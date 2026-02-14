"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.35, normal: 0.6, slow: 0.9 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };
const S = { tight: 0.06, normal: 0.1 };

// ── Data ─────────────────────────────────────────────────────────────────────

const footerSections = [
    {
        title: "Platform",
        links: [
            { label: "Split-Fee Marketplace", href: "#" },
            { label: "Applicant Tracking", href: "#" },
            { label: "Analytics Dashboard", href: "#" },
            { label: "Smart Matching", href: "#" },
            { label: "API Access", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Press Kit", href: "#" },
            { label: "Partners", href: "#" },
            { label: "Contact", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "#" },
            { label: "Help Center", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Community", href: "#" },
            { label: "Status Page", href: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "Cookie Policy", href: "#" },
            { label: "GDPR", href: "#" },
            { label: "Security", href: "#" },
        ],
    },
];

const socialLinks = [
    { icon: "fa-brands fa-x-twitter", label: "Twitter", href: "#" },
    { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "#" },
    { icon: "fa-brands fa-github", label: "GitHub", href: "#" },
    { icon: "fa-brands fa-youtube", label: "YouTube", href: "#" },
];

const platformStats = [
    { value: "10K+", label: "Active Listings" },
    { value: "2K+", label: "Recruiters" },
    { value: "500+", label: "Companies" },
    { value: "95%", label: "Response Rate" },
];

// ── Footer Component: Full ───────────────────────────────────────────────────

function SwissFooterFull() {
    const [email, setEmail] = useState("");

    return (
        <footer className="bg-neutral text-neutral-content">
            {/* Top accent */}
            <div className="h-[2px] bg-neutral-content/20" />

            {/* Newsletter + Stats row */}
            <div className="border-b border-neutral-content/10">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 lg:py-16">
                        {/* Newsletter */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-content/30 mb-3">
                                Newsletter
                            </p>
                            <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                Stay in the loop.
                            </h3>
                            <p className="text-sm text-neutral-content/40 mb-6 max-w-sm leading-relaxed">
                                Weekly insights on recruiting trends, platform updates,
                                and marketplace opportunities.
                            </p>
                            <div className="flex gap-[2px]">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 bg-neutral-content/5 border border-neutral-content/10 px-4 py-3 text-sm text-neutral-content placeholder:text-neutral-content/20 focus:outline-none focus:border-neutral-content/30 transition-colors duration-200"
                                />
                                <button className="bg-neutral-content text-neutral px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-neutral-content/90 transition-colors duration-200">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-[2px] bg-neutral-content/5 self-end">
                            {platformStats.map((stat, i) => (
                                <div key={i} className="bg-neutral p-5">
                                    <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
                                    <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-content/30 mt-1">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation grid */}
            <div className="border-b border-neutral-content/10">
                <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                        {footerSections.map((section, i) => (
                            <div key={i}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-content/30 mb-5">
                                    {section.title}
                                </p>
                                <ul className="space-y-3">
                                    {section.links.map((link, j) => (
                                        <li key={j}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors duration-200"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                    {/* Logo + copyright */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-neutral-content/10 border border-neutral-content/10 flex items-center justify-center">
                            <span className="text-[9px] font-black text-neutral-content/40">SN</span>
                        </div>
                        <span className="text-[10px] text-neutral-content/30 tracking-wider">
                            &copy; {new Date().getFullYear()} Employment Networks. All rights reserved.
                        </span>
                    </div>

                    {/* Social links */}
                    <div className="flex items-center gap-2">
                        {socialLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                aria-label={link.label}
                                className="w-8 h-8 border border-neutral-content/10 flex items-center justify-center text-neutral-content/30 hover:text-neutral-content hover:border-neutral-content/30 transition-all duration-200"
                            >
                                <i className={`${link.icon} text-xs`} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Footer Component: Compact ────────────────────────────────────────────────

function SwissFooterCompact() {
    return (
        <footer className="bg-base-100 text-base-content border-t-2 border-neutral">
            <div className="container mx-auto px-6 lg:px-12 py-10 lg:py-12">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    {/* Brand column */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-neutral flex items-center justify-center">
                                <span className="text-xs font-black text-neutral-content">SN</span>
                            </div>
                            <div>
                                <div className="text-sm font-black tracking-tight leading-none">Splits Network</div>
                                <div className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 leading-none mt-0.5">
                                    Employment Networks
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-base-content/40 leading-relaxed max-w-xs mb-4">
                            The split-fee recruiting marketplace connecting recruiters,
                            companies, and candidates.
                        </p>
                        <div className="flex items-center gap-2">
                            {socialLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.href}
                                    aria-label={link.label}
                                    className="w-7 h-7 border border-neutral/10 flex items-center justify-center text-base-content/20 hover:text-base-content hover:border-neutral transition-all duration-200"
                                >
                                    <i className={`${link.icon} text-[10px]`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    {footerSections.slice(0, 3).map((section, i) => (
                        <div key={i} className="col-span-6 sm:col-span-4 lg:col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/30 mb-4">
                                {section.title}
                            </p>
                            <ul className="space-y-2">
                                {section.links.slice(0, 4).map((link, j) => (
                                    <li key={j}>
                                        <a
                                            href={link.href}
                                            className="text-xs text-base-content/40 hover:text-base-content transition-colors duration-200"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Legal column */}
                    <div className="col-span-6 sm:col-span-4 lg:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/30 mb-4">
                            Legal
                        </p>
                        <ul className="space-y-2">
                            {footerSections[3].links.slice(0, 4).map((link, j) => (
                                <li key={j}>
                                    <a
                                        href={link.href}
                                        className="text-xs text-base-content/40 hover:text-base-content transition-colors duration-200"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom line */}
            <div className="border-t border-neutral/10">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between py-4">
                        <span className="text-[10px] text-base-content/25 tracking-wider">
                            &copy; {new Date().getFullYear()} Employment Networks
                        </span>
                        <span className="text-[10px] text-base-content/25 tracking-wider">
                            Built with precision.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Footer Component: Minimal ────────────────────────────────────────────────

function SwissFooterMinimal() {
    return (
        <footer className="bg-base-100 text-base-content">
            <div className="h-[2px] bg-neutral" />
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
                    <div className="flex items-center gap-6">
                        <div className="w-6 h-6 bg-neutral flex items-center justify-center">
                            <span className="text-[8px] font-black text-neutral-content">S</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {["Privacy", "Terms", "Status", "Contact"].map((item, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/30 hover:text-base-content transition-colors duration-200"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <span className="text-[10px] text-base-content/25 tracking-wider">
                        &copy; {new Date().getFullYear()} Employment Networks
                    </span>
                </div>
            </div>
        </footer>
    );
}

// ── Footer Component: CTA Banner ─────────────────────────────────────────────

function SwissFooterCTA() {
    const [email, setEmail] = useState("");

    return (
        <footer className="bg-neutral text-neutral-content">
            <div className="h-[2px] bg-neutral-content/20" />

            {/* CTA Section */}
            <div className="border-b border-neutral-content/10">
                <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
                    <div className="grid grid-cols-12 gap-6 items-end">
                        <div className="col-span-12 lg:col-span-4">
                            <div className="text-[6rem] lg:text-[8rem] font-black leading-none tracking-tighter text-neutral-content/5 select-none">
                                GO
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-8">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-content/30 mb-3">
                                Get Started
                            </p>
                            <h3 className="text-3xl lg:text-5xl font-black tracking-tight leading-[0.9] mb-6">
                                Ready to transform
                                <br />
                                how you recruit?
                            </h3>
                            <div className="h-[2px] bg-neutral-content/10 mb-6 max-w-xs" />
                            <div className="flex flex-wrap gap-3 mb-8">
                                <a href="#" className="bg-neutral-content text-neutral px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-neutral-content/90 transition-colors duration-200">
                                    <i className="fa-duotone fa-regular fa-user-tie mr-2" />
                                    Join as Recruiter
                                </a>
                                <a href="#" className="border border-neutral-content/30 text-neutral-content px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-neutral-content/10 transition-colors duration-200">
                                    <i className="fa-duotone fa-regular fa-building mr-2" />
                                    Post a Role
                                </a>
                            </div>
                            {/* Inline newsletter */}
                            <div className="flex gap-[2px] max-w-md">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="or subscribe for updates..."
                                    className="flex-1 bg-neutral-content/5 border border-neutral-content/10 px-4 py-2.5 text-xs text-neutral-content placeholder:text-neutral-content/20 focus:outline-none focus:border-neutral-content/30 transition-colors duration-200"
                                />
                                <button className="bg-neutral-content/10 border border-neutral-content/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-content/50 hover:text-neutral-content hover:bg-neutral-content/20 transition-colors duration-200">
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact nav + copyright */}
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-neutral-content/10 flex items-center justify-center">
                            <span className="text-[9px] font-black text-neutral-content/30">SN</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {["Platform", "Company", "Resources", "Legal"].map((item, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-content/25 hover:text-neutral-content/60 transition-colors duration-200"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {socialLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.href}
                                    aria-label={link.label}
                                    className="text-neutral-content/20 hover:text-neutral-content/60 transition-colors duration-200"
                                >
                                    <i className={`${link.icon} text-xs`} />
                                </a>
                            ))}
                        </div>
                        <span className="text-[10px] text-neutral-content/20 tracking-wider">
                            &copy; {new Date().getFullYear()}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FootersThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: E.precise } });

            tl.fromTo(
                $1(".page-number"),
                { opacity: 0, y: 60, skewY: 5 },
                { opacity: 1, y: 0, skewY: 0, duration: D.slow },
            );

            tl.fromTo(
                $1(".page-headline"),
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: D.normal },
                "-=0.4",
            );

            tl.fromTo(
                $1(".page-divider"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.normal, transformOrigin: "left center" },
                "-=0.3",
            );

            $(".showcase-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.normal, ease: E.precise,
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content">
            {/* Page title */}
            <section className="border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12 pt-20 pb-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end mb-6">
                        <div className="col-span-12 lg:col-span-3">
                            <div className="page-number opacity-0 text-[6rem] sm:text-[8rem] lg:text-[10rem] font-black leading-none tracking-tighter text-neutral/10 select-none">
                                03
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-9 pb-2">
                            <div className="page-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-2">
                                    Component Showcase
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">
                                    Footer
                                    <br />
                                    Variations
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="page-divider h-[2px] bg-neutral" style={{ transformOrigin: "left center" }} />
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 1 - Full Footer (Dark)
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">01</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Complete</p>
                            <h2 className="text-2xl font-black tracking-tight">Full Footer</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral overflow-hidden">
                        {/* Sample content above */}
                        <div className="bg-base-100 p-8 lg:p-12">
                            <div className="max-w-2xl">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 mb-3">
                                    Page Content Area
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                    Content flows naturally
                                    <br />
                                    into the footer below.
                                </h3>
                                <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                                    The full footer provides comprehensive navigation,
                                    newsletter signup, and platform statistics in a
                                    structured Swiss grid layout.
                                </p>
                            </div>
                        </div>

                        <SwissFooterFull />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 2 - Compact (Light)
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">02</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Standard</p>
                            <h2 className="text-2xl font-black tracking-tight">Compact Footer</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral/10 overflow-hidden">
                        <div className="bg-base-100 p-8 lg:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] bg-neutral/10">
                                {[
                                    { num: "01", title: "Marketplace", desc: "Connect with verified recruiters and companies." },
                                    { num: "02", title: "Pipeline", desc: "Track candidates through every stage." },
                                    { num: "03", title: "Analytics", desc: "Data-driven recruiting decisions." },
                                ].map((item, i) => (
                                    <div key={i} className="bg-base-100 p-6">
                                        <span className="text-lg font-black tracking-tighter text-base-content/10 block mb-2">{item.num}</span>
                                        <h4 className="text-sm font-black tracking-tight mb-2">{item.title}</h4>
                                        <p className="text-xs text-base-content/40 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <SwissFooterCompact />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 3 - Minimal
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">03</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Reduced</p>
                            <h2 className="text-2xl font-black tracking-tight">Minimal Footer</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral/10 overflow-hidden">
                        <div className="bg-base-100 p-8 lg:p-12">
                            <div className="max-w-2xl">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 mb-3">
                                    Minimal Context
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                    Sometimes less is everything.
                                </h3>
                                <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                                    A single-line footer for pages where content is king
                                    and navigation is secondary.
                                </p>
                            </div>
                        </div>

                        <SwissFooterMinimal />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                VARIANT 4 - CTA Banner Footer
               ════════════════════════════════════════════════════════ */}
            <section className="showcase-section opacity-0 py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-5xl lg:text-7xl font-black tracking-tighter text-neutral/10">04</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">Conversion</p>
                            <h2 className="text-2xl font-black tracking-tight">CTA Banner Footer</h2>
                        </div>
                    </div>

                    <div className="border-2 border-neutral overflow-hidden">
                        <div className="bg-base-100 p-8 lg:p-12">
                            <div className="max-w-2xl">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 mb-3">
                                    Landing Page Context
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-4 leading-[0.95]">
                                    The footer as a final
                                    <br />
                                    conversion opportunity.
                                </h3>
                                <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                                    Combines a strong call-to-action with newsletter signup
                                    and compact navigation. Designed for landing pages
                                    that end with purpose.
                                </p>
                            </div>
                        </div>

                        <SwissFooterCTA />
                    </div>
                </div>
            </section>
        </div>
    );
}
