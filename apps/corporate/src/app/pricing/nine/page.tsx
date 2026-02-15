"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

const tiers = [
    {
        name: "Starter",
        ref: "PLAN-01",
        monthlyPrice: 0,
        annualPrice: 0,
        desc: "For individual recruiters exploring the network.",
        cta: "Get Started Free",
        ctaStyle: "border-2 border-[#233876]/20 text-[#233876] hover:border-[#233876]",
        features: [
            { text: "Up to 5 active roles", included: true },
            { text: "Basic candidate tracking", included: true },
            { text: "Email notifications", included: true },
            { text: "Community support", included: true },
            { text: "Pipeline analytics", included: false },
            { text: "Team collaboration", included: false },
            { text: "API access", included: false },
            { text: "Custom integrations", included: false },
        ],
    },
    {
        name: "Professional",
        ref: "PLAN-02",
        monthlyPrice: 49,
        annualPrice: 39,
        desc: "For active recruiters who need full pipeline visibility.",
        cta: "Start Free Trial",
        ctaStyle: "border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c]",
        popular: true,
        features: [
            { text: "Unlimited active roles", included: true },
            { text: "Advanced candidate tracking", included: true },
            { text: "All notification channels", included: true },
            { text: "Priority support", included: true },
            { text: "Pipeline analytics", included: true },
            { text: "Team collaboration (up to 5)", included: true },
            { text: "API access", included: false },
            { text: "Custom integrations", included: false },
        ],
    },
    {
        name: "Enterprise",
        ref: "PLAN-03",
        monthlyPrice: 149,
        annualPrice: 119,
        desc: "For agencies and teams that need full control and scale.",
        cta: "Contact Sales",
        ctaStyle: "border-2 border-[#233876]/20 text-[#233876] hover:border-[#233876]",
        features: [
            { text: "Everything in Professional", included: true },
            { text: "Unlimited team members", included: true },
            { text: "Custom branding", included: true },
            { text: "Dedicated account manager", included: true },
            { text: "Advanced analytics & reports", included: true },
            { text: "SSO & advanced security", included: true },
            { text: "Full API access", included: true },
            { text: "Custom integrations", included: true },
        ],
    },
];

const comparisonFeatures = [
    { feature: "Active Roles", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Candidate Tracking", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
    { feature: "Team Members", starter: "1", pro: "Up to 5", enterprise: "Unlimited" },
    { feature: "Analytics", starter: "---", pro: "Pipeline", enterprise: "Custom Reports" },
    { feature: "Support", starter: "Community", pro: "Priority", enterprise: "Dedicated" },
    { feature: "API Access", starter: "---", pro: "---", enterprise: "Full" },
    { feature: "Integrations", starter: "---", pro: "Standard", enterprise: "Custom" },
    { feature: "SLA", starter: "---", pro: "99.9%", enterprise: "99.99%" },
];

const faqs = [
    { q: "Can I switch plans at any time?", a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle. When upgrading, you get immediate access to new features." },
    { q: "Is there a free trial?", a: "Professional and Enterprise plans include a 14-day free trial. No credit card required to start. You can explore all features before committing." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) and can arrange invoicing for Enterprise annual plans." },
    { q: "Do you offer discounts for annual billing?", a: "Yes. Annual billing saves you approximately 20% compared to monthly billing. The discount is applied automatically when you select annual billing." },
    { q: "What happens when my trial ends?", a: "You will be notified before your trial expires. If you choose not to continue, your account reverts to the free Starter plan. No charges are made without your explicit consent." },
];

const testimonials = [
    { text: "Splits Network paid for itself in the first week. The pipeline visibility alone is worth it.", author: "Sarah Chen", role: "Independent Recruiter", placements: "147 placements" },
    { text: "We moved our entire 12-person agency to the Enterprise plan. The ROI has been exceptional.", author: "Marcus Rivera", role: "Agency Director", placements: "340+ placements" },
];

// -- Component ----------------------------------------------------------------

export default function PricingNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [annual, setAnnual] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".pricing-nine-heading"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($1(".pricing-nine-toggle"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo($(".pricing-nine-tier"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.2");

            gsap.fromTo($1(".pricing-nine-comparison"), { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
                scrollTrigger: { trigger: $1(".pricing-nine-comparison"), start: "top 85%" },
            });
            gsap.fromTo($(".pricing-nine-testimonial"), { opacity: 0, y: 20 }, {
                opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power3.out",
                scrollTrigger: { trigger: $1(".pricing-nine-testimonials"), start: "top 85%" },
            });
            gsap.fromTo($(".pricing-nine-faq"), { opacity: 0, y: 15 }, {
                opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out",
                scrollTrigger: { trigger: $1(".pricing-nine-faqs"), start: "top 85%" },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative py-20 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="pricing-nine-heading opacity-0 text-center max-w-2xl mx-auto mb-10">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            REF: EN-PRICING-09 // Plans
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                            Simple, Transparent<br /><span className="text-[#233876]">Pricing</span>
                        </h1>
                        <p className="text-lg text-[#0f1b3d]/45">
                            Choose the plan that fits your workflow. Scale as you grow. No hidden fees.
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="pricing-nine-toggle opacity-0 flex items-center justify-center gap-4 mb-14">
                        <span className={`text-sm font-medium ${!annual ? "text-[#0f1b3d]" : "text-[#0f1b3d]/30"}`}>Monthly</span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className={`w-14 h-7 relative transition-colors ${annual ? "bg-[#233876]" : "bg-[#233876]/15"}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white border border-[#233876]/20 transition-all ${annual ? "left-[30px]" : "left-1"}`} />
                        </button>
                        <span className={`text-sm font-medium ${annual ? "text-[#0f1b3d]" : "text-[#0f1b3d]/30"}`}>
                            Annual
                            <span className="ml-2 font-mono text-[10px] text-emerald-600 border border-emerald-200 px-2 py-0.5 tracking-wider uppercase">Save 20%</span>
                        </span>
                    </div>

                    {/* Tiers */}
                    <div className="grid md:grid-cols-3 gap-px bg-[#233876]/10 max-w-5xl mx-auto">
                        {tiers.map((tier, i) => (
                            <div key={i} className={`pricing-nine-tier opacity-0 bg-white p-8 relative ${tier.popular ? "ring-2 ring-[#233876] ring-inset" : ""}`}>
                                {tier.popular && (
                                    <div className="absolute top-0 left-0 right-0">
                                        <div className="bg-[#233876] text-white font-mono text-[9px] tracking-wider uppercase text-center py-1.5">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className={tier.popular ? "pt-6" : ""}>
                                    <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">{tier.ref}</div>

                                    <h3 className="font-bold text-xl text-[#0f1b3d] mb-2">{tier.name}</h3>
                                    <p className="text-xs text-[#0f1b3d]/40 mb-6 leading-relaxed">{tier.desc}</p>

                                    <div className="mb-6 pb-6 border-b border-dashed border-[#233876]/10">
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-4xl font-bold text-[#233876]">
                                                ${annual ? tier.annualPrice : tier.monthlyPrice}
                                            </span>
                                            {tier.monthlyPrice > 0 && (
                                                <span className="font-mono text-sm text-[#0f1b3d]/30">/month</span>
                                            )}
                                        </div>
                                        {tier.monthlyPrice === 0 && (
                                            <span className="font-mono text-sm text-[#0f1b3d]/30">Free forever</span>
                                        )}
                                        {annual && tier.monthlyPrice > 0 && (
                                            <div className="font-mono text-xs text-[#0f1b3d]/25 mt-1">
                                                ${tier.annualPrice * 12}/year (save ${(tier.monthlyPrice - tier.annualPrice) * 12})
                                            </div>
                                        )}
                                    </div>

                                    <button className={`w-full px-5 py-3 text-sm font-medium transition-colors mb-8 ${tier.ctaStyle}`}>
                                        {tier.cta}
                                    </button>

                                    <ul className="space-y-3">
                                        {tier.features.map((f, j) => (
                                            <li key={j} className="flex items-center gap-3">
                                                <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 ${
                                                    f.included ? "border-[#233876]/20" : "border-[#233876]/8"
                                                }`}>
                                                    {f.included ? (
                                                        <i className="fa-regular fa-check text-[9px] text-[#233876]" />
                                                    ) : (
                                                        <i className="fa-regular fa-minus text-[9px] text-[#0f1b3d]/15" />
                                                    )}
                                                </div>
                                                <span className={`text-xs ${f.included ? "text-[#0f1b3d]/60" : "text-[#0f1b3d]/25"}`}>
                                                    {f.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="relative py-20 bg-[#f7f8fa] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="pricing-nine-comparison opacity-0 max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">Feature Matrix</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d]">Compare Plans</h2>
                        </div>

                        <div className="border-2 border-[#233876]/10 bg-white overflow-hidden relative">
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />

                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#233876]/10">
                                        <th className="w-1/4 px-6 py-4 text-left">
                                            <span className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">Feature</span>
                                        </th>
                                        {["Starter", "Professional", "Enterprise"].map((plan) => (
                                            <th key={plan} className="w-1/4 px-6 py-4 text-center">
                                                <span className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">{plan}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonFeatures.map((row, i) => (
                                        <tr key={i} className="border-b border-dashed border-[#233876]/6 last:border-b-0">
                                            <td className="px-6 py-3.5 text-sm font-medium text-[#0f1b3d]">{row.feature}</td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className={`font-mono text-xs ${row.starter === "---" ? "text-[#0f1b3d]/15" : "text-[#0f1b3d]/50"}`}>
                                                    {row.starter}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center bg-[#233876]/[0.02]">
                                                <span className={`font-mono text-xs ${row.pro === "---" ? "text-[#0f1b3d]/15" : "text-[#233876] font-semibold"}`}>
                                                    {row.pro}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className={`font-mono text-xs ${row.enterprise === "---" ? "text-[#0f1b3d]/15" : "text-[#0f1b3d]/50"}`}>
                                                    {row.enterprise}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="pricing-nine-testimonials max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">Trusted By</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d]">What Recruiters Say</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {testimonials.map((t, i) => (
                                <div key={i} className="pricing-nine-testimonial opacity-0 border-2 border-[#233876]/10 p-8 relative">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">REVIEW</div>

                                    <p className="text-sm text-[#0f1b3d]/50 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>

                                    <div className="flex items-center gap-4 pt-4 border-t border-dashed border-[#233876]/10">
                                        <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876]">
                                            <span className="font-mono text-xs font-bold text-white">{t.author.split(" ").map((n) => n[0]).join("")}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-[#0f1b3d]">{t.author}</div>
                                            <div className="text-xs text-[#0f1b3d]/35">{t.role}</div>
                                        </div>
                                        <span className="ml-auto font-mono text-[10px] text-[#233876]/40 border border-[#233876]/15 px-2 py-0.5">
                                            {t.placements}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="relative py-20 bg-[#f7f8fa] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="pricing-nine-faqs max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">Reference Guide</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d]">Common Questions</h2>
                        </div>

                        <div className="space-y-px bg-[#233876]/10">
                            {faqs.map((faq, i) => (
                                <div key={i} className="pricing-nine-faq opacity-0 bg-white">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer select-none">
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-xs text-[#233876]/25 w-6">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                <span className="font-semibold text-sm text-[#0f1b3d]">{faq.q}</span>
                                            </div>
                                            <i className="fa-regular fa-plus text-[#233876]/30 group-open:rotate-45 transition-transform duration-200" />
                                        </summary>
                                        <div className="px-6 pb-6 pl-16">
                                            <p className="text-sm text-[#0f1b3d]/45 leading-relaxed">{faq.a}</p>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-20 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/8 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">Ready?</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-4">Start Building Your Network</h2>
                        <p className="text-[#0f1b3d]/40 mb-8">Join thousands of recruiters who trust Splits Network.</p>
                        <div className="flex justify-center gap-4">
                            <button className="px-8 py-3 border-2 border-[#233876] bg-[#233876] text-white text-sm font-medium hover:bg-[#1a2a5c] transition-colors">
                                Get Started Free
                            </button>
                            <button className="px-8 py-3 border-2 border-[#233876]/20 text-sm text-[#233876] font-medium hover:border-[#233876] transition-colors">
                                Talk to Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-[#f7f8fa] border-t border-[#233876]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // PRICING v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
