"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface PricingTier {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    icon: string;
    badge?: string;
    features: string[];
    cta: string;
    highlighted?: boolean;
}

const TIERS: PricingTier[] = [
    {
        name: "Starter",
        description:
            "For individual recruiters getting started with split placements.",
        monthlyPrice: 49,
        yearlyPrice: 39,
        icon: "fa-duotone fa-regular fa-seedling",
        features: [
            "Up to 10 active roles",
            "5 candidate submissions / month",
            "Basic search & matching",
            "Email notifications",
            "Standard support",
            "1 team member",
        ],
        cta: "Start Free Trial",
    },
    {
        name: "Professional",
        description:
            "For growing agencies that need more power and collaboration.",
        monthlyPrice: 149,
        yearlyPrice: 119,
        icon: "fa-duotone fa-regular fa-rocket",
        badge: "Most Popular",
        features: [
            "Unlimited active roles",
            "50 candidate submissions / month",
            "AI-powered matching",
            "Real-time notifications",
            "Priority support",
            "Up to 10 team members",
            "Analytics dashboard",
            "Custom branding",
        ],
        cta: "Start Free Trial",
        highlighted: true,
    },
    {
        name: "Enterprise",
        description:
            "For large agencies with advanced needs and compliance requirements.",
        monthlyPrice: 399,
        yearlyPrice: 319,
        icon: "fa-duotone fa-regular fa-building",
        features: [
            "Unlimited everything",
            "Unlimited submissions",
            "AI matching + automation",
            "Real-time + SMS notifications",
            "Dedicated account manager",
            "Unlimited team members",
            "Advanced analytics & reporting",
            "White-label portal",
            "SSO & SAML authentication",
            "Custom integrations (API)",
        ],
        cta: "Contact Sales",
    },
];

interface FeatureRow {
    name: string;
    starter: string | boolean;
    professional: string | boolean;
    enterprise: string | boolean;
}

const COMPARISON: FeatureRow[] = [
    {
        name: "Active Roles",
        starter: "10",
        professional: "Unlimited",
        enterprise: "Unlimited",
    },
    {
        name: "Candidate Submissions",
        starter: "5 / mo",
        professional: "50 / mo",
        enterprise: "Unlimited",
    },
    {
        name: "Team Members",
        starter: "1",
        professional: "10",
        enterprise: "Unlimited",
    },
    {
        name: "AI Matching",
        starter: false,
        professional: true,
        enterprise: true,
    },
    {
        name: "Automation Workflows",
        starter: false,
        professional: false,
        enterprise: true,
    },
    {
        name: "Analytics Dashboard",
        starter: false,
        professional: true,
        enterprise: true,
    },
    {
        name: "Custom Branding",
        starter: false,
        professional: true,
        enterprise: true,
    },
    {
        name: "White-Label Portal",
        starter: false,
        professional: false,
        enterprise: true,
    },
    {
        name: "SSO / SAML",
        starter: false,
        professional: false,
        enterprise: true,
    },
    {
        name: "API Access",
        starter: false,
        professional: true,
        enterprise: true,
    },
    {
        name: "Priority Support",
        starter: false,
        professional: true,
        enterprise: true,
    },
    {
        name: "Dedicated Account Manager",
        starter: false,
        professional: false,
        enterprise: true,
    },
];

interface FaqItem {
    q: string;
    a: string;
}

const FAQS: FaqItem[] = [
    {
        q: "How does the free trial work?",
        a: "You get 14 days of full access to your chosen plan with no credit card required. At the end of the trial, you can choose to subscribe or downgrade to the free tier.",
    },
    {
        q: "Can I change plans at any time?",
        a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. Downgrades take effect at the next billing date.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, Amex), ACH bank transfers for annual plans, and can arrange invoicing for Enterprise customers.",
    },
    {
        q: "How are split fees handled?",
        a: "Split fees are managed through the platform. When a placement is made, the agreed-upon split is automatically calculated and payouts are processed through Stripe to each party.",
    },
    {
        q: "Is there a setup fee?",
        a: "No setup fees for Starter and Professional plans. Enterprise plans may include a one-time onboarding fee depending on customization requirements.",
    },
    {
        q: "What happens to my data if I cancel?",
        a: "Your data is retained for 90 days after cancellation. You can export all your data at any time. After 90 days, data is permanently deleted per our privacy policy.",
    },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [annual, setAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    /* Animations */
    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-pricing-hero",
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            );
            gsap.fromTo(
                ".cin-tier-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: "power2.out",
                    delay: 0.2,
                },
            );
        },
        { scope: containerRef },
    );

    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-comparison",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    scrollTrigger: {
                        trigger: ".cin-comparison",
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                ".cin-faq",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    scrollTrigger: {
                        trigger: ".cin-faq",
                        start: "top 85%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    const savings = Math.round(
        ((TIERS[1].monthlyPrice - TIERS[1].yearlyPrice) /
            TIERS[1].monthlyPrice) *
            100,
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* Hero */}
            <header className="cin-pricing-hero bg-neutral text-neutral-content">
                <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4 font-semibold">
                        Pricing
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-neutral-content/60 max-w-xl mx-auto text-lg mb-8">
                        Choose the plan that fits your recruiting business. All
                        plans include a 14-day free trial.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-3">
                        <span
                            className={`text-sm font-semibold ${
                                !annual
                                    ? "text-neutral-content"
                                    : "text-neutral-content/40"
                            }`}
                        >
                            Monthly
                        </span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={annual}
                            onChange={() => setAnnual(!annual)}
                        />
                        <span
                            className={`text-sm font-semibold ${
                                annual
                                    ? "text-neutral-content"
                                    : "text-neutral-content/40"
                            }`}
                        >
                            Annual
                        </span>
                        {annual && (
                            <span className="badge badge-sm badge-primary ml-1">
                                Save {savings}%
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Tier Cards */}
            <section className="max-w-6xl mx-auto px-6 -mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TIERS.map((tier) => (
                        <div
                            key={tier.name}
                            className={`cin-tier-card relative bg-base-100 border rounded-xl p-6 flex flex-col ${
                                tier.highlighted
                                    ? "border-coral shadow-lg shadow-primary/10 ring-1 ring-primary"
                                    : "border-base-300"
                            }`}
                        >
                            {tier.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="badge badge-primary badge-sm font-bold">
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <i
                                        className={`${tier.icon} text-primary text-lg`}
                                    />
                                </div>
                                <h3 className="text-xl font-black mb-1">
                                    {tier.name}
                                </h3>
                                <p className="text-sm text-base-content/50 leading-relaxed">
                                    {tier.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">
                                        $
                                        {annual
                                            ? tier.yearlyPrice
                                            : tier.monthlyPrice}
                                    </span>
                                    <span className="text-base-content/40 text-sm">
                                        /mo
                                    </span>
                                </div>
                                {annual && (
                                    <p className="text-xs text-base-content/40 mt-1">
                                        ${tier.yearlyPrice * 12}/year &middot;
                                        billed annually
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-2.5 mb-8 flex-1">
                                {tier.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn w-full ${
                                    tier.highlighted
                                        ? "btn-primary"
                                        : "btn-outline border-base-300"
                                }`}
                            >
                                {tier.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="cin-comparison max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3 font-semibold">
                        Compare Plans
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black">
                        Detailed Feature Comparison
                    </h2>
                </div>

                <div className="overflow-x-auto border border-base-300 rounded-lg">
                    <table className="table table-sm w-full">
                        <thead>
                            <tr className="bg-base-200/60">
                                <th className="min-w-[200px]">Feature</th>
                                <th className="text-center">Starter</th>
                                <th className="text-center bg-primary/5">
                                    Professional
                                </th>
                                <th className="text-center">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON.map((row) => (
                                <tr
                                    key={row.name}
                                    className="hover:bg-base-200/30"
                                >
                                    <td className="font-medium text-sm">
                                        {row.name}
                                    </td>
                                    {(
                                        [
                                            "starter",
                                            "professional",
                                            "enterprise",
                                        ] as const
                                    ).map((tier) => (
                                        <td
                                            key={tier}
                                            className={`text-center ${
                                                tier === "professional"
                                                    ? "bg-primary/5"
                                                    : ""
                                            }`}
                                        >
                                            {typeof row[tier] === "boolean" ? (
                                                row[tier] ? (
                                                    <i className="fa-duotone fa-regular fa-circle-check text-primary" />
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-circle-xmark text-base-content/20" />
                                                )
                                            ) : (
                                                <span className="text-sm font-semibold">
                                                    {row[tier]}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="cin-faq bg-base-200/30 py-20">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3 font-semibold">
                            FAQ
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-base-100 border border-base-300 rounded-lg overflow-hidden"
                            >
                                <button
                                    onClick={() =>
                                        setOpenFaq(openFaq === i ? null : i)
                                    }
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-base-200/30 transition-colors"
                                >
                                    <span className="font-semibold text-sm pr-4">
                                        {faq.q}
                                    </span>
                                    <i
                                        className={`fa-duotone fa-regular fa-chevron-down text-xs text-base-content/40 transition-transform ${
                                            openFaq === i ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                        openFaq === i ? "max-h-40" : "max-h-0"
                                    }`}
                                >
                                    <p className="px-4 pb-4 text-sm text-base-content/60 leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-black mb-4">
                        Ready to Grow Your Recruiting Business?
                    </h2>
                    <p className="text-base-content/60 mb-8 max-w-lg mx-auto">
                        Join thousands of recruiters who use Splits Network to
                        find better roles, close more placements, and earn more
                        revenue.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button className="btn btn-primary btn-lg">
                            Start Free Trial
                            <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                        </button>
                        <button className="btn btn-ghost btn-lg border border-base-300">
                            <i className="fa-duotone fa-regular fa-phone mr-2" />
                            Talk to Sales
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
