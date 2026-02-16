"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Footer Link Data ───────────────────────────────────────────────────── */

const FOOTER_COLUMNS = [
    {
        title: "Platform",
        links: [
            { label: "Split-Fee Marketplace", href: "#" },
            { label: "Applicant Tracking", href: "#" },
            { label: "Recruiter Network", href: "#" },
            { label: "Analytics Dashboard", href: "#" },
            { label: "AI Matching", href: "#" },
        ],
    },
    {
        title: "Solutions",
        links: [
            { label: "For Recruiters", href: "#" },
            { label: "For Companies", href: "#" },
            { label: "For Candidates", href: "#" },
            { label: "Enterprise", href: "#" },
            { label: "Staffing Agencies", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "#" },
            { label: "API Reference", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Case Studies", href: "#" },
            { label: "Webinars", href: "#" },
            { label: "Help Center", href: "#" },
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

const SOCIAL_LINKS = [
    { icon: "fa-brands fa-x-twitter", label: "Twitter", href: "#" },
    { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "#" },
    { icon: "fa-brands fa-github", label: "GitHub", href: "#" },
    { icon: "fa-brands fa-youtube", label: "YouTube", href: "#" },
    { icon: "fa-brands fa-discord", label: "Discord", href: "#" },
];

const STATUS_ITEMS = [
    { label: "API", status: "operational" as const },
    { label: "Portal", status: "operational" as const },
    { label: "Matching", status: "operational" as const },
    { label: "Payments", status: "operational" as const },
];

/* ─── Sample Content Above Footer ────────────────────────────────────────── */

const TESTIMONIALS = [
    {
        quote: "Splits Network transformed how I run my desk. I went from juggling spreadsheets to closing three placements in my first month on the platform.",
        author: "Marcus Chen",
        role: "Independent Recruiter",
        avatar: "MC",
    },
    {
        quote: "We replaced twelve individual recruiter contracts with one platform. Our cost-per-hire dropped 40% in the first quarter alone.",
        author: "Sarah Mitchell",
        role: "VP Talent Acquisition",
        avatar: "SM",
    },
    {
        quote: "For the first time, I actually knew where I stood in the hiring process. No ghosting, no guessing. Just real communication and transparency.",
        author: "Priya Sharma",
        role: "Software Engineer",
        avatar: "PS",
    },
];

const CTA_IMG =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80&auto=format&fit=crop";

/* ═══════════════════════════════════════════════════════════════════════════
   CINEMATIC FOOTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function CinematicFooter() {
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
        <footer className="cin-footer bg-neutral border-t border-white/[0.06]">
            {/* ── Newsletter Banner ────────────────────── */}
            <div className="cin-newsletter border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left max-w-lg">
                            <p className="cin-nl-kicker text-[10px] uppercase tracking-[0.3em] text-primary/60 font-medium mb-3">
                                Stay in the loop
                            </p>
                            <h3 className="cin-nl-heading text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                                Get recruiting insights{" "}
                                <span className="text-primary">
                                    delivered weekly
                                </span>
                            </h3>
                            <p className="cin-nl-desc text-white/35 text-sm leading-relaxed">
                                Industry trends, platform updates, and
                                strategies from top-performing recruiters. No
                                spam. Unsubscribe any time.
                            </p>
                        </div>

                        <div className="w-full lg:w-auto">
                            {subscribed ? (
                                <div className="cin-nl-success flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-6 py-4">
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-success" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">
                                            You are subscribed
                                        </p>
                                        <p className="text-white/40 text-xs">
                                            Check your inbox for a confirmation
                                            email.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubscribe}
                                    className="cin-nl-form flex gap-2"
                                >
                                    <div className="relative flex-1 lg:w-72">
                                        <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@company.com"
                                            required
                                            className="input w-full pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-coral/40 focus:bg-white/[0.06] transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary font-semibold border-0 shadow-lg shadow-primary/15 px-6"
                                    >
                                        Subscribe
                                        <i className="fa-regular fa-arrow-right text-xs" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Footer Grid ─────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="cin-footer-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
                    {/* Brand Column */}
                    <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:pr-4">
                        <a
                            href="#"
                            className="cin-footer-brand flex items-center gap-2.5 mb-5 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <i className="fa-duotone fa-regular fa-split text-primary text-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-black text-base tracking-tight leading-none">
                                    SPLITS
                                </span>
                                <span className="text-white/25 text-[8px] uppercase tracking-[0.2em] leading-none mt-0.5">
                                    Network
                                </span>
                            </div>
                        </a>
                        <p className="text-white/25 text-xs leading-relaxed mb-5 max-w-[180px]">
                            The split-fee recruiting marketplace connecting
                            recruiters, companies, and candidates.
                        </p>

                        {/* Social Links */}
                        <div className="cin-socials flex items-center gap-1.5">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
                                >
                                    <i className={`${social.icon} text-xs`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {FOOTER_COLUMNS.map((col) => (
                        <div key={col.title} className="cin-footer-col">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-4">
                                {col.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-white/30 text-xs hover:text-white transition-colors duration-200 flex items-center gap-2"
                                        >
                                            {link.label}
                                            {"badge" in link && link.badge && (
                                                <span className="badge badge-xs badge-primary font-medium">
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

            {/* ── System Status Strip ──────────────────── */}
            <div className="cin-status border-t border-white/[0.04]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">
                            System Status
                        </span>
                        {STATUS_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-1.5"
                            >
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${item.status === "operational" ? "bg-success" : "bg-warning"}`}
                                />
                                <span className="text-[10px] text-white/25">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                        <a
                            href="#"
                            className="text-[10px] text-primary/50 hover:text-primary transition-colors"
                        >
                            View status page{" "}
                            <i className="fa-regular fa-arrow-right text-[8px]" />
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Bottom Bar ───────────────────────────── */}
            <div className="cin-bottom-bar border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/20">
                            <span>
                                &copy; {new Date().getFullYear()} Employment
                                Networks, Inc.
                            </span>
                            <span className="hidden sm:inline text-white/10">
                                |
                            </span>
                            <a
                                href="#"
                                className="hover:text-white/40 transition-colors"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="hover:text-white/40 transition-colors"
                            >
                                Terms
                            </a>
                            <a
                                href="#"
                                className="hover:text-white/40 transition-colors"
                            >
                                Cookies
                            </a>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[11px] text-white/15">
                                <i className="fa-regular fa-globe text-[10px]" />
                                <select className="bg-transparent text-white/25 text-[11px] border-0 outline-0 cursor-pointer">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <a
                                href="#top"
                                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-all"
                                aria-label="Back to top"
                            >
                                <i className="fa-regular fa-arrow-up text-xs" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function FootersFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='cin-']"),
                    { opacity: 1, y: 0, x: 0, scale: 1 },
                );
                return;
            }

            // Testimonial cards
            gsap.fromTo(
                ".cin-testimonial-card",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-testimonials-grid",
                        start: "top 80%",
                    },
                },
            );

            // CTA section parallax
            gsap.to(".cin-cta-bg", {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: ".cin-cta-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.fromTo(
                ".cin-cta-content",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-cta-section",
                        start: "top 65%",
                    },
                },
            );

            // Newsletter section
            gsap.fromTo(
                ".cin-nl-kicker",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-newsletter",
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                ".cin-nl-heading",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-newsletter",
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                ".cin-nl-desc",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-newsletter",
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                ".cin-nl-form, .cin-nl-success",
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    delay: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-newsletter",
                        start: "top 85%",
                    },
                },
            );

            // Footer grid
            gsap.fromTo(
                ".cin-footer-brand",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".cin-footer-grid",
                        start: "top 90%",
                    },
                },
            );
            gsap.fromTo(
                ".cin-footer-col",
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".cin-footer-grid",
                        start: "top 90%",
                    },
                },
            );
            gsap.fromTo(
                ".cin-socials",
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.3,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".cin-footer-grid",
                        start: "top 90%",
                    },
                },
            );

            // Status and bottom bar
            gsap.fromTo(
                ".cin-status",
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: { trigger: ".cin-status", start: "top 95%" },
                },
            );
            gsap.fromTo(
                ".cin-bottom-bar",
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".cin-bottom-bar",
                        start: "top 95%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-neutral" id="top">
            {/* ── Page Header ──────────────────────────────── */}
            <section className="pt-24 pb-16 px-6 border-b border-white/[0.06]">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-primary/60 font-medium mb-4">
                        Cinematic Editorial
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-[0.95]">
                        Footer <span className="text-primary">Showcase</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
                        Scroll down through the sample content to see the
                        cinematic footer with newsletter signup, navigation
                        columns, social links, system status, and legal
                        information.
                    </p>
                </div>
            </section>

            {/* ── Testimonials Section (context above footer) ── */}
            <section className="py-24 px-6 border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-medium mb-4">
                            Voices from the Network
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                            Trusted by{" "}
                            <span className="text-primary">thousands</span>
                        </h2>
                    </div>

                    <div className="cin-testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={i}
                                className="cin-testimonial-card opacity-0 p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-all duration-300"
                            >
                                <i className="fa-solid fa-quote-left text-primary/15 text-2xl mb-4" />
                                <p className="text-white/50 text-sm leading-relaxed mb-6">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-semibold">
                                            {t.author}
                                        </p>
                                        <p className="text-white/30 text-[10px]">
                                            {t.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ──────────────────────────────── */}
            <section className="cin-cta-section relative py-32 overflow-hidden">
                <div className="cin-cta-bg absolute inset-0 w-full h-[130%] -top-[15%]">
                    <img
                        src={CTA_IMG}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="absolute inset-0 bg-neutral/85" />

                <div className="cin-cta-content relative z-10 max-w-3xl mx-auto px-6 text-center opacity-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-medium mb-4">
                        Ready to transform your recruiting?
                    </p>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-[0.95]">
                        Join the network that
                        <br />
                        <span className="text-primary">pays for itself</span>
                    </h2>
                    <p className="text-white/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10">
                        Thousands of recruiters and hundreds of companies are
                        already making smarter placements. Start today with zero
                        upfront cost.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#"
                            className="btn btn-primary btn-lg font-semibold border-0 shadow-xl shadow-primary/20"
                        >
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Start Free Trial
                        </a>
                        <a
                            href="#"
                            className="btn btn-lg font-semibold btn-outline border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                        >
                            <i className="fa-duotone fa-regular fa-calendar" />
                            Book a Demo
                        </a>
                    </div>
                </div>
            </section>

            {/* ── The Footer ───────────────────────────────── */}
            <CinematicFooter />
        </div>
    );
}
