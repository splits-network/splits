"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.35, normal: 0.6, slow: 0.9, hero: 1.2, counter: 2.0 };
const E = { precise: "power3.out", mechanical: "power2.inOut", snap: "steps(1)" };
const S = { tight: 0.06, normal: 0.1, grid: 0.04 };

// ── Data ─────────────────────────────────────────────────────────────────────

const metrics = [
    { value: 10000, suffix: "+", label: "Active Listings", col: "col-span-2 row-span-2" },
    { value: 2000, suffix: "+", label: "Recruiters", col: "col-span-1 row-span-1" },
    { value: 500, suffix: "+", label: "Companies", col: "col-span-1 row-span-1" },
    { value: 95, suffix: "%", label: "Response Rate", col: "col-span-2 row-span-1" },
    { value: 48, suffix: "hr", label: "Avg. Response", col: "col-span-1 row-span-1" },
    { value: 3, suffix: "x", label: "Faster Placement", col: "col-span-1 row-span-1" },
];

const capabilities = [
    {
        number: "01",
        title: "Split-Fee Marketplace",
        description: "Access curated roles that match your expertise. No cold outreach. No wasted time. Clear terms on every placement.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        number: "02",
        title: "Integrated ATS",
        description: "Track every candidate and submission in one clean pipeline. Real-time status updates. Zero spreadsheet chaos.",
        icon: "fa-duotone fa-regular fa-table-columns",
    },
    {
        number: "03",
        title: "Candidate Portal",
        description: "Candidates get matched with recruiters who advocate for them. Real communication. No ghosting.",
        icon: "fa-duotone fa-regular fa-user",
    },
    {
        number: "04",
        title: "Company Dashboard",
        description: "Full visibility into every pipeline. Set fees once. Pay only on hire. A network of recruiters, one platform.",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        number: "05",
        title: "Analytics Engine",
        description: "Data-driven decisions. Track placement velocity, response rates, and pipeline health in real time.",
        icon: "fa-duotone fa-regular fa-chart-mixed",
    },
    {
        number: "06",
        title: "Smart Matching",
        description: "AI-powered candidate-job fit analysis. Surface the best matches instantly. Reduce time-to-fill.",
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
    },
];

const stakeholders = [
    {
        role: "Recruiters",
        platform: "Splits Network",
        stat: "2,000+",
        statLabel: "Active Recruiters",
        points: [
            "Access curated roles matching your niche",
            "Transparent split-fee terms on every role",
            "Clean pipeline with real-time tracking",
            "Earn more with less admin overhead",
        ],
        cta: "Join the Network",
        ctaHref: "https://splits.network/sign-up",
        accent: "primary",
    },
    {
        role: "Companies",
        platform: "Splits Network",
        stat: "500+",
        statLabel: "Hiring Companies",
        points: [
            "Tap into a vetted recruiter network",
            "Full pipeline visibility per role",
            "Set terms once for all recruiters",
            "Pay only when someone starts",
        ],
        cta: "Post a Role",
        ctaHref: "https://splits.network/sign-up",
        accent: "accent",
    },
    {
        role: "Candidates",
        platform: "Applicant Network",
        stat: "95%",
        statLabel: "Response Rate",
        points: [
            "Matched with specialized recruiters",
            "Real updates, feedback, no ghosting",
            "Curated opportunities for your skills",
            "100% free, your data stays private",
        ],
        cta: "Create Free Profile",
        ctaHref: "https://applicant.network/sign-up",
        accent: "secondary",
    },
];

const processSteps = [
    { number: "01", label: "Post Role", description: "Company publishes requirements and fee terms" },
    { number: "02", label: "Match", description: "Recruiters opt in to roles matching their niche" },
    { number: "03", label: "Submit", description: "Candidates are sourced and submitted via ATS" },
    { number: "04", label: "Hire", description: "Placement confirmed, split fees paid automatically" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                // Make everything visible but skip animations
                gsap.set(containerRef.current.querySelectorAll("[data-animate]"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // ── HERO ──────────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: E.precise } });

            // Oversized number reveal
            heroTl.fromTo(
                $1(".hero-number"),
                { opacity: 0, y: 120, skewY: 8 },
                { opacity: 1, y: 0, skewY: 0, duration: D.hero },
            );

            // Headline slides in mechanically
            heroTl.fromTo(
                $1(".hero-headline"),
                { opacity: 0, x: -80 },
                { opacity: 1, x: 0, duration: D.slow },
                "-=0.7",
            );

            // Subtext
            heroTl.fromTo(
                $1(".hero-subtext"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.4",
            );

            // Divider line draws in
            heroTl.fromTo(
                $1(".hero-divider"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.normal, transformOrigin: "left center" },
                "-=0.3",
            );

            // CTA buttons
            heroTl.fromTo(
                $(".hero-cta"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.fast, stagger: S.normal },
                "-=0.2",
            );

            // Grid cells appear
            heroTl.fromTo(
                $(".hero-grid-cell"),
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: D.fast, stagger: S.grid },
                "-=0.4",
            );

            // ── METRICS ───────────────────────────────────────
            gsap.fromTo(
                $1(".metrics-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".metrics-section"), start: "top 75%" },
                },
            );

            gsap.fromTo(
                $(".metric-cell"),
                { opacity: 0, scale: 0.85 },
                {
                    opacity: 1, scale: 1, duration: D.fast, ease: E.precise,
                    stagger: S.grid,
                    scrollTrigger: { trigger: $1(".metrics-grid"), start: "top 80%" },
                },
            );

            // Counter animations
            const counterEls = $(".metric-counter");
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
                        scrollTrigger: { trigger: $1(".metrics-grid"), start: "top 80%" },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            el.textContent = (target >= 1000 ? current.toLocaleString() : current) + suffix;
                        },
                    },
                );
            });

            // ── CAPABILITIES ──────────────────────────────────
            gsap.fromTo(
                $1(".capabilities-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".capabilities-section"), start: "top 75%" },
                },
            );

            $(".capability-row").forEach((row, i) => {
                // Number slides in
                gsap.fromTo(
                    row.querySelector(".capability-number"),
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0, duration: D.fast, ease: E.precise,
                        scrollTrigger: { trigger: row, start: "top 85%" },
                    },
                );

                // Divider draws
                gsap.fromTo(
                    row.querySelector(".capability-divider"),
                    { scaleX: 0 },
                    {
                        scaleX: 1, duration: D.normal, ease: E.mechanical,
                        transformOrigin: "left center",
                        delay: 0.1,
                        scrollTrigger: { trigger: row, start: "top 85%" },
                    },
                );

                // Title and description
                gsap.fromTo(
                    row.querySelector(".capability-title"),
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1, y: 0, duration: D.fast, ease: E.precise,
                        delay: 0.15,
                        scrollTrigger: { trigger: row, start: "top 85%" },
                    },
                );
                gsap.fromTo(
                    row.querySelector(".capability-desc"),
                    { opacity: 0 },
                    {
                        opacity: 1, duration: D.normal, ease: E.precise,
                        delay: 0.25,
                        scrollTrigger: { trigger: row, start: "top 85%" },
                    },
                );
            });

            // ── STAKEHOLDERS ──────────────────────────────────
            gsap.fromTo(
                $1(".stakeholders-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".stakeholders-section"), start: "top 75%" },
                },
            );

            $(".stakeholder-card").forEach((card) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: D.normal, ease: E.precise,
                        scrollTrigger: { trigger: card, start: "top 85%" },
                    },
                );

                // Stat counter inside card
                const statEl = card.querySelector(".stakeholder-stat");
                if (statEl) {
                    gsap.fromTo(
                        statEl,
                        { opacity: 0, scale: 0.8 },
                        {
                            opacity: 1, scale: 1, duration: D.fast, ease: E.precise,
                            delay: 0.3,
                            scrollTrigger: { trigger: card, start: "top 85%" },
                        },
                    );
                }

                // List items stagger in
                gsap.fromTo(
                    card.querySelectorAll(".stakeholder-point"),
                    { opacity: 0, x: -15 },
                    {
                        opacity: 1, x: 0, duration: D.fast, ease: E.precise,
                        stagger: S.tight,
                        delay: 0.2,
                        scrollTrigger: { trigger: card, start: "top 85%" },
                    },
                );
            });

            // ── PROCESS ───────────────────────────────────────
            gsap.fromTo(
                $1(".process-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".process-section"), start: "top 75%" },
                },
            );

            // Process line draws
            gsap.fromTo(
                $1(".process-line"),
                { scaleX: 0 },
                {
                    scaleX: 1, duration: D.hero, ease: E.mechanical,
                    transformOrigin: "left center",
                    scrollTrigger: { trigger: $1(".process-track"), start: "top 80%" },
                },
            );

            $(".process-step").forEach((step, i) => {
                gsap.fromTo(
                    step,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.fast, ease: E.precise,
                        delay: 0.15 + i * 0.2,
                        scrollTrigger: { trigger: $1(".process-track"), start: "top 80%" },
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
                HERO - Swiss Grid with oversized typography
               ════════════════════════════════════════════════════════ */}
            <section className="min-h-[95vh] relative overflow-hidden border-b-2 border-neutral">
                {/* Top grid accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-neutral" />

                <div className="container mx-auto px-6 lg:px-12 pt-24 pb-16 h-full flex flex-col justify-center">
                    {/* Grid layout */}
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end">
                        {/* Oversized number - primary visual element */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="hero-number opacity-0 text-[8rem] sm:text-[12rem] lg:text-[16rem] font-black leading-none tracking-tighter text-neutral select-none">
                                01
                            </div>
                        </div>

                        {/* Main headline and content */}
                        <div className="col-span-12 lg:col-span-7 pb-4 lg:pb-8">
                            <div className="hero-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral/50 mb-4">
                                    Employment Networks
                                </p>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] tracking-tight mb-6">
                                    The Future
                                    <br />
                                    of Recruiting
                                </h1>
                            </div>

                            <div className="hero-subtext opacity-0 max-w-xl">
                                <p className="text-base lg:text-lg text-base-content/60 leading-relaxed mb-8">
                                    Two platforms. One connected ecosystem. Recruiters,
                                    companies, and candidates working together with
                                    full transparency.
                                </p>
                            </div>

                            <div className="hero-divider h-[2px] bg-neutral mb-8 opacity-100" style={{ transformOrigin: "left center" }} />

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="https://splits.network/sign-up"
                                    className="hero-cta opacity-0 btn btn-neutral btn-lg font-bold tracking-wide"
                                >
                                    Join as Recruiter
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                                </a>
                                <a
                                    href="https://applicant.network/sign-up"
                                    className="hero-cta opacity-0 btn btn-outline btn-lg font-bold tracking-wide border-2"
                                >
                                    Find a Job
                                </a>
                                <a
                                    href="#for-companies"
                                    className="hero-cta opacity-0 btn btn-ghost btn-lg font-bold tracking-wide"
                                >
                                    I&apos;m Hiring
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom grid cells - decorative data blocks */}
                    <div className="mt-12 lg:mt-16 grid grid-cols-4 lg:grid-cols-8 gap-2">
                        {[
                            { label: "Recruiters", value: "2K+" },
                            { label: "Companies", value: "500+" },
                            { label: "Jobs", value: "10K+" },
                            { label: "Response", value: "95%" },
                            { label: "Time to Fill", value: "3x" },
                            { label: "Avg Fee", value: "20%" },
                            { label: "Placement", value: "48hr" },
                            { label: "NPS Score", value: "72" },
                        ].map((cell, i) => (
                            <div
                                key={i}
                                className="hero-grid-cell opacity-0 border border-base-300 p-3 lg:p-4"
                            >
                                <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    {cell.label}
                                </div>
                                <div className="text-lg lg:text-xl font-black tracking-tight">
                                    {cell.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                METRICS - Data-driven grid
               ════════════════════════════════════════════════════════ */}
            <section className="metrics-section py-20 lg:py-28 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Section label */}
                    <div className="metrics-label opacity-0 flex items-center gap-4 mb-12 lg:mb-16">
                        <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral/10">02</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40">By the Numbers</p>
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Platform Metrics</h2>
                        </div>
                    </div>

                    {/* Metric grid */}
                    <div className="metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                        {metrics.map((metric, i) => (
                            <div
                                key={i}
                                className={`metric-cell opacity-0 bg-base-100 p-6 lg:p-10 ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
                            >
                                <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    {metric.label}
                                </div>
                                <div
                                    className={`metric-counter font-black tracking-tighter leading-none ${i === 0 ? "text-5xl lg:text-8xl" : "text-3xl lg:text-5xl"}`}
                                    data-value={metric.value}
                                    data-suffix={metric.suffix}
                                >
                                    0{metric.suffix}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                CAPABILITIES - Editorial list
               ════════════════════════════════════════════════════════ */}
            <section className="capabilities-section py-20 lg:py-28 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Section label */}
                    <div className="capabilities-label opacity-0 flex items-center gap-4 mb-12 lg:mb-16">
                        <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral/10">03</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40">What We Built</p>
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Capabilities</h2>
                        </div>
                    </div>

                    {/* Capability rows */}
                    <div className="space-y-0">
                        {capabilities.map((cap, i) => (
                            <div
                                key={i}
                                className="capability-row group border-t-2 border-neutral/10 hover:border-neutral transition-colors duration-300"
                            >
                                <div className="grid grid-cols-12 gap-4 py-8 lg:py-10 items-start">
                                    {/* Number */}
                                    <div className="col-span-2 lg:col-span-1">
                                        <span className="capability-number opacity-0 text-2xl lg:text-3xl font-black tracking-tighter text-base-content/20 group-hover:text-primary transition-colors duration-300">
                                            {cap.number}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="col-span-10 lg:col-span-1 flex items-center h-full hidden lg:flex">
                                        <div className="capability-divider h-[2px] w-full bg-neutral/20 group-hover:bg-primary transition-colors duration-300" />
                                    </div>

                                    {/* Title */}
                                    <div className="col-span-12 lg:col-span-4">
                                        <h3 className="capability-title opacity-0 text-xl lg:text-2xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">
                                            <i className={`${cap.icon} mr-3 text-base-content/20 group-hover:text-primary/60 transition-colors duration-300`} />
                                            {cap.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-12 lg:col-span-6">
                                        <p className="capability-desc opacity-0 text-base-content/60 leading-relaxed lg:text-lg">
                                            {cap.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Bottom border */}
                        <div className="border-t-2 border-neutral/10" />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                STAKEHOLDERS - Grid cards
               ════════════════════════════════════════════════════════ */}
            <section id="for-companies" className="stakeholders-section py-20 lg:py-28 bg-neutral text-neutral-content border-b-2 border-neutral-content/20">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Section label */}
                    <div className="stakeholders-label opacity-0 flex items-center gap-4 mb-12 lg:mb-16">
                        <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral-content/10">04</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-content/40">Who It&apos;s For</p>
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Three Stakeholders</h2>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px]">
                        {stakeholders.map((s, i) => (
                            <div
                                key={i}
                                className="stakeholder-card opacity-0 bg-neutral-content/5 border border-neutral-content/10 p-8 lg:p-10 flex flex-col"
                            >
                                {/* Header */}
                                <div className="mb-8">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-content/40 mb-2">
                                        {s.platform}
                                    </p>
                                    <h3 className="text-2xl lg:text-3xl font-black tracking-tight">
                                        {s.role}
                                    </h3>
                                </div>

                                {/* Stat */}
                                <div className="stakeholder-stat opacity-0 mb-8 pb-8 border-b border-neutral-content/10">
                                    <div className="text-4xl lg:text-5xl font-black tracking-tighter">
                                        {s.stat}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.2em] text-neutral-content/40 mt-1">
                                        {s.statLabel}
                                    </div>
                                </div>

                                {/* Points */}
                                <ul className="space-y-3 mb-10 flex-1">
                                    {s.points.map((point, j) => (
                                        <li key={j} className="stakeholder-point opacity-0 flex items-start gap-3 text-sm text-neutral-content/70">
                                            <span className="text-neutral-content/30 text-xs mt-1 font-mono">
                                                {String(j + 1).padStart(2, "0")}
                                            </span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <a
                                    href={s.ctaHref}
                                    className={`btn btn-outline border-2 border-neutral-content/30 hover:bg-neutral-content hover:text-neutral text-neutral-content font-bold tracking-wide w-full`}
                                >
                                    {s.cta}
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                PROCESS - Horizontal flow
               ════════════════════════════════════════════════════════ */}
            <section className="process-section py-20 lg:py-28 border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Section label */}
                    <div className="process-label opacity-0 flex items-center gap-4 mb-12 lg:mb-16">
                        <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral/10">05</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40">How It Works</p>
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">The Process</h2>
                        </div>
                    </div>

                    {/* Process track */}
                    <div className="process-track relative">
                        {/* Connecting line */}
                        <div className="hidden lg:block absolute top-12 left-0 right-0 h-[2px] bg-base-300">
                            <div className="process-line absolute inset-0 bg-neutral" style={{ transformOrigin: "left center" }} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                            {processSteps.map((step, i) => (
                                <div key={i} className="process-step opacity-0 relative">
                                    {/* Step number */}
                                    <div className="relative z-10 w-24 h-24 bg-base-100 border-2 border-neutral flex items-center justify-center mb-6">
                                        <span className="text-3xl font-black tracking-tighter">{step.number}</span>
                                    </div>
                                    <h4 className="text-lg font-black tracking-tight mb-2">{step.label}</h4>
                                    <p className="text-sm text-base-content/50 leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                EDITORIAL IMAGE BREAK
               ════════════════════════════════════════════════════════ */}
            <section className="relative h-[50vh] lg:h-[60vh] border-b-2 border-neutral overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format&fit=crop"
                    alt="Modern workspace"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-neutral-content">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-content/40 mb-4">
                            Employment Networks
                        </p>
                        <p className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none">
                            Recruiting,
                            <br />
                            Reimagined.
                        </p>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                CTA - Final conversion
               ════════════════════════════════════════════════════════ */}
            <section className="cta-section py-20 lg:py-32">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end">
                        {/* Oversized number */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="cta-number opacity-0 text-[8rem] sm:text-[10rem] lg:text-[14rem] font-black leading-none tracking-tighter text-neutral/5 select-none">
                                06
                            </div>
                        </div>

                        {/* Content */}
                        <div className="col-span-12 lg:col-span-8 pb-4 lg:pb-8">
                            <div className="cta-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-4">
                                    Get Started
                                </p>
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.9] tracking-tight mb-8">
                                    Ready to
                                    <br />
                                    transform how
                                    <br />
                                    you recruit?
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
