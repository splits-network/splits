"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const plans = [
    {
        name: "Starter",
        desc: "For independent recruiters getting started.",
        monthly: 0,
        annual: 0,
        cta: "Start Free",
        ctaStyle: "ghost" as const,
        popular: false,
        features: ["5 active job listings", "Basic candidate search", "Email support", "1 team member", "Standard analytics", "Community access"],
    },
    {
        name: "Pro",
        desc: "For growing agencies and active recruiters.",
        monthly: 79,
        annual: 59,
        cta: "Start Pro Trial",
        ctaStyle: "secondary" as const,
        popular: true,
        features: ["Unlimited job listings", "Advanced candidate search", "AI-powered matching", "Priority support", "Up to 10 team members", "Advanced analytics", "Custom split-fee templates", "API access"],
    },
    {
        name: "Enterprise",
        desc: "For large agencies and hiring companies.",
        monthly: 249,
        annual: 199,
        cta: "Contact Sales",
        ctaStyle: "ghost" as const,
        popular: false,
        features: ["Everything in Pro", "Unlimited team members", "SSO & SAML", "Dedicated success manager", "Custom integrations", "SLA guarantee", "White-label options", "Advanced security controls", "Bulk operations"],
    },
];

const features = [
    { name: "Active Job Listings", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Team Members", starter: "1", pro: "Up to 10", enterprise: "Unlimited" },
    { name: "Candidate Search", starter: "Basic", pro: "Advanced + AI", enterprise: "Advanced + AI" },
    { name: "AI Matching", starter: false, pro: true, enterprise: true },
    { name: "Custom Split Templates", starter: false, pro: true, enterprise: true },
    { name: "API Access", starter: false, pro: true, enterprise: true },
    { name: "Analytics", starter: "Standard", pro: "Advanced", enterprise: "Advanced + Custom" },
    { name: "SSO / SAML", starter: false, pro: false, enterprise: true },
    { name: "Dedicated Support", starter: false, pro: false, enterprise: true },
    { name: "White Label", starter: false, pro: false, enterprise: true },
    { name: "SLA Guarantee", starter: false, pro: false, enterprise: true },
];

const faqs = [
    { q: "Can I switch plans at any time?", a: "Yes. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your current billing cycle." },
    { q: "Is there a free trial for the Pro plan?", a: "Absolutely. Every Pro plan includes a 14-day free trial with full access to all features. No credit card required." },
    { q: "What happens when my trial ends?", a: "You will be automatically moved to the Starter plan unless you choose to subscribe. No charges will be made without your explicit consent." },
    { q: "Do you offer discounts for annual billing?", a: "Yes. Annual plans save you approximately 25% compared to monthly billing. The discount is applied automatically when you select annual billing." },
    { q: "How does the split-fee system work?", a: "When you place a candidate through the network, fees are split according to the terms you agree upon with the other party. The platform handles tracking and payments." },
];

const testimonials = [
    { quote: "The Pro plan paid for itself within the first week. The AI matching alone saved us hours of sourcing.", author: "Marcus Webb", role: "Director, Meridian Search" },
    { quote: "We switched from a competitor and immediately saw a 40% improvement in time-to-fill across all our mandates.", author: "Lisa Park", role: "Principal Recruiter" },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function PricingPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [annual, setAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useGSAP(() => {
        gsap.from("[data-page-text]", { y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" });
        gsap.from("[data-plan]", { y: 40, opacity: 0, duration: 0.7, stagger: 0.15, delay: 0.3, ease: "power2.out" });
        gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
            gsap.from(line, { scaleX: 0, transformOrigin: "left center", duration: 1, ease: "power2.inOut", scrollTrigger: { trigger: line, start: "top 90%" } });
        });
        gsap.from("[data-faq]", { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: "[data-faq-section]", start: "top 80%" } });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            {/* Hero */}
            <section className="bg-neutral text-neutral-content py-24 md:py-32">
                <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
                    <p data-page-text className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-6">Pricing</p>
                    <h1 data-page-text className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6">Simple, transparent<br />pricing</h1>
                    <p data-page-text className="text-lg text-neutral-content/60 max-w-xl mx-auto leading-relaxed mb-10">Start free, upgrade as you grow. No hidden fees, no surprise charges. Every plan includes access to the full recruiting marketplace.</p>
                    {/* Toggle */}
                    <div data-page-text className="inline-flex items-center gap-4 bg-neutral-content/5 border border-neutral-content/10 p-1.5">
                        <button onClick={() => setAnnual(false)} className={`px-5 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${!annual ? "bg-secondary text-secondary-content" : "text-neutral-content/50 hover:text-neutral-content"}`}>Monthly</button>
                        <button onClick={() => setAnnual(true)} className={`px-5 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${annual ? "bg-secondary text-secondary-content" : "text-neutral-content/50 hover:text-neutral-content"}`}>Annual <span className="text-[10px] ml-1 opacity-70">Save 25%</span></button>
                    </div>
                </div>
            </section>

            {/* Plans */}
            <section className="py-16 md:py-24 -mt-8">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.name} data-plan className={`border p-8 flex flex-col ${plan.popular ? "border-secondary bg-secondary/5 relative" : "border-base-300"}`}>
                                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-content text-[10px] uppercase tracking-wider font-bold px-4 py-1">Most Popular</div>}
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">{plan.name}</p>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold text-base-content">${annual ? plan.annual : plan.monthly}</span>
                                    {(annual ? plan.annual : plan.monthly) > 0 && <span className="text-sm text-base-content/40">/mo</span>}
                                </div>
                                {plan.monthly === 0 && <p className="text-sm text-base-content/50 mb-4">Free forever</p>}
                                {plan.monthly > 0 && annual && <p className="text-xs text-base-content/40 mb-4">Billed annually (${plan.annual * 12}/yr)</p>}
                                {plan.monthly > 0 && !annual && <p className="text-xs text-base-content/40 mb-4">Billed monthly</p>}
                                <p className="text-sm text-base-content/60 leading-relaxed mb-6">{plan.desc}</p>
                                <button className={`btn btn-block font-semibold uppercase text-xs tracking-wider mb-8 ${plan.ctaStyle === "secondary" ? "btn-secondary" : "btn-ghost border border-base-300"}`}>{plan.cta}</button>
                                <ul className="space-y-3 mt-auto">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm text-base-content/60">
                                            <i className="fa-duotone fa-regular fa-check text-secondary text-xs mt-1 shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Matrix */}
            <section className="bg-base-200 py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4 text-center">Feature Comparison</p>
                    <h2 className="text-3xl font-bold text-base-content tracking-tight mb-10 text-center">Everything you get</h2>
                    <div className="border border-base-300 bg-base-100 overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-base-200">
                                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider font-medium text-base-content/50">Feature</th>
                                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider font-medium text-base-content/50 text-center">Starter</th>
                                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider font-medium text-secondary text-center">Pro</th>
                                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider font-medium text-base-content/50 text-center">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((f) => (
                                    <tr key={f.name} className="border-b border-base-300 last:border-0">
                                        <td className="py-3 px-5 text-sm text-base-content">{f.name}</td>
                                        {[f.starter, f.pro, f.enterprise].map((val, i) => (
                                            <td key={i} className="py-3 px-5 text-center">
                                                {typeof val === "boolean" ? (val ? <i className="fa-duotone fa-regular fa-circle-check text-secondary" /> : <i className="fa-regular fa-minus text-base-content/20" />)
                                                    : <span className="text-sm text-base-content/70">{val}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div data-divider className="h-px bg-base-300 mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((t) => (
                            <blockquote key={t.author} className="border-l-4 border-secondary pl-6 py-2">
                                <p className="text-lg italic text-base-content/70 leading-snug mb-3">&ldquo;{t.quote}&rdquo;</p>
                                <cite className="text-xs text-base-content/40 not-italic uppercase tracking-wider">{t.author}, {t.role}</cite>
                            </blockquote>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section data-faq-section className="bg-neutral text-neutral-content py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-6 md:px-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4 text-center">FAQ</p>
                    <h2 className="text-3xl font-bold tracking-tight mb-10 text-center">Common questions</h2>
                    <div className="space-y-0">
                        {faqs.map((faq, i) => (
                            <div key={i} data-faq className="border-b border-neutral-content/10">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left">
                                    <span className="text-sm font-medium text-neutral-content pr-4">{faq.q}</span>
                                    <i className={`fa-regular ${openFaq === i ? "fa-minus" : "fa-plus"} text-secondary text-xs shrink-0`} />
                                </button>
                                {openFaq === i && <p className="text-sm text-neutral-content/60 leading-relaxed pb-5">{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary text-primary-content py-16 md:py-20">
                <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to start recruiting?</h2>
                    <p className="text-primary-content/70 mb-8">14-day free trial. No credit card required.</p>
                    <button className="btn btn-secondary btn-lg font-semibold uppercase text-xs tracking-wider px-10">Start Free Trial</button>
                </div>
            </section>

            <section className="bg-base-200 py-12">
                <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">Splits Network &middot; Pricing &middot; Magazine Editorial</p>
                </div>
            </section>
        </div>
    );
}
