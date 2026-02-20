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
    {
        value: "Free",
        label: "to begin placing candidates",
        semantic: "border-success",
    },
    {
        value: "3",
        label: "tiers with clear differentiation",
        semantic: "border-primary",
    },
    {
        value: "20%",
        label: "saved with annual billing",
        semantic: "border-accent",
    },
    {
        value: "$0",
        label: "hidden fees at any tier",
        semantic: "border-warning",
    },
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

            const heroKicker = $1(".hero-kicker");
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.normal },
                );
            }
            const heroWords = $(".hero-headline-word");
            if (heroWords.length) {
                heroTl.fromTo(
                    heroWords,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: D.hero,
                        stagger: S.normal,
                    },
                    "-=0.3",
                );
            }
            const heroBody = $1(".hero-body");
            if (heroBody) {
                heroTl.fromTo(
                    heroBody,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.5",
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

            // Hero image panel reveal
            const heroImgWrap = $1(".hero-img-wrap");
            if (heroImgWrap) {
                gsap.fromTo(
                    heroImgWrap,
                    { opacity: 0, scale: 1.08 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1.4,
                        ease: E.smooth,
                        delay: 0.2,
                    },
                );
            }

            // Hero image parallax
            const heroImg = $1(".hero-img-wrap img");
            if (heroImg) {
                gsap.to(heroImg, {
                    yPercent: 12,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $1(".hero-section"),
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                    },
                });
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

            // ═══ INTRO (editorial split) ══════════════════════════════
            const introText = $1(".intro-text");
            if (introText) {
                gsap.fromTo(
                    introText,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: $1(".pricing-intro"),
                            start: "top 70%",
                        },
                    },
                );
            }
            const introSidebar = $1(".intro-sidebar");
            if (introSidebar) {
                gsap.fromTo(
                    introSidebar,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: $1(".pricing-intro"),
                            start: "top 70%",
                        },
                    },
                );
            }

            // ═══ PULL QUOTES ════════════════════════════════════════════
            $(".pullquote").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, x: -40 },
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

            // ═══ ROI CALCULATOR ═══════════════════════════════════════
            const calcText = $1(".calc-editorial-text");
            if (calcText) {
                gsap.fromTo(
                    calcText,
                    { opacity: 0, x: -50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: $1(".roi-calculator-section"),
                            start: "top 70%",
                        },
                    },
                );
            }
            const calcWidget = $1(".calc-widget");
            if (calcWidget) {
                gsap.fromTo(
                    calcWidget,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: D.normal,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: $1(".roi-calculator-section"),
                            start: "top 70%",
                        },
                    },
                );
            }

            // ═══ COMPANIES ══════════════════════════════════════════════
            const companiesText = $1(".companies-text");
            if (companiesText) {
                gsap.fromTo(
                    companiesText,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: D.slow,
                        ease: E.strong,
                        scrollTrigger: {
                            trigger: $1(".companies-section"),
                            start: "top 70%",
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
                        trigger: $1(".companies-grid"),
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
                HERO — 60/40 Split-Screen with Diagonal Clip
               ═══════════════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-neutral overflow-hidden">
                {/* Right image panel — behind on mobile, 40% on desktop */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                    style={{
                        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1606002830191-c1b4f20e6cda?w=800&q=80"
                        alt="Professional recruiter in modern office"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/30" />
                </div>

                {/* Subtle diagonal accent behind text */}
                <div
                    className="absolute inset-0 bg-primary/5 pointer-events-none hidden lg:block"
                    style={{
                        clipPath: "polygon(0 0, 55% 0, 45% 100%, 0% 100%)",
                    }}
                />

                {/* Content panel — left-aligned, 60% */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            Pricing
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-neutral-content">
                                Predictable
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-neutral-content">
                                costs.
                            </span>
                            <br />
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                Compounding
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-neutral-content">
                                returns.
                            </span>
                        </h1>

                        <p className="hero-body text-lg md:text-xl text-neutral-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                            Three tiers. One transparent model. Your
                            subscription is the only recurring cost -- placement
                            earnings are yours to keep. Start free, scale when
                            the math makes sense.
                        </p>

                        <div className="hero-cta-row flex flex-wrap items-center gap-4 opacity-0">
                            <a
                                href="/sign-up"
                                className="btn btn-primary btn-lg uppercase tracking-wider text-sm shadow-md"
                            >
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Start Recruiting
                            </a>
                            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral-content/50">
                                Free tier. No credit card. No expiration.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                KEY STATS BAR — Stacked editorial with accent borders
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div
                            key={index}
                            className={`stat-block p-8 md:p-10 bg-base-200 border-l-4 ${stat.semantic} opacity-0`}
                        >
                            <div className="text-4xl md:text-5xl font-black mb-2 text-base-content">
                                {stat.value}
                            </div>
                            <div className="text-sm font-bold uppercase tracking-[0.12em] text-base-content/50">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                INTRO — 60/40 Split-Screen Editorial (Text Left / Sidebar Right)
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-intro py-28 overflow-hidden bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-start">
                        {/* Text — 3 of 5 columns (60%) */}
                        <div className="intro-text lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Our Philosophy
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8 text-base-content">
                                Aligned{" "}
                                <span className="text-primary">Incentives</span>
                                , Not Aligned Fees
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-base-content/80 max-w-lg">
                                Most recruiting platforms subsidize a free tier
                                by extracting a percentage from every deal. The
                                cost is invisible until it compounds. Splits
                                Network works differently: your subscription is
                                your entire platform cost. Placement earnings
                                flow to you based on a transparent split model
                                with no platform deductions layered on top.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-base-content/80 max-w-lg">
                                Every recruiter starts with full marketplace
                                access, unlimited submissions, and a complete
                                ATS workflow at no cost. Paid tiers increase
                                your payout bonuses and unlock operational tools
                                -- analytics, priority access, API integrations,
                                team management. The features scale with your
                                business; the fundamentals never get gated.
                            </p>

                            <p className="text-lg leading-relaxed text-base-content/80 max-w-lg">
                                For companies, posting roles costs nothing.
                                Payment happens only on successful hires, at a
                                fee percentage set before the engagement begins.
                                Candidates are never charged. Every participant
                                in the ecosystem knows exactly what they owe and
                                exactly what they earn.
                            </p>
                        </div>

                        {/* Sidebar — 2 of 5 columns (40%) */}
                        <div className="intro-sidebar lg:col-span-2 opacity-0">
                            <div className="bg-base-200 p-8 md:p-10 border-l-4 border-primary">
                                <h3 className="font-black text-lg uppercase tracking-wide mb-6 text-base-content">
                                    The Splits Model
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        {
                                            icon: "fa-duotone fa-regular fa-user-tie",
                                            title: "Recruiters",
                                            body: "Subscribe to access the marketplace. Earn on every successful placement.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-building",
                                            title: "Companies",
                                            body: "Post roles free. Pay only when you hire a candidate.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-user",
                                            title: "Candidates",
                                            body: "Always free. Get matched with real recruiters who advocate for you.",
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                                <i
                                                    className={`${item.icon} text-primary`}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base mb-1 text-base-content">
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-base-content/60 leading-relaxed">
                                                    {item.body}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PULL QUOTE 1 — Full-bleed dark, left-aligned editorial
               ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 overflow-hidden bg-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 items-center">
                        <div className="pullquote lg:col-span-4 border-l-4 border-secondary pl-8 md:pl-12 opacity-0">
                            <p className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] text-neutral-content">
                                The platform charges a subscription. It does not
                                take a cut of your placements. That distinction
                                changes the economics of every deal you close.
                            </p>
                            <div className="mt-8 pt-6 border-t border-secondary/30">
                                <span className="text-sm font-bold uppercase tracking-wider text-secondary">
                                    -- The Splits Network Pricing Model
                                </span>
                            </div>
                        </div>
                        <div className="lg:col-span-1 hidden lg:flex items-center justify-center">
                            <div className="w-20 h-20 bg-secondary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-quote-right text-4xl text-secondary/40" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PRICING CARDS — Full-width section, left-aligned heading
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-cards-section py-28 overflow-hidden bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Left-aligned kicker/headline (editorial, not centered) */}
                    <div className="pricing-cards-heading max-w-3xl mb-16 opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] mb-4 bg-accent text-accent-content">
                            Select a Tier
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-base-content">
                            Three Plans.{" "}
                            <span className="text-accent">One Standard.</span>
                        </h2>
                    </div>

                    <div className="pricing-cards-grid opacity-0">
                        <BaselDynamicPricingSection
                            showBillingToggle={true}
                            defaultAnnual={false}
                            selectable={false}
                        />
                    </div>

                    <div className="max-w-3xl mt-10 text-sm text-base-content/50">
                        Splits Network does not guarantee placements, income, or
                        role availability. All payout amounts are calculated at
                        hire time based on role terms, recruiter participation,
                        and active subscription tier. Placement fee percentages
                        are set by hiring companies and confirmed before
                        recruiter engagement. Annual billing savings are based
                        on comparison to monthly rates for the same tier. Prices
                        shown are in USD.
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                ROI CALCULATOR — Editorial Split (Text Left / Calculator Right)
               ═══════════════════════════════════════════════════════════════ */}
            <section className="roi-calculator-section py-28 overflow-hidden bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Editorial intro — left-aligned, narrow */}
                    <div className="calc-editorial-text max-w-2xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Earnings Projection
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6 text-base-content">
                            Model Your{" "}
                            <span className="text-secondary">
                                Actual Returns
                            </span>
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed">
                            Input a placement scenario -- salary, fee
                            percentage, tier -- and see the precise payout at
                            each subscription level.
                        </p>
                    </div>

                    {/* Calculator widget — full width */}
                    <div className="calc-widget opacity-0">
                        <BaselCalculator variant="page" animate={false} />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FULL-BLEED IMAGE BREAK
               ═══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden h-[40vh] md:h-[50vh]">
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                    alt="Team collaborating in modern office"
                    className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-neutral/75" />

                <div className="relative z-10 flex items-center h-full px-6 lg:px-12">
                    <div className="image-caption container mx-auto opacity-0">
                        <p className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-neutral-content max-w-3xl">
                            Invest in your tier.{" "}
                            <span className="text-warning">
                                Compound your returns.
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FOR COMPANIES — Reversed 40/60 (Image Left / Text Right)
                Asymmetric card grid below
               ═══════════════════════════════════════════════════════════════ */}
            <section className="companies-section py-28 overflow-hidden bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Section heading — right-aligned for editorial contrast */}
                    <div className="companies-text lg:ml-auto max-w-2xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-warning mb-4">
                            Hiring Companies
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6 text-base-content">
                            Post Roles at{" "}
                            <span className="text-warning">Zero Cost</span>
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed">
                            Companies access the full recruiter network without
                            a subscription, a listing fee, or a per-seat charge.
                            Post as many roles as you need and manage every
                            pipeline from a single dashboard.
                        </p>
                    </div>

                    {/* Asymmetric grid — 3/5 + 2/5 split */}
                    <div className="companies-grid grid lg:grid-cols-5 gap-8">
                        {/* Free to Post — larger card (3 cols) */}
                        <div className="companies-card lg:col-span-3 p-10 md:p-12 border-l-4 border-secondary bg-base-200 shadow-sm opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center mb-6 bg-secondary">
                                <i className="fa-duotone fa-regular fa-building text-2xl text-secondary-content" />
                            </div>
                            <h3 className="font-black text-2xl uppercase tracking-wide mb-4 text-base-content">
                                Free to Post
                            </h3>
                            <p className="text-base leading-relaxed mb-8 text-base-content/75 max-w-md">
                                Companies access the full recruiter network
                                without a subscription, a listing fee, or a
                                per-seat charge. Post as many roles as you need.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Unlimited role postings across the network",
                                    "Full recruiter marketplace visibility",
                                    "ATS pipeline tracking per role",
                                    "Candidate management and evaluation tools",
                                    "Built-in communication and status notifications",
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

                        {/* Pay on Hire — narrower card (2 cols) */}
                        <div className="companies-card lg:col-span-2 p-10 md:p-12 border-l-4 border-warning bg-base-200 shadow-sm opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center mb-6 bg-warning">
                                <i className="fa-duotone fa-regular fa-handshake text-2xl text-warning-content" />
                            </div>
                            <h3 className="font-black text-2xl uppercase tracking-wide mb-4 text-base-content">
                                Pay on Successful Hire
                            </h3>
                            <p className="text-base leading-relaxed mb-8 text-base-content/75">
                                Placement fees are agreed before the engagement
                                starts. You pay only when a candidate accepts
                                and begins the role. No retainer. No upfront
                                deposit. No platform surcharge.
                            </p>
                            <div className="p-8 text-center mb-6 bg-neutral">
                                <div className="text-4xl font-black mb-2 text-warning">
                                    15-25%
                                </div>
                                <div className="text-sm font-bold uppercase tracking-wider text-neutral-content/60">
                                    of first-year salary, set per role
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-base-content/60">
                                A $120,000 hire at a 20% fee generates a $24,000
                                placement fee. The majority goes to the placing
                                recruiter; the platform retains a transparent
                                processing percentage disclosed at role
                                creation.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <a
                            href="/sign-up"
                            className="btn btn-warning btn-lg uppercase tracking-wider text-sm shadow-md"
                        >
                            <i className="fa-duotone fa-regular fa-building" />
                            Post Your First Role
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PULL QUOTE 2 — Narrow-width, right-aligned for rhythm shift
               ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 overflow-hidden bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="lg:ml-auto max-w-3xl">
                        <div className="pullquote border-l-4 border-primary pl-8 md:pl-12 opacity-0">
                            <p className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-[0.95] text-base-content">
                                A single placement on Pro covers months of
                                subscription costs. On Partner, the margin is
                                wider still. The upgrade pays for itself -- the
                                question is how quickly.
                            </p>
                            <div className="mt-8 pt-6 border-t border-primary/30">
                                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                                    -- The Economics of Tier Selection
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FEATURE COMPARISON — Full-width, left-aligned heading
               ═══════════════════════════════════════════════════════════════ */}
            <section className="feature-comparison py-28 overflow-hidden bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Heading block — 2 of 5 cols */}
                        <div className="comparison-heading lg:col-span-2 opacity-0">
                            <span className="inline-block px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] mb-4 bg-primary text-primary-content">
                                Full Breakdown
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] text-base-content">
                                Every Feature.{" "}
                                <span className="text-primary">
                                    Every Tier.
                                </span>
                            </h2>
                            <p className="mt-4 text-base text-base-content/60 leading-relaxed">
                                Every recruiter gets full marketplace access.
                                Higher tiers unlock premium operational tools
                                and better payout bonuses on every placement.
                            </p>
                        </div>

                        {/* Table — 3 of 5 cols */}
                        <div className="comparison-table lg:col-span-3 opacity-0">
                            <BaselComparisonTable
                                features={comparisonFeatures}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FAQ — Dark section, asymmetric heading + accordion
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-faq py-28 overflow-hidden bg-neutral">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* Heading — 2 of 5 cols, left-aligned */}
                        <div className="faq-heading lg:col-span-2 opacity-0">
                            <span className="inline-block px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                Common Questions
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] text-neutral-content">
                                Pricing{" "}
                                <span className="text-secondary">Answered</span>
                            </h2>
                            <p className="mt-4 text-base text-neutral-content/50 leading-relaxed">
                                Everything you need to know about plans,
                                billing, upgrades, and how the split model
                                works.
                            </p>
                        </div>

                        {/* Accordion — 3 of 5 cols */}
                        <div className="faq-grid lg:col-span-3">
                            <PricingFaqAccordion faqs={pricingFaqs} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FINAL QUOTE — Full-bleed base-100, left-aligned for contrast
               ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 overflow-hidden bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <div className="final-quote border-l-4 border-warning pl-8 md:pl-12 opacity-0">
                            <p className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] text-base-content">
                                Transparent pricing is not a feature. It is a
                                prerequisite. Every fee is disclosed before any
                                work begins. Every payout is tied to a verified
                                outcome.
                            </p>
                            <div className="mt-8 pt-6 border-t border-warning/30">
                                <span className="text-sm font-bold uppercase tracking-wider text-warning">
                                    -- Splits Network, 2026
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CTA — Full-bleed dark, editorial split with roomy cards
               ═══════════════════════════════════════════════════════════════ */}
            <section className="pricing-cta relative py-28 overflow-hidden bg-neutral">
                {/* Subtle diagonal accent */}
                <div
                    className="absolute inset-0 bg-primary/5 pointer-events-none hidden lg:block"
                    style={{
                        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 30% 100%)",
                    }}
                />

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    {/* Editorial heading — left-aligned */}
                    <div className="cta-content max-w-3xl mb-16 opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] mb-6 bg-primary text-primary-content">
                            Begin Here
                        </span>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.92] mb-6 text-neutral-content">
                            One Network. Three Ways{" "}
                            <span className="text-primary">In.</span>
                        </h2>
                        <p className="text-lg text-neutral-content/70 max-w-xl leading-relaxed">
                            Pick the path that fits your role in the ecosystem.
                            Every account starts in minutes.
                        </p>
                    </div>

                    {/* CTA cards — 3-col with generous padding */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {/* Recruiters */}
                        <div className="cta-card p-10 border-l-4 border-primary bg-base-100/5 border border-base-content/10 opacity-0">
                            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-primary">
                                <i className="fa-duotone fa-regular fa-user-tie text-2xl text-primary-content" />
                            </div>
                            <h3 className="font-black text-xl uppercase mb-3 text-neutral-content">
                                Recruiters
                            </h3>
                            <p className="text-sm mb-8 text-neutral-content/60 leading-relaxed">
                                Access the split-fee marketplace and start
                                submitting candidates today.
                            </p>
                            <a
                                href="/sign-up"
                                className="btn btn-primary btn-block btn-lg uppercase tracking-wider text-sm"
                            >
                                Join the Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-10 border-l-4 border-warning bg-base-100/5 border border-base-content/10 opacity-0">
                            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-warning">
                                <i className="fa-duotone fa-regular fa-building text-2xl text-warning-content" />
                            </div>
                            <h3 className="font-black text-xl uppercase mb-3 text-neutral-content">
                                Companies
                            </h3>
                            <p className="text-sm mb-8 text-neutral-content/60 leading-relaxed">
                                Post roles at no cost. Pay only when you hire.
                            </p>
                            <a
                                href="/sign-up"
                                className="btn btn-warning btn-block btn-lg uppercase tracking-wider text-sm"
                            >
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-10 border-l-4 border-secondary bg-base-100/5 border border-base-content/10 opacity-0">
                            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-secondary">
                                <i className="fa-duotone fa-regular fa-user text-2xl text-secondary-content" />
                            </div>
                            <h3 className="font-black text-xl uppercase mb-3 text-neutral-content">
                                Candidates
                            </h3>
                            <p className="text-sm mb-8 text-neutral-content/60 leading-relaxed">
                                Create a free profile. Let specialized
                                recruiters find you the right fit.
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-secondary btn-block btn-lg uppercase tracking-wider text-sm"
                            >
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer opacity-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <p className="text-sm text-neutral-content/50">
                                No credit card required for Starter. Upgrade or
                                cancel anytime.
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
                </div>
            </section>
        </div>
    );
}
