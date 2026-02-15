"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out" };

const plans = [
    {
        name: "Starter",
        price: { monthly: 0, annual: 0 },
        desc: "For individual recruiters getting started",
        cta: "Start Free",
        features: ["5 active job listings", "Basic candidate search", "Email notifications", "Standard support", "Public profile"],
        limits: ["No analytics", "No API access", "5 submissions/month"],
    },
    {
        name: "Professional",
        price: { monthly: 79, annual: 59 },
        desc: "For active recruiters and small teams",
        cta: "Start 14-Day Trial",
        popular: true,
        features: ["Unlimited job listings", "Advanced candidate search", "Analytics dashboard", "Priority support", "API access", "Custom branding", "Team collaboration (3 seats)", "Weekly digest reports"],
        limits: [],
    },
    {
        name: "Enterprise",
        price: { monthly: 199, annual: 149 },
        desc: "For agencies and large recruiting teams",
        cta: "Contact Sales",
        features: ["Everything in Professional", "Unlimited team seats", "Advanced analytics & reporting", "Dedicated account manager", "Custom integrations", "SLA guarantee", "White-label options", "Bulk operations", "Compliance tools", "Training & onboarding"],
        limits: [],
    },
];

const faqs = [
    { q: "How does the split-fee model work?", a: "When you place a candidate through Splits Network, the placement fee is split between the sourcing recruiter and the job-listing recruiter. Standard splits are 50/50, but terms are negotiable per listing." },
    { q: "Can I upgrade or downgrade at any time?", a: "Yes. Changes take effect immediately. If upgrading, you pay the prorated difference. If downgrading, you receive a credit toward your next billing cycle." },
    { q: "Is there a commitment or contract?", a: "No long-term contracts. Monthly plans can be cancelled anytime. Annual plans are billed upfront with a 30-day money-back guarantee." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), ACH bank transfers, and wire transfers for Enterprise plans." },
];

const compareFeatures = [
    { feature: "Active Listings", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Team Seats", starter: "1", pro: "3", enterprise: "Unlimited" },
    { feature: "Candidate Search", starter: "Basic", pro: "Advanced", enterprise: "Advanced+" },
    { feature: "Analytics", starter: "--", pro: "Standard", enterprise: "Advanced" },
    { feature: "API Access", starter: "--", pro: "Yes", enterprise: "Yes" },
    { feature: "Support", starter: "Email", pro: "Priority", enterprise: "Dedicated" },
    { feature: "Custom Branding", starter: "--", pro: "Yes", enterprise: "Yes" },
    { feature: "SLA", starter: "--", pro: "--", enterprise: "99.9%" },
];

export default function PricingThreePage() {
    const [annual, setAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
        tl.fromTo($1(".page-title"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
        tl.fromTo($(".plan-card"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal, stagger: 0.1 }, "-=0.2");
        $(".scroll-section").forEach((s) => {
            gsap.fromTo(s, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: D.normal, ease: E.precise, scrollTrigger: { trigger: s, start: "top 85%" } });
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* Header */}
            <section className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-16 pb-10 text-center">
                    <div className="page-number opacity-0 text-[6rem] lg:text-[8rem] font-black tracking-tighter text-neutral/6 select-none leading-none mb-2">03</div>
                    <div className="page-title opacity-0">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-2">Plans & Pricing</p>
                        <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">Choose Your Plan</h1>
                        <p className="text-sm text-base-content/40 max-w-md mx-auto leading-relaxed">Simple, transparent pricing. Start free and scale as your recruiting business grows.</p>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${!annual ? "text-base-content" : "text-base-content/30"}`}>Monthly</span>
                        <button onClick={() => setAnnual(!annual)} className={`w-12 h-6 relative transition-colors ${annual ? "bg-neutral" : "bg-base-300"}`}>
                            <div className={`absolute top-1 w-4 h-4 transition-all ${annual ? "left-7 bg-neutral-content" : "left-1 bg-base-content/30"}`} />
                        </button>
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${annual ? "text-base-content" : "text-base-content/30"}`}>
                            Annual <span className="text-success ml-1">Save 25%</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Plans */}
            <section className="px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] bg-neutral/10 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`plan-card opacity-0 bg-base-100 flex flex-col ${plan.popular ? "ring-2 ring-neutral relative" : ""}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral text-neutral-content text-[8px] uppercase tracking-[0.25em] font-black z-10">
                                    Most Popular
                                </div>
                            )}
                            <div className="p-6 lg:p-8 flex-1">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 font-bold mb-1">{plan.name}</p>
                                <div className="flex items-baseline gap-1 mb-2">
                                    {plan.price.monthly === 0 ? (
                                        <span className="text-4xl font-black tracking-tighter">Free</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black tracking-tighter">${annual ? plan.price.annual : plan.price.monthly}</span>
                                            <span className="text-[10px] text-base-content/30">/mo</span>
                                        </>
                                    )}
                                </div>
                                {plan.price.monthly > 0 && annual && (
                                    <p className="text-[9px] text-base-content/25 mb-3">Billed annually at ${plan.price.annual * 12}/yr</p>
                                )}
                                <p className="text-xs text-base-content/40 mb-6">{plan.desc}</p>

                                <button className={`w-full py-3 text-[10px] uppercase tracking-[0.3em] font-black transition-colors mb-6 ${plan.popular ? "bg-neutral text-neutral-content hover:bg-primary hover:text-primary-content" : "bg-base-200 text-base-content/50 hover:text-base-content"}`}>
                                    {plan.cta}
                                </button>

                                <div className="space-y-2">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-[9px] text-success mt-1 flex-shrink-0" />
                                            <span className="text-[11px] text-base-content/50">{f}</span>
                                        </div>
                                    ))}
                                    {plan.limits.map((l) => (
                                        <div key={l} className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-xmark text-[9px] text-base-content/15 mt-1 flex-shrink-0" />
                                            <span className="text-[11px] text-base-content/25">{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison */}
            <section className="scroll-section opacity-0 px-6 lg:px-12 py-12 border-t-2 border-neutral/10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-end gap-3 mb-8 justify-center">
                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">02</span>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Feature Comparison</p>
                    </div>
                    <div className="border-2 border-neutral/10">
                        <div className="grid grid-cols-4 gap-0 bg-base-200/50 border-b border-neutral/10">
                            <div className="p-4 text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/30">Feature</div>
                            <div className="p-4 text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/30 text-center">Starter</div>
                            <div className="p-4 text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/30 text-center bg-neutral/5">Professional</div>
                            <div className="p-4 text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/30 text-center">Enterprise</div>
                        </div>
                        {compareFeatures.map((row) => (
                            <div key={row.feature} className="grid grid-cols-4 gap-0 border-b border-base-300 last:border-0">
                                <div className="p-4 text-xs font-medium tracking-tight text-base-content/50">{row.feature}</div>
                                <div className="p-4 text-xs text-center text-base-content/40">{row.starter === "--" ? <span className="text-base-content/15">--</span> : row.starter}</div>
                                <div className="p-4 text-xs text-center font-bold bg-neutral/5">{row.pro === "--" ? <span className="text-base-content/15">--</span> : row.pro}</div>
                                <div className="p-4 text-xs text-center text-base-content/40">{row.enterprise}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust */}
            <section className="scroll-section opacity-0 px-6 lg:px-12 py-12 border-t-2 border-neutral/10">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10 mb-8">
                        {[
                            { value: "12K+", label: "Active Recruiters" },
                            { value: "8.4K", label: "Companies" },
                            { value: "99.9%", label: "Uptime SLA" },
                            { value: "4.9/5", label: "Avg Rating" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-base-100 py-5 px-4 text-center">
                                <div className="text-xl font-black tracking-tighter">{stat.value}</div>
                                <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/25 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-base-content/30 mb-4">
                        Trusted by recruiting teams at leading companies worldwide. 30-day money-back guarantee on all paid plans.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="scroll-section opacity-0 px-6 lg:px-12 py-12 border-t-2 border-neutral/10">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-end gap-3 mb-8 justify-center">
                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">03</span>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">FAQ</p>
                    </div>
                    <div className="border-2 border-neutral/10">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-base-300 last:border-0">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-base-200/50 transition-colors">
                                    <span className="text-sm font-bold tracking-tight pr-4">{faq.q}</span>
                                    <i className={`fa-duotone fa-regular ${openFaq === i ? "fa-minus" : "fa-plus"} text-xs text-base-content/25 flex-shrink-0`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-4">
                                        <p className="text-xs text-base-content/40 leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
