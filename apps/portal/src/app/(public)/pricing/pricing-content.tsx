"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";
import {
    BaselDynamicPricingSection,
    BaselComparisonTable,
    BaselCalculator,
} from "@/components/basel/pricing";
import { pricingFaqs } from "./pricing-faq-data";
import { PricingFaqAccordion } from "./pricing-faq-accordion";

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
        feature: "Messaging",
        starter: "5/month",
        pro: "Unlimited",
        partner: "Unlimited",
    },
    {
        feature: "Saved Candidates",
        starter: "10",
        pro: "100",
        partner: "Unlimited",
    },
    {
        feature: "Saved Roles",
        starter: "10",
        pro: "50",
        partner: "Unlimited",
    },
    {
        feature: "Referral Codes",
        starter: "1",
        pro: "5",
        partner: "Unlimited",
    },
    {
        feature: "Email Notifications",
        starter: false,
        pro: true,
        partner: true,
    },
    {
        feature: "Early Access to Roles",
        starter: false,
        pro: true,
        partner: true,
    },
    {
        feature: "Priority Role Access",
        starter: false,
        pro: false,
        partner: true,
    },
    {
        feature: "Advanced Analytics & Data Export",
        starter: false,
        pro: true,
        partner: true,
    },
    {
        feature: "Call Recording & Transcription",
        starter: false,
        pro: true,
        partner: true,
    },
    {
        feature: "Email & Calendar Integrations",
        starter: false,
        pro: true,
        partner: true,
    },
    {
        feature: "AI Match Scoring (True Score)",
        starter: false,
        pro: false,
        partner: true,
    },
    {
        feature: "AI Call Summaries",
        starter: false,
        pro: false,
        partner: true,
    },
    {
        feature: "Firm & Team Management",
        starter: false,
        pro: false,
        partner: true,
    },
    { feature: "API Access", starter: false, pro: false, partner: true },
    {
        feature: "Support Level",
        starter: "In-App",
        pro: "Priority Email",
        partner: "Account Mgr",
    },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export function PricingContent() {
    const containerRef = useRef<HTMLDivElement>(null);
    useScrollReveal(containerRef);

    // NOTE: Hero image parallax effect removed (was scrub-based GSAP ScrollTrigger).
    // All entrance animations now handled by scroll-reveal CSS classes.

    return (
        <div ref={containerRef}>
            {/* ═══════════════════════════════════════════════════════════════
                HERO — 60/40 Split-Screen with Diagonal Clip
               ═══════════════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-neutral overflow-hidden">
                {/* Right image panel — behind on mobile, 40% on desktop */}
                <div
                    className="scroll-reveal scale-in absolute inset-0 lg:left-[58%]"
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
                <div className="relative  container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6">
                            Pricing
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="scroll-reveal fade-up inline-block text-neutral-content">
                                Predictable
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block text-neutral-content">
                                costs.
                            </span>
                            <br />
                            <span className="scroll-reveal fade-up inline-block text-primary">
                                Compounding
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block text-neutral-content">
                                returns.
                            </span>
                        </h1>

                        <p className="scroll-reveal fade-up text-lg md:text-xl text-neutral-content/70 leading-relaxed max-w-xl mb-10">
                            Three tiers. One transparent model. Your
                            subscription is the only recurring cost -- placement
                            earnings are yours to keep. Start free, scale when
                            the math makes sense.
                        </p>

                        <div className="scroll-reveal fade-up flex flex-wrap items-center gap-4">
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
                            className={`scroll-reveal fade-up p-8 md:p-10 bg-base-200 border-l-4 ${stat.semantic}`}
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
                        <div className="scroll-reveal slide-from-left lg:col-span-3">
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
                        <div className="scroll-reveal slide-from-right lg:col-span-2">
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
                        <div className="scroll-reveal slide-from-left lg:col-span-4 border-l-4 border-secondary pl-8 md:pl-12">
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
                    <div className="scroll-reveal fade-up max-w-3xl mb-16">
                        <span className="inline-block px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] mb-4 bg-accent text-accent-content">
                            Select a Tier
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-base-content">
                            Three Plans.{" "}
                            <span className="text-accent">One Standard.</span>
                        </h2>
                    </div>

                    <div className="scroll-reveal fade-up">
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
                    <div className="scroll-reveal slide-from-left max-w-2xl mb-16">
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
                    <div className="scroll-reveal fade-up">
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

                <div className="relative  flex items-center h-full px-6 lg:px-12">
                    <div className="scroll-reveal fade-up container mx-auto">
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
                    <div className="scroll-reveal slide-from-right lg:ml-auto max-w-2xl mb-16">
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
                        <div className="scroll-reveal fade-up lg:col-span-3 p-10 md:p-12 border-l-4 border-secondary bg-base-200 shadow-sm">
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
                        <div className="scroll-reveal fade-up lg:col-span-2 p-10 md:p-12 border-l-4 border-warning bg-base-200 shadow-sm">
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
                        <div className="scroll-reveal slide-from-left border-l-4 border-primary pl-8 md:pl-12">
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
                        <div className="scroll-reveal fade-up lg:col-span-2">
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
                        <div className="scroll-reveal fade-up lg:col-span-3">
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
                        <div className="scroll-reveal fade-up lg:col-span-2">
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
                        <div className="scroll-reveal fade-up border-l-4 border-warning pl-8 md:pl-12">
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

                <div className="container mx-auto px-6 lg:px-12 relative ">
                    {/* Editorial heading — left-aligned */}
                    <div className="scroll-reveal fade-up max-w-3xl mb-16">
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
                        <div className="scroll-reveal fade-up p-10 border-l-4 border-primary bg-base-100/5 border border-base-content/10">
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
                        <div className="scroll-reveal fade-up p-10 border-l-4 border-warning bg-base-100/5 border border-base-content/10">
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
                        <div className="scroll-reveal fade-up p-10 border-l-4 border-secondary bg-base-100/5 border border-base-content/10">
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

                    <div className="scroll-reveal fade-in">
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
