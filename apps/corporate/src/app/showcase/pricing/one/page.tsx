"use client";

import { useRef, useState } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

/* --- Data ----------------------------------------------------------------- */

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: { monthly: 0, annual: 0 },
        description: "Full marketplace access for new recruiters",
        cta: "Get Started Free",
        ctaStyle: "btn-ghost border-base-content/20",
        features: [
            { text: "Access to open roles", included: true },
            { text: "Unlimited submissions", included: true },
            { text: "Full ATS workflow", included: true },
            { text: "5 messaging initiations/month", included: true },
            { text: "10 saved candidates", included: true },
            { text: "In-app support", included: true },
            { text: "Early access to roles", included: false },
            { text: "Advanced analytics", included: false },
            { text: "AI features", included: false },
            { text: "API access", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: { monthly: 99, annual: 83 },
        description: "For serious recruiters scaling their pipeline",
        cta: "Get Started with Pro",
        ctaStyle: "btn-primary",
        popular: true,
        features: [
            { text: "Everything in Starter", included: true },
            { text: "Unlimited messaging", included: true },
            { text: "100 saved candidates", included: true },
            { text: "Early access to new roles", included: true },
            { text: "Call recording & transcription", included: true },
            { text: "Email & calendar integrations", included: true },
            { text: "Advanced analytics & data export", included: true },
            { text: "Priority email support", included: true },
            { text: "Higher payout bonuses", included: true },
            { text: "API access", included: false },
        ],
    },
    {
        id: "partner",
        name: "Partner",
        price: { monthly: 249, annual: 208 },
        description: "For firms and power users who want it all",
        cta: "Upgrade to Partner",
        ctaStyle: "btn-ghost border-base-content/20",
        features: [
            { text: "Everything in Pro", included: true },
            { text: "Unlimited saved candidates & jobs", included: true },
            { text: "Priority role access", included: true },
            { text: "AI match scoring (True Score)", included: true },
            { text: "AI call summaries", included: true },
            { text: "Firm creation & management", included: true },
            { text: "API access", included: true },
            { text: "Dedicated account manager", included: true },
            { text: "Maximum payout bonuses", included: true },
        ],
    },
];

const comparisonFeatures = [
    {
        name: "Monthly Price",
        starter: "Free",
        partner: "$249",
        pro: "$99",
    },
    {
        name: "Annual Price",
        starter: "Free",
        pro: "$999/yr",
        partner: "$2,499/yr",
    },
    {
        name: "Messaging",
        starter: "5/month",
        pro: "Unlimited",
        partner: "Unlimited",
    },
    {
        name: "Saved Candidates",
        starter: "10",
        pro: "100",
        partner: "Unlimited",
    },
    {
        name: "Saved Roles",
        starter: "10",
        pro: "50",
        partner: "Unlimited",
    },
    {
        name: "Referral Codes",
        starter: "1",
        pro: "5",
        partner: "Unlimited",
    },
    {
        name: "Payout Bonuses",
        starter: "Base",
        pro: "Higher",
        partner: "Maximum",
    },
    {
        name: "Early Access to Roles",
        starter: "---",
        pro: "Yes",
        partner: "Yes",
    },
    {
        name: "Priority Role Access",
        starter: "---",
        pro: "---",
        partner: "Yes",
    },
    {
        name: "Call Recording & Transcription",
        starter: "---",
        pro: "Yes",
        partner: "Yes",
    },
    {
        name: "Analytics & Data Export",
        starter: "---",
        pro: "Advanced",
        partner: "Advanced",
    },
    {
        name: "Email & Calendar Integrations",
        starter: "---",
        pro: "Yes",
        partner: "Yes",
    },
    {
        name: "AI Match Scoring",
        starter: "---",
        pro: "---",
        partner: "True Score",
    },
    {
        name: "AI Call Summaries",
        starter: "---",
        pro: "---",
        partner: "Yes",
    },
    {
        name: "Firm & Team Management",
        starter: "---",
        pro: "---",
        partner: "Yes",
    },
    {
        name: "API Access",
        starter: "---",
        pro: "---",
        partner: "Yes",
    },
    {
        name: "Support",
        starter: "In-App",
        pro: "Priority Email",
        partner: "Account Manager",
    },
];

const faqs = [
    {
        q: "Can I switch plans at any time?",
        a: "Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the end of your current billing cycle. No commitments — cancel anytime.",
    },
    {
        q: "Are there free trials?",
        a: "No. The Starter plan is permanently free with full marketplace access, unlimited submissions, and the complete ATS workflow. Paid tiers charge immediately on subscription.",
    },
    {
        q: "What happens to my data if I downgrade?",
        a: "Your data is preserved. You will lose access to premium features but nothing is deleted. You can upgrade again at any time.",
    },
    {
        q: "How do payout bonuses work?",
        a: "When a placement is made, the company pays a placement fee. Your subscription tier determines your payout bonus level — Higher on Pro, Maximum on Partner. All payouts are finalized at hire time.",
    },
    {
        q: "Are there any hidden fees?",
        a: "No. Your subscription is the only recurring cost. Placement earnings follow the transparent split model with no platform deductions layered on top.",
    },
];

/* --- Page ----------------------------------------------------------------- */

export default function PricingOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-base-300 text-base-content py-16 lg:py-24">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative  container mx-auto px-6 lg:px-12 text-center">
                    <p className="pricing-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 scroll-reveal fade-up">
                        Pricing
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                        <span className="pricing-title-word inline-block scroll-reveal hero-word">
                            Simple,
                        </span>{" "}
                        <span className="pricing-title-word inline-block scroll-reveal hero-word text-primary">
                            transparent
                        </span>{" "}
                        <span className="pricing-title-word inline-block scroll-reveal hero-word">
                            pricing.
                        </span>
                    </h1>
                    <p className="pricing-desc text-base text-base-content/50 max-w-xl mx-auto scroll-reveal fade-up">
                        Start free. Upgrade when you are ready. No hidden fees,
                        no surprises.
                    </p>

                    {/* Billing Toggle */}
                    <div className="pricing-toggle scroll-reveal fade-up flex items-center justify-center gap-4 mt-8">
                        <span
                            className={`text-sm font-semibold ${billing === "monthly" ? "text-base-content" : "text-base-content/40"}`}
                        >
                            Monthly
                        </span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={billing === "annual"}
                            onChange={() =>
                                setBilling(
                                    billing === "monthly"
                                        ? "annual"
                                        : "monthly",
                                )
                            }
                        />
                        <span
                            className={`text-sm font-semibold ${billing === "annual" ? "text-base-content" : "text-base-content/40"}`}
                        >
                            Annual
                        </span>
                        {billing === "annual" && (
                            <span className="px-2 py-0.5 bg-success/10 text-success text-sm font-bold uppercase">
                                Save ~16%
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container mx-auto px-6 lg:px-12 -mt-8 relative">
                <div className="grid md:grid-cols-3 gap-0">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`pricing-card scroll-reveal fade-up bg-base-100 border border-base-300 p-8 lg:p-10 relative ${plan.popular ? "border-coral border-2 lg:-mt-4 lg:mb-0 lg:pb-14 " : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-content text-sm font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-lg font-black tracking-tight">
                                {plan.name}
                            </h3>
                            <p className="text-sm text-base-content/50 mb-6">
                                {plan.description}
                            </p>

                            <div className="mb-6">
                                <span className="text-4xl font-black">
                                    ${plan.price[billing]}
                                </span>
                                {plan.price[billing] > 0 && (
                                    <span className="text-base-content/40 text-sm">
                                        /month
                                    </span>
                                )}
                                {plan.price[billing] === 0 && (
                                    <span className="text-base-content/40 text-sm ml-2">
                                        forever
                                    </span>
                                )}
                            </div>

                            <button
                                className={`btn w-full mb-8 ${plan.ctaStyle}`}
                            >
                                {plan.cta}
                            </button>

                            <div className="space-y-3">
                                {plan.features.map((f) => (
                                    <div
                                        key={f.text}
                                        className={`flex items-center gap-2 text-sm ${f.included ? "" : "text-base-content/25"}`}
                                    >
                                        <i
                                            className={`fa-solid fa-${f.included ? "check text-success" : "xmark text-base-content/20"} text-xs w-4 text-center`}
                                        />
                                        <span>{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="pricing-section scroll-reveal fade-up container mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-10">
                    Compare plans
                </h2>
                <div className="overflow-x-auto border border-base-300">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                                    Feature
                                </th>
                                <th className="text-center text-xs font-semibold uppercase tracking-widest text-base-content/40">
                                    Starter
                                </th>
                                <th className="text-center text-xs font-semibold uppercase tracking-widest text-primary">
                                    Pro
                                </th>
                                <th className="text-center text-xs font-semibold uppercase tracking-widest text-base-content/40">
                                    Partner
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonFeatures.map((f) => (
                                <tr
                                    key={f.name}
                                    className="border-b border-base-300"
                                >
                                    <td className="text-sm font-semibold">
                                        {f.name}
                                    </td>
                                    <td className="text-center text-sm text-base-content/60">
                                        {f.starter}
                                    </td>
                                    <td className="text-center text-sm font-semibold">
                                        {f.pro}
                                    </td>
                                    <td className="text-center text-sm text-base-content/60">
                                        {f.partner}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="pricing-section scroll-reveal fade-up bg-base-200 py-16 lg:py-24">
                <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-10">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-0">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-base-300">
                                <button
                                    onClick={() =>
                                        setOpenFaq(openFaq === i ? null : i)
                                    }
                                    className="w-full flex items-center justify-between py-5 text-left"
                                >
                                    <span className="font-semibold">
                                        {faq.q}
                                    </span>
                                    <i
                                        className={`fa-solid fa-chevron-down text-xs text-base-content/30 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {openFaq === i && (
                                    <p className="text-sm text-base-content/60 pb-5 leading-relaxed">
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pricing-section scroll-reveal fade-up bg-base-300 text-base-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        Ready to grow your pipeline?
                    </h2>
                    <p className="text-base-content/50 max-w-lg mx-auto mb-8">
                        Join 2,400+ recruiters earning split fees on the
                        marketplace. Start for free, no credit card required.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button className="btn btn-primary btn-lg">
                            Get Started Free
                        </button>
                        <button className="btn btn-ghost border-neutral-content/20 btn-lg">
                            Talk to Sales
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
