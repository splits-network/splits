"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Constants ──────────────────────────────────────────────────────────────
const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)" };

const FOOTER_COLUMNS = [
    {
        title: "Platform",
        links: [
            { label: "Overview", href: "#" },
            { label: "Split-Fee Marketplace", href: "#" },
            { label: "Built-in ATS", href: "#" },
            { label: "Analytics Engine", href: "#" },
            { label: "AI Matching", href: "#" },
            { label: "Integrations", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Press", href: "#" },
            { label: "Partners", href: "#" },
            { label: "Contact", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "#" },
            { label: "API Reference", href: "#" },
            { label: "Help Center", href: "#" },
            { label: "Case Studies", href: "#" },
            { label: "Webinars", href: "#" },
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
            { label: "Compliance", href: "#" },
        ],
    },
];

const SOCIAL_LINKS = [
    { icon: "fa-brands fa-linkedin-in", href: "#", label: "LinkedIn" },
    { icon: "fa-brands fa-x-twitter", href: "#", label: "X / Twitter" },
    { icon: "fa-brands fa-github", href: "#", label: "GitHub" },
    { icon: "fa-brands fa-youtube", href: "#", label: "YouTube" },
];

const CTA_CARDS = [
    {
        role: "Recruiters",
        icon: "fa-duotone fa-regular fa-hard-hat",
        sub: "Splits Network",
        desc: "Join the marketplace. Access curated roles with transparent splits.",
        cta: "Join Network",
    },
    {
        role: "Companies",
        icon: "fa-duotone fa-regular fa-compass-drafting",
        sub: "Splits Network",
        desc: "Post roles to a network of specialized recruiters. Pay on hire.",
        cta: "Post a Role",
    },
    {
        role: "Candidates",
        icon: "fa-duotone fa-regular fa-user-helmet-safety",
        sub: "Applicant Network",
        desc: "Get matched with expert recruiters. Track everything. Free forever.",
        cta: "Create Profile",
    },
];

const STATS = [
    { value: "10,000+", label: "Active Listings" },
    { value: "2,000+", label: "Recruiters" },
    { value: "500+", label: "Companies" },
    { value: "95%", label: "Response Rate" },
];

// ─── Page Component ─────────────────────────────────────────────────────────
export default function FootersEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Hero intro
            const tl = gsap.timeline({ defaults: { ease: E.smooth } });
            tl.fromTo(
                ".bp-ftr-hero-badge",
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: D.fast },
            );
            tl.fromTo(
                ".bp-ftr-hero-title",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-ftr-hero-sub",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.2",
            );

            // Sample content cards
            tl.fromTo(
                $(".bp-ftr-sample-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.build, stagger: 0.1, ease: E.bounce },
                "-=0.1",
            );

            // Footer CTA section
            gsap.fromTo(
                $1(".bp-ftr-cta-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-ftr-cta-section"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".bp-ftr-cta-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.build, ease: E.bounce, stagger: 0.12,
                    scrollTrigger: { trigger: $1(".bp-ftr-cta-section"), start: "top 80%" },
                },
            );

            // Footer main
            gsap.fromTo(
                $1(".bp-ftr-newsletter"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-ftr-main"), start: "top 85%" },
                },
            );
            gsap.fromTo(
                $(".bp-ftr-col"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: D.fast, stagger: 0.08, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-ftr-columns"), start: "top 85%" },
                },
            );
            gsap.fromTo(
                $(".bp-ftr-stat"),
                { opacity: 0, y: 15 },
                {
                    opacity: 1, y: 0, duration: D.fast, stagger: 0.06, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-ftr-stats"), start: "top 90%" },
                },
            );
            gsap.fromTo(
                $1(".bp-ftr-bottom"),
                { opacity: 0 },
                {
                    opacity: 1, duration: D.fast, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-ftr-bottom"), start: "top 95%" },
                },
            );
        },
        { scope: containerRef },
    );

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: "#0a1628" }}>
            {/* Blueprint grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Corner dimension marks */}
            <div className="fixed top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />

            {/* ══════════════════════════════════════════════════════════════
                SAMPLE CONTENT ABOVE FOOTER
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative z-10 py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
                <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <div className="bp-ftr-hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-compass-drafting text-xs" />
                            <span>FOOTER SHOWCASE // BLUEPRINT v8</span>
                        </div>

                        <h1 className="bp-ftr-hero-title text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 text-white opacity-0">
                            Blueprint-Grade{" "}
                            <span className="text-cyan-400">Footer</span>
                        </h1>

                        <p className="bp-ftr-hero-sub text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light opacity-0">
                            A comprehensive footer engineered with precision. Scroll down to see the
                            full footer structure with navigation, newsletter, social links, and more.
                        </p>
                    </div>

                    {/* Sample content cards */}
                    <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                        {[
                            {
                                icon: "fa-duotone fa-regular fa-handshake",
                                title: "Transparent Partnerships",
                                desc: "Every fee structure is visible upfront. No hidden costs, no surprises.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-chart-line-up",
                                title: "Data-Driven Decisions",
                                desc: "Real-time analytics help you optimize your recruiting pipeline.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-shield-check",
                                title: "Enterprise Security",
                                desc: "SOC 2 compliant with end-to-end encryption for all your data.",
                            },
                        ].map((card, i) => (
                            <div key={i} className="bp-ftr-sample-card group relative opacity-0">
                                <div
                                    className="absolute inset-0 rounded-xl translate-y-1 translate-x-1"
                                    style={{ backgroundColor: "rgba(34,211,238,0.03)" }}
                                />
                                <div
                                    className="relative rounded-xl p-6 border border-cyan-500/15 transition-all duration-200 group-hover:border-cyan-400/30 group-hover:-translate-y-0.5"
                                    style={{ backgroundColor: "#0f2847" }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30"
                                        style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                                    >
                                        <i className={`${card.icon} text-xl text-cyan-400`} />
                                    </div>
                                    <h3 className="font-bold text-white text-sm mb-2">{card.title}</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PRE-FOOTER CTA SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-ftr-cta-section relative z-10 py-20 overflow-hidden" style={{ backgroundColor: "#081220" }}>
                {/* Horizontal dashed lines */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-cyan-500/5"
                            style={{ top: `${(i + 1) * 20}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-4 lg:px-8 max-w-[1400px] relative z-10">
                    <div className="bp-ftr-cta-heading text-center mb-12 opacity-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                            Join the Ecosystem
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Break Ground?
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Whether you recruit, hire, or job search, the split-fee ecosystem
                            was precision-engineered for you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {CTA_CARDS.map((card, i) => (
                            <div
                                key={i}
                                className="bp-ftr-cta-card rounded-2xl p-6 border border-cyan-500/20 opacity-0"
                                style={{ backgroundColor: "#0f2847" }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center border border-cyan-500/30"
                                        style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                                    >
                                        <i className={`${card.icon} text-xl text-cyan-400`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{card.role}</div>
                                        <div className="text-xs text-cyan-400/50 font-mono">{card.sub}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-6">{card.desc}</p>
                                <a
                                    href="#"
                                    className="btn btn-sm w-full border-0 text-slate-900 font-semibold"
                                    style={{ backgroundColor: "#22d3ee" }}
                                >
                                    {card.cta}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOOTER - Blueprint Construction
               ══════════════════════════════════════════════════════════════ */}
            <footer className="bp-ftr-main relative z-10 overflow-hidden" style={{ backgroundColor: "#060e1a" }}>
                {/* Top accent line */}
                <div className="h-[2px] w-full" style={{ backgroundColor: "#22d3ee" }} />

                {/* Blueprint grid overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                {/* Corner dimension marks */}
                <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-cyan-500/15 pointer-events-none" />
                <div className="absolute top-6 right-6 w-10 h-10 border-r-2 border-t-2 border-cyan-500/15 pointer-events-none" />

                <div className="container mx-auto px-4 lg:px-8 max-w-[1400px] relative z-10">
                    {/* ── Newsletter + Logo Row ── */}
                    <div className="bp-ftr-newsletter py-12 border-b border-cyan-500/10 opacity-0">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                            {/* Logo + tagline */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-11 h-11 rounded-xl border border-cyan-500/30 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-network-wired text-cyan-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">Splits Network</div>
                                    <div className="font-mono text-[10px] text-cyan-500/40 tracking-wider uppercase">
                                        Precision-Engineered Recruiting
                                    </div>
                                </div>
                            </div>

                            {/* Newsletter signup */}
                            <div className="w-full lg:w-auto lg:min-w-[420px]">
                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-2">
                                    Blueprint Updates
                                </div>
                                {subscribed ? (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-cyan-500/20"
                                        style={{ backgroundColor: "rgba(34,211,238,0.05)" }}>
                                        <i className="fa-duotone fa-regular fa-circle-check text-cyan-400" />
                                        <span className="text-sm text-cyan-400">Subscribed. You will receive blueprint updates.</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/30 text-sm" />
                                            <input
                                                type="email"
                                                placeholder="architect@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                                                style={{ backgroundColor: "#0d1d33" }}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 rounded-lg text-sm text-slate-900 font-semibold flex items-center gap-2 flex-shrink-0"
                                            style={{ backgroundColor: "#22d3ee" }}
                                        >
                                            <i className="fa-duotone fa-regular fa-paper-plane text-xs" />
                                            Subscribe
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Navigation Columns ── */}
                    <div className="bp-ftr-columns py-12 border-b border-cyan-500/10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                            {FOOTER_COLUMNS.map((col, i) => (
                                <div key={i} className="bp-ftr-col opacity-0">
                                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/50 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22d3ee" }} />
                                        {col.title}
                                    </h3>
                                    <ul className="space-y-2.5">
                                        {col.links.map((link, j) => (
                                            <li key={j}>
                                                <a
                                                    href={link.href}
                                                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
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

                    {/* ── Stats Bar ── */}
                    <div className="bp-ftr-stats py-8 border-b border-cyan-500/10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(34,211,238,0.08)" }}>
                            {STATS.map((stat, i) => (
                                <div
                                    key={i}
                                    className="bp-ftr-stat px-4 py-5 text-center opacity-0"
                                    style={{ backgroundColor: "#060e1a" }}
                                >
                                    <div className="font-mono text-xl font-bold text-cyan-300 mb-1">{stat.value}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Bottom Bar: Social + Copyright ── */}
                    <div className="bp-ftr-bottom py-8 opacity-0">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Social links */}
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[9px] text-cyan-500/30 uppercase tracking-wider mr-2">
                                    Connect
                                </span>
                                {SOCIAL_LINKS.map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-9 h-9 rounded-lg border border-cyan-500/15 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
                                        style={{ backgroundColor: "rgba(34,211,238,0.03)" }}
                                    >
                                        <i className={`${social.icon} text-sm`} />
                                    </a>
                                ))}
                            </div>

                            {/* Copyright */}
                            <div className="flex items-center gap-4 text-center md:text-right">
                                <span className="text-xs text-slate-500">
                                    &copy; {new Date().getFullYear()} Employment Networks, Inc.
                                </span>
                                <span className="font-mono text-[8px] text-cyan-500/20">
                                    //
                                </span>
                                <span className="font-mono text-[10px] text-cyan-500/20 tracking-wider">
                                    Built with precision
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blueprint dimension lines at very bottom */}
                <div className="relative z-10 px-4 lg:px-8">
                    <div className="max-w-[1400px] mx-auto pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.08)" }} />
                            <span className="font-mono text-[8px] text-cyan-500/15 uppercase tracking-wider">
                                End of Document
                            </span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.08)" }} />
                        </div>
                    </div>
                </div>

                {/* Bottom corner marks */}
                <div className="absolute bottom-4 left-6 w-8 h-8 border-l-2 border-b-2 border-cyan-500/10 pointer-events-none" />
                <div className="absolute bottom-4 right-6 w-8 h-8 border-r-2 border-b-2 border-cyan-500/10 pointer-events-none" />
            </footer>
        </div>
    );
}
