"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    BaselDynamicPricingSection,
    BaselComparisonTable,
    BaselCalculator,
} from "@/components/basel/pricing";
import { pricingFaqs } from "./pricing-faq-data";
import { PricingFaqAccordion } from "./pricing-faq-accordion";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Constants ───────────────────────────────────────────────────────────── */

const D = { fast: 0.3, normal: 0.6, slow: 0.9, hero: 1.2 };
const E = { smooth: "power2.out", strong: "power3.out" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

const keyStats = [
    { value: "Free", label: "to start recruiting", semantic: "border-success" },
    { value: "3", label: "transparent tiers", semantic: "border-primary" },
    {
        value: "20%",
        label: "annual billing savings",
        semantic: "border-accent",
    },
    { value: "$0", label: "hidden fees ever", semantic: "border-warning" },
];

const starterFeatures = [
    "Access to open roles across the network",
    "Unlimited candidate submissions",
    "Full ATS workflow and application tracking",
    "Communication & notifications",
    "Email support",
];

const proFeatures = [
    "Everything in Starter, plus:",
    "Higher payout bonuses on placements",
    "Priority access to new roles",
    "Performance analytics dashboard",
    "Advanced reporting tools",
    "Priority email support",
];

const partnerFeatures = [
    "Everything in Pro, plus:",
    "Maximum payout bonuses",
    "Exclusive early access to roles",
    "API access for integrations",
    "Team management tools",
    "White-label options",
    "Dedicated account manager",
];

const comparisonFeatures = [
    { feature: "Monthly Price", starter: "Free", pro: "$99", partner: "$249" },
    {
        feature: "Payout Bonuses",
        starter: "Base",
        pro: "Higher",
        partner: "Maximum",
    },
    {
        feature: "Access to Open Roles",
        starter: true,
        pro: true,
        partner: true,
    },
    {
        feature: "Unlimited Submissions",
        starter: true,
        pro: true,
        partner: true,
    },
    { feature: "Full ATS Workflow", starter: true, pro: true, partner: true },
    {
        feature: "Priority Role Access",
        starter: false,
        pro: true,
        partner: true,
    },
    {
        feature: "Exclusive Early Access",
        starter: false,
        pro: false,
        partner: true,
    },
    {
        feature: "Performance Analytics",
        starter: false,
        pro: true,
        partner: true,
    },
    { feature: "Advanced Reporting", starter: false, pro: true, partner: true },
    { feature: "API Access", starter: false, pro: false, partner: true },
    { feature: "Team Management", starter: false, pro: false, partner: true },
    {
        feature: "White-Label Options",
        starter: false,
        pro: false,
        partner: true,
    },
    {
        feature: "Support Level",
        starter: "Email",
        pro: "Priority",
        partner: "Account Mgr",
    },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export function PricingContent() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll(
                        "[class*='opacity-0']",
                    ),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ═══ HERO ═══════════════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: E.strong } });

            const heroBadge = $1(".hero-badge");
            if (heroBadge) {
                heroTl.fromTo(
                    heroBadge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: D.normal },
                );
            }
            const heroHeadline = $1(".hero-headline");
            if (heroHeadline) {
                heroTl.fromTo(
                    heroHeadline,
                    { opacity: 0, y: 60 },
                    { opacity: 1, y: 0, duration: D.hero },
                    "-=0.3",
                );
            }
            const heroSubtext = $1(".hero-subtext");
            if (heroSubtext) {
                heroTl.fromTo(
                    heroSubtext,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.4",
                );
            }
            const heroCtaRow = $1(".hero-cta-row");
            if (heroCtaRow) {
                heroTl.fromTo(
                    heroCtaRow,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.2",
                );
            }

            // ═══ STATS BAR ══════════════════════════════════════════════
            const statsSection = $1(".pricing-stats");
            if (statsSection) {
                gsap.fromTo(
                    $(".stat-block"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.strong,
                        stagger: S.normal,
                        scrollTrigger: {
                            trigger: statsSection,
                            start: "top 90%",
                        },
                    },
                );
            }

            // ═══ INTRO ══════════════════════════════════════════════════
            const introContent = $1(".intro-content");
            if (introContent) {
                gsap.fromTo(
                    introContent,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".pricing-intro"),
                            start: "top 75%",
                        },
                    },
                );
            }

            // ═══ PULL QUOTES ════════════════════════════════════════════
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: quote,
                            start: "top 80%",
                        },
                    },
                );
            });

            // ═══ PRICING CARDS ══════════════════════════════════════════
            const cardsHeading = $1(".pricing-cards-heading");
            if (cardsHeading) {
                gsap.fromTo(
                    cardsHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".pricing-cards-section"),
                            start: "top 75%",
                        },
                    },
                );
            }
            const pricingGrid = $1(".pricing-cards-grid");
            if (pricingGrid) {
                gsap.fromTo(
                    pricingGrid,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: pricingGrid,
                            start: "top 85%",
                        },
                    },
                );
            }

            // ═══ COMPANIES ══════════════════════════════════════════════
            const companiesHeading = $1(".companies-heading");
            if (companiesHeading) {
                gsap.fromTo(
                    companiesHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".companies-section"),
                            start: "top 75%",
                        },
                    },
                );
            }
            gsap.fromTo(
                $(".companies-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.strong,
                    stagger: S.loose,
                    scrollTrigger: {
                        trigger: $1(".companies-section"),
                        start: "top 80%",
                    },
                },
            );

            // ═══ IMAGE BREAK ════════════════════════════════════════════
            const imageCaption = $1(".image-caption");
            if (imageCaption) {
                gsap.fromTo(
                    imageCaption,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: imageCaption,
                            start: "top 85%",
                        },
                    },
                );
            }

            // ═══ FEATURE COMPARISON ═════════════════════════════════════
            const comparisonHeading = $1(".comparison-heading");
            if (comparisonHeading) {
                gsap.fromTo(
                    comparisonHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".feature-comparison"),
                            start: "top 75%",
                        },
                    },
                );
            }
            const comparisonTable = $1(".comparison-table");
            if (comparisonTable) {
                gsap.fromTo(
                    comparisonTable,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: comparisonTable,
                            start: "top 80%",
                        },
                    },
                );
            }

            // ═══ FAQ ════════════════════════════════════════════════════
            const faqHeading = $1(".faq-heading");
            if (faqHeading) {
                gsap.fromTo(
                    faqHeading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: $1(".pricing-faq"),
                            start: "top 75%",
                        },
                    },
                );
            }
            gsap.fromTo(
                $(".faq-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: D.normal,
                    ease: E.strong,
                    stagger: S.normal,
                    scrollTrigger: {
                        trigger: $1(".faq-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ═══ FINAL QUOTE ════════════════════════════════════════════
            const finalQuote = $1(".final-quote");
            if (finalQuote) {
                gsap.fromTo(
                    finalQuote,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.slow,
                        ease: E.smooth,
                        scrollTrigger: {
                            trigger: finalQuote,
                            start: "top 85%",
                        },
                    },
                );
            }

            // ═══ CTA ════════════════════════════════════════════════════
            const ctaSection = $1(".pricing-cta");
            if (ctaSection) {
                gsap.fromTo(
                    $1(".cta-content"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.hero,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
                gsap.fromTo(
                    $(".cta-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.strong,
                        stagger: S.loose,
                        delay: 0.3,
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
                gsap.fromTo(
                    $1(".cta-footer"),
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: D.normal,
                        ease: E.smooth,
                        delay: 0.6,
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef}>
            {/* ═══════════════════════════════════════════════════════════════
                HERO
               ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[70vh] overflow-hidden flex items-center bg-neutral">
                {/* Diagonal clip accent */}
                <div
                    className="absolute inset-0 bg-primary/5 pointer-events-none"
                    style={{
                        clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)",
                    }}
                />

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-8 bg-primary text-primary-content opacity-0">
                            <i className="fa-duotone fa-regular fa-tag" />
                            Simple Pricing
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-neutral-content opacity-0">
                            Transparent Pricing.{" "}
                            <span className="text-primary">Real Value.</span> No
                            Surprises.
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-neutral-content/70 opacity-0">
                            Choose the plan that fits your recruiting business.
                            Higher tiers unlock better payout bonuses and
                            priority access to roles. Start free, upgrade when
                            you&apos;re ready.
                        </p>

                        <div className="hero-cta-row flex flex-wrap items-center justify-center gap-4 opacity-0">
                            <a
                                href="/sign-up"
                                className="btn btn-primary btn-lg uppercase tracking-wider text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Get Started Free
                            </a>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-content/50">
                                No credit card required
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div
                            key={index}
                            className={`stat-block p-6 md:p-8 text-center bg-base-200 border-l-4 ${stat.semantic} opacity-0`}
                        >
                            <div className="text-3xl md:text-4xl font-black mb-1 text-base-content">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em] text-base-content/50">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                INTRO - Pricing Philosophy
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-intro py-20 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="intro-content opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-base-content">
                                Built for{" "}
                                <span className="text-primary">Recruiters</span>
                                , Not Against Them
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-base-content/80">
                                Most platforms take a cut from every deal and
                                call it &ldquo;free.&rdquo; We believe in a
                                different model. Your subscription is your only
                                recurring cost. When you make a placement, the
                                earnings are yours -- no surprise deductions, no
                                hidden platform fees eating into your
                                commission.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-base-content/80">
                                Higher tiers unlock better payout bonuses and
                                premium features. But every recruiter -- from
                                day one on the free Starter plan -- gets full
                                access to the marketplace, unlimited
                                submissions, and a complete ATS workflow. No
                                feature gates on the basics.
                            </p>

                            <p className="text-lg leading-relaxed text-base-content/80">
                                Companies post roles for free and pay only on
                                successful hires. Candidates never pay a dime.
                                The incentives are aligned for everyone.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PULL QUOTE 1
               ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-neutral">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-l-4 border-secondary opacity-0">
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-neutral-content">
                            Your subscription is your only cost. When you place
                            a candidate, the earnings are yours -- no hidden
                            platform fees, no surprise deductions.
                        </p>
                        <div className="mt-6 pt-4 border-t border-secondary/30">
                            <span className="text-sm font-bold uppercase tracking-wider text-secondary">
                                -- Splits Network Pricing Promise
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PRICING CARDS
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-cards-section py-20 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="pricing-cards-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-accent text-accent-content">
                                Choose Your Tier
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                Three Plans.{" "}
                                <span className="text-accent">
                                    Zero Guesswork.
                                </span>
                            </h2>
                        </div>

                        <div className="pricing-cards-grid opacity-0">
                            <BaselDynamicPricingSection
                                showBillingToggle={true}
                                defaultAnnual={false}
                                selectable={false}
                            />
                        </div>

                        <div className="text-center mt-8 text-sm text-base-content/50">
                            Splits Network does not guarantee placements,
                            income, or role availability. All payouts are
                            finalized at hire time based on participation, role,
                            and subscription tier.
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                ROI CALCULATOR
               ═══════════════════════════════════════════════════════════════ */}
            <section className="roi-calculator-section py-20 overflow-hidden bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                ROI Calculator
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                See What You&apos;ll{" "}
                                <span className="text-secondary">
                                    Actually Earn
                                </span>
                            </h2>
                            <p className="mt-4 text-lg text-base-content/60 max-w-2xl mx-auto">
                                Enter a placement scenario and see exactly how
                                much you&apos;d earn at each tier. Higher tiers
                                mean bigger payouts.
                            </p>
                        </div>

                        <BaselCalculator variant="page" animate={false} />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FOR COMPANIES
               ═══════════════════════════════════════════════════════════════ */}
            <section className="companies-section py-20 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="companies-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                For Companies
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                Post Roles{" "}
                                <span className="text-warning">For Free</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Free to Post */}
                            <div className="companies-card p-8 border-l-4 border-secondary bg-base-100 border border-base-300 shadow-sm opacity-0">
                                <div className="w-14 h-14 flex items-center justify-center mb-4 bg-secondary">
                                    <i className="fa-duotone fa-regular fa-building text-2xl text-secondary-content" />
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-base-content">
                                    Free to Post
                                </h3>
                                <p className="text-sm leading-relaxed mb-6 text-base-content/75">
                                    Companies pay nothing to post roles and
                                    access our network of specialized
                                    recruiters.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Unlimited role postings",
                                        "Access to recruiter network",
                                        "Full ATS pipeline visibility",
                                        "Candidate management tools",
                                        "Communication & notifications",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3 text-sm leading-relaxed text-base-content/80"
                                        >
                                            <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-secondary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pay on Hire */}
                            <div className="companies-card p-8 border-l-4 border-warning bg-base-100 border border-base-300 shadow-sm opacity-0">
                                <div className="w-14 h-14 flex items-center justify-center mb-4 bg-warning">
                                    <i className="fa-duotone fa-regular fa-handshake text-2xl text-warning-content" />
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-base-content">
                                    Pay on Hire
                                </h3>
                                <p className="text-sm leading-relaxed mb-6 text-base-content/75">
                                    Only pay when you successfully hire a
                                    candidate. Set your fee percentage upfront
                                    -- total transparency.
                                </p>
                                <div className="p-6 text-center mb-4 bg-neutral">
                                    <div className="text-3xl font-black mb-1 text-warning">
                                        15-25%
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-content/60">
                                        Typical placement fee range
                                    </div>
                                </div>
                                <p className="text-xs leading-relaxed text-base-content/60">
                                    Example: For a $120,000 salary with 20% fee
                                    = $24,000 placement fee. The platform takes
                                    a small percentage, and the recruiter
                                    receives the majority.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <a
                                href="/sign-up"
                                className="btn btn-warning btn-lg uppercase tracking-wider text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                Post Your First Role
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                IMAGE BREAK
               ═══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden min-h-[400px]">
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                    alt="Team collaborating in modern office"
                    className="w-full h-full object-cover absolute inset-0 min-h-[400px]"
                />
                <div className="absolute inset-0 bg-neutral/75" />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-neutral-content">
                            Higher tiers.{" "}
                            <span className="text-warning">
                                Bigger payouts.
                            </span>{" "}
                            Same transparent model.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FEATURE COMPARISON
               ═══════════════════════════════════════════════════════════════ */}
            <section className="feature-comparison py-20 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-primary text-primary-content">
                                Full Breakdown
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                Feature{" "}
                                <span className="text-primary">Comparison</span>
                            </h2>
                        </div>

                        <div className="comparison-table opacity-0">
                            <BaselComparisonTable
                                features={comparisonFeatures}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PULL QUOTE 2
               ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-l-4 border-primary opacity-0">
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-base-content">
                            Start with Starter. Upgrade when placements justify
                            it. Every tier pays for itself with a single
                            successful hire.
                        </p>
                        <div className="mt-6 pt-4 border-t border-primary/30">
                            <span className="text-sm font-bold uppercase tracking-wider text-primary">
                                -- The Splits Network Approach
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FAQ
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-faq py-20 overflow-hidden bg-neutral">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="faq-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                Common Questions
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-neutral-content">
                                Pricing{" "}
                                <span className="text-secondary">FAQs</span>
                            </h2>
                        </div>

                        <div className="faq-grid">
                            <PricingFaqAccordion faqs={pricingFaqs} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FINAL QUOTE
               ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="final-quote max-w-4xl mx-auto relative p-8 md:p-12 border-l-4 border-warning opacity-0">
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-base-content">
                            No hidden fees. No surprise deductions. Just
                            transparent pricing that lets recruiters focus on
                            what they do best -- placing candidates.
                        </p>
                        <div className="mt-6 pt-4 border-t border-warning/30">
                            <span className="text-sm font-bold uppercase tracking-wider text-warning">
                                -- Splits Network, 2026
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CTA
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-cta relative py-24 overflow-hidden bg-neutral">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-primary text-primary-content">
                            Get Started Today
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-neutral-content">
                            Ready To Start{" "}
                            <span className="text-primary">Making</span>{" "}
                            Placements?
                        </h2>
                        <p className="text-lg mb-10 text-neutral-content/70">
                            Join Splits Network today and start building your
                            recruiting business with transparent, fair
                            participation in split placements.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-l-4 border-primary bg-base-100/5 border border-base-content/10 text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-primary">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-primary-content" />
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-neutral-content">
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5 text-neutral-content/60">
                                Access the split-fee marketplace
                            </p>
                            <a
                                href="/sign-up"
                                className="btn btn-primary btn-block uppercase tracking-wider text-sm"
                            >
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-l-4 border-warning bg-base-100/5 border border-base-content/10 text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-warning">
                                <i className="fa-duotone fa-regular fa-building text-xl text-warning-content" />
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-neutral-content">
                                Companies
                            </h3>
                            <p className="text-xs mb-5 text-neutral-content/60">
                                Post roles, find vetted talent
                            </p>
                            <a
                                href="/sign-up"
                                className="btn btn-warning btn-block uppercase tracking-wider text-sm"
                            >
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-l-4 border-secondary bg-base-100/5 border border-base-content/10 text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-secondary">
                                <i className="fa-duotone fa-regular fa-user text-xl text-secondary-content" />
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-neutral-content">
                                Candidates
                            </h3>
                            <p className="text-xs mb-5 text-neutral-content/60">
                                Free profile, real recruiters
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-secondary btn-block uppercase tracking-wider text-sm"
                            >
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-1 text-neutral-content/50">
                            No credit card required for Starter. Upgrade
                            anytime.
                        </p>
                        <a
                            href="mailto:hello@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-warning"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
