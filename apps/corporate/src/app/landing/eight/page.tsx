"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Animation constants ────────────────────────────────────────────────────
const D = { fast: 0.4, normal: 0.7, hero: 1.2, build: 0.8 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

// ─── Data ───────────────────────────────────────────────────────────────────

const buildingBlocks = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        description: "Connect with recruiters and companies in a transparent fee-sharing ecosystem.",
        layer: 1,
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Built-in ATS",
        description: "Track every candidate from first contact through placement in one system.",
        layer: 2,
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Analytics Engine",
        description: "Real-time dashboards that show pipeline health and revenue at a glance.",
        layer: 3,
    },
    {
        icon: "fa-duotone fa-regular fa-robot",
        title: "AI Matching",
        description: "Intelligent algorithms that connect the right candidates with the right roles.",
        layer: 4,
    },
];

const blueprintSteps = [
    {
        phase: "01",
        title: "Foundation",
        subtitle: "Set up your organization",
        details: [
            "Create your company profile",
            "Define fee structures and terms",
            "Invite your recruiting team",
        ],
        icon: "fa-duotone fa-regular fa-layer-group",
    },
    {
        phase: "02",
        title: "Framework",
        subtitle: "Build your pipeline",
        details: [
            "Post roles to the marketplace",
            "Recruiters discover and claim roles",
            "Candidates flow into your ATS",
        ],
        icon: "fa-duotone fa-regular fa-sitemap",
    },
    {
        phase: "03",
        title: "Structure",
        subtitle: "Collaborate and track",
        details: [
            "Real-time submission tracking",
            "Interview coordination",
            "Transparent communication",
        ],
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        phase: "04",
        title: "Completion",
        subtitle: "Place and get paid",
        details: [
            "Automated placement tracking",
            "Split-fee calculations",
            "Integrated billing and payouts",
        ],
        icon: "fa-duotone fa-regular fa-flag-checkered",
    },
];

const architectureCards = [
    {
        role: "Recruiters",
        tagline: "The skilled builders",
        description: "Access curated roles, submit top candidates, and earn transparent split fees. Your expertise is the foundation.",
        features: ["Role marketplace", "Pipeline management", "Revenue tracking", "Team collaboration"],
        icon: "fa-duotone fa-regular fa-hard-hat",
        accent: "cyan",
    },
    {
        role: "Companies",
        tagline: "The project owners",
        description: "Post roles, review candidates, and hire through a network of vetted recruiters. Full visibility, zero surprises.",
        features: ["Recruiter network", "Candidate pipeline", "Fee management", "Analytics dashboard"],
        icon: "fa-duotone fa-regular fa-compass-drafting",
        accent: "teal",
    },
    {
        role: "Candidates",
        tagline: "The cornerstone",
        description: "Get matched with specialized recruiters who advocate for you. Real updates, real feedback, never ghosted.",
        features: ["Recruiter matching", "Application tracking", "Interview prep", "100% free"],
        icon: "fa-duotone fa-regular fa-user-helmet-safety",
        accent: "sky",
    },
];

const metrics = [
    { value: 10000, suffix: "+", label: "Active Listings", icon: "fa-duotone fa-regular fa-briefcase" },
    { value: 2000, suffix: "+", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
    { value: 500, suffix: "+", label: "Companies", icon: "fa-duotone fa-regular fa-building" },
    { value: 95, suffix: "%", label: "Response Rate", icon: "fa-duotone fa-regular fa-comments" },
];

const blueprintFaqs = [
    {
        q: "How does the split-fee marketplace work?",
        a: "Companies post roles with defined fee structures. Recruiters browse and claim roles that match their expertise. When a placement is made, fees are automatically split according to the agreed terms.",
    },
    {
        q: "What does it cost for recruiters?",
        a: "Recruiters can join and browse the marketplace for free. You only pay a small platform fee when you successfully place a candidate and earn your split.",
    },
    {
        q: "How is this different from job boards?",
        a: "We are not a job board. We are a collaborative recruiting platform where companies, recruiters, and candidates work together with full transparency, built-in tracking, and automated payments.",
    },
    {
        q: "Is the candidate portal really free?",
        a: "Yes, completely free. Candidates create profiles, get matched with specialized recruiters, track their applications, and receive real feedback at no cost.",
    },
    {
        q: "How long does setup take?",
        a: "Most companies are fully operational within a day. Create your profile, post your first role, and recruiters can start submitting candidates immediately.",
    },
];

// ─── Page Component ─────────────────────────────────────────────────────────

export default function LandingEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // ── HERO ──
            const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

            heroTl.fromTo(
                $1(".bp-hero-badge"),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: D.fast },
            );
            heroTl.fromTo(
                $1(".bp-hero-headline"),
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: D.hero },
                "-=0.2",
            );
            heroTl.fromTo(
                $1(".bp-hero-sub"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.6",
            );
            heroTl.fromTo(
                $(".bp-hero-cta"),
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.normal, stagger: S.normal, ease: E.bounce },
                "-=0.3",
            );
            // Blueprint grid lines
            heroTl.fromTo(
                $(".bp-grid-line"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.build, stagger: S.tight, ease: E.smooth },
                "-=0.4",
            );
            heroTl.fromTo(
                $(".bp-grid-line-v"),
                { scaleY: 0 },
                { scaleY: 1, duration: D.build, stagger: S.tight, ease: E.smooth },
                "-=0.6",
            );

            // ── BUILDING BLOCKS ──
            gsap.fromTo(
                $1(".bp-blocks-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-blocks-section"), start: "top 75%" },
                },
            );
            // Blocks assemble from bottom up (construction metaphor)
            gsap.fromTo(
                $(".bp-block"),
                { opacity: 0, y: 60, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.build, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".bp-blocks-grid"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".bp-block-icon"),
                { scale: 0, rotation: -90 },
                {
                    scale: 1, rotation: 0,
                    duration: D.fast, ease: E.elastic, stagger: S.loose, delay: 0.3,
                    scrollTrigger: { trigger: $1(".bp-blocks-grid"), start: "top 80%" },
                },
            );

            // ── BLUEPRINT STEPS ──
            gsap.fromTo(
                $1(".bp-steps-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-steps-section"), start: "top 75%" },
                },
            );
            gsap.fromTo(
                $(".bp-step-card"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0,
                    duration: D.build, ease: E.smooth, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".bp-steps-grid"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".bp-step-phase"),
                { opacity: 0, scale: 0 },
                {
                    opacity: 1, scale: 1,
                    duration: D.fast, ease: E.bounce, stagger: S.loose, delay: 0.2,
                    scrollTrigger: { trigger: $1(".bp-steps-grid"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".bp-step-detail"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1, x: 0,
                    duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.4,
                    scrollTrigger: { trigger: $1(".bp-steps-grid"), start: "top 80%" },
                },
            );
            // Connector lines between steps
            gsap.fromTo(
                $(".bp-step-connector"),
                { scaleY: 0 },
                {
                    scaleY: 1,
                    duration: D.build, ease: E.smooth, stagger: S.loose, delay: 0.3,
                    scrollTrigger: { trigger: $1(".bp-steps-grid"), start: "top 80%" },
                },
            );

            // ── ARCHITECTURE CARDS (Isometric) ──
            gsap.fromTo(
                $1(".bp-arch-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-arch-section"), start: "top 75%" },
                },
            );
            gsap.fromTo(
                $(".bp-arch-card"),
                { opacity: 0, y: 50, rotateX: 15 },
                {
                    opacity: 1, y: 0, rotateX: 0,
                    duration: D.build, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: $1(".bp-arch-grid"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".bp-arch-feature"),
                { opacity: 0, x: -10 },
                {
                    opacity: 1, x: 0,
                    duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.3,
                    scrollTrigger: { trigger: $1(".bp-arch-grid"), start: "top 80%" },
                },
            );

            // ── METRICS ──
            gsap.fromTo(
                $1(".bp-metrics-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-metrics-section"), start: "top 75%" },
                },
            );
            gsap.fromTo(
                $(".bp-metric-card"),
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.normal, ease: E.bounce, stagger: S.normal,
                    scrollTrigger: { trigger: $1(".bp-metrics-grid"), start: "top 80%" },
                },
            );
            // Counter animations
            const valueEls = $(".bp-metric-value");
            valueEls.forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: 1.5, ease: E.smooth,
                        delay: 0.3 + i * S.normal,
                        scrollTrigger: { trigger: $1(".bp-metrics-grid"), start: "top 80%" },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            el.textContent = (target >= 1000 ? current.toLocaleString() : String(current)) + suffix;
                        },
                    },
                );
            });

            // ── FAQ ──
            gsap.fromTo(
                $1(".bp-faq-heading"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: D.normal, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-faq-section"), start: "top 75%" },
                },
            );
            gsap.fromTo(
                $(".bp-faq-item"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: D.fast, ease: E.smooth, stagger: S.tight,
                    scrollTrigger: { trigger: $1(".bp-faq-list"), start: "top 80%" },
                },
            );

            // ── CTA ──
            gsap.fromTo(
                $1(".bp-cta-content"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: D.hero, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".bp-cta-section"), start: "top 80%" },
                },
            );
            gsap.fromTo(
                $(".bp-cta-card"),
                { opacity: 0, scale: 0.9, y: 20 },
                {
                    opacity: 1, scale: 1, y: 0,
                    duration: D.normal, ease: E.bounce, stagger: S.loose, delay: 0.3,
                    scrollTrigger: { trigger: $1(".bp-cta-section"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef}>
            {/* ══════════════════════════════════════════════════════════════
                HERO - Blueprint/Construction
               ══════════════════════════════════════════════════════════════ */}
            <section className="min-h-[90vh] relative overflow-hidden flex items-center"
                style={{ backgroundColor: "#0a1628" }}>
                {/* Blueprint grid overlay */}
                <div className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                    }}
                />
                {/* Animated horizontal grid lines */}
                <div className="absolute top-[25%] left-0 right-0 h-px bg-cyan-500/20 bp-grid-line origin-left" />
                <div className="absolute top-[50%] left-0 right-0 h-px bg-cyan-500/15 bp-grid-line origin-left" />
                <div className="absolute top-[75%] left-0 right-0 h-px bg-cyan-500/20 bp-grid-line origin-left" />
                {/* Animated vertical grid lines */}
                <div className="absolute left-[20%] top-0 bottom-0 w-px bg-cyan-500/10 bp-grid-line-v origin-top" />
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-cyan-500/15 bp-grid-line-v origin-top" />
                <div className="absolute left-[80%] top-0 bottom-0 w-px bg-cyan-500/10 bp-grid-line-v origin-top" />

                {/* Corner dimension marks */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
                <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-cyan-500/30" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-cyan-500/30" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30" />

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="bp-hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-compass-drafting text-xs" />
                            <span>ARCHITECTURAL BLUEPRINT v2.0</span>
                        </div>

                        <h1 className="bp-hero-headline text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-white opacity-0">
                            Precision-Engineered{" "}
                            <span className="text-cyan-400">Recruiting</span>
                        </h1>

                        <p className="bp-hero-sub text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light opacity-0">
                            Every great structure starts with a blueprint. Build your recruiting
                            operation on a platform designed with architectural precision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://splits.network/sign-up"
                                className="bp-hero-cta btn btn-lg border-0 text-slate-900 font-bold shadow-lg shadow-cyan-500/25 opacity-0"
                                style={{ backgroundColor: "#22d3ee" }}>
                                <i className="fa-duotone fa-regular fa-hard-hat" />
                                Start Building
                            </a>
                            <a href="#blueprint"
                                className="bp-hero-cta btn btn-lg btn-outline border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 opacity-0">
                                <i className="fa-duotone fa-regular fa-scroll" />
                                View Blueprint
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BUILDING BLOCKS - Isometric assembly
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-blocks-section py-24 overflow-hidden"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="container mx-auto px-4">
                    <div className="bp-blocks-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-3 font-mono">
                            Platform Architecture
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            Built Block by Block
                        </h2>
                        <p className="text-lg text-slate-400">
                            Each component is engineered to work independently and in concert,
                            creating a recruiting platform greater than the sum of its parts.
                        </p>
                    </div>

                    <div className="bp-blocks-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
                        style={{ perspective: "1000px" }}>
                        {buildingBlocks.map((block, index) => (
                            <div key={index}
                                className="bp-block group relative opacity-0"
                                style={{
                                    transform: "rotateX(5deg) rotateY(-5deg)",
                                    transformStyle: "preserve-3d",
                                }}>
                                {/* Isometric shadow */}
                                <div className="absolute inset-0 rounded-xl translate-y-2 translate-x-2"
                                    style={{ backgroundColor: "rgba(34,211,238,0.05)" }} />
                                {/* Main card */}
                                <div className="relative rounded-xl p-6 border border-cyan-500/20 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:-translate-y-1"
                                    style={{ backgroundColor: "#0f2847" }}>
                                    {/* Layer indicator */}
                                    <div className="absolute top-3 right-3 text-xs font-mono text-cyan-500/40">
                                        L{block.layer}
                                    </div>
                                    <div className="bp-block-icon w-14 h-14 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30"
                                        style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                        <i className={`${block.icon} text-2xl text-cyan-400`} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-white">{block.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{block.description}</p>
                                    {/* Bottom construction bar */}
                                    <div className="mt-4 h-1 rounded-full overflow-hidden"
                                        style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                        <div className="h-full rounded-full"
                                            style={{
                                                backgroundColor: "#22d3ee",
                                                width: `${25 * block.layer}%`,
                                            }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BLUEPRINT STEPS - Construction phases
               ══════════════════════════════════════════════════════════════ */}
            <section id="blueprint" className="bp-steps-section py-24 overflow-hidden"
                style={{ backgroundColor: "#081220" }}>
                {/* Blueprint background */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-steps-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-3 font-mono">
                            Construction Phases
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            The Build Process
                        </h2>
                        <p className="text-lg text-slate-400">
                            From foundation to completion, each phase is designed for
                            maximum efficiency and measurable results.
                        </p>
                    </div>

                    <div className="bp-steps-grid max-w-4xl mx-auto relative">
                        {/* Vertical connector line */}
                        <div className="hidden md:block absolute left-[39px] top-0 bottom-0 w-px bg-cyan-500/20" />

                        {blueprintSteps.map((step, index) => (
                            <div key={index} className="relative mb-12 last:mb-0">
                                {/* Connector between steps */}
                                {index < blueprintSteps.length - 1 && (
                                    <div className="bp-step-connector hidden md:block absolute left-[39px] top-[80px] w-px h-[calc(100%-40px)] origin-top"
                                        style={{ backgroundColor: "rgba(34,211,238,0.3)" }} />
                                )}
                                <div className="bp-step-card flex gap-6 items-start opacity-0">
                                    {/* Phase number circle */}
                                    <div className="bp-step-phase flex-shrink-0 w-20 h-20 rounded-xl border-2 border-cyan-500/30 flex flex-col items-center justify-center opacity-0"
                                        style={{ backgroundColor: "rgba(34,211,238,0.08)" }}>
                                        <span className="text-cyan-400 font-mono text-xs">PHASE</span>
                                        <span className="text-cyan-300 font-bold text-xl">{step.phase}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 rounded-xl p-6 border border-cyan-500/15"
                                        style={{ backgroundColor: "#0d1d33" }}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <i className={`${step.icon} text-xl text-cyan-400`} />
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{step.title}</h3>
                                                <p className="text-cyan-400/70 text-sm font-mono">{step.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 ml-1">
                                            {step.details.map((detail, dIdx) => (
                                                <div key={dIdx} className="bp-step-detail flex items-center gap-3 opacity-0">
                                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: "#22d3ee" }} />
                                                    <span className="text-slate-400 text-sm">{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARCHITECTURE - Isometric role cards
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-arch-section py-24 overflow-hidden"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="container mx-auto px-4">
                    <div className="bp-arch-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-3 font-mono">
                            Structural Roles
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            Every Role Has a Purpose
                        </h2>
                        <p className="text-lg text-slate-400">
                            Like a well-designed building, every participant in the ecosystem
                            serves a critical structural function.
                        </p>
                    </div>

                    <div className="bp-arch-grid grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                        style={{ perspective: "1200px" }}>
                        {architectureCards.map((card, index) => (
                            <div key={index}
                                className="bp-arch-card group opacity-0"
                                style={{
                                    transform: "rotateX(3deg)",
                                    transformStyle: "preserve-3d",
                                }}>
                                <div className="relative rounded-2xl p-8 border border-cyan-500/20 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:-translate-y-2"
                                    style={{ backgroundColor: "#0f2847" }}>
                                    {/* Top accent bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                                        style={{ backgroundColor: "#22d3ee" }} />

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-cyan-500/30"
                                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                            <i className={`${card.icon} text-xl text-cyan-400`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white">{card.role}</h3>
                                            <p className="text-cyan-400/70 text-sm font-mono">{card.tagline}</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{card.description}</p>

                                    <div className="space-y-2">
                                        {card.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="bp-arch-feature flex items-center gap-3 opacity-0">
                                                <i className="fa-duotone fa-regular fa-wrench text-xs text-cyan-500/60" />
                                                <span className="text-slate-300 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Blueprint dimension lines at bottom */}
                                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-cyan-500/10">
                                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.2)" }} />
                                        <span className="text-xs font-mono text-cyan-500/40">
                                            {card.features.length} components
                                        </span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.2)" }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                METRICS - Construction stats
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-metrics-section py-24 overflow-hidden"
                style={{ backgroundColor: "#081220" }}>
                <div className="container mx-auto px-4">
                    <div className="bp-metrics-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-3 font-mono">
                            Project Status
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            The Numbers Speak
                        </h2>
                        <p className="text-lg text-slate-400">
                            A growing ecosystem of recruiters, companies, and candidates
                            building transparent partnerships.
                        </p>
                    </div>

                    <div className="bp-metrics-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {metrics.map((metric, index) => (
                            <div key={index}
                                className="bp-metric-card rounded-xl p-8 text-center border border-cyan-500/15 opacity-0"
                                style={{ backgroundColor: "#0d1d33" }}>
                                <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.08)" }}>
                                    <i className={`${metric.icon} text-2xl text-cyan-400`} />
                                </div>
                                <div className="bp-metric-value text-4xl md:text-5xl font-bold text-cyan-300 mb-2 font-mono"
                                    data-value={metric.value}
                                    data-suffix={metric.suffix}>
                                    0{metric.suffix}
                                </div>
                                <div className="font-semibold text-white text-sm">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FAQ - Blueprint specs
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-faq-section py-24 overflow-hidden"
                style={{ backgroundColor: "#0d1d33" }}>
                <div className="container mx-auto px-4">
                    <div className="bp-faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-3 font-mono">
                            Technical Specifications
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            Common Questions
                        </h2>
                        <p className="text-lg text-slate-400">
                            Everything you need to know before breaking ground.
                        </p>
                    </div>

                    <div className="bp-faq-list max-w-3xl mx-auto space-y-4">
                        {blueprintFaqs.map((faq, index) => (
                            <div key={index}
                                className="bp-faq-item collapse collapse-plus rounded-xl border border-cyan-500/15 opacity-0"
                                style={{ backgroundColor: "#0f2847" }}>
                                <input type="radio" name="bp-faq" defaultChecked={index === 0} />
                                <div className="collapse-title font-semibold text-lg pr-12 text-white">
                                    {faq.q}
                                </div>
                                <div className="collapse-content">
                                    <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA - Final construction
               ══════════════════════════════════════════════════════════════ */}
            <section className="bp-cta-section py-24 overflow-hidden relative"
                style={{ backgroundColor: "#0a1628" }}>
                {/* Blueprint grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                {/* Corner dimension marks */}
                <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-cyan-500/20" />
                <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-cyan-500/20" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-cyan-500/20" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-cyan-500/20" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="bp-cta-content text-center mb-12 opacity-0 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                            Ready to Break Ground?
                        </h2>
                        <p className="text-xl text-slate-400">
                            Join the ecosystem that is precision-engineering the future of recruiting.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        <div className="bp-cta-card rounded-2xl p-6 border border-cyan-500/20 opacity-0"
                            style={{ backgroundColor: "#0f2847" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-cyan-500/30"
                                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                    <i className="fa-duotone fa-regular fa-hard-hat text-xl text-cyan-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Recruiters</div>
                                    <div className="text-xs text-cyan-400/60 font-mono">Splits Network</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                Join a collaborative marketplace with curated roles and transparent splits.
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="btn btn-sm w-full border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: "#22d3ee" }}>
                                Join Network
                                <i className="fa-duotone fa-regular fa-arrow-right" />
                            </a>
                        </div>

                        <div className="bp-cta-card rounded-2xl p-6 border border-cyan-500/20 opacity-0"
                            style={{ backgroundColor: "#0f2847" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-cyan-500/30"
                                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                    <i className="fa-duotone fa-regular fa-compass-drafting text-xl text-cyan-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Companies</div>
                                    <div className="text-xs text-cyan-400/60 font-mono">Splits Network</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                Access a network of recruiters with full pipeline visibility and pay-on-hire.
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="btn btn-sm w-full border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: "#22d3ee" }}>
                                Post a Role
                                <i className="fa-duotone fa-regular fa-arrow-right" />
                            </a>
                        </div>

                        <div className="bp-cta-card rounded-2xl p-6 border border-cyan-500/20 opacity-0"
                            style={{ backgroundColor: "#0f2847" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-cyan-500/30"
                                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                    <i className="fa-duotone fa-regular fa-user-helmet-safety text-xl text-cyan-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Candidates</div>
                                    <div className="text-xs text-cyan-400/60 font-mono">Applicant Network</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                Get matched with expert recruiters and never get ghosted again. Free forever.
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="btn btn-sm w-full border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: "#22d3ee" }}>
                                Create Profile
                                <i className="fa-duotone fa-regular fa-arrow-right" />
                            </a>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-4">
                            Questions? Reach out to us directly.
                        </p>
                        <a href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 text-cyan-400/80 hover:text-cyan-400 transition-colors font-mono text-sm">
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
