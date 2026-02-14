"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Footer Navigation Data ────────────────────────────────────────────────── */

const footerColumns = [
    {
        title: "Platform",
        links: [
            { label: "For Recruiters", href: "#" },
            { label: "For Companies", href: "#" },
            { label: "For Candidates", href: "#" },
            { label: "Integrations", href: "#" },
            { label: "API Documentation", href: "#" },
        ],
    },
    {
        title: "Solutions",
        links: [
            { label: "Split-Fee Recruiting", href: "#" },
            { label: "Talent Marketplace", href: "#" },
            { label: "Enterprise Search", href: "#" },
            { label: "Analytics Suite", href: "#" },
            { label: "AI Matching", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Blog", href: "#" },
            { label: "Case Studies", href: "#" },
            { label: "Webinars", href: "#" },
            { label: "Help Center", href: "#" },
            { label: "Community", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#", badge: "Hiring" },
            { label: "Press", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Partners", href: "#" },
        ],
    },
];

const socialLinks = [
    { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "#" },
    { icon: "fa-brands fa-x-twitter", label: "X", href: "#" },
    { icon: "fa-brands fa-github", label: "GitHub", href: "#" },
    { icon: "fa-brands fa-youtube", label: "YouTube", href: "#" },
];

const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security", href: "#" },
];

const trustedLogos = [
    { name: "Meridian Corp", initials: "MC" },
    { name: "Quantum Financial", initials: "QF" },
    { name: "Apex Robotics", initials: "AR" },
    { name: "Cirrus Technologies", initials: "CT" },
    { name: "Helix Dynamics", initials: "HD" },
];

/* ─── Sample Content Data (above footer) ─────────────────────────────────────── */

const testimonials = [
    {
        quote: "Splits Network transformed how we approach recruiting. We filled three executive roles in under two weeks through split-fee partnerships.",
        author: "Marcus Chen",
        title: "VP of Engineering",
        company: "Meridian Corp",
        initials: "MC",
    },
    {
        quote: "The platform's ability to connect me with specialist recruiters has doubled my placement rate. The split-fee model just makes sense.",
        author: "Diana Foster",
        title: "Technical Recruiter",
        company: "Foster Talent Group",
        initials: "DF",
    },
    {
        quote: "As a candidate, I appreciated how the network approach brought opportunities I would never have found through a single recruiter.",
        author: "James Park",
        title: "Staff Software Engineer",
        company: "Formerly at Stripe",
        initials: "JP",
    },
];

const ctaStats = [
    { value: "50%", label: "Avg. fee on split placements" },
    { value: "3x", label: "Faster than solo recruiting" },
    { value: "Zero", label: "Upfront cost to join" },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function FootersTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    /* ─── Animations ─────────────────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            // Testimonials
            gsap.from("[data-testimonial]", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "[data-testimonials]",
                    start: "top 80%",
                },
            });

            // CTA section
            gsap.from("[data-cta-content]", {
                y: 40,
                opacity: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "[data-cta]",
                    start: "top 80%",
                },
            });

            // CTA stats
            gsap.from("[data-cta-stat]", {
                y: 25,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-cta-stats]",
                    start: "top 85%",
                },
            });

            // Footer newsletter
            gsap.from("[data-footer-newsletter]", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "[data-footer-newsletter]",
                    start: "top 90%",
                },
            });

            // Footer columns stagger
            gsap.from("[data-footer-col]", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-footer-nav]",
                    start: "top 90%",
                },
            });

            // Trusted logos
            gsap.from("[data-trusted-logo]", {
                scale: 0.8,
                opacity: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-trusted]",
                    start: "top 90%",
                },
            });

            // Dividers
            gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
                gsap.from(line, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 95%",
                    },
                });
            });

            // Bottom bar
            gsap.from("[data-bottom-bar]", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-bottom-bar]",
                    start: "top 95%",
                },
            });
        },
        { scope: containerRef },
    );

    /* ─── Newsletter Handler ─────────────────────────────────────────────────── */

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    /* ─── Render ─────────────────────────────────────────────────────────────── */

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* ═══════════════════════════════════════════════════════════════════
                SAMPLE PAGE CONTENT (above footer for context)
            ═══════════════════════════════════════════════════════════════════ */}

            {/* ─── Section Label ─────────────────────────────────────────────── */}
            <section className="pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/30 font-semibold mb-3">
                        What People Say
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
                        Trusted by recruiting professionals.
                    </h2>
                </div>
            </section>

            {/* ─── Testimonials ──────────────────────────────────────────────── */}
            <section data-testimonials className="pb-20">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.author}
                                data-testimonial
                                className="p-6 border border-base-200 rounded-xl"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className="fa-solid fa-star text-warning text-xs"
                                        />
                                    ))}
                                </div>
                                <blockquote className="text-sm text-base-content/60 leading-relaxed mb-6 italic">
                                    &ldquo;{t.quote}&rdquo;
                                </blockquote>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-xs font-bold text-base-content/50">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-base-content">
                                            {t.author}
                                        </p>
                                        <p className="text-[11px] text-base-content/40">
                                            {t.title}, {t.company}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Divider ───────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div data-divider className="h-px bg-base-300" />
            </div>

            {/* ─── CTA Section ───────────────────────────────────────────────── */}
            <section data-cta className="py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
                    <div className="max-w-2xl mx-auto">
                        <p
                            data-cta-content
                            className="text-[11px] uppercase tracking-[0.4em] text-secondary font-semibold mb-4"
                        >
                            Get Started Today
                        </p>
                        <h2
                            data-cta-content
                            className="text-3xl md:text-5xl font-bold tracking-tight text-base-content leading-tight mb-5"
                        >
                            Ready to grow your
                            <br />recruiting business?
                        </h2>
                        <p
                            data-cta-content
                            className="text-base text-base-content/45 leading-relaxed mb-8"
                        >
                            Join thousands of recruiters and companies using Splits Network to make better placements, faster.
                        </p>
                        <div data-cta-content className="flex flex-wrap justify-center gap-3 mb-12">
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Create Free Account
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-7 py-3.5 border border-base-300 text-base-content/60 text-sm font-semibold rounded-lg hover:border-base-content/30 hover:text-base-content transition-colors"
                            >
                                Schedule Demo
                            </a>
                        </div>
                    </div>
                    <div data-cta-stats className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                        {ctaStats.map((stat) => (
                            <div key={stat.label} data-cta-stat>
                                <p className="text-xl md:text-2xl font-bold text-base-content tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.15em] text-base-content/35 mt-1 font-medium">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════════════════ */}

            <footer className="bg-base-content text-base-100">
                {/* ─── Newsletter Section ────────────────────────────────────── */}
                <div data-footer-newsletter className="border-b border-base-100/10">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                            <div className="max-w-md">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-base-100/30 font-semibold mb-2">
                                    Stay Informed
                                </p>
                                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-base-100 mb-2">
                                    The Splits Newsletter
                                </h3>
                                <p className="text-sm text-base-100/40 leading-relaxed">
                                    Weekly insights on recruiting trends, split-fee strategies, and platform updates. Trusted by 4,000+ professionals.
                                </p>
                            </div>
                            <div className="w-full md:w-auto md:min-w-[380px]">
                                {subscribed ? (
                                    <div className="flex items-center gap-3 px-5 py-4 bg-base-100/10 rounded-xl">
                                        <i className="fa-duotone fa-regular fa-circle-check text-secondary text-lg" />
                                        <div>
                                            <p className="text-sm font-semibold text-base-100">You&apos;re subscribed!</p>
                                            <p className="text-xs text-base-100/40">Check your inbox for a welcome email.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex gap-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="flex-1 px-4 py-3 bg-base-100/10 border border-base-100/10 rounded-lg text-sm text-base-100 placeholder:text-base-100/25 focus:outline-none focus:border-base-100/25 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="px-5 py-3 bg-base-100 text-base-content text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                                        >
                                            Subscribe
                                        </button>
                                    </form>
                                )}
                                <p className="text-[10px] text-base-100/20 mt-2">
                                    No spam. Unsubscribe anytime.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Main Footer Navigation ───────────────────────────────── */}
                <div data-footer-nav className="border-b border-base-100/10">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
                            {/* Brand Column */}
                            <div data-footer-col className="col-span-2 md:col-span-1">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-base-100/10 rounded-lg flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-split text-base-100 text-sm" />
                                    </div>
                                    <div className="leading-none">
                                        <span className="text-base font-bold tracking-tight text-base-100">
                                            Splits
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-base-100/30 block -mt-0.5 font-medium">
                                            Network
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-base-100/35 leading-relaxed mb-6 max-w-[220px]">
                                    The recruiting network where collaboration drives better placements for everyone.
                                </p>
                                {/* Social Links */}
                                <div className="flex gap-2">
                                    {socialLinks.map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            aria-label={s.label}
                                            className="w-9 h-9 rounded-lg bg-base-100/5 flex items-center justify-center text-base-100/30 hover:text-base-100/70 hover:bg-base-100/10 transition-colors"
                                        >
                                            <i className={`${s.icon} text-sm`} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Link Columns */}
                            {footerColumns.map((col) => (
                                <div key={col.title} data-footer-col>
                                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-100/30 font-semibold mb-4">
                                        {col.title}
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {col.links.map((link) => (
                                            <li key={link.label}>
                                                <a
                                                    href={link.href}
                                                    className="text-sm text-base-100/50 hover:text-base-100 transition-colors inline-flex items-center gap-2"
                                                >
                                                    {link.label}
                                                    {"badge" in link && link.badge && (
                                                        <span className="px-1.5 py-0.5 bg-secondary/20 text-secondary text-[9px] font-bold uppercase tracking-wider rounded">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Trusted By Section ────────────────────────────────────── */}
                <div data-trusted className="border-b border-base-100/10">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-100/20 font-semibold whitespace-nowrap">
                                Trusted By
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                                {trustedLogos.map((logo) => (
                                    <div
                                        key={logo.name}
                                        data-trusted-logo
                                        className="flex items-center gap-2 px-4 py-2 bg-base-100/5 rounded-lg"
                                    >
                                        <div className="w-7 h-7 rounded bg-base-100/10 flex items-center justify-center text-[10px] font-bold text-base-100/30">
                                            {logo.initials}
                                        </div>
                                        <span className="text-xs font-medium text-base-100/30">
                                            {logo.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Bottom Bar ────────────────────────────────────────────── */}
                <div data-bottom-bar>
                    <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                                {legalLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="text-[11px] text-base-100/25 hover:text-base-100/50 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                            <p className="text-[11px] text-base-100/20 text-center md:text-right">
                                &copy; {new Date().getFullYear()} Employment Networks, Inc. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
