"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* --- Data ----------------------------------------------------------------- */

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: { monthly: 0, annual: 0 },
        description: "For independent recruiters getting started",
        cta: "Get Started Free",
        ctaStyle: "btn-ghost border-base-content/20",
        features: [
            { text: "Up to 5 active placements", included: true },
            { text: "Basic candidate tracking", included: true },
            { text: "Email support", included: true },
            { text: "Marketplace access", included: true },
            { text: "AI matching", included: false },
            { text: "Custom branding", included: false },
            { text: "Analytics dashboard", included: false },
            { text: "Priority support", included: false },
            { text: "API access", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: { monthly: 49, annual: 39 },
        description: "For active recruiters scaling their pipeline",
        cta: "Start Pro Trial",
        ctaStyle: "btn-primary",
        popular: true,
        features: [
            { text: "Unlimited placements", included: true },
            { text: "Advanced candidate tracking", included: true },
            { text: "Priority email support", included: true },
            { text: "Marketplace access", included: true },
            { text: "AI matching & scoring", included: true },
            { text: "Custom branding", included: true },
            { text: "Analytics dashboard", included: true },
            { text: "Priority support", included: false },
            { text: "API access", included: false },
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: { monthly: 149, annual: 119 },
        description: "For teams and agencies with advanced needs",
        cta: "Contact Sales",
        ctaStyle: "btn-ghost border-base-content/20",
        features: [
            { text: "Unlimited placements", included: true },
            { text: "Advanced candidate tracking", included: true },
            { text: "Dedicated account manager", included: true },
            { text: "Marketplace access", included: true },
            { text: "AI matching & scoring", included: true },
            { text: "Custom branding", included: true },
            { text: "Analytics dashboard", included: true },
            { text: "Priority support", included: true },
            { text: "API access", included: true },
        ],
    },
];

const comparisonFeatures = [
    {
        name: "Active Placements",
        starter: "5",
        pro: "Unlimited",
        enterprise: "Unlimited",
    },
    {
        name: "Candidate Profiles",
        starter: "50",
        pro: "500",
        enterprise: "Unlimited",
    },
    {
        name: "AI Match Scoring",
        starter: "---",
        pro: "Standard",
        enterprise: "Advanced",
    },
    {
        name: "Custom Branding",
        starter: "---",
        pro: "Logo + Colors",
        enterprise: "Full White-Label",
    },
    {
        name: "Analytics",
        starter: "Basic",
        pro: "Advanced",
        enterprise: "Custom Reports",
    },
    { name: "Team Members", starter: "1", pro: "5", enterprise: "Unlimited" },
    {
        name: "Integrations",
        starter: "---",
        pro: "Slack, Calendar",
        enterprise: "All + API",
    },
    {
        name: "Support",
        starter: "Email",
        pro: "Priority Email",
        enterprise: "Dedicated Manager",
    },
    { name: "SLA", starter: "---", pro: "99.9%", enterprise: "99.99%" },
];

const faqs = [
    {
        q: "Can I switch plans at any time?",
        a: "Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the end of your current billing cycle.",
    },
    {
        q: "Is there a free trial for Pro?",
        a: "Yes, Pro comes with a 14-day free trial. No credit card required to start.",
    },
    {
        q: "What happens to my data if I downgrade?",
        a: "Your data is preserved. You will lose access to premium features but nothing is deleted. You can upgrade again at any time.",
    },
    {
        q: "Do you offer discounts for agencies?",
        a: "Yes. Teams of 10+ get custom pricing. Contact our sales team for a tailored quote.",
    },
];

/* --- Page ----------------------------------------------------------------- */

export default function PricingOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                $1(".pricing-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".pricing-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".pricing-desc"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                )
                .fromTo(
                    $1(".pricing-toggle"),
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.2",
                )
                .fromTo(
                    $(".pricing-card"),
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
                    "-=0.2",
                );

            $(".pricing-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-24">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
                    <p className="pricing-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                        Pricing
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                        <span className="pricing-title-word inline-block opacity-0">
                            Simple,
                        </span>{" "}
                        <span className="pricing-title-word inline-block opacity-0 text-primary">
                            transparent
                        </span>{" "}
                        <span className="pricing-title-word inline-block opacity-0">
                            pricing.
                        </span>
                    </h1>
                    <p className="pricing-desc text-base text-neutral-content/50 max-w-xl mx-auto opacity-0">
                        Start free. Upgrade when you are ready. No hidden fees,
                        no surprises.
                    </p>

                    {/* Billing Toggle */}
                    <div className="pricing-toggle opacity-0 flex items-center justify-center gap-4 mt-8">
                        <span
                            className={`text-sm font-semibold ${billing === "monthly" ? "text-neutral-content" : "text-neutral-content/40"}`}
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
                            className={`text-sm font-semibold ${billing === "annual" ? "text-neutral-content" : "text-neutral-content/40"}`}
                        >
                            Annual
                        </span>
                        {billing === "annual" && (
                            <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase">
                                Save 20%
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container mx-auto px-6 lg:px-12 -mt-8 relative z-20">
                <div className="grid md:grid-cols-3 gap-0">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`pricing-card opacity-0 bg-base-100 border border-base-300 p-8 lg:p-10 relative ${plan.popular ? "border-coral border-2 lg:-mt-4 lg:mb-0 lg:pb-14 z-10" : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-content text-[10px] font-bold uppercase tracking-wider">
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
            <section className="pricing-section opacity-0 container mx-auto px-6 lg:px-12 py-16 lg:py-24">
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
                                    Enterprise
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
                                        {f.enterprise}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="pricing-section opacity-0 bg-base-200 py-16 lg:py-24">
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
            <section className="pricing-section opacity-0 bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        Ready to grow your pipeline?
                    </h2>
                    <p className="text-neutral-content/50 max-w-lg mx-auto mb-8">
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
