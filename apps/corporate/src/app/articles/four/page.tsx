"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Cinematic Unsplash Photography ────────────────────────────────────── */
const HERO_IMG =
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80&auto=format&fit=crop";
const HISTORY_IMG =
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=960&q=80&auto=format&fit=crop";
const TECH_IMG =
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=960&q=80&auto=format&fit=crop";
const DATA_IMG =
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80&auto=format&fit=crop";
const FUTURE_IMG =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=960&q=80&auto=format&fit=crop";
const CTA_IMG =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80&auto=format&fit=crop";

/* ─── Article Meta ──────────────────────────────────────────────────────── */
const articleMeta = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry",
    date: "February 14, 2026",
    readTime: "14 min read",
    author: "Employment Networks Editorial",
    category: "Industry Analysis",
};

/* ─── Key Stats ─────────────────────────────────────────────────────────── */
const keyStats = [
    { value: "$4.7B", label: "Split-Fee Market Size" },
    { value: "73%", label: "Higher Earnings Reported" },
    { value: "3x", label: "Faster Time-to-Fill" },
    { value: "92%", label: "Partner Satisfaction" },
];

/* ─── Growth Drivers ────────────────────────────────────────────────────── */
const growthDrivers = [
    {
        icon: "fa-duotone fa-regular fa-globe",
        title: "Expanded Reach",
        text: "Solo recruiters access enterprise-level roles they could never touch alone. By partnering on the fee, they gain entry into larger markets and new verticals.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Reduced Risk",
        text: "Companies diversify their sourcing pipeline. Instead of relying on one recruiter, they tap into an entire network simultaneously.",
    },
    {
        icon: "fa-duotone fa-regular fa-crosshairs",
        title: "Deep Specialization",
        text: "Recruiters focus on what they do best. One partner sources, another closes. Each contributes their strongest skill to the placement.",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "Faster Placements",
        text: "More eyes on a role means faster candidate flow. Split-fee placements fill 3x faster than traditional solo approaches.",
    },
];

/* ─── Technology Features ───────────────────────────────────────────────── */
const techFeatures = [
    {
        icon: "fa-duotone fa-regular fa-robot",
        title: "AI-Powered Matching",
        desc: "Algorithms that pair the right recruiter with the right role based on track record, specialty, and network strength.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Real-Time Transparency",
        desc: "Every stakeholder sees the same pipeline. No black boxes, no surprises, no lost candidates in email threads.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Automated Payouts",
        desc: "Smart contracts and automated split calculations eliminate disputes and ensure every partner gets paid on time.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Data-Driven Insights",
        desc: "Performance analytics help recruiters optimize their approach and companies track sourcing effectiveness across their network.",
    },
];

/* ─── Timeline Milestones ───────────────────────────────────────────────── */
const timeline = [
    {
        year: "2010",
        title: "The Handshake Era",
        text: "Split-fee arrangements relied on personal relationships and verbal agreements. Trust was currency, and disputes were common.",
    },
    {
        year: "2015",
        title: "Early Platforms",
        text: "First-generation job boards attempted to formalize recruiter collaboration, but lacked workflow tools and transparent fee structures.",
    },
    {
        year: "2020",
        title: "The Remote Shift",
        text: "Global remote hiring exploded demand for distributed recruiter networks. Traditional agency models struggled to keep pace.",
    },
    {
        year: "2025",
        title: "The Platform Age",
        text: "Purpose-built split-fee marketplaces emerged with real-time tracking, automated payouts, and AI-driven matching at scale.",
    },
];

/* ─── Impact Metrics ────────────────────────────────────────────────────── */
const impactMetrics = [
    { value: "73%", label: "Higher Recruiter Earnings", detail: "compared to solo placements" },
    { value: "3x", label: "Faster Time-to-Fill", detail: "versus single-agency search" },
    { value: "40%", label: "Less Admin Overhead", detail: "with platform automation" },
    { value: "92%", label: "Partner Satisfaction", detail: "among active split-fee users" },
];

/* ─── Pull Quotes ───────────────────────────────────────────────────────── */
const pullQuotes = [
    {
        quote: "Split-fee networks let me punch above my weight class. I placed a VP of Engineering last quarter at a company I never could have reached alone.",
        author: "Marcus Chen",
        role: "Independent Recruiter, Bay Area",
    },
    {
        quote: "We replaced twelve individual recruiter contracts with one platform. Our cost-per-hire dropped 40% in the first quarter.",
        author: "David Okonkwo",
        role: "VP Talent Acquisition, Series B Startup",
    },
    {
        quote: "The old recruiting model is dying. Companies want transparency, recruiters want fairness, and candidates want communication. Split-fee platforms deliver all three.",
        author: "Sarah Mitchell",
        role: "Industry Analyst, Talent Insights Group",
    },
];

export default function ArticleFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(
                    containerRef.current.querySelectorAll(".cin-reveal"),
                    { opacity: 1, y: 0, x: 0 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ════════════════════════════════════════
            // HERO — cinematic entrance
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Parallax hero image
            gsap.to($1(".cin-hero-img"), {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".cin-hero"),
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            heroTl
                .fromTo(
                    $1(".cin-hero-overlay"),
                    { opacity: 0 },
                    { opacity: 1, duration: 0.8 },
                )
                .fromTo(
                    $1(".cin-hero-kicker"),
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    0.3,
                )
                .fromTo(
                    $1(".cin-hero-headline"),
                    { opacity: 0, y: 80 },
                    { opacity: 1, y: 0, duration: 1.2 },
                    0.4,
                )
                .fromTo(
                    $1(".cin-hero-sub"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    0.8,
                )
                .fromTo(
                    $(".cin-hero-meta"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
                    1.0,
                );

            // ════════════════════════════════════════
            // KEY STATS BAR — stagger in
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".cin-stat"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".cin-stats"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // INTRO SECTION
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cin-intro-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-intro"),
                        start: "top 75%",
                    },
                },
            );

            // ════════════════════════════════════════
            // TIMELINE — stagger milestones
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cin-timeline-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-timeline"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-milestone"),
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-milestones"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // SPLIT PANELS — slide from alternating sides
            // ════════════════════════════════════════
            const panels = $(".cin-split-panel");
            panels.forEach((panel, i) => {
                const img = panel.querySelector(".cin-split-img");
                const content = panel.querySelector(".cin-split-content");
                const fromLeft = i % 2 === 0;

                if (img) {
                    gsap.to(img.querySelector("img"), {
                        yPercent: 15,
                        ease: "none",
                        scrollTrigger: {
                            trigger: panel,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });

                    gsap.fromTo(
                        img,
                        { opacity: 0, x: fromLeft ? -80 : 80 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: panel,
                                start: "top 75%",
                            },
                        },
                    );
                }

                if (content) {
                    gsap.fromTo(
                        content,
                        { opacity: 0, x: fromLeft ? 80 : -80 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: panel,
                                start: "top 75%",
                            },
                        },
                    );

                    const cards = content.querySelectorAll(".cin-feature-card");
                    if (cards.length) {
                        gsap.fromTo(
                            cards,
                            { opacity: 0, y: 30 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.5,
                                stagger: 0.08,
                                ease: "power2.out",
                                scrollTrigger: {
                                    trigger: content,
                                    start: "top 70%",
                                },
                            },
                        );
                    }
                }
            });

            // ════════════════════════════════════════
            // PULL QUOTES — bold fade
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cin-quotes-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-quotes"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-quote"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-quotes-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // DATA SECTION — cinematic wide reveal
            // ════════════════════════════════════════
            gsap.to($1(".cin-data-img"), {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".cin-data"),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.fromTo(
                $1(".cin-data-content"),
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-data"),
                        start: "top 60%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-data-metric"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".cin-data-metrics"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // FUTURE PANEL — slide in
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cin-future-img"),
                { opacity: 0, x: 80 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-future"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $1(".cin-future-content"),
                { opacity: 0, x: -80 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-future"),
                        start: "top 75%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CTA — cinematic final
            // ════════════════════════════════════════
            gsap.to($1(".cin-cta-img"), {
                yPercent: 25,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".cin-cta"),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.fromTo(
                $1(".cin-cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-cta"),
                        start: "top 65%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-cta-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: $1(".cin-cta-cards"),
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="cin-page overflow-hidden">
            {/* ══════════════════════════════════════════════════════════════
                HERO — Full-Bleed Cinematic
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-hero relative min-h-screen flex items-end overflow-hidden">
                <div className="cin-hero-img absolute inset-0 w-full h-[120%] -top-[10%]">
                    <img
                        src={HERO_IMG}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </div>

                <div className="cin-hero-overlay absolute inset-0 bg-neutral/85 opacity-0" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20 pt-40 w-full">
                    <p className="cin-hero-kicker text-xs uppercase tracking-[0.3em] font-medium text-primary mb-6 opacity-0">
                        {articleMeta.category}
                    </p>

                    <h1 className="cin-hero-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white mb-8 max-w-4xl opacity-0">
                        The Future of Recruiting:
                        <br />
                        How <span className="text-primary">Split-Fee Models</span>
                        <br />
                        Are Changing The Industry
                    </h1>

                    <p className="cin-hero-sub text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-10 opacity-0">
                        An in-depth look at how collaborative recruiting models
                        are reshaping a $200 billion industry, and why the
                        smartest firms are already making the switch.
                    </p>

                    <div className="flex flex-wrap gap-6 text-sm text-white/50">
                        <span className="cin-hero-meta inline-flex items-center gap-2 opacity-0">
                            <i className="fa-duotone fa-regular fa-user-pen text-primary" />
                            {articleMeta.author}
                        </span>
                        <span className="cin-hero-meta inline-flex items-center gap-2 opacity-0">
                            <i className="fa-duotone fa-regular fa-calendar text-primary" />
                            {articleMeta.date}
                        </span>
                        <span className="cin-hero-meta inline-flex items-center gap-2 opacity-0">
                            <i className="fa-duotone fa-regular fa-clock text-primary" />
                            {articleMeta.readTime}
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
                    <i className="fa-duotone fa-regular fa-chevron-down text-xl" />
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-stats bg-neutral py-12 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {keyStats.map((s, i) => (
                            <div
                                key={i}
                                className="cin-stat text-center opacity-0"
                            >
                                <div className="text-3xl md:text-4xl font-black text-primary mb-1">
                                    {s.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-white/50 font-medium">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTRODUCTION — The Broken Status Quo
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-intro bg-base-100 py-24 lg:py-32">
                <div className="cin-intro-content max-w-3xl mx-auto px-6 opacity-0">
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-6">
                        01 &mdash; The Broken Status Quo
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8">
                        Recruiting is broken.{" "}
                        <span className="text-base-content/40">
                            Everyone knows it.
                        </span>
                    </h2>
                    <div className="space-y-6 text-lg text-base-content/70 leading-relaxed">
                        <p>
                            The traditional recruiting model was built for a
                            world that no longer exists. Companies pay retainers
                            for searches that may never close. Recruiters juggle
                            dozens of clients with no visibility into pipeline
                            progress. Candidates apply into black holes and
                            never hear back.
                        </p>
                        <p>
                            The numbers tell the story: the average
                            cost-per-hire in the United States now exceeds
                            $4,700, and the average time-to-fill stretches
                            beyond 44 days. For specialized roles in technology
                            and healthcare, those figures can triple. Meanwhile,
                            73% of candidates say they have been ghosted after
                            an interview, and 65% of recruiters report spending
                            more time on administrative tasks than actual
                            recruiting.
                        </p>
                        <p>
                            Something has to change. And it is.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE — Evolution of Split-Fee
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-timeline bg-neutral text-white py-24 lg:py-32">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="cin-timeline-heading mb-16 opacity-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                            02 &mdash; What Are Split-Fee Models?
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight max-w-3xl">
                            From handshake deals
                            <br />
                            to digital ecosystems
                        </h2>
                    </div>

                    <div className="cin-milestones space-y-0">
                        {timeline.map((m, i) => (
                            <div
                                key={i}
                                className="cin-milestone flex gap-8 items-start opacity-0 border-l-4 border-primary/30 pl-8 pb-12 last:pb-0 relative"
                            >
                                <div className="absolute -left-[11px] top-0 w-[18px] h-[18px] rounded-full bg-primary" />
                                <div>
                                    <div className="text-primary font-black text-2xl mb-2">
                                        {m.year}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {m.title}
                                    </h3>
                                    <p className="text-white/60 leading-relaxed max-w-lg">
                                        {m.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 max-w-3xl">
                        <p className="text-lg text-white/60 leading-relaxed">
                            In a split-fee arrangement, two or more recruiters
                            share a placement fee. Typically, one party has the
                            job order (the hiring company relationship) while the
                            other has the candidate. When the placement closes,
                            the fee is split based on pre-agreed terms, usually
                            50/50 or weighted by contribution.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                GROWTH DRIVERS — Split Panel (Image Left, Content Right)
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-split-panel grid lg:grid-cols-2 min-h-[80vh]">
                <div className="cin-split-img relative overflow-hidden bg-neutral opacity-0">
                    <img
                        src={HISTORY_IMG}
                        alt="Strategic planning and collaboration"
                        className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-primary/15" />
                    <div className="absolute bottom-6 left-6">
                        <span className="badge badge-primary badge-lg font-bold shadow-lg">
                            <i className="fa-duotone fa-regular fa-chart-line-up mr-1" />
                            Growth Accelerating
                        </span>
                    </div>
                </div>

                <div className="cin-split-content flex items-center bg-base-100 opacity-0">
                    <div className="max-w-xl mx-auto px-8 py-16 lg:px-12">
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                            03 &mdash; Why Split-Fee Is Growing
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6">
                            Four forces driving
                            <br />
                            the revolution
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed mb-10">
                            Split-fee recruiting is not new, but its explosive
                            growth is. Several converging forces have turned what
                            was once a niche practice into the fastest-growing
                            segment of the $200B staffing industry.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {growthDrivers.map((d, i) => (
                                <div
                                    key={i}
                                    className="cin-feature-card p-4 bg-base-200 rounded-xl opacity-0"
                                >
                                    <i
                                        className={`${d.icon} text-primary text-lg mb-2 block`}
                                    />
                                    <div className="font-bold text-sm mb-1">
                                        {d.title}
                                    </div>
                                    <p className="text-xs text-base-content/60 leading-relaxed">
                                        {d.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTES — Bold Testimonials
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-quotes bg-neutral text-white py-24 lg:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="cin-quotes-heading text-center mb-16 opacity-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                            Voices From The Field
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black">
                            What they are saying
                        </h2>
                    </div>

                    <div className="cin-quotes-grid grid md:grid-cols-3 gap-8">
                        {pullQuotes.map((q, i) => (
                            <div
                                key={i}
                                className="cin-quote opacity-0"
                            >
                                <div className="border-l-4 border-primary pl-6 mb-6">
                                    <p className="text-xl md:text-2xl font-bold leading-snug text-white/90 italic">
                                        &ldquo;{q.quote}&rdquo;
                                    </p>
                                </div>
                                <div className="pl-6">
                                    <div className="font-bold text-white">
                                        {q.author}
                                    </div>
                                    <div className="text-sm text-white/50">
                                        {q.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TECHNOLOGY — Split Panel (Content Left, Image Right)
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-split-panel grid lg:grid-cols-2 min-h-[80vh]">
                <div className="cin-split-content flex items-center bg-base-100 order-2 lg:order-1 opacity-0">
                    <div className="max-w-xl mx-auto px-8 py-16 lg:px-12">
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                            04 &mdash; Technology as the Catalyst
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6">
                            Platforms that make
                            <br />
                            collaboration seamless
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed mb-10">
                            The real accelerant behind the split-fee revolution
                            is technology. Modern platforms eliminate the friction
                            that historically made collaboration between
                            recruiters impractical at scale.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {techFeatures.map((f, i) => (
                                <div
                                    key={i}
                                    className="cin-feature-card p-4 bg-base-200 rounded-xl opacity-0"
                                >
                                    <i
                                        className={`${f.icon} text-primary text-lg mb-2 block`}
                                    />
                                    <div className="font-bold text-sm mb-1">
                                        {f.title}
                                    </div>
                                    <p className="text-xs text-base-content/60 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="cin-split-img relative overflow-hidden bg-neutral order-1 lg:order-2 opacity-0">
                    <img
                        src={TECH_IMG}
                        alt="Modern technology workspace"
                        className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-neutral/20" />
                    <div className="absolute bottom-6 right-6">
                        <span className="badge badge-primary badge-lg font-bold shadow-lg">
                            <i className="fa-duotone fa-regular fa-microchip mr-1" />
                            Platform-Powered
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                THE DATA — Cinematic Wide with Overlay
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-data relative min-h-[80vh] flex items-center overflow-hidden">
                <div className="cin-data-img absolute inset-0 w-full h-[130%] -top-[15%]">
                    <img
                        src={DATA_IMG}
                        alt="Data analytics dashboard"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="absolute inset-0 bg-neutral/90" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center text-white">
                    <div className="cin-data-content opacity-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                            05 &mdash; The Data Speaks
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                            Numbers that tell
                            <br />
                            the story
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-16">
                            Across every metric that matters, split-fee
                            recruiting outperforms traditional models. The
                            evidence is clear and the trend is accelerating.
                        </p>
                    </div>

                    <div className="cin-data-metrics grid md:grid-cols-4 gap-6">
                        {impactMetrics.map((m, i) => (
                            <div
                                key={i}
                                className="cin-data-metric bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0"
                            >
                                <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                                    {m.value}
                                </div>
                                <div className="font-bold text-white text-sm mb-1">
                                    {m.label}
                                </div>
                                <div className="text-xs text-white/40">
                                    {m.detail}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                WHAT THIS MEANS — Split Panel (Image Left, Content Right)
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-future grid lg:grid-cols-2 min-h-[80vh]">
                <div className="cin-future-img relative overflow-hidden bg-neutral opacity-0">
                    <img
                        src={FUTURE_IMG}
                        alt="Team celebrating success"
                        className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-primary/10" />
                </div>

                <div className="cin-future-content flex items-center bg-base-100 opacity-0">
                    <div className="max-w-xl mx-auto px-8 py-16 lg:px-12">
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                            06 &mdash; What This Means For You
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8">
                            The question is not if,
                            <br />
                            <span className="text-primary">but when</span>
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed">
                            <p className="text-lg">
                                <strong className="text-base-content">
                                    If you are a recruiter,
                                </strong>{" "}
                                the split-fee model is your force multiplier.
                                You no longer need to be everything to everyone.
                                Focus on your niche, build your candidate
                                relationships, and let the network handle the
                                rest. The recruiters who thrive in the next
                                decade will be the ones who collaborate, not the
                                ones who hoard.
                            </p>
                            <p className="text-lg">
                                <strong className="text-base-content">
                                    If you are a company,
                                </strong>{" "}
                                stop managing a dozen recruiter contracts with a
                                dozen different fee structures. One platform, one
                                set of terms, access to an entire network. Your
                                cost-per-hire drops, your time-to-fill
                                accelerates, and your visibility into the process
                                goes from opaque to transparent.
                            </p>
                            <p className="text-lg">
                                <strong className="text-base-content">
                                    If you are a candidate,
                                </strong>{" "}
                                the split-fee model means more advocates working
                                on your behalf. Instead of one recruiter with
                                limited relationships, you get access to an
                                entire network of opportunities. And with
                                platform-driven transparency, you will always
                                know where you stand.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA — Cinematic Final
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-cta relative min-h-[70vh] flex items-center overflow-hidden">
                <div className="cin-cta-img absolute inset-0 w-full h-[130%] -top-[15%]">
                    <img
                        src={CTA_IMG}
                        alt="Modern workspace"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="absolute inset-0 bg-primary/85" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center text-white">
                    <div className="cin-cta-content opacity-0">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                            Ready to join
                            <br />
                            the revolution?
                        </h2>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                            The future of recruiting is collaborative,
                            transparent, and platform-driven. Be part of the
                            ecosystem that is making it happen.
                        </p>
                    </div>

                    <div className="cin-cta-cards grid md:grid-cols-3 gap-6 mb-12">
                        <div className="cin-cta-card bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm opacity-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-lg" />
                            </div>
                            <h3 className="font-bold mb-2">Recruiters</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Join a collaborative marketplace with curated
                                roles and transparent splits.
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full font-semibold"
                            >
                                Join Network
                            </a>
                        </div>

                        <div className="cin-cta-card bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm opacity-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-user text-lg" />
                            </div>
                            <h3 className="font-bold mb-2">Candidates</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Get matched with expert recruiters. Never get
                                ghosted again. Free forever.
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-sm bg-white text-secondary hover:bg-white/90 border-0 w-full font-semibold"
                            >
                                Create Profile
                            </a>
                        </div>

                        <div className="cin-cta-card bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm opacity-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-building text-lg" />
                            </div>
                            <h3 className="font-bold mb-2">Companies</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Access a network of recruiters with full
                                visibility and pay-on-hire.
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-sm bg-white text-accent hover:bg-white/90 border-0 w-full font-semibold"
                            >
                                Post a Role
                            </a>
                        </div>
                    </div>

                    <div className="text-white/40 text-sm">
                        <a
                            href="mailto:hello@employment-networks.com"
                            className="hover:text-white/70 transition-colors inline-flex items-center gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
