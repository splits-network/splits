import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { PricingAnimator } from "./pricing-animator";
import { DynamicPricingSection } from "@/components/pricing";
import { pricingFaqs } from "./pricing-faq-data";
import { PricingFaqAccordion } from "./pricing-faq-accordion";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the plan that fits your recruiting business on Splits Network, with clear tiers and transparent earnings for every placement.",
    openGraph: {
        title: "Pricing",
        description:
            "Choose the plan that fits your recruiting business on Splits Network, with clear tiers and transparent earnings for every placement.",
        url: "https://splits.network/public/pricing",
    },
    ...buildCanonical("/public/pricing"),
};

// ─── Pricing data ────────────────────────────────────────────────────────────

const keyStats = [
    { value: "Free", label: "to start recruiting", color: "#FF6B6B" },
    { value: "3", label: "transparent tiers", color: "#4ECDC4" },
    { value: "20%", label: "annual billing savings", color: "#FFE66D" },
    { value: "$0", label: "hidden fees ever", color: "#A78BFA" },
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
    { feature: "Payout Bonuses", starter: "Base", pro: "Higher", partner: "Maximum" },
    { feature: "Access to Open Roles", starter: true, pro: true, partner: true },
    { feature: "Unlimited Submissions", starter: true, pro: true, partner: true },
    { feature: "Full ATS Workflow", starter: true, pro: true, partner: true },
    { feature: "Priority Role Access", starter: false, pro: true, partner: true },
    { feature: "Exclusive Early Access", starter: false, pro: false, partner: true },
    { feature: "Performance Analytics", starter: false, pro: true, partner: true },
    { feature: "Advanced Reporting", starter: false, pro: true, partner: true },
    { feature: "API Access", starter: false, pro: false, partner: true },
    { feature: "Team Management", starter: false, pro: false, partner: true },
    { feature: "White-Label Options", starter: false, pro: false, partner: true },
    { feature: "Support Level", starter: "Email", pro: "Priority", partner: "Account Mgr" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PricingPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pricingFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Splits Network Pricing",
        description:
            "Pricing plans for recruiters using Splits Network, including Starter, Pro, and Partner tiers.",
        brand: {
            "@type": "Organization",
            name: "Splits Network",
        },
        offers: {
            "@type": "AggregateOffer",
            lowPrice: "0",
            highPrice: "249",
            priceCurrency: "USD",
            offerCount: "3",
        },
        url: "https://splits.network/public/pricing",
    };

    return (
        <>
            <JsonLd data={faqJsonLd} id="portal-pricing-faq-jsonld" />
            <JsonLd data={productJsonLd} id="portal-pricing-product-jsonld" />
            <PricingAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO HEADER
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[70vh] overflow-hidden flex items-center"
                    style={{ backgroundColor: "#1A1A2E" }}>
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] opacity-0"
                            style={{ borderColor: "#FF6B6B" }} />
                        <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full opacity-0"
                            style={{ backgroundColor: "#4ECDC4" }} />
                        <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full opacity-0"
                            style={{ backgroundColor: "#FFE66D" }} />
                        <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 opacity-0"
                            style={{ backgroundColor: "#A78BFA" }} />
                        <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] opacity-0"
                            style={{ borderColor: "#FF6B6B" }} />
                        <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 opacity-0"
                            style={{ backgroundColor: "#FF6B6B" }} />
                        {/* Triangle */}
                        <div className="memphis-shape absolute top-[18%] left-[45%] opacity-0"
                            style={{
                                width: 0, height: 0,
                                borderLeft: "25px solid transparent",
                                borderRight: "25px solid transparent",
                                borderBottom: "43px solid #FFE66D",
                                transform: "rotate(-10deg)",
                            }} />
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[45%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4ECDC4" }} />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                            <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                                fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Plus sign */}
                        <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                            <line x1="15" y1="3" x2="15" y2="27" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                            <line x1="3" y1="15" x2="27" y2="15" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        {/* Dollar sign shape */}
                        <div className="memphis-shape absolute top-[35%] right-[8%] text-4xl font-black opacity-0"
                            style={{ color: "#4ECDC4" }}>
                            $
                        </div>
                        {/* Small square */}
                        <div className="memphis-shape absolute bottom-[35%] left-[5%] w-8 h-8 border-[3px] rotate-12 opacity-0"
                            style={{ borderColor: "#A78BFA" }} />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Badge */}
                            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-8 opacity-0"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-tag"></i>
                                Simple Pricing
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0"
                                style={{ color: "#FFFFFF" }}>
                                Transparent Pricing.{" "}
                                <span className="relative inline-block">
                                    <span style={{ color: "#FF6B6B" }}>Real Value.</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#FF6B6B" }} />
                                </span>{" "}
                                No Surprises.
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 opacity-0"
                                style={{ color: "rgba(255,255,255,0.7)" }}>
                                Choose the plan that fits your recruiting business. Higher
                                tiers unlock better payout bonuses and priority access to
                                roles. Start free, upgrade when you&apos;re ready.
                            </p>

                            {/* CTA row */}
                            <div className="hero-cta-row flex flex-wrap items-center justify-center gap-4 opacity-0">
                                <a href="/sign-up"
                                    className="inline-flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wider text-sm border-4 transition-transform hover:-translate-y-1"
                                    style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                    <i className="fa-duotone fa-regular fa-rocket"></i>
                                    Get Started Free
                                </a>
                                <span className="text-xs font-bold uppercase tracking-[0.15em]"
                                    style={{ color: "rgba(255,255,255,0.5)" }}>
                                    No credit card required
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    KEY STATS BAR
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-stats py-0 overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {keyStats.map((stat, index) => (
                            <div key={index}
                                className="stat-block p-6 md:p-8 text-center opacity-0"
                                style={{
                                    backgroundColor: stat.color,
                                    color: stat.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                                }}>
                                <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    INTRO SECTION - Pricing Philosophy
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-intro py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="intro-content opacity-0">
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                    style={{ color: "#1A1A2E" }}>
                                    Built for{" "}
                                    <span style={{ color: "#FF6B6B" }}>Recruiters</span>,
                                    Not Against Them
                                </h2>

                                <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                    Most platforms take a cut from every deal and call it
                                    &ldquo;free.&rdquo; We believe in a different model. Your subscription
                                    is your only recurring cost. When you make a placement, the
                                    earnings are yours -- no surprise deductions, no hidden platform
                                    fees eating into your commission.
                                </p>

                                <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                    Higher tiers unlock better payout bonuses and premium features.
                                    But every recruiter -- from day one on the free Starter plan --
                                    gets full access to the marketplace, unlimited submissions, and
                                    a complete ATS workflow. No feature gates on the basics.
                                </p>

                                <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                    Companies post roles for free and pay only on successful hires.
                                    Candidates never pay a dime. The incentives are aligned for
                                    everyone.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PULL QUOTE 1
                   ══════════════════════════════════════════════════════════════ */}
                <section className="py-16 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                    <div className="container mx-auto px-4">
                        <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                            style={{ borderColor: "#4ECDC4" }}>
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                                style={{ color: "#4ECDC4" }}>
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                                style={{ color: "#FFFFFF" }}>
                                Your subscription is your only cost.
                                When you place a candidate, the earnings are yours --
                                no hidden platform fees, no surprise deductions.
                            </p>
                            <div className="mt-6 pt-4" style={{ borderTop: "3px solid #4ECDC4" }}>
                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
                                    -- Splits Network Pricing Promise
                                </span>
                            </div>
                            {/* Corner decoration */}
                            <div className="absolute top-0 right-0 w-10 h-10"
                                style={{ backgroundColor: "#4ECDC4" }} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PRICING CARDS - The Visual Centerpiece
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-cards-section py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            {/* Section heading */}
                            <div className="pricing-cards-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                    style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                    Choose Your Tier
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                    style={{ color: "#1A1A2E" }}>
                                    Three Plans.{" "}
                                    <span style={{ color: "#A78BFA" }}>Zero Guesswork.</span>
                                </h2>
                            </div>

                            {/* Dynamic pricing from API */}
                            <div className="billing-toggle-section opacity-0">
                                <DynamicPricingSection
                                    showBillingToggle={true}
                                    defaultAnnual={false}
                                    variant="default"
                                    selectable={false}
                                />
                            </div>

                            {/* Static Memphis-styled pricing cards as visual complement */}
                            <div className="pricing-cards-grid grid md:grid-cols-3 gap-8 mt-16">
                                {/* Starter Card */}
                                <div className="pricing-card relative p-8 border-4 opacity-0"
                                    style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: "#4ECDC4" }} />
                                    <div className="mb-6">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3"
                                            style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                            Starter
                                        </span>
                                        <div className="text-4xl font-black mb-1" style={{ color: "#1A1A2E" }}>
                                            Free
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "#1A1A2E", opacity: 0.5 }}>
                                            Forever -- no credit card
                                        </div>
                                    </div>
                                    <div className="w-full h-1 mb-6" style={{ backgroundColor: "#4ECDC4" }} />
                                    <ul className="space-y-3 mb-8">
                                        {starterFeatures.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                                style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0"
                                                    style={{ color: "#4ECDC4" }}></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/sign-up"
                                        className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                        style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                        Start Free
                                    </a>
                                </div>

                                {/* Pro Card (featured) */}
                                <div className="pricing-card relative p-8 border-4 opacity-0 md:-mt-4 md:mb-[-16px]"
                                    style={{ borderColor: "#FF6B6B", backgroundColor: "#1A1A2E" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: "#FF6B6B" }} />
                                    {/* Popular badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-[0.2em]"
                                        style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                        Most Popular
                                    </div>
                                    <div className="mb-6 mt-2">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3"
                                            style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                            Pro
                                        </span>
                                        <div className="text-4xl font-black mb-1" style={{ color: "#FFFFFF" }}>
                                            $99<span className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>/mo</span>
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(255,255,255,0.5)" }}>
                                            $79/mo billed annually -- save 20%
                                        </div>
                                    </div>
                                    <div className="w-full h-1 mb-6" style={{ backgroundColor: "#FF6B6B" }} />
                                    <ul className="space-y-3 mb-8">
                                        {proFeatures.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                                style={{ color: "rgba(255,255,255,0.8)" }}>
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0"
                                                    style={{ color: "#FF6B6B" }}></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/sign-up"
                                        className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                        style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                        Go Pro
                                    </a>
                                </div>

                                {/* Partner Card */}
                                <div className="pricing-card relative p-8 border-4 opacity-0"
                                    style={{ borderColor: "#A78BFA", backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: "#A78BFA" }} />
                                    <div className="mb-6">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3"
                                            style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                            Partner
                                        </span>
                                        <div className="text-4xl font-black mb-1" style={{ color: "#1A1A2E" }}>
                                            $249<span className="text-lg font-bold" style={{ color: "#1A1A2E", opacity: 0.5 }}>/mo</span>
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "#1A1A2E", opacity: 0.5 }}>
                                            $199/mo billed annually -- save 20%
                                        </div>
                                    </div>
                                    <div className="w-full h-1 mb-6" style={{ backgroundColor: "#A78BFA" }} />
                                    <ul className="space-y-3 mb-8">
                                        {partnerFeatures.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                                style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0"
                                                    style={{ color: "#A78BFA" }}></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/sign-up"
                                        className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                        style={{ backgroundColor: "#A78BFA", borderColor: "#A78BFA", color: "#FFFFFF" }}>
                                        Become a Partner
                                    </a>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="text-center mt-8 text-sm" style={{ color: "#1A1A2E", opacity: 0.5 }}>
                                Splits Network does not guarantee placements, income, or role availability.
                                All payouts are finalized at hire time based on participation, role, and subscription tier.
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FOR COMPANIES SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="companies-section py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="companies-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                    style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                    For Companies
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                    style={{ color: "#1A1A2E" }}>
                                    Post Roles{" "}
                                    <span style={{ color: "#FFE66D" }}>For Free</span>
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Free to Post */}
                                <div className="companies-card relative p-8 border-4 opacity-0"
                                    style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: "#4ECDC4" }} />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: "#4ECDC4" }}>
                                        <i className="fa-duotone fa-regular fa-building text-2xl" style={{ color: "#4ECDC4" }}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-4"
                                        style={{ color: "#1A1A2E" }}>
                                        Free to Post
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.75 }}>
                                        Companies pay nothing to post roles and access
                                        our network of specialized recruiters.
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            "Unlimited role postings",
                                            "Access to recruiter network",
                                            "Full ATS pipeline visibility",
                                            "Candidate management tools",
                                            "Communication & notifications",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                                style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0"
                                                    style={{ color: "#4ECDC4" }}></i>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Pay on Hire */}
                                <div className="companies-card relative p-8 border-4 opacity-0"
                                    style={{ borderColor: "#FFE66D", backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: "#FFE66D" }} />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: "#FFE66D" }}>
                                        <i className="fa-duotone fa-regular fa-handshake text-2xl" style={{ color: "#FFE66D" }}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-4"
                                        style={{ color: "#1A1A2E" }}>
                                        Pay on Hire
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.75 }}>
                                        Only pay when you successfully hire a candidate.
                                        Set your fee percentage upfront -- total transparency.
                                    </p>
                                    <div className="p-6 text-center mb-4 border-4"
                                        style={{ borderColor: "#FFE66D", backgroundColor: "#1A1A2E" }}>
                                        <div className="text-3xl font-black mb-1" style={{ color: "#FFE66D" }}>
                                            15-25%
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(255,255,255,0.6)" }}>
                                            Typical placement fee range
                                        </div>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.6 }}>
                                        Example: For a $120,000 salary with 20% fee = $24,000 placement fee.
                                        The platform takes a small percentage, and the recruiter receives the majority.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center mt-10">
                                <a href="/sign-up"
                                    className="inline-flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wider text-sm border-4 transition-transform hover:-translate-y-1"
                                    style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    Post Your First Role
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    IMAGE BREAK
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
                    <img
                        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                        alt="Team collaborating in modern office"
                        className="w-full h-full object-cover absolute inset-0"
                        style={{ minHeight: "400px" }}
                    />
                    {/* Retro color overlay */}
                    <div className="absolute inset-0" style={{ backgroundColor: "#1A1A2E", opacity: 0.75 }} />
                    {/* Memphis border frame */}
                    <div className="absolute inset-4 md:inset-8 border-4 pointer-events-none"
                        style={{ borderColor: "#FFE66D" }} />

                    <div className="relative z-10 flex items-center justify-center py-24 px-8">
                        <div className="image-caption text-center max-w-3xl opacity-0">
                            <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight"
                                style={{ color: "#FFFFFF" }}>
                                Higher tiers.{" "}
                                <span style={{ color: "#FFE66D" }}>Bigger payouts.</span>{" "}
                                Same transparent model.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FEATURE COMPARISON TABLE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="feature-comparison py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="comparison-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                    style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                    Full Breakdown
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                    style={{ color: "#1A1A2E" }}>
                                    Feature{" "}
                                    <span style={{ color: "#FF6B6B" }}>Comparison</span>
                                </h2>
                            </div>

                            <div className="comparison-table overflow-x-auto">
                                {/* Table header */}
                                <div className="grid grid-cols-4 gap-0 mb-2">
                                    <div className="p-4 font-black text-sm uppercase tracking-wider"
                                        style={{ color: "#1A1A2E" }}>
                                        Feature
                                    </div>
                                    <div className="p-4 text-center font-black text-sm uppercase tracking-wider"
                                        style={{ color: "#4ECDC4" }}>
                                        Starter
                                    </div>
                                    <div className="p-4 text-center font-black text-sm uppercase tracking-wider"
                                        style={{ backgroundColor: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}>
                                        Pro
                                    </div>
                                    <div className="p-4 text-center font-black text-sm uppercase tracking-wider"
                                        style={{ color: "#A78BFA" }}>
                                        Partner
                                    </div>
                                </div>

                                {/* Table rows */}
                                {comparisonFeatures.map((row, index) => (
                                    <div key={index}
                                        className="comparison-row grid grid-cols-4 gap-0 opacity-0"
                                        style={{
                                            borderTop: "1px solid rgba(26,26,46,0.1)",
                                            backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F5F0EB",
                                        }}>
                                        <div className="p-4 text-sm font-medium" style={{ color: "#1A1A2E" }}>
                                            {row.feature}
                                        </div>
                                        <div className="p-4 text-center text-sm">
                                            {typeof row.starter === "boolean" ? (
                                                row.starter ? (
                                                    <i className="fa-duotone fa-regular fa-check" style={{ color: "#4ECDC4" }}></i>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-xmark" style={{ color: "rgba(26,26,46,0.25)" }}></i>
                                                )
                                            ) : (
                                                <span className="font-bold" style={{ color: "#1A1A2E" }}>{row.starter}</span>
                                            )}
                                        </div>
                                        <div className="p-4 text-center text-sm"
                                            style={{ backgroundColor: index % 2 === 0 ? "rgba(255,107,107,0.05)" : "rgba(255,107,107,0.1)" }}>
                                            {typeof row.pro === "boolean" ? (
                                                row.pro ? (
                                                    <i className="fa-duotone fa-regular fa-check" style={{ color: "#FF6B6B" }}></i>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-xmark" style={{ color: "rgba(26,26,46,0.25)" }}></i>
                                                )
                                            ) : (
                                                <span className="font-bold" style={{ color: "#1A1A2E" }}>{row.pro}</span>
                                            )}
                                        </div>
                                        <div className="p-4 text-center text-sm">
                                            {typeof row.partner === "boolean" ? (
                                                row.partner ? (
                                                    <i className="fa-duotone fa-regular fa-check" style={{ color: "#A78BFA" }}></i>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-xmark" style={{ color: "rgba(26,26,46,0.25)" }}></i>
                                                )
                                            ) : (
                                                <span className="font-bold" style={{ color: "#1A1A2E" }}>{row.partner}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PULL QUOTE 2
                   ══════════════════════════════════════════════════════════════ */}
                <section className="py-16 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                    <div className="container mx-auto px-4">
                        <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                            style={{ borderColor: "#FF6B6B" }}>
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                                style={{ color: "#FF6B6B" }}>
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                                style={{ color: "#1A1A2E" }}>
                                Start with Starter. Upgrade when placements justify it.
                                Every tier pays for itself with a single successful hire.
                            </p>
                            <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FF6B6B" }}>
                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B6B" }}>
                                    -- The Splits Network Approach
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-10 h-10"
                                style={{ backgroundColor: "#FF6B6B" }} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FAQ SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-faq py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="faq-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                    style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                    Common Questions
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                    style={{ color: "#FFFFFF" }}>
                                    Pricing{" "}
                                    <span style={{ color: "#4ECDC4" }}>FAQs</span>
                                </h2>
                            </div>

                            <div className="faq-grid space-y-6">
                                {pricingFaqs.map((faq, index) => {
                                    const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FF6B6B"];
                                    const color = colors[index % colors.length];
                                    const isDark = color === "#FFE66D";
                                    return (
                                        <div key={index}
                                            className="faq-card relative p-6 md:p-8 border-4 opacity-0"
                                            style={{ borderColor: color, backgroundColor: "rgba(255,255,255,0.03)" }}>
                                            <div className="absolute top-0 right-0 w-8 h-8"
                                                style={{ backgroundColor: color }} />
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: color }}>
                                                    <i className="fa-duotone fa-regular fa-question font-bold"
                                                        style={{ color: isDark ? "#1A1A2E" : "#FFFFFF" }}></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-base uppercase tracking-wide mb-3"
                                                        style={{ color: "#FFFFFF" }}>
                                                        {faq.question}
                                                    </h3>
                                                    <p className="text-sm leading-relaxed"
                                                        style={{ color: "rgba(255,255,255,0.65)" }}>
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FINAL QUOTE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="py-16 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                    <div className="container mx-auto px-4">
                        <div className="final-quote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                            style={{ borderColor: "#FFE66D" }}>
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                                style={{ color: "#FFE66D" }}>
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                                style={{ color: "#1A1A2E" }}>
                                No hidden fees. No surprise deductions.
                                Just transparent pricing that lets recruiters
                                focus on what they do best -- placing candidates.
                            </p>
                            <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FFE66D" }}>
                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FFE66D" }}>
                                    -- Splits Network, 2026
                                </span>
                            </div>
                            <div className="absolute top-0 left-0 w-10 h-10"
                                style={{ backgroundColor: "#FFE66D" }} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CTA SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-cta relative py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4"
                            style={{ borderColor: "#FF6B6B" }} />
                        <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45"
                            style={{ backgroundColor: "#4ECDC4" }} />
                        <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full"
                            style={{ backgroundColor: "#FFE66D" }} />
                        <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                            <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                                fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Get Started Today
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1]"
                                style={{ color: "#FFFFFF" }}>
                                Ready To Start{" "}
                                <span style={{ color: "#FF6B6B" }}>Making</span>{" "}
                                Placements?
                            </h2>
                            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                                Join Splits Network today and start building your recruiting
                                business with transparent, fair participation in split placements.
                            </p>
                        </div>

                        <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                            {/* Recruiters */}
                            <div className="cta-card p-6 border-4 text-center opacity-0"
                                style={{ borderColor: "#FF6B6B", backgroundColor: "rgba(255,255,255,0.03)" }}>
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                    style={{ backgroundColor: "#FF6B6B" }}>
                                    <i className="fa-duotone fa-regular fa-user-tie text-xl" style={{ color: "#FFFFFF" }}></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                    Recruiters
                                </h3>
                                <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    Access the split-fee marketplace
                                </p>
                                <a href="/sign-up"
                                    className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                    style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                    Join Network
                                </a>
                            </div>

                            {/* Companies */}
                            <div className="cta-card p-6 border-4 text-center opacity-0"
                                style={{ borderColor: "#FFE66D", backgroundColor: "rgba(255,255,255,0.03)" }}>
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                    style={{ backgroundColor: "#FFE66D" }}>
                                    <i className="fa-duotone fa-regular fa-building text-xl" style={{ color: "#1A1A2E" }}></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                    Companies
                                </h3>
                                <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    Post roles, find vetted talent
                                </p>
                                <a href="/sign-up"
                                    className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                    style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                    Post a Role
                                </a>
                            </div>

                            {/* Candidates */}
                            <div className="cta-card p-6 border-4 text-center opacity-0"
                                style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.03)" }}>
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                    style={{ backgroundColor: "#4ECDC4" }}>
                                    <i className="fa-duotone fa-regular fa-user text-xl" style={{ color: "#1A1A2E" }}></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                    Candidates
                                </h3>
                                <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    Free profile, real recruiters
                                </p>
                                <a href="https://applicant.network/sign-up"
                                    className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                    style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                    Create Profile
                                </a>
                            </div>
                        </div>

                        <div className="cta-footer text-center opacity-0">
                            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                                No credit card required for Starter. Upgrade anytime.
                            </p>
                            <a href="mailto:hello@employment-networks.com"
                                className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm"
                                style={{ color: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                hello@employment-networks.com
                            </a>
                        </div>
                    </div>
                </section>
            </PricingAnimator>
        </>
    );
}
