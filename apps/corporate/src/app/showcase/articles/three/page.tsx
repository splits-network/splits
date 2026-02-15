"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants (matching landing page three) ────────────────────────
const D = { fast: 0.35, normal: 0.6, slow: 0.9, hero: 1.2, counter: 2.0 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };
const S = { tight: 0.06, normal: 0.1, grid: 0.04 };

// ── Article Data ─────────────────────────────────────────────────────────────

const articleMeta = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry",
    date: "February 14, 2026",
    readTime: "12 min read",
    author: "Employment Networks Editorial",
    category: "Industry Analysis",
    ref: "EN-2026-A03",
};

const keyStats = [
    { value: "73%", label: "Recruiters Report Higher Earnings" },
    { value: "3x", label: "Faster Time-to-Fill" },
    { value: "40%", label: "Reduction in Admin Overhead" },
    { value: "$4.7B", label: "Split-Fee Market (2025)" },
];

const sectionIndex = [
    { number: "01", title: "The Broken Status Quo" },
    { number: "02", title: "What Are Split-Fee Models?" },
    { number: "03", title: "Why Split-Fee Is Growing" },
    { number: "04", title: "Technology as the Catalyst" },
    { number: "05", title: "The Data Speaks" },
    { number: "06", title: "What This Means for You" },
];

const growthReasons = [
    {
        number: "01",
        title: "Expanded Reach",
        text: "Solo recruiters can access enterprise-level roles they could never touch alone. By partnering on the fee, they gain entry into larger markets.",
    },
    {
        number: "02",
        title: "Reduced Risk",
        text: "Companies diversify their sourcing pipeline. Instead of relying on one recruiter, they tap an entire network simultaneously.",
    },
    {
        number: "03",
        title: "Specialization",
        text: "Recruiters can focus on what they do best. One partner sources, another closes. Each contributes their strongest skill.",
    },
    {
        number: "04",
        title: "Faster Placements",
        text: "More eyes on a role means faster candidate flow. Data shows split-fee placements fill 3x faster than traditional solo approaches.",
    },
];

const impactMetrics = [
    { value: 73, suffix: "%", label: "Higher Recruiter Earnings", description: "compared to solo placements" },
    { value: 3, suffix: "x", label: "Faster Time-to-Fill", description: "versus single-agency search" },
    { value: 40, suffix: "%", label: "Less Admin Overhead", description: "with platform automation" },
    { value: 92, suffix: "%", label: "Partner Satisfaction", description: "among active split-fee users" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ArticleThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".anim"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // ── HERO ──────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.precise } });

            heroTl.fromTo(
                $1(".article-number"),
                { opacity: 0, y: 120, skewY: 8 },
                { opacity: 1, y: 0, skewY: 0, duration: D.hero },
            );

            heroTl.fromTo(
                $1(".article-category"),
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: D.fast },
                "-=0.6",
            );

            heroTl.fromTo(
                $1(".article-headline"),
                { opacity: 0, x: -80 },
                { opacity: 1, x: 0, duration: D.slow },
                "-=0.5",
            );

            heroTl.fromTo(
                $1(".article-meta-line"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.normal, transformOrigin: "left center" },
                "-=0.3",
            );

            heroTl.fromTo(
                $(".article-meta-item"),
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: D.fast, stagger: S.normal },
                "-=0.2",
            );

            // Key stats grid
            heroTl.fromTo(
                $(".key-stat-cell"),
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: D.fast, stagger: S.grid },
                "-=0.2",
            );

            // ── TABLE OF CONTENTS ─────────────────────────────
            gsap.fromTo(
                $1(".toc-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".toc-section"), start: "top 80%" },
                },
            );

            $(".toc-item").forEach((item, i) => {
                gsap.fromTo(
                    item,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0, duration: D.fast, ease: E.precise,
                        delay: i * S.tight,
                        scrollTrigger: { trigger: $1(".toc-list"), start: "top 85%" },
                    },
                );
            });

            // ── ARTICLE SECTIONS ──────────────────────────────
            $(".article-section").forEach((section) => {
                // Section number
                gsap.fromTo(
                    section.querySelector(".section-number"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0, duration: D.fast, ease: E.precise,
                        scrollTrigger: { trigger: section, start: "top 80%" },
                    },
                );

                // Section divider
                const divider = section.querySelector(".section-divider");
                if (divider) {
                    gsap.fromTo(
                        divider,
                        { scaleX: 0 },
                        {
                            scaleX: 1, duration: D.normal, ease: E.mechanical,
                            transformOrigin: "left center",
                            delay: 0.1,
                            scrollTrigger: { trigger: section, start: "top 80%" },
                        },
                    );
                }

                // Section heading
                gsap.fromTo(
                    section.querySelector(".section-heading"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0, duration: D.fast, ease: E.precise,
                        delay: 0.15,
                        scrollTrigger: { trigger: section, start: "top 80%" },
                    },
                );

                // Body paragraphs
                gsap.fromTo(
                    section.querySelectorAll(".section-body"),
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1, y: 0, duration: D.normal, ease: E.precise,
                        stagger: S.normal,
                        delay: 0.25,
                        scrollTrigger: { trigger: section, start: "top 80%" },
                    },
                );
            });

            // ── PULL QUOTES ───────────────────────────────────
            $(".pull-quote").forEach((quote) => {
                gsap.fromTo(
                    quote.querySelector(".quote-line"),
                    { scaleY: 0 },
                    {
                        scaleY: 1, duration: D.slow, ease: E.mechanical,
                        transformOrigin: "top center",
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );

                gsap.fromTo(
                    quote.querySelector(".quote-text"),
                    { opacity: 0, x: 30 },
                    {
                        opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                        delay: 0.2,
                        scrollTrigger: { trigger: quote, start: "top 80%" },
                    },
                );
            });

            // ── GROWTH REASONS GRID ───────────────────────────
            $(".reason-card").forEach((card, i) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.fast, ease: E.precise,
                        delay: i * S.grid,
                        scrollTrigger: { trigger: $1(".reasons-grid"), start: "top 80%" },
                    },
                );
            });

            // ── IMPACT METRICS ────────────────────────────────
            gsap.fromTo(
                $(".impact-cell"),
                { opacity: 0, scale: 0.85 },
                {
                    opacity: 1, scale: 1, duration: D.fast, ease: E.precise,
                    stagger: S.grid,
                    scrollTrigger: { trigger: $1(".impact-grid"), start: "top 80%" },
                },
            );

            // Counter animations for impact metrics
            const counterEls = $(".impact-counter");
            counterEls.forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.precise,
                        delay: 0.2 + i * S.normal,
                        scrollTrigger: { trigger: $1(".impact-grid"), start: "top 80%" },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            el.textContent = current + suffix;
                        },
                    },
                );
            });

            // ── IMAGES ────────────────────────────────────────
            $(".article-image").forEach((img) => {
                gsap.fromTo(
                    img,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.slow, ease: E.precise,
                        scrollTrigger: { trigger: img, start: "top 85%" },
                    },
                );
            });

            // ── CTA ───────────────────────────────────────────
            gsap.fromTo(
                $1(".cta-number"),
                { opacity: 0, y: 80, skewY: 5 },
                {
                    opacity: 1, y: 0, skewY: 0, duration: D.hero, ease: E.precise,
                    scrollTrigger: { trigger: $1(".cta-section"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $1(".cta-headline"),
                { opacity: 0, x: -60 },
                {
                    opacity: 1, x: 0, duration: D.slow, ease: E.precise,
                    delay: 0.2,
                    scrollTrigger: { trigger: $1(".cta-section"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".cta-button"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: D.fast, ease: E.precise,
                    stagger: S.normal,
                    delay: 0.5,
                    scrollTrigger: { trigger: $1(".cta-section"), start: "top 75%" },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content">
            {/* ════════════════════════════════════════════════════════
                HERO - Article header with Swiss grid
               ════════════════════════════════════════════════════════ */}
            <section className="min-h-[80vh] relative overflow-hidden border-b-2 border-neutral">
                <div className="absolute top-0 left-0 right-0 h-1 bg-neutral" />

                <div className="container mx-auto px-6 lg:px-12 pt-24 pb-16 flex flex-col justify-center">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end">
                        {/* Oversized article marker */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="article-number opacity-0 text-[7rem] sm:text-[10rem] lg:text-[14rem] font-black leading-none tracking-tighter text-neutral/8 select-none">
                                A3
                            </div>
                        </div>

                        {/* Article header content */}
                        <div className="col-span-12 lg:col-span-8 pb-4 lg:pb-8">
                            <div className="article-category opacity-0 mb-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40 border border-base-300 px-3 py-1.5 inline-block">
                                    {articleMeta.category}
                                </span>
                            </div>

                            <h1 className="article-headline opacity-0 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                {articleMeta.title}
                            </h1>

                            <div className="article-meta-line h-[2px] bg-neutral mb-6" style={{ transformOrigin: "left center" }} />

                            <div className="flex flex-wrap gap-6 items-center">
                                <span className="article-meta-item opacity-0 text-xs uppercase tracking-[0.2em] text-base-content/40">
                                    {articleMeta.date}
                                </span>
                                <span className="article-meta-item opacity-0 text-xs uppercase tracking-[0.2em] text-base-content/40">
                                    {articleMeta.readTime}
                                </span>
                                <span className="article-meta-item opacity-0 text-xs uppercase tracking-[0.2em] text-base-content/40">
                                    {articleMeta.author}
                                </span>
                                <span className="article-meta-item opacity-0 text-[10px] font-mono tracking-wider text-base-content/20">
                                    REF: {articleMeta.ref}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Key stats bar */}
                    <div className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                        {keyStats.map((stat, i) => (
                            <div
                                key={i}
                                className="key-stat-cell opacity-0 bg-base-100 p-4 lg:p-6"
                            >
                                <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-2xl lg:text-3xl font-black tracking-tighter">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                HERO IMAGE
               ════════════════════════════════════════════════════════ */}
            <section className="article-image opacity-0 relative h-[40vh] lg:h-[50vh] border-b-2 border-neutral overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80&auto=format&fit=crop"
                    alt="Team collaboration in modern office"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/40" />
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 bg-neutral/60 px-3 py-1.5 inline-block">
                        The modern recruiting landscape demands collaboration
                    </span>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                TABLE OF CONTENTS
               ════════════════════════════════════════════════════════ */}
            <section className="toc-section py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-3">
                            <div className="toc-label opacity-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40 mb-2">Contents</p>
                                <h2 className="text-lg font-black tracking-tight">Index</h2>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-9">
                            <div className="toc-list space-y-0">
                                {sectionIndex.map((item, i) => (
                                    <div
                                        key={i}
                                        className="toc-item opacity-0 flex items-baseline gap-4 py-3 border-b border-base-300 group cursor-default"
                                    >
                                        <span className="text-sm font-black tracking-tighter text-base-content/20 group-hover:text-primary transition-colors duration-300 w-8 flex-shrink-0">
                                            {item.number}
                                        </span>
                                        <span className="text-base lg:text-lg font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SECTION 01 - The Broken Status Quo
               ════════════════════════════════════════════════════════ */}
            <section className="article-section py-16 lg:py-24 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        {/* Section marker */}
                        <div className="col-span-12 lg:col-span-2">
                            <span className="section-number opacity-0 text-4xl lg:text-6xl font-black tracking-tighter text-neutral/10">
                                01
                            </span>
                        </div>

                        {/* Content */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="section-divider h-[2px] bg-neutral/20 mb-6" style={{ transformOrigin: "left center" }} />

                            <h2 className="section-heading opacity-0 text-2xl lg:text-3xl font-black tracking-tight mb-8">
                                The Broken Status Quo
                            </h2>

                            <div className="space-y-6">
                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    For decades, the recruiting industry has operated on a model built for a
                                    different era. Individual recruiters work in silos, maintaining their own
                                    networks and databases. Companies engage multiple agencies under separate
                                    contracts, each with different terms and visibility levels. Candidates
                                    submit applications into black holes, rarely hearing back.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The result is an ecosystem defined by fragmentation. Recruiters spend
                                    more time on administration than actual recruiting. Companies lack
                                    visibility into their hiring pipelines. And candidates -- the people
                                    the entire industry is supposed to serve -- are left in the dark.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The numbers paint a clear picture: the average time-to-fill for a
                                    professional role has grown to 44 days. Recruiter burnout rates hover
                                    near 50%. And over 60% of candidates report being ghosted after at
                                    least one interview. The system is not just inefficient -- it is
                                    fundamentally broken.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PULL QUOTE 1 ──────────────────────────────────── */}
            <section className="pull-quote py-16 lg:py-20 border-b-2 border-neutral bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-center">
                        <div className="col-span-1">
                            <div className="quote-line w-[2px] h-24 lg:h-32 bg-neutral-content/30 mx-auto" style={{ transformOrigin: "top center" }} />
                        </div>
                        <div className="col-span-11 lg:col-span-9">
                            <blockquote className="quote-text opacity-0">
                                <p className="text-2xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
                                    &ldquo;The recruiting industry is the last
                                    major professional services sector to
                                    resist structural collaboration.&rdquo;
                                </p>
                                <cite className="text-xs uppercase tracking-[0.2em] text-neutral-content/40 not-italic">
                                    -- Industry Analysis, 2025
                                </cite>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SECTION 02 - What Are Split-Fee Models?
               ════════════════════════════════════════════════════════ */}
            <section className="article-section py-16 lg:py-24 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="section-number opacity-0 text-4xl lg:text-6xl font-black tracking-tighter text-neutral/10">
                                02
                            </span>
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <div className="section-divider h-[2px] bg-neutral/20 mb-6" style={{ transformOrigin: "left center" }} />

                            <h2 className="section-heading opacity-0 text-2xl lg:text-3xl font-black tracking-tight mb-8">
                                What Are Split-Fee Models?
                            </h2>

                            <div className="space-y-6">
                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    Split-fee recruiting is a partnership model where two or more recruiters
                                    collaborate on a single placement and share the resulting fee. One
                                    recruiter typically holds the job order (the &ldquo;job side&rdquo;),
                                    while another sources and submits candidates (the
                                    &ldquo;candidate side&rdquo;). When a placement is made, the fee is
                                    divided according to pre-agreed terms.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The concept is not new -- split-fee networks have existed since the
                                    1970s. But historically, they were run through loose associations,
                                    phone calls, and handshake agreements. The lack of infrastructure
                                    meant disputes were common, transparency was nonexistent, and
                                    scaling beyond a handful of trusted partners was impractical.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    What has changed is technology. Modern split-fee platforms provide
                                    the infrastructure that makes collaboration reliable at scale:
                                    clear terms set upfront, automated tracking, transparent pipelines,
                                    and guaranteed payouts. The split-fee model has finally caught up
                                    to its potential.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── INLINE IMAGE ──────────────────────────────────── */}
            <section className="article-image opacity-0 relative h-[35vh] lg:h-[45vh] border-b-2 border-neutral overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&q=80&auto=format&fit=crop"
                    alt="Digital dashboard and analytics"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/50" />
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 bg-neutral/60 px-3 py-1.5 inline-block">
                        Platform technology enables transparent collaboration at scale
                    </span>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SECTION 03 - Why Split-Fee Is Growing
               ════════════════════════════════════════════════════════ */}
            <section className="article-section py-16 lg:py-24 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="section-number opacity-0 text-4xl lg:text-6xl font-black tracking-tighter text-neutral/10">
                                03
                            </span>
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <div className="section-divider h-[2px] bg-neutral/20 mb-6" style={{ transformOrigin: "left center" }} />

                            <h2 className="section-heading opacity-0 text-2xl lg:text-3xl font-black tracking-tight mb-8">
                                Why Split-Fee Is Growing
                            </h2>

                            <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg mb-10">
                                The split-fee model addresses fundamental structural problems in
                                recruiting. Here are four reasons adoption is accelerating across
                                the industry.
                            </p>
                        </div>
                    </div>

                    {/* Reasons grid */}
                    <div className="reasons-grid grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-neutral/10 mt-8 max-w-5xl mx-auto lg:ml-[16.666%]">
                        {growthReasons.map((reason, i) => (
                            <div
                                key={i}
                                className="reason-card opacity-0 bg-base-100 p-6 lg:p-8"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl font-black tracking-tighter text-base-content/15 flex-shrink-0">
                                        {reason.number}
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight mb-2">
                                            {reason.title}
                                        </h3>
                                        <p className="text-sm text-base-content/60 leading-relaxed">
                                            {reason.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PULL QUOTE 2 ──────────────────────────────────── */}
            <section className="pull-quote py-16 lg:py-20 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-center">
                        <div className="col-span-1">
                            <div className="quote-line w-[2px] h-24 lg:h-32 bg-primary mx-auto" style={{ transformOrigin: "top center" }} />
                        </div>
                        <div className="col-span-11 lg:col-span-9">
                            <blockquote className="quote-text opacity-0">
                                <p className="text-2xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
                                    &ldquo;Split-fee is not about splitting
                                    your earnings. It is about multiplying
                                    your opportunities.&rdquo;
                                </p>
                                <cite className="text-xs uppercase tracking-[0.2em] text-base-content/40 not-italic">
                                    -- Senior Recruiter, Splits Network Member
                                </cite>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SECTION 04 - Technology as the Catalyst
               ════════════════════════════════════════════════════════ */}
            <section className="article-section py-16 lg:py-24 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="section-number opacity-0 text-4xl lg:text-6xl font-black tracking-tighter text-neutral/10">
                                04
                            </span>
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <div className="section-divider h-[2px] bg-neutral/20 mb-6" style={{ transformOrigin: "left center" }} />

                            <h2 className="section-heading opacity-0 text-2xl lg:text-3xl font-black tracking-tight mb-8">
                                Technology as the Catalyst
                            </h2>

                            <div className="space-y-6">
                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The split-fee concept existed for decades without gaining
                                    mainstream traction. The missing ingredient was infrastructure.
                                    Without a reliable platform to manage agreements, track candidates,
                                    and process payouts, the friction cost of collaboration outweighed
                                    the benefits.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    Modern platforms like Splits Network have changed this equation
                                    fundamentally. They provide an integrated environment where terms
                                    are set upfront, every candidate submission is tracked, pipeline
                                    visibility is shared in real time, and payouts are automated upon
                                    placement confirmation.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The technology layer does more than reduce friction -- it creates
                                    trust. When every interaction is logged, every agreement is
                                    documented, and every payout is guaranteed, recruiters can
                                    collaborate with partners they have never met. The platform
                                    becomes the trust layer.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    AI-powered matching further accelerates the model. Instead of
                                    manually searching for the right partner or candidate, algorithms
                                    surface optimal matches based on specialization, track record,
                                    and real-time availability. The result is faster placements with
                                    higher quality matches.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── INLINE IMAGE ──────────────────────────────────── */}
            <section className="article-image opacity-0 relative h-[35vh] lg:h-[45vh] border-b-2 border-neutral overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80&auto=format&fit=crop"
                    alt="Data analytics and metrics dashboard"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/50" />
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 bg-neutral/60 px-3 py-1.5 inline-block">
                        Data-driven recruiting replaces intuition with evidence
                    </span>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SECTION 05 - The Data Speaks
               ════════════════════════════════════════════════════════ */}
            <section className="article-section py-16 lg:py-24 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="section-number opacity-0 text-4xl lg:text-6xl font-black tracking-tighter text-neutral/10">
                                05
                            </span>
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <div className="section-divider h-[2px] bg-neutral/20 mb-6" style={{ transformOrigin: "left center" }} />

                            <h2 className="section-heading opacity-0 text-2xl lg:text-3xl font-black tracking-tight mb-8">
                                The Data Speaks
                            </h2>

                            <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg mb-10">
                                The impact of platform-enabled split-fee recruiting is measurable
                                across every key metric. The following data reflects aggregate
                                performance across active platform users.
                            </p>
                        </div>
                    </div>

                    {/* Impact metrics grid */}
                    <div className="impact-grid grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10 mt-4 max-w-5xl mx-auto lg:ml-[16.666%]">
                        {impactMetrics.map((metric, i) => (
                            <div
                                key={i}
                                className="impact-cell opacity-0 bg-base-100 p-6 lg:p-8"
                            >
                                <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    {metric.label}
                                </div>
                                <div
                                    className="impact-counter text-4xl lg:text-5xl font-black tracking-tighter leading-none mb-2"
                                    data-value={metric.value}
                                    data-suffix={metric.suffix}
                                >
                                    0{metric.suffix}
                                </div>
                                <div className="text-xs text-base-content/30">
                                    {metric.description}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Continuation text */}
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 mt-12">
                        <div className="col-span-12 lg:col-span-2" />
                        <div className="col-span-12 lg:col-span-8">
                            <div className="space-y-6">
                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    These numbers represent a structural shift, not a marginal
                                    improvement. Recruiters earn more because they access roles
                                    beyond their individual network. Companies fill faster because
                                    they activate an entire community of specialists. And candidates
                                    get better outcomes because multiple recruiters are advocating
                                    for them simultaneously.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The 92% partner satisfaction rate is particularly significant.
                                    It suggests that once recruiters experience the split-fee model
                                    on a modern platform, they do not go back to working solo. The
                                    collaborative model becomes the default operating mode.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PULL QUOTE 3 ──────────────────────────────────── */}
            <section className="pull-quote py-16 lg:py-20 border-b-2 border-neutral bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-center">
                        <div className="col-span-1">
                            <div className="quote-line w-[2px] h-24 lg:h-32 bg-neutral-content/30 mx-auto" style={{ transformOrigin: "top center" }} />
                        </div>
                        <div className="col-span-11 lg:col-span-9">
                            <blockquote className="quote-text opacity-0">
                                <p className="text-2xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
                                    &ldquo;The platform is the trust layer.
                                    When everything is tracked and transparent,
                                    collaboration becomes effortless.&rdquo;
                                </p>
                                <cite className="text-xs uppercase tracking-[0.2em] text-neutral-content/40 not-italic">
                                    -- Hiring Manager, Enterprise Client
                                </cite>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SECTION 06 - What This Means for You
               ════════════════════════════════════════════════════════ */}
            <section className="article-section py-16 lg:py-24 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="section-number opacity-0 text-4xl lg:text-6xl font-black tracking-tighter text-neutral/10">
                                06
                            </span>
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <div className="section-divider h-[2px] bg-neutral/20 mb-6" style={{ transformOrigin: "left center" }} />

                            <h2 className="section-heading opacity-0 text-2xl lg:text-3xl font-black tracking-tight mb-8">
                                What This Means for You
                            </h2>

                            <div className="space-y-6">
                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    <strong className="text-base-content font-bold">If you are a recruiter:</strong>{" "}
                                    The split-fee model gives you access to roles and markets that
                                    would take years to build on your own. You keep doing what you
                                    do best -- sourcing, screening, advocating -- while partnering
                                    with others who complement your strengths. The administrative
                                    burden disappears when the platform handles terms, tracking,
                                    and payments.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    <strong className="text-base-content font-bold">If you are a company:</strong>{" "}
                                    Instead of managing a dozen recruiter contracts with different
                                    terms, you post a role once and activate an entire network.
                                    Every recruiter working your role operates under the same terms.
                                    You see every candidate, every submission, every status update
                                    in one pipeline. And you only pay when someone starts.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    <strong className="text-base-content font-bold">If you are a candidate:</strong>{" "}
                                    The split-fee model means more recruiters are aware of your
                                    profile and actively advocating for you. You get matched with
                                    specialists in your field. You receive real communication and
                                    feedback. And because the platform tracks everything, you never
                                    get ghosted again.
                                </p>

                                <p className="section-body opacity-0 text-base-content/70 leading-relaxed lg:text-lg">
                                    The future of recruiting is collaborative, transparent, and
                                    platform-enabled. The split-fee model is not a niche strategy
                                    anymore -- it is becoming the industry standard. The only
                                    question is whether you will be part of building it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                ARTICLE FOOTER / TAGS
               ════════════════════════════════════════════════════════ */}
            <section className="py-12 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">
                                Tags
                            </span>
                        </div>
                        <div className="col-span-12 lg:col-span-10 flex flex-wrap gap-2">
                            {["Split-Fee", "Recruiting", "Marketplace", "Technology", "Collaboration", "Industry Trends"].map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 border border-base-300 px-3 py-1.5 inline-block hover:border-neutral hover:text-base-content transition-colors duration-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="h-[1px] bg-base-300 my-8" />

                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">
                                Published
                            </span>
                        </div>
                        <div className="col-span-12 lg:col-span-10 flex flex-wrap gap-8">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 block mb-1">Date</span>
                                <span className="text-sm font-bold">{articleMeta.date}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 block mb-1">Author</span>
                                <span className="text-sm font-bold">{articleMeta.author}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 block mb-1">Reading Time</span>
                                <span className="text-sm font-bold">{articleMeta.readTime}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 block mb-1">Reference</span>
                                <span className="text-sm font-mono text-base-content/50">{articleMeta.ref}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                CTA - Final conversion (matching landing page pattern)
               ════════════════════════════════════════════════════════ */}
            <section className="cta-section py-20 lg:py-32">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end">
                        {/* Oversized number */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="cta-number opacity-0 text-[7rem] sm:text-[10rem] lg:text-[14rem] font-black leading-none tracking-tighter text-neutral/5 select-none">
                                EN
                            </div>
                        </div>

                        {/* Content */}
                        <div className="col-span-12 lg:col-span-8 pb-4 lg:pb-8">
                            <div className="cta-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-4">
                                    Join the Movement
                                </p>
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.9] tracking-tight mb-8">
                                    Be part of the
                                    <br />
                                    future of
                                    <br />
                                    recruiting.
                                </h2>
                            </div>

                            <div className="h-[2px] bg-neutral/10 mb-8" />

                            <div className="flex flex-wrap gap-4 mb-10">
                                <a
                                    href="https://splits.network/sign-up"
                                    className="cta-button opacity-0 btn btn-neutral btn-lg font-bold tracking-wide"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie mr-2" />
                                    Recruiter Sign Up
                                </a>
                                <a
                                    href="https://applicant.network/sign-up"
                                    className="cta-button opacity-0 btn btn-outline btn-lg font-bold tracking-wide border-2"
                                >
                                    <i className="fa-duotone fa-regular fa-user mr-2" />
                                    Candidate Sign Up
                                </a>
                                <a
                                    href="https://splits.network/sign-up"
                                    className="cta-button opacity-0 btn btn-ghost btn-lg font-bold tracking-wide"
                                >
                                    <i className="fa-duotone fa-regular fa-building mr-2" />
                                    Post a Role
                                </a>
                            </div>

                            <div className="cta-button opacity-0">
                                <a
                                    href="mailto:hello@employment-networks.com"
                                    className="inline-flex items-center gap-2 text-sm text-base-content/40 hover:text-base-content transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-envelope" />
                                    hello@employment-networks.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
