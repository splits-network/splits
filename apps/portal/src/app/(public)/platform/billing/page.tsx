import type { Metadata } from "next";
import { BillingAnimator } from "./billing-animator";
import { MemphisZigzag } from "@splits-network/memphis-ui";

export const metadata: Metadata = {
    title: "Billing - Automated Payouts | Splits Network",
    description:
        "Automated billing and payout management for split-fee recruiting. Transparent pricing, instant calculations, and fast Stripe-powered payments.",
};

const features = [
    {
        icon: "fa-duotone fa-regular fa-calculator-simple",
        title: "Auto Calculations",
        description:
            "Platform does the math. Split percentages calculated automatically when placements close.",
        color: "bg-teal-500",
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Stripe Integration",
        description:
            "Fast, secure payouts powered by Stripe. Funds hit your account within 2 business days.",
        color: "bg-coral-500",
    },
    {
        icon: "fa-duotone fa-regular fa-receipt",
        title: "Invoice Management",
        description:
            "Automatic invoice generation for every placement. Download PDFs anytime.",
        color: "bg-yellow-500",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Payment Protection",
        description:
            "Escrow holds funds until terms are met. No payment disputes, no chargebacks.",
        color: "bg-purple-500",
    },
];

const benefits = [
    {
        metric: "100%",
        label: "Automated",
        description: "No manual invoicing or calculations",
        color: "bg-teal-500",
    },
    {
        metric: "2 days",
        label: "Fast Payouts",
        description: "Average payout time via Stripe",
        color: "bg-coral-500",
    },
    {
        metric: "Zero",
        label: "Fee Disputes",
        description: "Terms locked in before work starts",
        color: "bg-yellow-500",
    },
    {
        metric: "Full",
        label: "Transparency",
        description: "Track every dollar from quote to payout",
        color: "bg-purple-500",
    },
];

const useCases = [
    {
        title: "Split-Fee Tracking",
        text: "Track every split from agreement to payout. See pending, processing, and completed payments.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        color: "text-teal-500",
        borderColor: "border-teal-500",
    },
    {
        title: "Commission Management",
        text: "Internal recruiter commissions calculated automatically based on placement value and terms.",
        icon: "fa-duotone fa-regular fa-percentage",
        color: "text-coral-500",
        borderColor: "border-coral-500",
    },
    {
        title: "Client Billing",
        text: "Send professional invoices to hiring companies. Track payment status in real time.",
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        color: "text-yellow-500",
        borderColor: "border-yellow-500",
    },
];

export default function BillingMemphisPage() {
    return (
        <BillingAnimator>
            <section className="billing-hero relative min-h-[90vh] overflow-hidden flex items-center bg-base-950">
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[12%] left-[8%] w-28 h-28 rounded-full border-[6px] border-teal-500 opacity-0" />
                    <div className="memphis-shape absolute top-[65%] right-[10%] w-20 h-20 rounded-full bg-coral-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] left-[15%] w-14 h-14 rounded-full bg-yellow-500 opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[20%] w-20 h-20 rotate-12 bg-purple-500 opacity-0" />
                    <MemphisZigzag
                        color="purple"
                        size="md"
                        className="absolute bottom-[15%] right-[45%] opacity-0"
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-overline inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] bg-teal-500 text-white">
                                <i className="fa-duotone fa-regular fa-file-invoice-dollar"></i>
                                Billing & Payouts
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0 uppercase tracking-tight text-white">
                            Automated{" "}
                            <span className="relative inline-block">
                                <span className="text-teal-500">Payouts</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal-500" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 text-white/80">
                            No more chasing invoices or calculating splits.
                            Automated billing, instant calculations, and fast
                            Stripe payouts.
                        </p>

                        <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/sign-up"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-teal-500 bg-teal-500 text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Get Started
                            </a>
                            <a
                                href="#features"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-white bg-transparent text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-circle-play"></i>
                                See Features
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="features"
                className="billing-features py-24 overflow-hidden bg-base-50"
            >
                <div className="container mx-auto px-4">
                    <div className="features-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal-500 text-white">
                            Features
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-base-950">
                            Billing That{" "}
                            <span className="text-teal-500">Just Works</span>
                        </h2>
                        <p className="text-lg text-base-950/70">
                            No spreadsheets, no manual invoices, no payment
                            disputes. Just automated, transparent billing.
                        </p>
                    </div>

                    <div className="features-grid grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card relative p-8 border-4 border-base-950 bg-white opacity-0"
                            >
                                <div
                                    className={`absolute top-0 right-0 w-16 h-16 ${feature.color}`}
                                />
                                <div className="w-16 h-16 flex items-center justify-center mb-4 border-4 border-base-950">
                                    <i
                                        className={`${feature.icon} text-3xl text-base-950`}
                                    ></i>
                                </div>
                                <h3 className="font-black text-2xl uppercase tracking-wide mb-3 text-base-950">
                                    {feature.title}
                                </h3>
                                <p className="text-base leading-relaxed text-base-950/70">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="billing-benefits py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className={`benefit-block p-8 md:p-12 text-center opacity-0 ${benefit.color} ${benefit.color === "bg-yellow-500" ? "text-base-950" : "text-white"}`}
                        >
                            <div className="benefit-metric text-4xl md:text-6xl font-black mb-2">
                                {benefit.metric}
                            </div>
                            <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em] mb-2">
                                {benefit.label}
                            </div>
                            <div
                                className={`text-sm ${benefit.color === "bg-yellow-500" ? "text-base-950/70" : "text-white/70"}`}
                            >
                                {benefit.description}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="billing-use-cases py-24 overflow-hidden bg-base-950">
                <div className="container mx-auto px-4">
                    <div className="use-cases-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral-500 text-white">
                            Use Cases
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Built For{" "}
                            <span className="text-coral-500">
                                Every Payment Type
                            </span>
                        </h2>
                    </div>

                    <div className="use-cases-grid grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className={`use-case-card relative p-6 border-4 ${useCase.borderColor} bg-white/5 opacity-0`}
                            >
                                <div className="mb-4">
                                    <i
                                        className={`${useCase.icon} text-4xl ${useCase.color}`}
                                    ></i>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-white">
                                    {useCase.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-white/60">
                                    {useCase.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="billing-cta relative py-24 overflow-hidden bg-base-50">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1] text-base-950">
                            Ready For{" "}
                            <span className="text-teal-500">
                                Automated Billing?
                            </span>
                        </h2>
                        <p className="text-xl mb-12 text-base-950/70">
                            Join recruiters who replaced invoicing spreadsheets
                            with automated payouts.
                        </p>
                    </div>

                    <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                        <a
                            href="/sign-up"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-teal-500 bg-teal-500 text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-rocket"></i>
                            Get Started Free
                        </a>
                        <a
                            href="/contact-memphis"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-base-950 bg-transparent text-base-950 transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-comments"></i>
                            Request Demo
                        </a>
                    </div>
                </div>
            </section>
        </BillingAnimator>
    );
}
