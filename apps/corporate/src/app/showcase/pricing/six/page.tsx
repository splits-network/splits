"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

const TIERS = [
    {
        name: "Free", price: { monthly: 0, annual: 0 }, color: C.dark, popular: false,
        desc: "For solo recruiters getting started",
        features: ["5 active job listings", "Basic ATS", "10 candidates/month", "Email support", "Community access"],
        cta: "Start Free",
    },
    {
        name: "Pro", price: { monthly: 49, annual: 39 }, color: C.coral, popular: true,
        desc: "For growing recruitment teams",
        features: ["Unlimited job listings", "Full ATS + Pipeline", "Unlimited candidates", "Split-fee marketplace", "Priority support", "Analytics dashboard", "Team collaboration (5 seats)", "API access"],
        cta: "Start Pro Trial",
    },
    {
        name: "Enterprise", price: { monthly: 149, annual: 119 }, color: C.purple, popular: false,
        desc: "For agencies and large teams",
        features: ["Everything in Pro", "Unlimited team seats", "Custom integrations", "Dedicated account manager", "SLA guarantee", "Advanced analytics", "Custom branding", "SSO / SAML", "Audit logs", "Bulk import/export"],
        cta: "Contact Sales",
    },
];

const COMPARISON = [
    { feature: "Active Job Listings", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Candidates per Month", free: "10", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "ATS / Pipeline", free: "Basic", pro: "Full", enterprise: "Full + Custom" },
    { feature: "Split-Fee Marketplace", free: false, pro: true, enterprise: true },
    { feature: "Team Seats", free: "1", pro: "5", enterprise: "Unlimited" },
    { feature: "Analytics", free: false, pro: true, enterprise: "Advanced" },
    { feature: "API Access", free: false, pro: true, enterprise: true },
    { feature: "Custom Integrations", free: false, pro: false, enterprise: true },
    { feature: "SSO / SAML", free: false, pro: false, enterprise: true },
    { feature: "Dedicated Support", free: false, pro: false, enterprise: true },
];

const FAQS = [
    { q: "Can I switch plans anytime?", a: "Yes, upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate your billing." },
    { q: "Is there a free trial for Pro?", a: "Yes! Start a 14-day free trial of Pro with no credit card required. Full access to all Pro features." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards, ACH transfers, and wire transfers for Enterprise plans." },
    { q: "What happens when my trial ends?", a: "You'll be downgraded to the Free plan automatically. No charges unless you choose to subscribe." },
    { q: "Do you offer discounts for nonprofits?", a: "Yes! Contact our sales team for special nonprofit and educational pricing." },
];

export default function PricingSixPage() {
    const [annual, setAnnual] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelector(".pricing-heading"), { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        gsap.fromTo(pageRef.current.querySelectorAll(".tier-card"), { opacity: 0, y: 50, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)", stagger: 0.12, delay: 0.3 });

        const comparison = pageRef.current.querySelector(".comparison-section");
        if (comparison) {
            gsap.fromTo(comparison, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger: comparison, start: "top 85%" } });
        }
    }, []);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.dark }}>
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Header */}
            <div className="container mx-auto px-4 py-16">
                <div className="pricing-heading text-center mb-12 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] mb-6"
                        style={{ backgroundColor: C.coral, color: C.white }}>
                        <i className="fa-duotone fa-regular fa-tag"></i>Pricing
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4" style={{ color: C.white }}>
                        Simple,{" "}<span style={{ color: C.coral }}>Bold</span>{" "}Pricing
                    </h1>
                    <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
                        No hidden fees. No mystery math. Pick your plan and start recruiting.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: annual ? "rgba(255,255,255,0.4)" : C.white }}>Monthly</span>
                        <button onClick={() => setAnnual(!annual)}
                            className="w-14 h-8 relative border-3" style={{ borderColor: C.coral, backgroundColor: annual ? C.coral : "transparent" }}>
                            <div className="absolute top-1 w-5 h-5 transition-all border-2"
                                style={{ left: annual ? "calc(100% - 24px)" : "3px", borderColor: C.dark, backgroundColor: C.white }} />
                        </button>
                        <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: annual ? C.white : "rgba(255,255,255,0.4)" }}>
                            Annual
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase" style={{ backgroundColor: C.yellow, color: C.dark }}>Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* Tier Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
                    {TIERS.map((tier, i) => (
                        <div key={i} className={`tier-card border-4 relative ${tier.popular ? "md:-mt-4 md:mb-4" : ""}`}
                            style={{ borderColor: tier.color, backgroundColor: C.white }}>
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-wider"
                                    style={{ backgroundColor: tier.color, color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-star mr-1"></i>Most Popular
                                </div>
                            )}

                            <div className="p-8 text-center">
                                <h3 className="text-xl font-black uppercase tracking-wider mb-2" style={{ color: tier.color }}>{tier.name}</h3>
                                <p className="text-xs mb-6" style={{ color: C.dark, opacity: 0.5 }}>{tier.desc}</p>

                                <div className="mb-6">
                                    <div className="flex items-end justify-center gap-1">
                                        <span className="text-4xl font-black" style={{ color: C.dark }}>
                                            ${annual ? tier.price.annual : tier.price.monthly}
                                        </span>
                                        {tier.price.monthly > 0 && <span className="text-sm font-bold mb-1" style={{ color: C.dark, opacity: 0.4 }}>/mo</span>}
                                    </div>
                                    {tier.price.monthly > 0 && annual && (
                                        <p className="text-xs mt-1" style={{ color: C.teal }}>
                                            <s className="mr-1" style={{ color: C.dark, opacity: 0.3 }}>${tier.price.monthly}/mo</s>
                                            Save ${(tier.price.monthly - tier.price.annual) * 12}/yr
                                        </p>
                                    )}
                                </div>

                                <button className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 mb-8 transition-transform hover:-translate-y-0.5"
                                    style={{
                                        borderColor: tier.color, backgroundColor: tier.popular ? tier.color : "transparent",
                                        color: tier.popular ? C.white : tier.color,
                                    }}>
                                    {tier.cta}
                                </button>

                                <div className="space-y-3 text-left">
                                    {tier.features.map((f, fi) => (
                                        <div key={fi} className="flex items-start gap-2">
                                            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5"
                                                style={{ backgroundColor: tier.color }}>
                                                <i className="fa-solid fa-check text-[8px]" style={{ color: tier.color === C.dark ? C.white : (tier.color === C.yellow ? C.dark : C.white) }}></i>
                                            </div>
                                            <span className="text-xs font-semibold" style={{ color: C.dark, opacity: 0.7 }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
                    {[
                        { icon: "fa-duotone fa-regular fa-shield-check", label: "SOC 2 Compliant", color: C.teal },
                        { icon: "fa-duotone fa-regular fa-clock", label: "99.9% Uptime", color: C.coral },
                        { icon: "fa-duotone fa-regular fa-lock", label: "End-to-End Encrypted", color: C.yellow },
                        { icon: "fa-duotone fa-regular fa-money-check-dollar", label: "30-Day Guarantee", color: C.purple },
                    ].map((t, i) => (
                        <div key={i} className="border-3 p-4 text-center" style={{ borderColor: t.color, backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <i className={`${t.icon} text-lg mb-2 block`} style={{ color: t.color }}></i>
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.white }}>{t.label}</span>
                        </div>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="comparison-section max-w-4xl mx-auto mb-20">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-center mb-8" style={{ color: C.white }}>
                        Feature <span style={{ color: C.teal }}>Comparison</span>
                    </h2>
                    <div className="border-4 overflow-hidden" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: C.dark }}>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: C.white }}>Feature</th>
                                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>Free</th>
                                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider" style={{ color: C.coral }}>Pro</th>
                                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider" style={{ color: C.purple }}>Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON.map((row, i) => (
                                    <tr key={i} className="border-b-2" style={{ borderColor: C.cream }}>
                                        <td className="px-6 py-3 text-xs font-bold" style={{ color: C.dark }}>{row.feature}</td>
                                        {[row.free, row.pro, row.enterprise].map((val, vi) => (
                                            <td key={vi} className="px-4 py-3 text-center">
                                                {val === true ? (
                                                    <div className="w-5 h-5 mx-auto flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                                        <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>
                                                    </div>
                                                ) : val === false ? (
                                                    <span className="text-xs" style={{ color: C.dark, opacity: 0.2 }}>--</span>
                                                ) : (
                                                    <span className="text-xs font-bold" style={{ color: C.dark }}>{val}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-center mb-8" style={{ color: C.white }}>
                        Frequently <span style={{ color: C.yellow }}>Asked</span>
                    </h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, i) => {
                            const colors = [C.coral, C.teal, C.yellow, C.purple, C.coral];
                            return (
                                <div key={i} className="border-4" style={{ borderColor: colors[i] }}>
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-sm uppercase tracking-wide"
                                            style={{ color: C.white, backgroundColor: "rgba(255,255,255,0.03)" }}>
                                            {faq.q}
                                            <span className="w-7 h-7 flex items-center justify-center flex-shrink-0 font-black text-lg transition-transform group-open:rotate-45"
                                                style={{ backgroundColor: colors[i], color: colors[i] === C.yellow ? C.dark : C.white }}>+</span>
                                        </summary>
                                        <div className="px-5 pb-5" style={{ backgroundColor: C.white }}>
                                            <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.7 }}>{faq.a}</p>
                                        </div>
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
