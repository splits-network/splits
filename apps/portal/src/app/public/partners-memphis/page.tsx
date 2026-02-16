import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { PartnersAnimator } from "./partners-animator";

export const metadata: Metadata = {
    title: "Partners | Splits Network",
    description:
        "Partner with Splits Network to expand your recruiting reach, access powerful APIs, co-market roles, and unlock shared revenue across the network.",
    openGraph: {
        title: "Partners | Splits Network",
        description:
            "Partner with Splits Network to expand your recruiting reach, access powerful APIs, co-market roles, and unlock shared revenue across the network.",
        url: "https://splits.network/public/partners-memphis",
    },
    ...buildCanonical("/public/partners-memphis"),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    { value: "200+", label: "Active Partner Organizations", accent: "coral" },
    { value: "3.8x", label: "Faster Integration Than Industry Avg", accent: "teal" },
    { value: "$12M+", label: "Partner Revenue Shared Annually", accent: "yellow" },
    { value: "99.9%", label: "Platform Uptime Guarantee", accent: "purple" },
];

const partnerTypes = [
    {
        icon: "fa-duotone fa-regular fa-microchip",
        title: "Technology Partners",
        description:
            "Integrate your ATS, CRM, or HR tools with our open API. Reach thousands of recruiters through our marketplace and build workflow automations that drive adoption.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Recruiting Networks",
        description:
            "White-label split-fee capabilities for your existing network. Give your recruiters access to a shared marketplace while maintaining your brand and revenue model.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-plug",
        title: "Integration Partners",
        description:
            "Build on our platform with webhooks, real-time events, and candidate data sync. Create custom integrations that solve real workflow problems for recruiting teams.",
        accent: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Agency Partners",
        description:
            "Established recruiting firms that want to expand into split-fee placements. Access roles beyond your client base and earn from collaborative fills across the network.",
        accent: "purple",
    },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Revenue Share",
        description: "Earn recurring commissions on every recruiter and firm you bring to the platform. Transparent payouts, no minimums.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "API Access",
        description: "Full REST API with webhooks, real-time events, and sandbox environments. Build integrations your users will actually use.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Co-Marketing",
        description: "Joint case studies, featured placement in our partner directory, and co-branded campaigns that drive leads for both sides.",
        accent: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-headset",
        title: "Priority Support",
        description: "Dedicated partner success manager, priority ticket queue, and quarterly business reviews to keep growth on track.",
        accent: "purple",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Training Programs",
        description: "Onboarding bootcamps, certification tracks, and sales enablement materials so your team hits the ground running.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Analytics Dashboard",
        description: "Real-time visibility into referral performance, integration usage, and revenue metrics across your entire partner portfolio.",
        accent: "teal",
    },
];

const processSteps = [
    {
        number: "01",
        title: "Apply",
        description: "Submit your partner application. Tell us about your organization, your goals, and how you see the partnership working.",
        accent: "coral",
    },
    {
        number: "02",
        title: "Align",
        description: "Meet with our partnerships team for a discovery call. We map out integration points, revenue models, and launch timeline.",
        accent: "teal",
    },
    {
        number: "03",
        title: "Launch",
        description: "Sign the agreement, complete onboarding, and go live. Dedicated support from day one through first revenue milestone.",
        accent: "yellow",
    },
];

// ─── Accent helpers ──────────────────────────────────────────────────────────

const accentStyles: Record<string, { bg: string; border: string; text: string; bgLight: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error", bgLight: "bg-error/10" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success", bgLight: "bg-success/10" },
    yellow: { bg: "bg-warning", border: "border-warning", text: "text-warning", bgLight: "bg-warning/10" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary", bgLight: "bg-secondary/10" },
};

const statBg: Record<string, string> = {
    coral: "bg-error text-error-content",
    teal: "bg-success text-success-content",
    yellow: "bg-warning text-warning-content",
    purple: "bg-secondary text-secondary-content",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PartnersMemphisPage() {
    return (
        <PartnersAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-hero relative min-h-[70vh] overflow-hidden flex items-center bg-base-300">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-24 h-24 rounded-full border-[5px] border-error opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[8%] w-20 h-20 rounded-full bg-success opacity-0" />
                    <div className="memphis-shape absolute bottom-[14%] left-[18%] w-12 h-12 rounded-full bg-warning opacity-0" />
                    <div className="memphis-shape absolute top-[20%] right-[22%] w-16 h-16 rotate-12 bg-secondary opacity-0" />
                    <div className="memphis-shape absolute bottom-[28%] right-[32%] w-24 h-10 -rotate-6 border-[4px] border-error opacity-0" />
                    <div className="memphis-shape absolute top-[38%] left-[28%] w-10 h-10 rotate-45 bg-error opacity-0" />
                    {/* Triangle */}
                    <svg className="memphis-shape absolute top-[16%] left-[42%] opacity-0" width="50" height="43" viewBox="0 0 50 43">
                        <polygon points="25,0 50,43 0,43" className="fill-warning" transform="rotate(-10 25 21.5)" />
                    </svg>
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[18%] right-[42%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-success" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[68%] left-[38%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[62%] left-[7%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" className="stroke-warning" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" className="stroke-warning" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="hero-badge mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                <i className="fa-duotone fa-regular fa-handshake"></i>
                                Partner Ecosystem
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                            Build The Future{" "}
                            <span className="relative inline-block">
                                <span className="text-error">Together</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-error" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-base-content/70 opacity-0">
                            Splits Network is more than a platform -- it&apos;s an ecosystem.
                            Whether you&apos;re a recruiting network, technology vendor, or agency,
                            there&apos;s a partnership model that turns collaboration into revenue.
                        </p>

                        <div className="hero-cta flex flex-wrap items-center gap-4 opacity-0">
                            <a href="mailto:partnerships@splits.network"
                                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-error bg-error text-error-content transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Become A Partner
                            </a>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50">
                                <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                Response within 48 hours
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${statBg[stat.accent]}`}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PARTNER TYPES — 2x2 Grid
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-types py-20 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="types-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                Partner Types
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                Find Your{" "}
                                <span className="text-error">Fit</span>
                            </h2>
                        </div>

                        <div className="types-grid grid md:grid-cols-2 gap-6">
                            {partnerTypes.map((type, index) => {
                                const a = accentStyles[type.accent];
                                return (
                                    <div key={index}
                                        className={`type-card relative p-6 md:p-8 border-4 ${a.border} bg-base-100 opacity-0`}>
                                        <div className={`absolute top-0 right-0 w-10 h-10 ${a.bg}`} />
                                        <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${a.border}`}>
                                            <i className={`${type.icon} text-2xl ${a.text}`}></i>
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-base-content">
                                            {type.title}
                                        </h3>
                                        <p className="text-base leading-relaxed text-base-content/75">
                                            {type.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-pullquote py-16 overflow-hidden bg-base-300">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-success opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-success">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-base-content">
                            A recruiting platform is only as powerful as the
                            ecosystem around it. Partners don&apos;t just extend
                            our reach -- they multiply it.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-success">
                            <span className="text-sm font-bold uppercase tracking-wider text-success">
                                -- Splits Network Partnerships
                            </span>
                        </div>
                        <div className="absolute top-0 right-0 w-10 h-10 bg-success" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                WHY PARTNER — Benefits Grid (2x3)
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-benefits py-20 overflow-hidden bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="benefits-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                Why Partner
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                What You{" "}
                                <span className="text-warning">Get</span>
                            </h2>
                        </div>

                        <div className="benefits-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {benefits.map((benefit, index) => {
                                const a = accentStyles[benefit.accent];
                                return (
                                    <div key={index}
                                        className={`benefit-card relative p-6 border-4 ${a.border} bg-base-100 opacity-0`}>
                                        <div className={`absolute top-0 right-0 w-8 h-8 ${a.bg}`} />
                                        <div className={`w-12 h-12 flex items-center justify-center mb-4 border-4 ${a.border}`}>
                                            <i className={`${benefit.icon} text-xl ${a.text}`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {benefit.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS — 3-Step Process
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-process py-20 overflow-hidden bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="process-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                How It Works
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                Three Steps To{" "}
                                <span className="text-secondary">Partnership</span>
                            </h2>
                        </div>

                        <div className="process-steps grid md:grid-cols-3 gap-8">
                            {processSteps.map((step, index) => {
                                const a = accentStyles[step.accent];
                                return (
                                    <div key={index} className="process-step opacity-0">
                                        {/* Step number */}
                                        <div className={`w-20 h-20 flex items-center justify-center mb-6 border-4 ${a.border} ${a.bg}`}>
                                            <span className="text-3xl font-black text-base-100">
                                                {step.number}
                                            </span>
                                        </div>

                                        <h3 className={`font-black text-xl uppercase tracking-wide mb-3 ${a.text}`}>
                                            {step.title}
                                        </h3>

                                        <p className="text-base leading-relaxed text-base-content/70">
                                            {step.description}
                                        </p>

                                        {/* Connector line (not on last) */}
                                        {index < processSteps.length - 1 && (
                                            <div className="hidden md:block absolute top-10 right-0 translate-x-1/2">
                                                <div className={`w-8 h-1 ${a.bg} opacity-30`} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="partners-cta relative py-24 overflow-hidden bg-base-300">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-error" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-success" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-warning" />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-error text-error-content">
                            Get Started
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                            Become A{" "}
                            <span className="text-error">Partner</span>
                        </h2>
                        <p className="text-lg mb-10 text-base-content/70">
                            Join the ecosystem powering the next generation of
                            collaborative recruiting. Apply today and start
                            building together.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Technology */}
                        <div className="cta-card p-6 border-4 border-error text-center bg-base-300/50 opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-error">
                                <i className="fa-duotone fa-regular fa-microchip text-xl text-error-content"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-base-content">
                                Technology
                            </h3>
                            <p className="text-xs mb-5 text-base-content/60">
                                Integrate your tools with our API
                            </p>
                            <a href="mailto:partnerships@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-error border-error text-error-content">
                                Apply Now
                            </a>
                        </div>

                        {/* Networks */}
                        <div className="cta-card p-6 border-4 border-warning text-center bg-base-300/50 opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-warning">
                                <i className="fa-duotone fa-regular fa-network-wired text-xl text-warning-content"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-base-content">
                                Networks
                            </h3>
                            <p className="text-xs mb-5 text-base-content/60">
                                White-label for your recruiters
                            </p>
                            <a href="mailto:partnerships@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-warning border-warning text-warning-content">
                                Apply Now
                            </a>
                        </div>

                        {/* Agencies */}
                        <div className="cta-card p-6 border-4 border-success text-center bg-base-300/50 opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-success">
                                <i className="fa-duotone fa-regular fa-building text-xl text-success-content"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-base-content">
                                Agencies
                            </h3>
                            <p className="text-xs mb-5 text-base-content/60">
                                Expand into split-fee placements
                            </p>
                            <a href="mailto:partnerships@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-success border-success text-success-content">
                                Apply Now
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-base-content/50">
                            Questions about partnership opportunities?
                        </p>
                        <a href="mailto:partnerships@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-warning">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            partnerships@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </PartnersAnimator>
    );
}
