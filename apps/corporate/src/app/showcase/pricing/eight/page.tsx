"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BG = {
  deep: "#0a1628",
  mid: "#0d1d33",
  card: "#0f2847",
  dark: "#081220",
  input: "#0b1a2e",
};

const D = { fast: 0.3, normal: 0.6, hero: 1.0, build: 1.4 };
const E = { smooth: "power2.out", bounce: "back.out(1.2)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.05, normal: 0.1, loose: 0.15 };

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    desc: "For individual recruiters getting started",
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: [
      { text: "Up to 5 active placements", included: true },
      { text: "Basic candidate matching", included: true },
      { text: "Email notifications", included: true },
      { text: "Standard support", included: true },
      { text: "1 team member", included: true },
      { text: "Basic analytics", included: true },
      { text: "AI-powered matching", included: false },
      { text: "Custom integrations", included: false },
      { text: "Priority support", included: false },
      { text: "White-label reports", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    desc: "For growing recruiting teams",
    monthlyPrice: 79,
    yearlyPrice: 66,
    features: [
      { text: "Up to 25 active placements", included: true },
      { text: "Advanced candidate matching", included: true },
      { text: "Email & push notifications", included: true },
      { text: "Priority support", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Advanced analytics", included: true },
      { text: "AI-powered matching", included: true },
      { text: "Standard integrations", included: true },
      { text: "Custom integrations", included: false },
      { text: "White-label reports", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    desc: "For large agencies and teams",
    monthlyPrice: 199,
    yearlyPrice: 166,
    features: [
      { text: "Unlimited placements", included: true },
      { text: "AI-powered matching", included: true },
      { text: "All notification channels", included: true },
      { text: "Dedicated support manager", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Custom analytics & reports", included: true },
      { text: "AI-powered matching", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA guarantees", included: true },
      { text: "White-label reports", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const COMPARISON = [
  { category: "Placements", features: [
    { name: "Active placements", starter: "5", pro: "25", enterprise: "Unlimited" },
    { name: "Placement history", starter: "90 days", pro: "1 year", enterprise: "Unlimited" },
    { name: "Split-fee arrangements", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
  ]},
  { category: "Matching", features: [
    { name: "Candidate matching", starter: "Basic", pro: "Advanced", enterprise: "AI-Powered" },
    { name: "Job recommendations", starter: "5/week", pro: "25/week", enterprise: "Unlimited" },
    { name: "Match score accuracy", starter: "Standard", pro: "Enhanced", enterprise: "Premium" },
  ]},
  { category: "Team", features: [
    { name: "Team members", starter: "1", pro: "10", enterprise: "Unlimited" },
    { name: "Role permissions", starter: "-", pro: "3 roles", enterprise: "Custom roles" },
    { name: "Shared pipelines", starter: "-", pro: "Yes", enterprise: "Yes" },
  ]},
  { category: "Support", features: [
    { name: "Support channels", starter: "Email", pro: "Email + Chat", enterprise: "Dedicated" },
    { name: "Response time", starter: "48h", pro: "4h", enterprise: "1h" },
    { name: "Onboarding", starter: "Self-serve", pro: "Guided", enterprise: "White-glove" },
  ]},
];

const FAQS = [
  { q: "Can I change plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle." },
  { q: "Is there a free trial?", a: "All plans include a 14-day free trial with full access to features. No credit card required." },
  { q: "What happens when I exceed my placement limit?", a: "You will receive a notification and can either upgrade your plan or archive existing placements to free up slots." },
  { q: "Do you offer discounts for annual billing?", a: "Yes, annual billing saves you approximately 17% compared to monthly billing across all plans." },
];

export default function PricingEightPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: E.smooth } });
    tl.from(".pricing-hero", { opacity: 0, y: -30, duration: D.hero })
      .from(".billing-toggle", { opacity: 0, scale: 0.95, duration: D.fast }, "-=0.5")
      .from(".pricing-card", { opacity: 0, y: 40, duration: D.normal, stagger: S.normal }, "-=0.3");

    gsap.from(".comparison-section", {
      scrollTrigger: { trigger: ".comparison-section", start: "top 80%" },
      opacity: 0, y: 40, duration: D.normal, ease: E.smooth,
    });

    gsap.from(".faq-item", {
      scrollTrigger: { trigger: ".faq-section", start: "top 80%" },
      opacity: 0, y: 20, duration: D.fast, stagger: S.tight, ease: E.smooth,
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen text-white" style={{ background: BG.deep }}>
      {/* Blueprint Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner Dimension Marks */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="pricing-hero text-center mb-12">
          <p className="font-mono text-xs text-cyan-400 tracking-[0.3em] uppercase mb-4">// PRICING PLANS</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Build Your Recruiting Engine</h1>
          <p className="text-white/50 font-mono text-sm max-w-lg mx-auto">
            Choose the plan that fits your team. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="billing-toggle flex items-center justify-center gap-4 mb-12">
          <span className={`font-mono text-sm ${billing === "monthly" ? "text-cyan-400" : "text-white/40"}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full transition-colors"
            style={{ backgroundColor: billing === "yearly" ? "#22d3ee" : "rgba(255,255,255,0.15)" }}
          >
            <span
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              style={{ transform: billing === "yearly" ? "translateX(28px)" : "translateX(0)" }}
            />
          </button>
          <span className={`font-mono text-sm ${billing === "yearly" ? "text-cyan-400" : "text-white/40"}`}>
            Yearly
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Save 17%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map(plan => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            return (
              <div
                key={plan.id}
                className={`pricing-card rounded-xl border p-6 relative ${
                  plan.popular ? "border-cyan-400" : "border-cyan-500/20"
                }`}
                style={{ background: BG.card }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-mono text-xs font-bold text-white" style={{ background: "#22d3ee" }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm font-mono">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white font-mono">${price}</span>
                    <span className="text-white/40 font-mono text-sm">/mo</span>
                  </div>
                  {billing === "yearly" && (
                    <p className="text-white/30 text-xs font-mono mt-1">
                      ${price * 12}/year (billed annually)
                    </p>
                  )}
                </div>
                <button
                  className={`w-full py-3 rounded-lg font-mono text-sm font-bold transition-colors mb-6 ${
                    plan.popular
                      ? "text-white hover:opacity-90"
                      : "border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  }`}
                  style={plan.popular ? { background: "#22d3ee" } : {}}
                >
                  {plan.cta}
                </button>
                <div className="space-y-3">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <i className={`fa-duotone fa-regular ${feat.included ? "fa-check text-cyan-400" : "fa-xmark text-white/15"} text-sm w-4 text-center`} />
                      <span className={`text-sm font-mono ${feat.included ? "text-white/70" : "text-white/25"}`}>{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="comparison-section mb-20">
          <div className="text-center mb-8">
            <p className="font-mono text-xs text-cyan-400 tracking-[0.3em] uppercase mb-2">// DETAILED COMPARISON</p>
            <h2 className="text-2xl font-bold text-white">Compare Plans</h2>
          </div>
          <div className="rounded-xl border border-cyan-500/20 overflow-hidden" style={{ background: BG.card }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: BG.dark }}>
                  <th className="p-4 text-left font-mono text-xs text-white/40 uppercase tracking-wider w-1/4">Feature</th>
                  <th className="p-4 text-center font-mono text-xs text-white/40 uppercase tracking-wider">Starter</th>
                  <th className="p-4 text-center font-mono text-xs text-cyan-400 uppercase tracking-wider">Professional</th>
                  <th className="p-4 text-center font-mono text-xs text-white/40 uppercase tracking-wider">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(cat => (
                  <>
                    <tr key={cat.category} style={{ background: BG.input }}>
                      <td colSpan={4} className="p-3 font-mono text-xs text-cyan-400 uppercase tracking-wider">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.features.map((feat, i) => (
                      <tr key={`${cat.category}-${i}`} className="border-t border-cyan-500/10">
                        <td className="p-4 text-white/60 font-mono text-xs">{feat.name}</td>
                        <td className="p-4 text-center text-white/40 font-mono text-xs">{feat.starter}</td>
                        <td className="p-4 text-center text-cyan-400 font-mono text-xs font-medium">{feat.pro}</td>
                        <td className="p-4 text-center text-white/40 font-mono text-xs">{feat.enterprise}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section mb-20">
          <div className="text-center mb-8">
            <p className="font-mono text-xs text-cyan-400 tracking-[0.3em] uppercase mb-2">// FAQ</p>
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="faq-item rounded-lg border border-cyan-500/15 overflow-hidden"
                style={{ background: BG.card }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-white text-sm font-medium">{faq.q}</span>
                  <i className={`fa-duotone fa-regular fa-chevron-down text-cyan-400/50 text-xs transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-white/50 text-sm font-mono">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-xl border border-cyan-500/20 p-12" style={{ background: BG.card }}>
          <p className="font-mono text-xs text-cyan-400 tracking-[0.3em] uppercase mb-3">// READY TO BUILD?</p>
          <h2 className="text-3xl font-bold text-white mb-4">Start your 14-day free trial</h2>
          <p className="text-white/50 font-mono text-sm max-w-md mx-auto mb-6">
            No credit card required. Get full access to all features during your trial period.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 rounded-lg font-mono text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: "#22d3ee" }}>
              Start Free Trial
            </button>
            <button className="px-8 py-3 rounded-lg border border-cyan-500/30 font-mono text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
