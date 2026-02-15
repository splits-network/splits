"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

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
};
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };

// ─── Footer Data ────────────────────────────────────────────────────────────
const FOOTER_SECTIONS = [
    {
        title: "Platform",
        color: M.coral,
        icon: "fa-duotone fa-regular fa-grid-2",
        links: [
            { label: "ATS", icon: "fa-duotone fa-regular fa-briefcase" },
            { label: "Split-Fee Marketplace", icon: "fa-duotone fa-regular fa-handshake" },
            { label: "Analytics Dashboard", icon: "fa-duotone fa-regular fa-chart-mixed" },
            { label: "AI Matching", icon: "fa-duotone fa-regular fa-robot" },
            { label: "Messaging", icon: "fa-duotone fa-regular fa-messages" },
            { label: "Billing & Payouts", icon: "fa-duotone fa-regular fa-file-invoice-dollar" },
        ],
    },
    {
        title: "Network",
        color: M.teal,
        icon: "fa-duotone fa-regular fa-circle-nodes",
        links: [
            { label: "For Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
            { label: "For Companies", icon: "fa-duotone fa-regular fa-building" },
            { label: "For Candidates", icon: "fa-duotone fa-regular fa-user" },
            { label: "Browse Jobs", icon: "fa-duotone fa-regular fa-magnifying-glass" },
            { label: "Success Stories", icon: "fa-duotone fa-regular fa-star" },
            { label: "Partner Program", icon: "fa-duotone fa-regular fa-people-group" },
        ],
    },
    {
        title: "Resources",
        color: M.yellow,
        icon: "fa-duotone fa-regular fa-books",
        links: [
            { label: "Help Center", icon: "fa-duotone fa-regular fa-circle-question" },
            { label: "API Documentation", icon: "fa-duotone fa-regular fa-code" },
            { label: "Blog", icon: "fa-duotone fa-regular fa-newspaper" },
            { label: "Webinars", icon: "fa-duotone fa-regular fa-video" },
            { label: "Guides & Tutorials", icon: "fa-duotone fa-regular fa-book-open" },
            { label: "Status Page", icon: "fa-duotone fa-regular fa-signal-bars" },
        ],
    },
    {
        title: "Legal",
        color: M.purple,
        icon: "fa-duotone fa-regular fa-scale-balanced",
        links: [
            { label: "Privacy Policy", icon: "fa-duotone fa-regular fa-shield-halved" },
            { label: "Terms of Service", icon: "fa-duotone fa-regular fa-file-contract" },
            { label: "Cookie Policy", icon: "fa-duotone fa-regular fa-cookie-bite" },
            { label: "GDPR Compliance", icon: "fa-duotone fa-regular fa-lock" },
            { label: "Security", icon: "fa-duotone fa-regular fa-shield-check" },
        ],
    },
];

const SOCIAL_LINKS = [
    { icon: "fa-brands fa-x-twitter", color: M.coral, label: "Twitter" },
    { icon: "fa-brands fa-linkedin-in", color: M.teal, label: "LinkedIn" },
    { icon: "fa-brands fa-github", color: M.yellow, label: "GitHub" },
    { icon: "fa-brands fa-youtube", color: M.purple, label: "YouTube" },
    { icon: "fa-brands fa-discord", color: M.coral, label: "Discord" },
];

const SAMPLE_CONTENT = [
    {
        title: "Built for Modern Recruiting",
        text: "Every feature is designed around how recruiters actually work. No bloated enterprise nonsense. No features you will never use.",
        color: M.coral,
        icon: "fa-duotone fa-regular fa-rocket",
    },
    {
        title: "Transparent Split Fees",
        text: "Know exactly what you earn before you start. Our marketplace handles the math, the contracts, and the payouts.",
        color: M.teal,
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        title: "AI-Powered Matching",
        text: "Our algorithms learn what makes a great match. Better candidates for your roles, better roles for your candidates.",
        color: M.purple,
        icon: "fa-duotone fa-regular fa-brain-circuit",
    },
];

// ─── Memphis Footer Component ───────────────────────────────────────────────
function MemphisFooter() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    }

    return (
        <footer className="memphis-footer relative overflow-hidden" style={{ backgroundColor: M.navy }}>

            {/* Memphis geometric decorations scattered across the footer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Circles */}
                <div className="footer-shape absolute top-[8%] right-[6%] w-20 h-20 rounded-full border-[4px]"
                    style={{ borderColor: M.coral, opacity: 0 }} />
                <div className="footer-shape absolute top-[40%] left-[3%] w-12 h-12 rounded-full"
                    style={{ backgroundColor: M.teal, opacity: 0 }} />
                <div className="footer-shape absolute bottom-[25%] right-[12%] w-8 h-8 rounded-full"
                    style={{ backgroundColor: M.yellow, opacity: 0 }} />

                {/* Squares */}
                <div className="footer-shape absolute top-[15%] left-[8%] w-14 h-14 rotate-12 border-[3px]"
                    style={{ borderColor: M.purple, opacity: 0 }} />
                <div className="footer-shape absolute bottom-[35%] right-[25%] w-10 h-10 -rotate-6"
                    style={{ backgroundColor: M.coral, opacity: 0 }} />

                {/* Triangle */}
                <div className="footer-shape absolute top-[55%] left-[15%]"
                    style={{
                        width: 0, height: 0,
                        borderLeft: "18px solid transparent",
                        borderRight: "18px solid transparent",
                        borderBottom: `32px solid ${M.yellow}`,
                        opacity: 0,
                        transform: "rotate(-15deg)",
                    }} />

                {/* Zigzag */}
                <svg className="footer-shape absolute top-[30%] right-[35%]" width="80" height="25" viewBox="0 0 80 25" style={{ opacity: 0 }}>
                    <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20"
                        fill="none" stroke={M.teal} strokeWidth="2" strokeLinecap="round" />
                </svg>

                {/* Dots pattern */}
                <div className="footer-shape absolute bottom-[15%] left-[30%]" style={{ opacity: 0 }}>
                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: M.purple }} />
                        ))}
                    </div>
                </div>

                {/* Plus sign */}
                <svg className="footer-shape absolute top-[70%] left-[60%]" width="24" height="24" viewBox="0 0 24 24" style={{ opacity: 0 }}>
                    <line x1="12" y1="2" x2="12" y2="22" stroke={M.coral} strokeWidth="3" strokeLinecap="round" />
                    <line x1="2" y1="12" x2="22" y2="12" stroke={M.coral} strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            <div className="relative z-10">

                {/* ─── Newsletter Section ─── */}
                <div className="newsletter-section py-12 px-4 md:px-10"
                    style={{ borderBottom: `4px solid ${M.darkGray}` }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-block px-3 py-1 border-[3px] mb-4"
                                    style={{ borderColor: M.yellow }}>
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em]"
                                        style={{ color: M.yellow }}>
                                        <i className="fa-duotone fa-regular fa-envelope mr-1.5"></i>
                                        Stay Updated
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3"
                                    style={{ color: M.white }}>
                                    Get the <span style={{ color: M.yellow }}>Inside Track</span>
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                                    Weekly recruiting insights, platform updates, and marketplace tips. Join 5,000+ recruiters.
                                </p>
                            </div>

                            <div>
                                {subscribed ? (
                                    <div className="flex items-center gap-3 p-4 border-[3px]"
                                        style={{ borderColor: M.teal, backgroundColor: `${M.teal}10` }}>
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: M.teal }}>
                                            <i className="fa-duotone fa-regular fa-check text-lg" style={{ color: M.navy }}></i>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black uppercase tracking-wider" style={{ color: M.teal }}>
                                                You&apos;re In!
                                            </div>
                                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                Check your inbox for a confirmation.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex gap-3">
                                        <input
                                            type="email"
                                            placeholder="YOUR EMAIL..."
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="flex-1 px-4 py-3 border-[3px] text-xs font-bold uppercase tracking-wider outline-none placeholder:opacity-30"
                                            style={{
                                                borderColor: M.darkGray,
                                                backgroundColor: "rgba(255,255,255,0.03)",
                                                color: M.white,
                                            }}
                                        />
                                        <button type="submit"
                                            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-[3px] text-xs font-black uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5"
                                            style={{ borderColor: M.yellow, backgroundColor: M.yellow, color: M.navy }}>
                                            <i className="fa-duotone fa-regular fa-paper-plane text-[10px]"></i>
                                            Subscribe
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Main Footer Content ─── */}
                <div className="footer-main py-12 px-4 md:px-10"
                    style={{ borderBottom: `4px solid ${M.darkGray}` }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                            {FOOTER_SECTIONS.map((section, sIdx) => (
                                <div key={sIdx} className="footer-column">
                                    {/* Section header */}
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-7 h-7 flex items-center justify-center"
                                            style={{ backgroundColor: section.color }}>
                                            <i className={`${section.icon} text-[10px]`}
                                                style={{ color: section.color === M.yellow ? M.navy : M.white }}></i>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.15em]"
                                            style={{ color: section.color }}>
                                            {section.title}
                                        </span>
                                    </div>

                                    {/* Links */}
                                    <ul className="space-y-2">
                                        {section.links.map((link, lIdx) => (
                                            <li key={lIdx}>
                                                <a href="#"
                                                    className="footer-link group flex items-center gap-2 transition-all hover:translate-x-1"
                                                    style={{ color: "rgba(255,255,255,0.45)" }}>
                                                    <i className={`${link.icon} text-[9px] transition-colors`}
                                                        style={{ color: `${section.color}55` }}></i>
                                                    <span className="text-[11px] font-bold uppercase tracking-wider transition-colors group-hover:text-white">
                                                        {link.label}
                                                    </span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Social & Brand Bar ─── */}
                <div className="footer-social py-8 px-4 md:px-10"
                    style={{ borderBottom: `4px solid ${M.darkGray}` }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Brand block */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 flex items-center justify-center border-[3px]"
                                        style={{ borderColor: M.coral, backgroundColor: M.coral }}>
                                        <span className="text-xl font-black" style={{ color: M.white }}>S</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full"
                                        style={{ backgroundColor: M.teal }} />
                                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rotate-45"
                                        style={{ backgroundColor: M.yellow }} />
                                </div>
                                <div>
                                    <div className="text-base font-black uppercase tracking-[0.15em]" style={{ color: M.white }}>
                                        Splits Network
                                    </div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                        Recruiting, Rewired
                                    </div>
                                </div>
                            </div>

                            {/* Social links */}
                            <div className="flex items-center gap-3">
                                {SOCIAL_LINKS.map((social, i) => (
                                    <a key={i} href="#" title={social.label}
                                        className="social-link w-10 h-10 flex items-center justify-center border-[3px] transition-all hover:-translate-y-1"
                                        style={{ borderColor: social.color, color: social.color }}>
                                        <i className={`${social.icon} text-sm`}></i>
                                    </a>
                                ))}
                            </div>

                            {/* App badges */}
                            <div className="flex items-center gap-3">
                                {[
                                    { label: "App Store", icon: "fa-brands fa-apple", color: M.purple },
                                    { label: "Google Play", icon: "fa-brands fa-google-play", color: M.teal },
                                ].map((badge, i) => (
                                    <a key={i} href="#"
                                        className="flex items-center gap-2 px-3.5 py-2 border-[2px] text-[10px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
                                        style={{ borderColor: badge.color, color: badge.color }}>
                                        <i className={`${badge.icon} text-sm`}></i>
                                        {badge.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Bottom Bar ─── */}
                <div className="footer-bottom py-5 px-4 md:px-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-wrap justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
                                    style={{ color: "rgba(255,255,255,0.25)" }}>
                                    &copy; 2026 Employment Networks, Inc.
                                </span>
                                <div className="flex items-center gap-1">
                                    {[M.coral, M.teal, M.yellow, M.purple].map((c, i) => (
                                        <div key={i} className="w-2 h-2"
                                            style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {["Privacy", "Terms", "Cookies", "Security"].map((link, i) => (
                                    <a key={i} href="#"
                                        className="text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:text-white"
                                        style={{ color: "rgba(255,255,255,0.3)" }}>
                                        {link}
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: M.teal }} />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]"
                                    style={{ color: M.teal }}>
                                    All Systems Operational
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FootersSixPage() {
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

            // Page title
            gsap.fromTo(
                $1(".page-title"),
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: D.slow, ease: E.bounce },
            );

            // Section labels
            gsap.fromTo(
                $(".section-label"),
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: D.normal, ease: E.smooth, stagger: 0.4 },
            );

            // Sample content cards
            gsap.fromTo(
                $(".sample-card"),
                { y: 30, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: D.normal, ease: E.bounce, stagger: S.loose, delay: 0.3 },
            );

            // Footer shapes
            gsap.fromTo(
                $(".footer-shape"),
                { opacity: 0, scale: 0, rotation: -120 },
                {
                    opacity: 0.08, scale: 1, rotation: 0,
                    duration: D.slow, ease: E.elastic,
                    stagger: { each: S.tight, from: "random" },
                    scrollTrigger: { trigger: $1(".memphis-footer"), start: "top 80%" },
                },
            );

            // Footer floating animation
            $(".footer-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${6 + (i % 3) * 4}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i)}`,
                    duration: 4 + i * 0.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.2,
                });
            });

            // Newsletter section
            gsap.fromTo(
                $1(".newsletter-section"),
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: D.slow, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".memphis-footer"), start: "top 85%" },
                },
            );

            // Footer columns
            gsap.fromTo(
                $(".footer-column"),
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: D.normal, ease: E.bounce,
                    stagger: S.loose,
                    scrollTrigger: { trigger: $1(".footer-main"), start: "top 85%" },
                },
            );

            // Social links
            gsap.fromTo(
                $(".social-link"),
                { scale: 0, rotation: -20 },
                {
                    scale: 1, rotation: 0,
                    duration: D.fast, ease: E.elastic,
                    stagger: S.tight,
                    scrollTrigger: { trigger: $1(".footer-social"), start: "top 90%" },
                },
            );

            // Bottom bar
            gsap.fromTo(
                $1(".footer-bottom"),
                { y: 20, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".footer-bottom"), start: "top 95%" },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: M.cream }}>

            {/* ═══════════════════════════════════════════
                SHOWCASE TITLE
               ═══════════════════════════════════════════ */}
            <div className="page-title py-10 text-center" style={{ backgroundColor: M.navy }}>
                <div className="inline-block px-4 py-1.5 border-[3px] mb-4"
                    style={{ borderColor: M.teal }}>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: M.teal }}>
                        Footer Showcase
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3" style={{ color: M.white }}>
                    Retro <span style={{ color: M.teal }}>Memphis</span> Footer
                </h1>
                <p className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Bold geometry, loud accents, structured navigation
                </p>
            </div>

            {/* ═══════════════════════════════════════════
                SAMPLE CONTENT (Above Footer Context)
               ═══════════════════════════════════════════ */}
            <div className="px-4 md:px-8 py-16">
                <div className="max-w-5xl mx-auto">
                    {/* Section label */}
                    <div className="section-label flex items-center gap-3 mb-6 opacity-0">
                        <div className="w-8 h-8 flex items-center justify-center border-[3px]"
                            style={{ borderColor: M.coral, backgroundColor: M.coral }}>
                            <i className="fa-duotone fa-regular fa-arrow-down text-xs" style={{ color: M.white }}></i>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: M.navy }}>
                            Sample Page Content (Footer Below)
                        </span>
                        <div className="flex-1 h-[3px]" style={{ backgroundColor: M.coral }} />
                    </div>

                    {/* Feature cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {SAMPLE_CONTENT.map((item, i) => (
                            <div key={i} className="sample-card relative p-6 border-[3px] opacity-0"
                                style={{ borderColor: item.color, backgroundColor: M.white }}>
                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-8 h-8"
                                    style={{ backgroundColor: item.color }} />
                                <div className="w-14 h-14 flex items-center justify-center border-[3px] mb-4"
                                    style={{ borderColor: item.color }}>
                                    <i className={`${item.icon} text-xl`} style={{ color: item.color }}></i>
                                </div>
                                <h3 className="text-base font-black uppercase tracking-wide mb-2" style={{ color: M.navy }}>
                                    {item.title}
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: M.navy, opacity: 0.6 }}>
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA block above footer */}
                    <div className="sample-card relative p-8 md:p-12 border-[4px] text-center opacity-0"
                        style={{ borderColor: M.navy, backgroundColor: M.white }}>
                        <div className="relative inline-block mb-6">
                            <div className="w-16 h-16 flex items-center justify-center border-[3px] mx-auto"
                                style={{ borderColor: M.coral }}>
                                <i className="fa-duotone fa-regular fa-rocket text-2xl" style={{ color: M.coral }}></i>
                            </div>
                            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full"
                                style={{ backgroundColor: M.teal }} />
                            <div className="absolute -bottom-1 -left-2 w-4 h-4 rotate-45"
                                style={{ backgroundColor: M.yellow }} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3" style={{ color: M.navy }}>
                            Ready to <span style={{ color: M.coral }}>Get Started</span>?
                        </h2>
                        <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: M.navy, opacity: 0.5 }}>
                            Join thousands of recruiters who are already using Splits Network to close more placements.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="#" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-[3px] text-xs font-black uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5"
                                style={{ borderColor: M.coral, backgroundColor: M.coral, color: M.white }}>
                                <i className="fa-duotone fa-regular fa-rocket text-[10px]"></i>
                                Start Free Trial
                            </a>
                            <a href="#" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-[3px] text-xs font-black uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5"
                                style={{ borderColor: M.navy, color: M.navy }}>
                                <i className="fa-duotone fa-regular fa-calendar text-[10px]"></i>
                                Book a Demo
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                FOOTER LABEL
               ═══════════════════════════════════════════ */}
            <div className="px-4 md:px-8 pb-4">
                <div className="section-label flex items-center gap-3 opacity-0">
                    <div className="w-8 h-8 flex items-center justify-center border-[3px]"
                        style={{ borderColor: M.teal, backgroundColor: M.teal }}>
                        <i className="fa-duotone fa-regular fa-rectangle-wide text-xs" style={{ color: M.navy }}></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: M.navy }}>
                        Footer Component
                    </span>
                    <div className="flex-1 h-[3px]" style={{ backgroundColor: M.teal }} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                THE FOOTER
               ═══════════════════════════════════════════ */}
            <MemphisFooter />

            {/* ═══════════════════════════════════════════
                DESIGN DETAILS
               ═══════════════════════════════════════════ */}
            <div className="px-4 md:px-8 py-12" style={{ backgroundColor: M.cream }}>
                <div className="section-label flex items-center gap-3 mb-6 opacity-0">
                    <div className="w-8 h-8 flex items-center justify-center border-[3px]"
                        style={{ borderColor: M.yellow, backgroundColor: M.yellow }}>
                        <i className="fa-duotone fa-regular fa-swatchbook text-xs" style={{ color: M.navy }}></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: M.navy }}>
                        Footer Design System
                    </span>
                    <div className="flex-1 h-[3px]" style={{ backgroundColor: M.yellow }} />
                </div>

                <div className="grid md:grid-cols-4 gap-4 max-w-5xl">
                    {[
                        {
                            title: "4 Nav Sections",
                            items: ["Platform tools", "Network pages", "Resource center", "Legal links"],
                            color: M.coral,
                            icon: "fa-duotone fa-regular fa-sitemap",
                        },
                        {
                            title: "Newsletter CTA",
                            items: ["Email capture", "Success state", "Memphis styling", "Inline validation"],
                            color: M.teal,
                            icon: "fa-duotone fa-regular fa-envelope",
                        },
                        {
                            title: "Social & Apps",
                            items: ["5 social platforms", "App store badges", "Brand block", "Hover lift effect"],
                            color: M.yellow,
                            icon: "fa-duotone fa-regular fa-share-nodes",
                        },
                        {
                            title: "Bottom Bar",
                            items: ["Copyright notice", "Legal quick links", "Status indicator", "Color palette dots"],
                            color: M.purple,
                            icon: "fa-duotone fa-regular fa-bars",
                        },
                    ].map((section, i) => (
                        <div key={i} className="sample-card p-4 border-[3px] opacity-0"
                            style={{ borderColor: section.color, backgroundColor: M.white }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 flex items-center justify-center"
                                    style={{ backgroundColor: section.color }}>
                                    <i className={`${section.icon} text-[10px]`}
                                        style={{ color: section.color === M.yellow ? M.navy : M.white }}></i>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color: M.navy }}>
                                    {section.title}
                                </span>
                            </div>
                            <ul className="space-y-1.5">
                                {section.items.map((item, j) => (
                                    <li key={j} className="flex items-center gap-2 text-[10px]" style={{ color: M.navy, opacity: 0.6 }}>
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
