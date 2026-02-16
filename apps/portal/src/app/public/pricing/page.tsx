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
    { value: "Free", label: "to start recruiting", bg: "bg-coral", fg: "text-cream" },
    { value: "3", label: "transparent tiers", bg: "bg-teal", fg: "text-cream" },
    { value: "20%", label: "annual billing savings", bg: "bg-yellow", fg: "text-dark" },
    { value: "$0", label: "hidden fees ever", bg: "bg-purple", fg: "text-cream" },
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
                <section className="relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                        {/* Triangle -- keep inline for CSS triangle borders */}
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
                                    <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag -- keep inline for SVG attributes */}
                        <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                            <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                                fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Plus sign -- keep inline for SVG attributes */}
                        <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                            <line x1="15" y1="3" x2="15" y2="27" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                            <line x1="3" y1="15" x2="27" y2="15" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        {/* Dollar sign shape */}
                        <div className="memphis-shape absolute top-[35%] right-[8%] text-4xl font-black text-teal opacity-0">
                            $
                        </div>
                        {/* Small square */}
                        <div className="memphis-shape absolute bottom-[35%] left-[5%] w-8 h-8 border-[3px] border-purple rotate-12 opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Badge */}
                            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-8 bg-coral text-cream opacity-0">
                                <i className="fa-duotone fa-regular fa-tag"></i>
                                Simple Pricing
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                                Transparent Pricing.{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">Real Value.</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                </span>{" "}
                                No Surprises.
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                                Choose the plan that fits your recruiting business. Higher
                                tiers unlock better payout bonuses and priority access to
                                roles. Start free, upgrade when you&apos;re ready.
                            </p>

                            {/* CTA row */}
                            <div className="hero-cta-row flex flex-wrap items-center justify-center gap-4 opacity-0">
                                <a href="/sign-up"
                                    className="inline-flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wider text-sm border-4 border-coral bg-coral text-cream transition-transform hover:-translate-y-1">
                                    <i className="fa-duotone fa-regular fa-rocket"></i>
                                    Get Started Free
                                </a>
                                <span className="text-xs font-bold uppercase tracking-[0.15em] text-cream/50">
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
                                className={`stat-block p-6 md:p-8 text-center opacity-0 ${stat.bg} ${stat.fg}`}>
                                <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    INTRO SECTION - Pricing Philosophy
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-intro py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="intro-content opacity-0">
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                    Built for{" "}
                                    <span className="text-coral">Recruiters</span>,
                                    Not Against Them
                                </h2>

                                <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                    Most platforms take a cut from every deal and call it
                                    &ldquo;free.&rdquo; We believe in a different model. Your subscription
                                    is your only recurring cost. When you make a placement, the
                                    earnings are yours -- no surprise deductions, no hidden platform
                                    fees eating into your commission.
                                </p>

                                <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                    Higher tiers unlock better payout bonuses and premium features.
                                    But every recruiter -- from day one on the free Starter plan --
                                    gets full access to the marketplace, unlimited submissions, and
                                    a complete ATS workflow. No feature gates on the basics.
                                </p>

                                <p className="text-lg leading-relaxed text-dark/80">
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
                <section className="py-16 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                                Your subscription is your only cost.
                                When you place a candidate, the earnings are yours --
                                no hidden platform fees, no surprise deductions.
                            </p>
                            <div className="mt-6 pt-4 border-t-[3px] border-teal">
                                <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                    -- Splits Network Pricing Promise
                                </span>
                            </div>
                            {/* Corner decoration */}
                            <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PRICING CARDS - The Visual Centerpiece
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-cards-section py-20 overflow-hidden bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            {/* Section heading */}
                            <div className="pricing-cards-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Choose Your Tier
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Three Plans.{" "}
                                    <span className="text-purple">Zero Guesswork.</span>
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
                                <div className="pricing-card relative p-8 border-4 border-teal bg-white opacity-0">
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                                    <div className="mb-6">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-teal text-dark">
                                            Starter
                                        </span>
                                        <div className="text-4xl font-black mb-1 text-dark">
                                            Free
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                            Forever -- no credit card
                                        </div>
                                    </div>
                                    <div className="w-full h-1 mb-6 bg-teal" />
                                    <ul className="space-y-3 mb-8">
                                        {starterFeatures.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-teal"></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/sign-up"
                                        className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                        Start Free
                                    </a>
                                </div>

                                {/* Pro Card (featured) */}
                                <div className="pricing-card relative p-8 border-4 border-coral bg-dark opacity-0 md:-mt-4 md:mb-[-16px]">
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-coral" />
                                    {/* Popular badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-yellow text-dark">
                                        Most Popular
                                    </div>
                                    <div className="mb-6 mt-2">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-coral text-cream">
                                            Pro
                                        </span>
                                        <div className="text-4xl font-black mb-1 text-cream">
                                            $99<span className="text-lg font-bold text-cream/50">/mo</span>
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-cream/50">
                                            $79/mo billed annually -- save 20%
                                        </div>
                                    </div>
                                    <div className="w-full h-1 mb-6 bg-coral" />
                                    <ul className="space-y-3 mb-8">
                                        {proFeatures.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-cream/80">
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-coral"></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/sign-up"
                                        className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-center text-sm transition-transform hover:-translate-y-1">
                                        Go Pro
                                    </a>
                                </div>

                                {/* Partner Card */}
                                <div className="pricing-card relative p-8 border-4 border-purple bg-white opacity-0">
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-purple" />
                                    <div className="mb-6">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-purple text-cream">
                                            Partner
                                        </span>
                                        <div className="text-4xl font-black mb-1 text-dark">
                                            $249<span className="text-lg font-bold text-dark/50">/mo</span>
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                            $199/mo billed annually -- save 20%
                                        </div>
                                    </div>
                                    <div className="w-full h-1 mb-6 bg-purple" />
                                    <ul className="space-y-3 mb-8">
                                        {partnerFeatures.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-purple"></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/sign-up"
                                        className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-purple bg-purple text-cream text-center text-sm transition-transform hover:-translate-y-1">
                                        Become a Partner
                                    </a>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="text-center mt-8 text-sm text-dark/50">
                                Splits Network does not guarantee placements, income, or role availability.
                                All payouts are finalized at hire time based on participation, role, and subscription tier.
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FOR COMPANIES SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="companies-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="companies-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    For Companies
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Post Roles{" "}
                                    <span className="text-yellow">For Free</span>
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Free to Post */}
                                <div className="companies-card relative p-8 border-4 border-teal bg-white opacity-0">
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4 border-teal">
                                        <i className="fa-duotone fa-regular fa-building text-2xl text-teal"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-dark">
                                        Free to Post
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-6 text-dark/75">
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
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-teal"></i>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Pay on Hire */}
                                <div className="companies-card relative p-8 border-4 border-yellow bg-white opacity-0">
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-yellow" />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4 border-yellow">
                                        <i className="fa-duotone fa-regular fa-handshake text-2xl text-yellow"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-dark">
                                        Pay on Hire
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-6 text-dark/75">
                                        Only pay when you successfully hire a candidate.
                                        Set your fee percentage upfront -- total transparency.
                                    </p>
                                    <div className="p-6 text-center mb-4 border-4 border-yellow bg-dark">
                                        <div className="text-3xl font-black mb-1 text-yellow">
                                            15-25%
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-cream/60">
                                            Typical placement fee range
                                        </div>
                                    </div>
                                    <p className="text-xs leading-relaxed text-dark/60">
                                        Example: For a $120,000 salary with 20% fee = $24,000 placement fee.
                                        The platform takes a small percentage, and the recruiter receives the majority.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center mt-10">
                                <a href="/sign-up"
                                    className="inline-flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wider text-sm border-4 border-yellow bg-yellow text-dark transition-transform hover:-translate-y-1">
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
                <section className="relative overflow-hidden min-h-[400px]">
                    <img
                        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                        alt="Team collaborating in modern office"
                        className="w-full h-full object-cover absolute inset-0 min-h-[400px]"
                    />
                    {/* Retro color overlay */}
                    <div className="absolute inset-0 bg-dark opacity-75" />
                    {/* Memphis border frame */}
                    <div className="absolute inset-4 md:inset-8 border-4 border-yellow pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-center py-24 px-8">
                        <div className="image-caption text-center max-w-3xl opacity-0">
                            <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-cream">
                                Higher tiers.{" "}
                                <span className="text-yellow">Bigger payouts.</span>{" "}
                                Same transparent model.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FEATURE COMPARISON TABLE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="feature-comparison py-20 overflow-hidden bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="comparison-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                    Full Breakdown
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Feature{" "}
                                    <span className="text-coral">Comparison</span>
                                </h2>
                            </div>

                            <div className="comparison-table overflow-x-auto">
                                {/* Table header */}
                                <div className="grid grid-cols-4 gap-0 mb-2">
                                    <div className="p-4 font-black text-sm uppercase tracking-wider text-dark">
                                        Feature
                                    </div>
                                    <div className="p-4 text-center font-black text-sm uppercase tracking-wider text-teal">
                                        Starter
                                    </div>
                                    <div className="p-4 text-center font-black text-sm uppercase tracking-wider bg-coral/10 text-coral">
                                        Pro
                                    </div>
                                    <div className="p-4 text-center font-black text-sm uppercase tracking-wider text-purple">
                                        Partner
                                    </div>
                                </div>

                                {/* Table rows */}
                                {comparisonFeatures.map((row, index) => (
                                    <div key={index}
                                        className={`comparison-row grid grid-cols-4 gap-0 border-t border-dark/10 opacity-0 ${index % 2 === 0 ? "bg-white" : "bg-cream"}`}>
                                        <div className="p-4 text-sm font-medium text-dark">
                                            {row.feature}
                                        </div>
                                        <div className="p-4 text-center text-sm">
                                            {typeof row.starter === "boolean" ? (
                                                row.starter ? (
                                                    <i className="fa-duotone fa-regular fa-check text-teal"></i>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-xmark text-dark/25"></i>
                                                )
                                            ) : (
                                                <span className="font-bold text-dark">{row.starter}</span>
                                            )}
                                        </div>
                                        <div className={`p-4 text-center text-sm ${index % 2 === 0 ? "bg-coral/5" : "bg-coral/10"}`}>
                                            {typeof row.pro === "boolean" ? (
                                                row.pro ? (
                                                    <i className="fa-duotone fa-regular fa-check text-coral"></i>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-xmark text-dark/25"></i>
                                                )
                                            ) : (
                                                <span className="font-bold text-dark">{row.pro}</span>
                                            )}
                                        </div>
                                        <div className="p-4 text-center text-sm">
                                            {typeof row.partner === "boolean" ? (
                                                row.partner ? (
                                                    <i className="fa-duotone fa-regular fa-check text-purple"></i>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-xmark text-dark/25"></i>
                                                )
                                            ) : (
                                                <span className="font-bold text-dark">{row.partner}</span>
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
                <section className="py-16 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-coral opacity-0">
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-coral">
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                                Start with Starter. Upgrade when placements justify it.
                                Every tier pays for itself with a single successful hire.
                            </p>
                            <div className="mt-6 pt-4 border-t-[3px] border-coral">
                                <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                    -- The Splits Network Approach
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FAQ SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-faq py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="faq-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Common Questions
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Pricing{" "}
                                    <span className="text-teal">FAQs</span>
                                </h2>
                            </div>

                            <div className="faq-grid space-y-6">
                                {pricingFaqs.map((faq, index) => {
                                    const faqColors = [
                                        { border: "border-coral", bg: "bg-coral", fg: "text-cream" },
                                        { border: "border-teal", bg: "bg-teal", fg: "text-cream" },
                                        { border: "border-yellow", bg: "bg-yellow", fg: "text-dark" },
                                        { border: "border-purple", bg: "bg-purple", fg: "text-cream" },
                                        { border: "border-coral", bg: "bg-coral", fg: "text-cream" },
                                    ];
                                    const c = faqColors[index % faqColors.length];
                                    return (
                                        <div key={index}
                                            className={`faq-card relative p-6 md:p-8 border-4 bg-cream/[0.03] opacity-0 ${c.border}`}>
                                            <div className={`absolute top-0 right-0 w-8 h-8 ${c.bg}`} />
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                                                    <i className={`fa-duotone fa-regular fa-question font-bold ${c.fg}`}></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-base uppercase tracking-wide mb-3 text-cream">
                                                        {faq.question}
                                                    </h3>
                                                    <p className="text-sm leading-relaxed text-cream/65">
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
                <section className="py-16 overflow-hidden bg-white">
                    <div className="container mx-auto px-4">
                        <div className="final-quote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-yellow opacity-0">
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-yellow">
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                                No hidden fees. No surprise deductions.
                                Just transparent pricing that lets recruiters
                                focus on what they do best -- placing candidates.
                            </p>
                            <div className="mt-6 pt-4 border-t-[3px] border-yellow">
                                <span className="text-sm font-bold uppercase tracking-wider text-yellow">
                                    -- Splits Network, 2026
                                </span>
                            </div>
                            <div className="absolute top-0 left-0 w-10 h-10 bg-yellow" />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CTA SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="pricing-cta relative py-24 overflow-hidden bg-dark">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                        <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                        <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                        {/* Zigzag -- keep inline for SVG attributes */}
                        <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                            <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                                fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-cream">
                                Get Started Today
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-cream">
                                Ready To Start{" "}
                                <span className="text-coral">Making</span>{" "}
                                Placements?
                            </h2>
                            <p className="text-lg mb-10 text-cream/70">
                                Join Splits Network today and start building your recruiting
                                business with transparent, fair participation in split placements.
                            </p>
                        </div>

                        <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                            {/* Recruiters */}
                            <div className="cta-card p-6 border-4 border-coral bg-cream/[0.03] text-center opacity-0">
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                    <i className="fa-duotone fa-regular fa-user-tie text-xl text-cream"></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2 text-cream">
                                    Recruiters
                                </h3>
                                <p className="text-xs mb-5 text-cream/60">
                                    Access the split-fee marketplace
                                </p>
                                <a href="/sign-up"
                                    className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-center text-sm transition-transform hover:-translate-y-1">
                                    Join Network
                                </a>
                            </div>

                            {/* Companies */}
                            <div className="cta-card p-6 border-4 border-yellow bg-cream/[0.03] text-center opacity-0">
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-yellow">
                                    <i className="fa-duotone fa-regular fa-building text-xl text-dark"></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2 text-cream">
                                    Companies
                                </h3>
                                <p className="text-xs mb-5 text-cream/60">
                                    Post roles, find vetted talent
                                </p>
                                <a href="/sign-up"
                                    className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                    Post a Role
                                </a>
                            </div>

                            {/* Candidates */}
                            <div className="cta-card p-6 border-4 border-teal bg-cream/[0.03] text-center opacity-0">
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                    <i className="fa-duotone fa-regular fa-user text-xl text-dark"></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2 text-cream">
                                    Candidates
                                </h3>
                                <p className="text-xs mb-5 text-cream/60">
                                    Free profile, real recruiters
                                </p>
                                <a href="https://applicant.network/sign-up"
                                    className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                    Create Profile
                                </a>
                            </div>
                        </div>

                        <div className="cta-footer text-center opacity-0">
                            <p className="text-sm mb-1 text-cream/50">
                                No credit card required for Starter. Upgrade anytime.
                            </p>
                            <a href="mailto:hello@employment-networks.com"
                                className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
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
