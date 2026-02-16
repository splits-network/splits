"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ─── data ─── */

const tiers = [
    {
        name: "Starter",
        tag: "// tier.starter",
        icon: "fa-seedling",
        monthlyPrice: 0,
        annualPrice: 0,
        description: "For individual recruiters exploring the network",
        popular: false,
        cta: "Get Started Free",
        features: [
            { name: "Active job orders", value: "5" },
            { name: "Candidate submissions", value: "25/mo" },
            { name: "Network partners", value: "10" },
            { name: "Split-fee management", included: true },
            { name: "Basic analytics", included: true },
            { name: "Email support", included: true },
            { name: "AI candidate matching", included: false },
            { name: "Custom branding", included: false },
            { name: "API access", included: false },
            { name: "Priority support", included: false },
        ],
    },
    {
        name: "Professional",
        tag: "// tier.professional",
        icon: "fa-rocket",
        monthlyPrice: 99,
        annualPrice: 79,
        description: "For growing recruiting teams and agencies",
        popular: true,
        cta: "Start Pro Trial",
        features: [
            { name: "Active job orders", value: "50" },
            { name: "Candidate submissions", value: "Unlimited" },
            { name: "Network partners", value: "100" },
            { name: "Split-fee management", included: true },
            { name: "Advanced analytics", included: true },
            { name: "Priority email support", included: true },
            { name: "AI candidate matching", included: true },
            { name: "Custom branding", included: true },
            { name: "API access", included: false },
            { name: "Dedicated account manager", included: false },
        ],
    },
    {
        name: "Enterprise",
        tag: "// tier.enterprise",
        icon: "fa-building",
        monthlyPrice: 299,
        annualPrice: 249,
        description: "For large agencies and staffing firms",
        popular: false,
        cta: "Contact Sales",
        features: [
            { name: "Active job orders", value: "Unlimited" },
            { name: "Candidate submissions", value: "Unlimited" },
            { name: "Network partners", value: "Unlimited" },
            { name: "Split-fee management", included: true },
            { name: "Enterprise analytics", included: true },
            { name: "24/7 phone support", included: true },
            { name: "AI candidate matching", included: true },
            { name: "Custom branding", included: true },
            { name: "Full API access", included: true },
            { name: "Dedicated account manager", included: true },
        ],
    },
];

const faqs = [
    {
        q: "Can I change plans at any time?",
        a: "Yes. Upgrade or downgrade instantly. When upgrading, you will be credited for the remaining time on your current plan. Downgrades take effect at the next billing cycle.",
    },
    {
        q: "Is there a free trial for Pro?",
        a: "Yes, all Professional plans include a 14-day free trial with full access. No credit card required to start.",
    },
    {
        q: "How does the split-fee system work?",
        a: "Split fees are automatically calculated and distributed when placements are confirmed. The platform handles invoicing, tracking, and payouts.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, ACH bank transfers, and wire transfers for Enterprise accounts.",
    },
    {
        q: "Can I add team members?",
        a: "Professional allows up to 10 team members. Enterprise offers unlimited seats. Starter is single-user only.",
    },
];

const logos = [
    "Apex Recruiting",
    "TechFlow",
    "Horizon",
    "Summit Talent",
    "Pipeline Co",
    "DataVault",
];

/* ─── component ─── */

export default function PricingShowcaseTen() {
    const mainRef = useRef<HTMLElement>(null);
    const [annual, setAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useGSAP(
        () => {
            if (
                !mainRef.current ||
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
                return;
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".pricing-scanline",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6 },
            )
                .fromTo(
                    ".pricing-title span",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.2",
                )
                .fromTo(
                    ".pricing-subtitle",
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.1",
                );

            gsap.fromTo(
                ".tier-card",
                { opacity: 0, y: 40, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".tier-grid", start: "top 85%" },
                },
            );

            gsap.fromTo(
                ".faq-item",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: ".faq-section",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".status-pulse",
                { scale: 0.6, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
        >
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-coral/30 pointer-events-none z-10" />

            {/* Hero */}
            <section className="relative flex items-center justify-center px-6 pt-28 pb-12">
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="pricing-scanline h-[2px] bg-primary w-48 mx-auto mb-8 origin-left" />
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-4 opacity-80">
                        sys.billing &gt; plan_selection v2.0
                    </p>
                    <h1 className="pricing-title text-4xl md:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                        <span className="block">Select Your</span>
                        <span className="block text-primary">
                            Clearance Level
                        </span>
                    </h1>
                    <p className="pricing-subtitle max-w-xl mx-auto text-base-content/50 font-light leading-relaxed mb-8">
                        Choose the operational tier that matches your recruiting
                        scale. All plans include core split-fee management.
                        Upgrade anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span
                            className={`font-mono text-xs uppercase tracking-wider ${!annual ? "text-primary" : "text-base-content/30"}`}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className="relative w-14 h-7 bg-base-200 border border-base-content/10 cursor-pointer"
                            aria-label="Toggle billing"
                        >
                            <div
                                className={`absolute top-1 w-5 h-5 bg-primary transition-all duration-300 ${annual ? "left-7" : "left-1"}`}
                            />
                        </button>
                        <span
                            className={`font-mono text-xs uppercase tracking-wider ${annual ? "text-primary" : "text-base-content/30"}`}
                        >
                            Annual
                        </span>
                        {annual && (
                            <span className="px-2 py-0.5 bg-success/10 border border-success/20 text-success font-mono text-[9px] uppercase tracking-wider">
                                Save 20%
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="tier-grid px-6 pb-24">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier) => {
                        const price = annual
                            ? tier.annualPrice
                            : tier.monthlyPrice;
                        return (
                            <div
                                key={tier.name}
                                className={`tier-card relative bg-base-200 border ${tier.popular ? "border-coral/40 border-2" : "border-base-content/5"} flex flex-col`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-content font-mono text-[9px] uppercase tracking-wider">
                                        Recommended
                                    </div>
                                )}

                                <div className="p-6 border-b border-base-content/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-10 h-10 flex items-center justify-center border ${tier.popular ? "bg-primary/10 text-primary border-coral/20" : "bg-base-300 text-base-content/30 border-base-content/10"}`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${tier.icon} text-lg`}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold tracking-tight">
                                                {tier.name}
                                            </h3>
                                            <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                                                {tier.tag}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-base-content/40 mb-4">
                                        {tier.description}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-mono text-4xl font-black text-primary">
                                            ${price}
                                        </span>
                                        {price > 0 && (
                                            <span className="font-mono text-sm text-base-content/30">
                                                /mo
                                            </span>
                                        )}
                                        {price === 0 && (
                                            <span className="font-mono text-sm text-base-content/30">
                                                forever
                                            </span>
                                        )}
                                    </div>
                                    {annual && price > 0 && (
                                        <p className="font-mono text-[10px] text-base-content/20 mt-1">
                                            Billed ${price * 12}/year
                                        </p>
                                    )}
                                </div>

                                <div className="p-6 flex-1">
                                    <ul className="space-y-3">
                                        {tier.features.map((f) => (
                                            <li
                                                key={f.name}
                                                className="flex items-center gap-2.5 text-sm"
                                            >
                                                {f.value ? (
                                                    <>
                                                        <span className="font-mono text-xs text-primary font-bold w-20 flex-shrink-0">
                                                            {f.value}
                                                        </span>
                                                        <span className="text-base-content/50">
                                                            {f.name}
                                                        </span>
                                                    </>
                                                ) : f.included ? (
                                                    <>
                                                        <i className="fa-duotone fa-regular fa-check text-success text-xs w-5 text-center flex-shrink-0" />
                                                        <span className="text-base-content/50">
                                                            {f.name}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-duotone fa-regular fa-xmark text-base-content/15 text-xs w-5 text-center flex-shrink-0" />
                                                        <span className="text-base-content/20">
                                                            {f.name}
                                                        </span>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 border-t border-base-content/5">
                                    <button
                                        className={`btn btn-sm w-full font-mono uppercase tracking-wider text-[10px] ${tier.popular ? "btn-primary" : "btn-outline"}`}
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${tier.name === "Enterprise" ? "fa-envelope" : "fa-rocket-launch"} mr-1`}
                                        />
                                        {tier.cta}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="px-6 pb-16 border-t border-base-content/10 pt-16">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/20 mb-6">
                        Trusted by leading recruiting firms
                    </p>
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                        {logos.map((l) => (
                            <span
                                key={l}
                                className="font-mono text-sm font-bold text-base-content/10 uppercase tracking-wider"
                            >
                                {l}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-8 text-base-content/25">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-shield-check text-sm" />
                            <span className="font-mono text-[10px] uppercase tracking-wider">
                                SOC 2 Compliant
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-lock text-sm" />
                            <span className="font-mono text-[10px] uppercase tracking-wider">
                                256-bit Encryption
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-clock-rotate-left text-sm" />
                            <span className="font-mono text-[10px] uppercase tracking-wider">
                                14-day Free Trial
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq-section px-6 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-10 text-center">
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
                            // frequently.asked
                        </p>
                        <h2 className="text-2xl font-black tracking-tight">
                            Common Questions
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="faq-item border border-base-content/5 bg-base-200"
                            >
                                <button
                                    onClick={() =>
                                        setOpenFaq(openFaq === i ? null : i)
                                    }
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <span className="text-sm font-bold pr-4">
                                        {faq.q}
                                    </span>
                                    <i
                                        className={`fa-duotone fa-regular ${openFaq === i ? "fa-minus" : "fa-plus"} text-xs text-primary flex-shrink-0`}
                                    />
                                </button>
                                {openFaq === i && (
                                    <div className="px-4 pb-4 pt-0">
                                        <p className="text-sm text-base-content/50 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
                <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
                    <div className="flex items-center gap-2">
                        <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            Pricing System Operational
                        </span>
                    </div>
                    <span className="text-base-content/10">|</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                        Splits Network // Component Showcase
                    </span>
                </div>
            </section>
        </main>
    );
}
