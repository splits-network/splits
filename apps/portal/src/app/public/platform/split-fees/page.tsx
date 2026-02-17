import type { Metadata } from "next";
import { SplitFeesAnimator } from "./split-fees-animator";
import { MemphisTriangle, MemphisZigzag, MemphisPlus } from "@splits-network/memphis-ui";

export const metadata: Metadata = {
    title: "Split Fees - Fair & Transparent | Splits Network",
    description:
        "Join the split-fee recruiting marketplace. Fair compensation, transparent pricing, and automated calculations. Built for modern recruiters.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: "fa-duotone fa-regular fa-percent",
        title: "Transparent Pricing",
        description: "Every split is clear upfront. No surprises, no hidden fees, no mystery math.",
        color: "bg-teal-500",
    },
    {
        icon: "fa-duotone fa-regular fa-calculator",
        title: "Automatic Calculations",
        description: "Platform handles all the math. Splits calculated automatically based on agreed terms.",
        color: "bg-coral-500",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Protected Agreements",
        description: "Split terms locked in before work starts. No disputes, no renegotiations.",
        color: "bg-yellow-500",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt-lightning",
        title: "Fast Payouts",
        description: "Get paid when placements close. Automated payout processing via Stripe.",
        color: "bg-purple-500",
    },
];

const benefits = [
    {
        metric: "100%",
        label: "Transparent",
        description: "Every fee split documented and visible",
        color: "bg-teal-500",
    },
    {
        metric: "Zero",
        label: "Fee Disputes",
        description: "Terms agreed before work starts",
        color: "bg-coral-500",
    },
    {
        metric: "2 days",
        label: "Avg Payout",
        description: "Fast automated payments via Stripe",
        color: "bg-yellow-500",
    },
    {
        metric: "$12.4K",
        label: "Avg Monthly",
        description: "Average recruiter earnings on platform",
        color: "bg-purple-500",
    },
];

const useCases = [
    {
        title: "Independent Recruiters",
        text: "Access hundreds of roles without client relationships. Get paid fairly for placements.",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "text-teal-500",
        borderColor: "border-teal-500",
    },
    {
        title: "Agency Partnerships",
        text: "Collaborate with other agencies on hard-to-fill roles. Share workload, share fees.",
        icon: "fa-duotone fa-regular fa-handshake-simple",
        color: "text-coral-500",
        borderColor: "border-coral-500",
    },
    {
        title: "Network Recruiting",
        text: "Tap into recruiter networks for specialized roles. Access talent you couldn't reach alone.",
        icon: "fa-duotone fa-regular fa-network-wired",
        color: "text-yellow-500",
        borderColor: "border-yellow-500",
    },
];

const howItWorks = [
    {
        step: "01",
        title: "Browse Roles",
        text: "See available split-fee opportunities from verified companies.",
        icon: "fa-duotone fa-regular fa-search",
        bgColor: "bg-teal-500",
    },
    {
        step: "02",
        title: "Agree on Terms",
        text: "Lock in split percentage before you start recruiting. No surprises.",
        icon: "fa-duotone fa-regular fa-handshake",
        bgColor: "bg-coral-500",
    },
    {
        step: "03",
        title: "Submit Candidates",
        text: "Work your magic. Track every submission in real-time.",
        icon: "fa-duotone fa-regular fa-user-plus",
        bgColor: "bg-yellow-500",
    },
    {
        step: "04",
        title: "Get Paid",
        text: "Placement closes, split calculates automatically, payout hits your account.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        bgColor: "bg-purple-500",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SplitFeesMemphisPage() {
    return (
        <SplitFeesAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="split-hero relative min-h-[90vh] overflow-hidden flex items-center bg-base-950">
                {/* Memphis geometric decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[12%] left-[8%] w-28 h-28 rounded-full border-[6px] border-teal-500 opacity-0" />
                    <div className="memphis-shape absolute top-[65%] right-[10%] w-20 h-20 rounded-full bg-coral-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] left-[15%] w-14 h-14 rounded-full bg-yellow-500 opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[20%] w-20 h-20 rotate-12 bg-purple-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-4 border-teal-500 opacity-0" />
                    <div className="memphis-shape absolute top-[50%] left-[25%] w-12 h-12 rotate-45 bg-teal-500 opacity-0" />
                    <MemphisTriangle color="yellow" size="md" rotation={-15} className="absolute top-[35%] left-[45%] opacity-0" />
                    <MemphisZigzag color="purple" size="md" className="absolute bottom-[15%] right-[45%] opacity-0" />
                    <MemphisPlus color="yellow" size="md" className="absolute top-[75%] left-[38%] opacity-0" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-overline inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] bg-teal-500 text-white">
                                <i className="fa-duotone fa-regular fa-handshake"></i>
                                Split-Fee Marketplace
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0 uppercase tracking-tight text-white">
                            Fair,{" "}
                            <span className="relative inline-block">
                                <span className="text-teal-500">Transparent</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal-500" />
                            </span>{" "}
                            Splits
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 text-white/80">
                            The split-fee marketplace where recruiters get paid what they're worth.
                            No mystery math, no fee disputes.
                        </p>

                        <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/sign-up"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-teal-500 bg-teal-500 text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Join Marketplace
                            </a>
                            <a
                                href="#how-it-works"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-white bg-transparent text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-circle-play"></i>
                                How It Works
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS
               ══════════════════════════════════════════════════════════════ */}
            <section id="how-it-works" className="split-how py-24 overflow-hidden bg-base-50">
                <div className="container mx-auto px-4">
                    <div className="how-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal-500 text-white">
                            How It Works
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-base-950">
                            Four Steps.{" "}
                            <span className="text-teal-500">Fair Payouts.</span>
                        </h2>
                    </div>

                    <div className="how-steps grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {howItWorks.map((step, index) => (
                            <div
                                key={index}
                                className={`how-step-card relative p-6 border-4 border-base-950 bg-white opacity-0`}
                            >
                                <div
                                    className={`absolute -top-5 -left-3 px-3 py-1 text-2xl font-black ${step.bgColor} ${step.bgColor === "bg-yellow-500" ? "text-base-950" : "text-white"}`}
                                >
                                    {step.step}
                                </div>
                                <div className="mt-4 mb-4">
                                    <i className={`${step.icon} text-3xl text-base-950`}></i>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide mb-2 text-base-950">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-base-950/70">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FEATURES
               ══════════════════════════════════════════════════════════════ */}
            <section className="split-features py-24 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="features-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral-500 text-white">
                            Features
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-base-950">
                            Built For{" "}
                            <span className="text-coral-500">Trust</span>
                        </h2>
                        <p className="text-lg text-base-950/70">
                            Every feature designed to protect recruiters and ensure fair compensation.
                        </p>
                    </div>

                    <div className="features-grid grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card relative p-8 border-4 border-base-950 bg-base-50 opacity-0"
                            >
                                <div className={`absolute top-0 right-0 w-16 h-16 ${feature.color}`} />
                                <div className={`w-16 h-16 flex items-center justify-center mb-4 border-4 border-base-950`}>
                                    <i className={`${feature.icon} text-3xl text-base-950`}></i>
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

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS
               ══════════════════════════════════════════════════════════════ */}
            <section className="split-benefits py-0 overflow-hidden">
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
                            <div className={`text-sm ${benefit.color === "bg-yellow-500" ? "text-base-950/70" : "text-white/70"}`}>
                                {benefit.description}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                USE CASES
               ══════════════════════════════════════════════════════════════ */}
            <section className="split-use-cases py-24 overflow-hidden bg-base-950">
                <div className="container mx-auto px-4">
                    <div className="use-cases-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral-500 text-white">
                            Use Cases
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Perfect For{" "}
                            <span className="text-coral-500">Every Recruiter</span>
                        </h2>
                    </div>

                    <div className="use-cases-grid grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className={`use-case-card relative p-6 border-4 ${useCase.borderColor} bg-white/5 opacity-0`}
                            >
                                <div className="mb-4">
                                    <i className={`${useCase.icon} text-4xl ${useCase.color}`}></i>
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

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="split-cta relative py-24 overflow-hidden bg-base-50">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-teal-500" />
                    <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rotate-45 bg-coral-500" />
                    <div className="absolute top-[50%] left-[5%] w-10 h-10 rounded-full bg-yellow-500" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1] text-base-950">
                            Ready For{" "}
                            <span className="text-teal-500">Fair Splits?</span>
                        </h2>
                        <p className="text-xl mb-12 text-base-950/70">
                            Join the marketplace where recruiters get paid what they deserve.
                        </p>
                    </div>

                    <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                        <a
                            href="/sign-up"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-teal-500 bg-teal-500 text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-rocket"></i>
                            Join Now
                        </a>
                        <a
                            href="/public/contact-memphis"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-base-950 bg-transparent text-base-950 transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-comments"></i>
                            Learn More
                        </a>
                    </div>
                </div>
            </section>
        </SplitFeesAnimator>
    );
}
