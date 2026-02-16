import type { Metadata } from "next";
import { AnalyticsAnimator } from "./analytics-animator";

export const metadata: Metadata = {
    title: "Analytics - Real-Time Insights | Splits Network",
    description:
        "Real-time dashboards and analytics for recruiting teams. Track performance, measure ROI, and make data-driven hiring decisions.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Real-Time Dashboards",
        description: "Live metrics that update as your team works. See pipeline health, placement rates, and revenue at a glance.",
        color: "bg-yellow-500",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Performance Tracking",
        description: "Individual and team metrics. Identify top performers and optimize recruiting workflows.",
        color: "bg-coral-500",
    },
    {
        icon: "fa-duotone fa-regular fa-file-chart-column",
        title: "Custom Reports",
        description: "Build reports that matter to your business. Export data for executive summaries and board meetings.",
        color: "bg-teal-500",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Pipeline Analytics",
        description: "Visualize candidate flow through stages. Spot bottlenecks before they become problems.",
        color: "bg-purple-500",
    },
];

const benefits = [
    {
        metric: "100%",
        label: "Visibility",
        description: "Complete transparency into recruiting operations",
        color: "bg-yellow-500",
    },
    {
        metric: "Live",
        label: "Updates",
        description: "Real-time data, no manual reporting",
        color: "bg-coral-500",
    },
    {
        metric: "60%",
        label: "Time Saved",
        description: "Automated reporting vs manual spreadsheets",
        color: "bg-teal-500",
    },
    {
        metric: "5 sec",
        label: "Load Time",
        description: "Fast dashboards even with thousands of records",
        color: "bg-purple-500",
    },
];

const useCases = [
    {
        title: "Agency Performance",
        text: "Track recruiter productivity, placement rates, and revenue per head across your entire team.",
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        color: "text-yellow-500",
        borderColor: "border-yellow-500",
    },
    {
        title: "Pipeline Health",
        text: "Monitor candidate progression through stages. Identify drop-off points and optimize conversion rates.",
        icon: "fa-duotone fa-regular fa-pipe",
        color: "text-coral-500",
        borderColor: "border-coral-500",
    },
    {
        title: "ROI Reporting",
        text: "Prove recruiting value with hard numbers. Time-to-fill, cost-per-hire, and placement success rates.",
        icon: "fa-duotone fa-regular fa-money-bill-trend-up",
        color: "text-teal-500",
        borderColor: "border-teal-500",
    },
];

const metrics = [
    { label: "Pipeline Status", icon: "fa-duotone fa-regular fa-list-check", color: "text-yellow-500" },
    { label: "Placement Rate", icon: "fa-duotone fa-regular fa-percentage", color: "text-coral-500" },
    { label: "Time to Fill", icon: "fa-duotone fa-regular fa-clock", color: "text-teal-500" },
    { label: "Revenue Per Role", icon: "fa-duotone fa-regular fa-dollar-sign", color: "text-purple-500" },
    { label: "Team Activity", icon: "fa-duotone fa-regular fa-users", color: "text-yellow-500" },
    { label: "Candidate Sources", icon: "fa-duotone fa-regular fa-arrow-right-to-bracket", color: "text-coral-500" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnalyticsMemphisPage() {
    return (
        <AnalyticsAnimator>
            {/* HERO */}
            <section className="analytics-hero relative min-h-[90vh] overflow-hidden flex items-center bg-base-950">
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[12%] left-[8%] w-28 h-28 rounded-full border-[6px] border-yellow-500 opacity-0" />
                    <div className="memphis-shape absolute top-[65%] right-[10%] w-20 h-20 rounded-full bg-coral-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] left-[15%] w-14 h-14 rounded-full bg-teal-500 opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[20%] w-20 h-20 rotate-12 bg-purple-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-4 border-yellow-500 opacity-0" />
                    <div className="memphis-shape absolute top-[50%] left-[25%] w-12 h-12 rotate-45 bg-yellow-500 opacity-0" />
                    <svg className="memphis-shape absolute bottom-[15%] right-[45%] opacity-0" width="100" height="35" viewBox="0 0 100 35">
                        <polyline points="0,25 12,8 25,25 38,8 50,25 62,8 75,25 88,8 100,25" fill="none" stroke="rgb(168 139 250)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-overline inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] bg-yellow-500 text-base-950">
                                <i className="fa-duotone fa-regular fa-chart-mixed"></i>
                                Analytics & Reporting
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0 uppercase tracking-tight text-white">
                            Real-Time{" "}
                            <span className="relative inline-block">
                                <span className="text-yellow-500">Insights</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-yellow-500" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 text-white/80">
                            Dashboards that actually help you recruit better. Live metrics, custom reports, and pipeline analytics.
                        </p>

                        <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/sign-up" className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-yellow-500 bg-yellow-500 text-base-950 transition-transform hover:-translate-y-1 opacity-0">
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                See Your Data
                            </a>
                            <a href="#features" className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-white bg-transparent text-white transition-transform hover:-translate-y-1 opacity-0">
                                <i className="fa-duotone fa-regular fa-circle-play"></i>
                                View Features
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="analytics-features py-24 overflow-hidden bg-base-50">
                <div className="container mx-auto px-4">
                    <div className="features-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow-500 text-base-950">Features</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-base-950">
                            Data That <span className="text-yellow-500">Drives Decisions</span>
                        </h2>
                        <p className="text-lg text-base-950/70">
                            Stop guessing. Start measuring. Every metric you need to run a world-class recruiting operation.
                        </p>
                    </div>

                    <div className="features-grid grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card relative p-8 border-4 border-base-950 bg-white opacity-0">
                                <div className={`absolute top-0 right-0 w-16 h-16 ${feature.color}`} />
                                <div className="w-16 h-16 flex items-center justify-center mb-4 border-4 border-base-950">
                                    <i className={`${feature.icon} text-3xl text-base-950`}></i>
                                </div>
                                <h3 className="font-black text-2xl uppercase tracking-wide mb-3 text-base-950">{feature.title}</h3>
                                <p className="text-base leading-relaxed text-base-950/70">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* METRICS SHOWCASE */}
            <section className="analytics-metrics-showcase py-24 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="metrics-showcase-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral-500 text-white">Track Everything</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-base-950">
                            Metrics That <span className="text-coral-500">Matter</span>
                        </h2>
                    </div>

                    <div className="metrics-grid grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {metrics.map((metric, index) => (
                            <div key={index} className="metric-item relative p-6 border-4 border-base-950 bg-base-50 opacity-0 text-center">
                                <i className={`${metric.icon} text-4xl mb-3 ${metric.color}`}></i>
                                <h3 className="font-black text-sm uppercase tracking-wide text-base-950">{metric.label}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="analytics-benefits py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit, index) => (
                        <div key={index} className={`benefit-block p-8 md:p-12 text-center opacity-0 ${benefit.color} ${benefit.color === "bg-yellow-500" ? "text-base-950" : "text-white"}`}>
                            <div className="benefit-metric text-4xl md:text-6xl font-black mb-2">{benefit.metric}</div>
                            <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em] mb-2">{benefit.label}</div>
                            <div className={`text-sm ${benefit.color === "bg-yellow-500" ? "text-base-950/70" : "text-white/70"}`}>{benefit.description}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* USE CASES */}
            <section className="analytics-use-cases py-24 overflow-hidden bg-base-950">
                <div className="container mx-auto px-4">
                    <div className="use-cases-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal-500 text-white">Use Cases</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Built For <span className="text-teal-500">Data-Driven Teams</span>
                        </h2>
                    </div>

                    <div className="use-cases-grid grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <div key={index} className={`use-case-card relative p-6 border-4 ${useCase.borderColor} bg-white/5 opacity-0`}>
                                <div className="mb-4">
                                    <i className={`${useCase.icon} text-4xl ${useCase.color}`}></i>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-white">{useCase.title}</h3>
                                <p className="text-sm leading-relaxed text-white/60">{useCase.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="analytics-cta relative py-24 overflow-hidden bg-base-50">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-yellow-500" />
                    <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rotate-45 bg-coral-500" />
                    <div className="absolute top-[50%] left-[5%] w-10 h-10 rounded-full bg-teal-500" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1] text-base-950">
                            Ready For <span className="text-yellow-500">Real Insights?</span>
                        </h2>
                        <p className="text-xl mb-12 text-base-950/70">
                            Join teams who replaced spreadsheets with real-time dashboards.
                        </p>
                    </div>

                    <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                        <a href="/sign-up" className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-yellow-500 bg-yellow-500 text-base-950 transition-transform hover:-translate-y-1">
                            <i className="fa-duotone fa-regular fa-rocket"></i>
                            Start Tracking
                        </a>
                        <a href="/public/contact-memphis" className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-base-950 bg-transparent text-base-950 transition-transform hover:-translate-y-1">
                            <i className="fa-duotone fa-regular fa-comments"></i>
                            Request Demo
                        </a>
                    </div>
                </div>
            </section>
        </AnalyticsAnimator>
    );
}
