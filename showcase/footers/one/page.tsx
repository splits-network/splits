"use client";

import { useRef, useState } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

/* ─── Footer Data ────────────────────────────────────────────────────────── */

const footerSections = [
    {
        title: "Platform",
        links: [
            { label: "For Recruiters", href: "#" },
            { label: "For Companies", href: "#" },
            { label: "For Candidates", href: "#" },
            { label: "Integrations", href: "#" },
            { label: "API Reference", href: "#" },
        ],
    },
    {
        title: "Solutions",
        links: [
            { label: "Split-Fee Recruiting", href: "#" },
            { label: "ATS & Pipeline", href: "#" },
            { label: "AI Candidate Matching", href: "#" },
            { label: "Analytics Dashboard", href: "#" },
            { label: "Team Collaboration", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Help Center", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Webinars", href: "#" },
            { label: "Case Studies", href: "#" },
            { label: "Community", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Press", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Partners", href: "#" },
        ],
    },
];

const socialLinks = [
    { icon: "fa-brands fa-linkedin-in", href: "#", label: "LinkedIn" },
    { icon: "fa-brands fa-x-twitter", href: "#", label: "X / Twitter" },
    { icon: "fa-brands fa-github", href: "#", label: "GitHub" },
    { icon: "fa-brands fa-youtube", href: "#", label: "YouTube" },
];

const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
];

const trustStats = [
    { value: "2,847", label: "Recruiters" },
    { value: "518", label: "Companies" },
    { value: "12,340", label: "Candidates" },
    { value: "$42M+", label: "In Placements" },
];

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function FootersOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    /* ── GSAP Animations ──────────────────────────────────────── */
    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ═══════════════════════════════════════════════════════
                HERO — Showcase description
               ═══════════════════════════════════════════════════════ */}
            <section className="relative min-h-[60vh] flex items-center bg-base-300 text-base-content">
                {/* Diagonal accent panel */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

                <div className="relative  container mx-auto px-6 lg:px-12 py-20">
                    <div className="max-w-3xl">
                        <p className="showcase-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-5 scroll-reveal fade-up">
                            Footer Component
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="showcase-word inline-block scroll-reveal hero-word">
                                Split-Screen
                            </span>{" "}
                            <span className="showcase-word inline-block scroll-reveal hero-word text-primary">
                                Editorial
                            </span>{" "}
                            <br className="hidden md:block" />
                            <span className="showcase-word inline-block scroll-reveal hero-word">
                                Footer.
                            </span>
                        </h1>

                        <p className="showcase-desc text-lg text-base-content/60 leading-relaxed max-w-xl scroll-reveal fade-up">
                            A comprehensive footer system built on the editorial
                            grid. Features a bold CTA band, newsletter signup
                            with split-screen layout, organized navigation
                            columns, social links, trust signals, and a legal
                            baseline. Every section uses the characteristic
                            angular geometry and typographic hierarchy of the
                            Split-Screen Editorial design.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-10">
                            {[
                                "CTA Band",
                                "Newsletter Signup",
                                "4-Column Nav",
                                "Social Links",
                                "Trust Stats",
                                "Legal Bar",
                                "Logo Lockup",
                                "Scroll Animations",
                            ].map((feat) => (
                                <span
                                    key={feat}
                                    className="px-3 py-1 text-sm font-semibold uppercase tracking-wider  text-base-content/60"
                                >
                                    {feat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SAMPLE CONTENT — Gives context above footer
               ═══════════════════════════════════════════════════════ */}
            <section className="content-section py-24 bg-base-100 scroll-reveal fade-up">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        <div className="lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Latest Updates
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-8">
                                What is new on
                                <br />
                                the platform.
                            </h2>

                            <div className="space-y-6">
                                {[
                                    {
                                        title: "AI-Powered Candidate Matching Now Live",
                                        excerpt:
                                            "Our new matching algorithm uses deep learning to connect recruiters with ideal candidates based on skills, culture fit, and career trajectory.",
                                        date: "Feb 12, 2026",
                                        tag: "Product",
                                    },
                                    {
                                        title: "Q4 Marketplace Report: Record Placements",
                                        excerpt:
                                            "The Splits Network marketplace saw a 34% increase in placements quarter-over-quarter, with average time-to-hire dropping to 28 days.",
                                        date: "Feb 8, 2026",
                                        tag: "Insights",
                                    },
                                    {
                                        title: "New Integration: Connect Your ATS in One Click",
                                        excerpt:
                                            "Seamlessly sync candidates, jobs, and pipeline data between Splits Network and your existing ATS with our new one-click integration.",
                                        date: "Feb 4, 2026",
                                        tag: "Feature",
                                    },
                                ].map((post, i) => (
                                    <article
                                        key={i}
                                        className="border-l-4 border-coral bg-base-200 p-6 hover:bg-base-300/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2 py-0.5 text-sm font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                                                {post.tag}
                                            </span>
                                            <span className="text-xs text-base-content/40">
                                                {post.date}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-base-content/60 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-base-200 p-8 border-t-4 border-secondary mb-8">
                                <h3 className="text-xl font-black mb-4">
                                    Trending Roles
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        {
                                            title: "Senior Engineer",
                                            count: "142 open",
                                        },
                                        {
                                            title: "Product Manager",
                                            count: "89 open",
                                        },
                                        {
                                            title: "Data Scientist",
                                            count: "67 open",
                                        },
                                        {
                                            title: "DevOps Engineer",
                                            count: "54 open",
                                        },
                                        {
                                            title: "UX Designer",
                                            count: "43 open",
                                        },
                                    ].map((role) => (
                                        <div
                                            key={role.title}
                                            className="flex items-center justify-between py-2 border-b border-base-300 last:border-0"
                                        >
                                            <span className="text-sm font-semibold">
                                                {role.title}
                                            </span>
                                            <span className="text-xs text-base-content/50">
                                                {role.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-primary text-primary-content p-8">
                                <h3 className="text-xl font-black mb-3">
                                    Ready to start?
                                </h3>
                                <p className="text-sm opacity-80 mb-6 leading-relaxed">
                                    Join thousands of recruiters and companies
                                    building the future of hiring.
                                </p>
                                <a
                                    href="#"
                                    className="btn bg-white text-primary hover:bg-white/90 border-0 btn-sm w-full"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Create Free Account
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transition section */}
            <section className="content-section py-16 bg-base-200 scroll-reveal fade-up">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                        Scroll Down
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-4">
                        The footer begins below.
                    </h2>
                    <p className="text-base-content/50 text-sm">
                        Multiple sections work together to close the page with
                        editorial impact.
                    </p>
                    <div className="mt-8">
                        <i className="fa-duotone fa-regular fa-chevron-down text-2xl text-primary animate-bounce" />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FOOTER — Split-Screen Editorial
               ═══════════════════════════════════════════════════════ */}

            {/* ── 1. CTA Band ─────────────────────────────────────── */}
            <section className="footer-cta-band bg-primary text-primary-content py-16 scroll-reveal fade-up">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-3">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                                Ready to transform
                                <br />
                                how you recruit?
                            </h2>
                        </div>
                        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 lg:justify-end">
                            <a
                                href="#"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Get Started Free
                            </a>
                            <a
                                href="#"
                                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                            >
                                <i className="fa-duotone fa-regular fa-calendar" />
                                Book a Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. Newsletter + Logo (split-screen layout) ──────── */}
            <footer className="bg-base-300 text-base-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-0 py-16 border-b border-neutral-content/10">
                        {/* Left: Newsletter */}
                        <div className="footer-newsletter lg:col-span-3 lg:pr-16 lg:border-r lg:border-neutral-content/10 mb-10 lg:mb-0 scroll-reveal slide-from-left">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">
                                        Stay in the loop
                                    </h3>
                                    <p className="text-xs opacity-50">
                                        Weekly insights on recruiting,
                                        marketplace trends, and platform
                                        updates.
                                    </p>
                                </div>
                            </div>

                            {subscribed ? (
                                <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20">
                                    <i className="fa-duotone fa-regular fa-circle-check text-success text-xl" />
                                    <div>
                                        <p className="text-sm font-bold text-success">
                                            You are subscribed!
                                        </p>
                                        <p className="text-xs opacity-50">
                                            Check your inbox for a confirmation
                                            email.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubscribe}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@company.com"
                                        required
                                        className="input input-sm flex-1 bg-neutral-content/5 border-neutral-content/10 text-base-content placeholder:text-base-content/30 focus:border-coral focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-paper-plane" />
                                        Subscribe
                                    </button>
                                </form>
                            )}

                            <p className="text-sm opacity-30 mt-3">
                                No spam. Unsubscribe anytime. We respect your
                                privacy.
                            </p>
                        </div>

                        {/* Right: Logo + tagline */}
                        <div className="lg:col-span-2 lg:pl-16 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-split text-primary-content text-2xl" />
                                </div>
                                <div>
                                    <span className="text-xl font-black tracking-tight">
                                        Splits
                                    </span>
                                    <span className="text-xl font-light tracking-tight opacity-60 ml-0.5">
                                        Network
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm opacity-50 leading-relaxed mb-4">
                                The split-fee recruiting marketplace that
                                connects recruiters, companies, and candidates
                                in a single transparent ecosystem.
                            </p>

                            {/* Social links */}
                            <div className="social-row flex gap-2">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        title={social.label}
                                        className="social-icon w-9 h-9 bg-neutral-content/5 hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all scroll-reveal scale-in"
                                    >
                                        <i
                                            className={`${social.icon} text-sm`}
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 3. Navigation Columns ────────────────────────── */}
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="footer-columns grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-neutral-content/10">
                        {footerSections.map((section) => (
                            <div
                                key={section.title}
                                className="footer-col scroll-reveal fade-up"
                            >
                                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                                    {section.title}
                                </h4>
                                <ul className="space-y-2.5">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-base-content/60 hover:text-base-content transition-colors"
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

                {/* ── 4. Stats / Trust Bar ─────────────────────────── */}
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="footer-stats-bar grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-b border-neutral-content/10">
                        {trustStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="footer-stat text-center scroll-reveal fade-up"
                            >
                                <div className="text-2xl font-black text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-sm uppercase tracking-widest opacity-40 mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 5. Bottom Bar (legal + copyright) ───────────── */}
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="footer-bottom py-6 flex flex-col md:flex-row items-center justify-between gap-4 scroll-reveal fade-in">
                        <div className="flex items-center gap-1 text-sm opacity-30">
                            <i className="fa-duotone fa-regular fa-copyright" />
                            <span>
                                {new Date().getFullYear()} Employment Networks
                                LLC. All rights reserved.
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {legalLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm opacity-30 hover:opacity-60 transition-opacity"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm opacity-30">
                            <i className="fa-duotone fa-regular fa-shield-check" />
                            <span>SOC 2 Type II Compliant</span>
                            <span className="mx-1">|</span>
                            <i className="fa-duotone fa-regular fa-lock" />
                            <span>256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
