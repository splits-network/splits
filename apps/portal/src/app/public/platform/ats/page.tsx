import type { Metadata } from "next";
import { ATSAnimator } from "./ats-animator";
import { MemphisTriangle, MemphisZigzag, MemphisPlus } from "@splits-network/memphis-ui";

export const metadata: Metadata = {
    title: "ATS - Applicant Tracking System | Splits Network",
    description:
        "Track every candidate with our built-in ATS. Manage pipelines, organize applications, and collaborate with your team in real time.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Pipeline Management",
        description: "Visual kanban boards that show exactly where every candidate stands. Drag, drop, done.",
        color: "bg-coral-500",
    },
    {
        icon: "fa-duotone fa-regular fa-user-group",
        title: "Candidate Profiles",
        description: "Complete profiles with resumes, notes, interview history, and communication logs in one place.",
        color: "bg-teal-500",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Team Collaboration",
        description: "Internal notes, @mentions, and activity feeds keep everyone synchronized.",
        color: "bg-yellow-500",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "Quick Actions",
        description: "Send emails, schedule interviews, and update statuses without leaving the page.",
        color: "bg-purple-500",
    },
];

const benefits = [
    {
        metric: "73%",
        label: "Faster Hiring",
        description: "Cut time-to-hire with streamlined workflows",
        color: "bg-coral-500",
    },
    {
        metric: "Zero",
        label: "Lost Candidates",
        description: "Every application tracked, nothing falls through cracks",
        color: "bg-teal-500",
    },
    {
        metric: "100%",
        label: "Visibility",
        description: "Complete transparency for recruiters and hiring managers",
        color: "bg-yellow-500",
    },
    {
        metric: "5 min",
        label: "Setup Time",
        description: "No complex configuration, start tracking immediately",
        color: "bg-purple-500",
    },
];

const useCases = [
    {
        title: "High-Volume Recruiting",
        text: "Manage hundreds of candidates across dozens of roles without losing track.",
        icon: "fa-duotone fa-regular fa-users-line",
        color: "text-coral-500",
        borderColor: "border-coral-500",
    },
    {
        title: "Agency Collaboration",
        text: "Multiple recruiters working the same role? No problem. Real-time sync keeps everyone aligned.",
        icon: "fa-duotone fa-regular fa-handshake",
        color: "text-teal-500",
        borderColor: "border-teal-500",
    },
    {
        title: "Split-Fee Tracking",
        text: "Built-in integration with split-fee marketplace. Track placements and earnings in one system.",
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        color: "text-yellow-500",
        borderColor: "border-yellow-500",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ATSMemphisPage() {
    return (
        <ATSAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="ats-hero relative min-h-[90vh] overflow-hidden flex items-center bg-base-950">
                {/* Memphis geometric decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Circles */}
                    <div className="memphis-shape absolute top-[12%] left-[8%] w-28 h-28 rounded-full border-[6px] border-coral-500 opacity-0" />
                    <div className="memphis-shape absolute top-[65%] right-[10%] w-20 h-20 rounded-full bg-teal-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] left-[15%] w-14 h-14 rounded-full bg-yellow-500 opacity-0" />

                    {/* Squares */}
                    <div className="memphis-shape absolute top-[25%] right-[20%] w-20 h-20 rotate-12 bg-purple-500 opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-4 border-coral-500 opacity-0" />
                    <div className="memphis-shape absolute top-[50%] left-[25%] w-12 h-12 rotate-45 bg-coral-500 opacity-0" />

                    {/* Triangles */}
                    <MemphisTriangle color="yellow" size="md" rotation={-15} className="absolute top-[35%] left-[45%] opacity-0" />

                    {/* Zigzag */}
                    <MemphisZigzag color="purple" size="md" className="absolute bottom-[15%] right-[45%] opacity-0" />

                    {/* Plus signs */}
                    <MemphisPlus color="yellow" size="md" className="absolute top-[75%] left-[38%] opacity-0" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Overline badge */}
                        <div className="hero-overline inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] bg-coral-500 text-white">
                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                Applicant Tracking System
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0 uppercase tracking-tight text-white">
                            Track{" "}
                            <span className="relative inline-block">
                                <span className="text-coral-500">Every</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral-500" />
                            </span>{" "}
                            Candidate
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 text-white/80">
                            Built-in ATS that actually works. Manage pipelines, track applications,
                            and never lose a candidate again.
                        </p>

                        <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/sign-up"
                                className="hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-coral-500 bg-coral-500 text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Start Tracking Free
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

            {/* ══════════════════════════════════════════════════════════════
                FEATURES
               ══════════════════════════════════════════════════════════════ */}
            <section id="features" className="ats-features py-24 overflow-hidden bg-base-50">
                <div className="container mx-auto px-4">
                    <div className="features-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral-500 text-white">
                            Features
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-base-950">
                            Everything You Need,{" "}
                            <span className="text-coral-500">Nothing You Don't</span>
                        </h2>
                        <p className="text-lg text-base-950/70">
                            No bloat, no complexity. Just the tools you actually need to track candidates.
                        </p>
                    </div>

                    <div className="features-grid grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card relative p-8 border-4 border-base-950 bg-white opacity-0"
                            >
                                {/* Corner accent */}
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
            <section className="ats-benefits py-0 overflow-hidden">
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
            <section className="ats-use-cases py-24 overflow-hidden bg-base-950">
                <div className="container mx-auto px-4">
                    <div className="use-cases-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal-500 text-white">
                            Use Cases
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Built For{" "}
                            <span className="text-teal-500">Real Recruiters</span>
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
            <section className="ats-cta relative py-24 overflow-hidden bg-base-50">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-coral-500" />
                    <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rotate-45 bg-teal-500" />
                    <div className="absolute top-[50%] left-[5%] w-10 h-10 rounded-full bg-yellow-500" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1] text-base-950">
                            Ready To{" "}
                            <span className="text-coral-500">Track Smarter?</span>
                        </h2>
                        <p className="text-xl mb-12 text-base-950/70">
                            Join thousands of recruiters who never lose a candidate.
                        </p>
                    </div>

                    <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                        <a
                            href="/sign-up"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-coral-500 bg-coral-500 text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-rocket"></i>
                            Get Started Free
                        </a>
                        <a
                            href="/public/contact-memphis"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 border-base-950 bg-transparent text-base-950 transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-comments"></i>
                            Talk to Sales
                        </a>
                    </div>
                </div>
            </section>
        </ATSAnimator>
    );
}
