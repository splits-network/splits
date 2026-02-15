"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Data ───────────────────────────────────────────────────────────────────

const plans = [
    {
        name: "Starter",
        price: { monthly: 29, annual: 24 },
        desc: "For independent recruiters getting started with split-fee recruiting.",
        features: [
            { name: "Active job roles", value: "5" },
            { name: "Team members", value: "1" },
            { name: "Candidate submissions/mo", value: "25" },
            { name: "Split-fee proposals/mo", value: "10" },
            { name: "Storage", value: "1 GB" },
            { name: "Email support", value: true },
            { name: "API access", value: false },
            { name: "Custom branding", value: false },
            { name: "Analytics dashboard", value: false },
            { name: "Priority matching", value: false },
        ],
        cta: "START_FREE_TRIAL",
        accent: "#c8ccd4",
    },
    {
        name: "Professional",
        price: { monthly: 99, annual: 79 },
        desc: "For growing agencies with active split-fee pipelines.",
        features: [
            { name: "Active job roles", value: "25" },
            { name: "Team members", value: "5" },
            { name: "Candidate submissions/mo", value: "100" },
            { name: "Split-fee proposals/mo", value: "50" },
            { name: "Storage", value: "10 GB" },
            { name: "Email support", value: true },
            { name: "API access", value: true },
            { name: "Custom branding", value: true },
            { name: "Analytics dashboard", value: true },
            { name: "Priority matching", value: false },
        ],
        cta: "UPGRADE_NOW",
        accent: "#3b5ccc",
        popular: true,
    },
    {
        name: "Enterprise",
        price: { monthly: 249, annual: 199 },
        desc: "For large teams requiring unlimited access and dedicated support.",
        features: [
            { name: "Active job roles", value: "Unlimited" },
            { name: "Team members", value: "Unlimited" },
            { name: "Candidate submissions/mo", value: "Unlimited" },
            { name: "Split-fee proposals/mo", value: "Unlimited" },
            { name: "Storage", value: "100 GB" },
            { name: "Email support", value: true },
            { name: "API access", value: true },
            { name: "Custom branding", value: true },
            { name: "Analytics dashboard", value: true },
            { name: "Priority matching", value: true },
        ],
        cta: "CONTACT_SALES",
        accent: "#14b8a6",
    },
];

const featureNames = plans[0].features.map((f) => f.name);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PricingSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-pricing-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-pricing-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-pricing-toggle", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.3");
            tl.fromTo(".bp-pricing-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, "-=0.2");
            tl.fromTo(".bp-pricing-compare", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.1");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-pricing-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-PRIC07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            PRICING
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="bp-pricing-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0 inline-block">
                            Pricing <span className="text-[#3b5ccc]">Plans</span>
                        </h1>
                        <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mt-2">// SELECT YOUR OPERATIONAL TIER</p>
                    </div>

                    {/* ═══ Billing Toggle ═══ */}
                    <div className="bp-pricing-toggle opacity-0 flex items-center justify-center gap-4 mb-12">
                        <span className={`font-mono text-[10px] tracking-widest transition-colors ${billing === "monthly" ? "text-white" : "text-[#c8ccd4]/30"}`}>
                            MONTHLY
                        </span>
                        <button
                            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
                            className={`w-12 h-6 border relative transition-colors ${
                                billing === "annual" ? "bg-[#3b5ccc]/20 border-[#3b5ccc]/40" : "bg-[#c8ccd4]/5 border-[#c8ccd4]/15"
                            }`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 transition-all ${
                                    billing === "annual" ? "left-[calc(100%-20px)] bg-[#3b5ccc]" : "left-1 bg-[#c8ccd4]/30"
                                }`}
                            ></div>
                        </button>
                        <span className={`font-mono text-[10px] tracking-widest transition-colors ${billing === "annual" ? "text-white" : "text-[#c8ccd4]/30"}`}>
                            ANNUAL
                        </span>
                        {billing === "annual" && (
                            <span className="px-2 py-1 border border-[#22c55e]/30 bg-[#22c55e]/5 font-mono text-[9px] text-[#22c55e]/70 tracking-widest">
                                SAVE 20%
                            </span>
                        )}
                    </div>

                    {/* ═══ Pricing Cards ═══ */}
                    <div className="grid md:grid-cols-3 gap-px bg-[#3b5ccc]/10 max-w-5xl mx-auto mb-16">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`bp-pricing-card bg-[#0a0e17] opacity-0 relative ${
                                    plan.popular ? "ring-1 ring-[#3b5ccc]/30" : ""
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-px left-0 right-0 h-px bg-[#3b5ccc]"></div>
                                )}
                                <div className={`font-mono text-[9px] tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10 flex items-center justify-between`}>
                                    <span style={{ color: `${plan.accent}66` }}>{plan.name.toUpperCase()}_TIER</span>
                                    {plan.popular && (
                                        <span className="px-2 py-0.5 bg-[#3b5ccc] text-white text-[8px] tracking-widest">RECOMMENDED</span>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-white">${billing === "monthly" ? plan.price.monthly : plan.price.annual}</span>
                                        <span className="text-sm text-[#c8ccd4]/30 ml-1">/mo</span>
                                    </div>
                                    {billing === "annual" && (
                                        <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider mb-4">
                                            Billed annually at ${plan.price.annual * 12}/yr
                                        </div>
                                    )}
                                    <p className="text-sm text-[#c8ccd4]/30 leading-relaxed mb-6">{plan.desc}</p>
                                    <button
                                        className={`w-full px-5 py-2.5 font-mono text-[10px] tracking-widest transition-colors border ${
                                            plan.popular
                                                ? "bg-[#3b5ccc] text-white border-[#3b5ccc] hover:bg-[#3b5ccc]/90"
                                                : `border-[${plan.accent}]/30 text-[${plan.accent}]/60 hover:bg-[${plan.accent}]/5`
                                        }`}
                                        style={!plan.popular ? { borderColor: `${plan.accent}30`, color: `${plan.accent}99` } : undefined}
                                    >
                                        {plan.cta}
                                    </button>
                                    <div className="mt-6 pt-6 border-t border-[#3b5ccc]/10 space-y-3">
                                        {plan.features.slice(0, 5).map((feat) => (
                                            <div key={feat.name} className="flex items-center justify-between">
                                                <span className="text-xs text-[#c8ccd4]/30">{feat.name}</span>
                                                <span className="font-mono text-[10px] text-white tracking-wider">{String(feat.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ═══ Feature Comparison Table ═══ */}
                    <div className="bp-pricing-compare opacity-0 max-w-5xl mx-auto">
                        <div className="border border-[#3b5ccc]/15">
                            <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                FEATURE_COMPARISON_MATRIX
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#3b5ccc]/10">
                                            <th className="px-6 py-3 text-left font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest">FEATURE</th>
                                            {plans.map((plan) => (
                                                <th key={plan.name} className="px-6 py-3 text-center font-mono text-[9px] tracking-widest" style={{ color: `${plan.accent}66` }}>
                                                    {plan.name.toUpperCase()}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3b5ccc]/5">
                                        {featureNames.map((featName) => (
                                            <tr key={featName} className="hover:bg-[#3b5ccc]/5 transition-colors">
                                                <td className="px-6 py-3 text-sm text-[#c8ccd4]/40">{featName}</td>
                                                {plans.map((plan) => {
                                                    const feat = plan.features.find((f) => f.name === featName);
                                                    const val = feat?.value;
                                                    return (
                                                        <td key={plan.name} className="px-6 py-3 text-center">
                                                            {typeof val === "boolean" ? (
                                                                val ? (
                                                                    <i className="fa-duotone fa-regular fa-check text-[#22c55e]/60"></i>
                                                                ) : (
                                                                    <i className="fa-duotone fa-regular fa-xmark text-[#c8ccd4]/15"></i>
                                                                )
                                                            ) : (
                                                                <span className="font-mono text-[10px] text-white tracking-wider">{val}</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ═══ FAQ ═══ */}
                    <div className="max-w-3xl mx-auto mt-16">
                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest mb-6">// FREQUENTLY ASKED QUESTIONS</div>
                        <div className="space-y-px">
                            {[
                                { q: "Can I change plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle." },
                                { q: "What happens when I reach my limits?", a: "You will receive a notification when approaching limits. You can upgrade your plan or purchase add-on capacity." },
                                { q: "Is there a free trial?", a: "All plans include a 14-day free trial. No credit card required to start." },
                                { q: "How are split-fee payments handled?", a: "Splits Network handles all payment processing. Fees are distributed automatically according to the agreed split ratio." },
                            ].map((faq, idx) => (
                                <div key={idx} className="border border-[#3b5ccc]/15 p-6">
                                    <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                                    <p className="text-xs text-[#c8ccd4]/30 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
