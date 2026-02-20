"use client";

import { HowItWorksAnimator } from "./how-it-works-animator";

// Memphis accent cycling (coral → teal → yellow → purple)
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

const PROCESS_STEPS = [
    {
        number: "01",
        title: "Create Your Profile",
        subtitle: "Get Set Up in Minutes",
        icon: "fa-user-plus",
        description:
            "Sign up with your email or social account. Build your professional profile with work history, skills, and career goals. Upload your resume or let us parse your LinkedIn profile.",
        features: [
            "Quick sign-up with email or social login",
            "Resume upload and auto-parsing",
            "LinkedIn profile import",
            "Skills and preferences setup",
        ],
        time: "5 minutes",
    },
    {
        number: "02",
        title: "Browse The Marketplace",
        subtitle: "Find Roles That Fit",
        icon: "fa-briefcase",
        description:
            "Search thousands of verified job listings from real companies. Filter by location, salary, role type, and company culture. Save jobs you like and set up alerts for new postings.",
        features: [
            "Advanced search with filters",
            "Save jobs to favorites",
            "Custom job alerts via email",
            "Company culture insights",
        ],
        time: "Ongoing",
    },
    {
        number: "03",
        title: "Apply & Get Matched",
        subtitle: "Recruiters Come to You",
        icon: "fa-paper-plane",
        description:
            "Apply with one click using your profile. Our AI matches you with specialized recruiters who know your industry. Recruiters pitch your profile to hiring managers and negotiate on your behalf.",
        features: [
            "One-click applications",
            "AI-powered recruiter matching",
            "Multiple recruiters per job",
            "Insider company insights",
        ],
        time: "1-3 days",
    },
    {
        number: "04",
        title: "Interview Coordination",
        subtitle: "We Handle the Logistics",
        icon: "fa-calendar-check",
        description:
            "Your matched recruiter coordinates interviews directly with the hiring team. Get prep materials, practice questions, and feedback after each round. Track all your interviews in one dashboard.",
        features: [
            "Centralized interview scheduling",
            "Interview prep materials",
            "Post-interview feedback",
            "Real-time application tracking",
        ],
        time: "1-4 weeks",
    },
    {
        number: "05",
        title: "Offer & Placement",
        subtitle: "Close the Deal",
        icon: "fa-handshake",
        description:
            "Receive and review offers in your dashboard. Your recruiter helps negotiate salary, benefits, and start dates. Accept your offer and celebrate your new role — we handle the rest.",
        features: [
            "Offer comparison tools",
            "Salary negotiation support",
            "Benefits review and guidance",
            "Onboarding coordination",
        ],
        time: "1-2 weeks",
    },
    {
        number: "06",
        title: "Long-Term Success",
        subtitle: "We're Here for Your Career",
        icon: "fa-chart-line",
        description:
            "Track your career growth and milestones. Get matched with mentors and upskilling opportunities. Return to the marketplace anytime you're ready for your next move.",
        features: [
            "Career milestone tracking",
            "Mentor matching program",
            "Upskilling recommendations",
            "Future job opportunities",
        ],
        time: "Your career",
    },
];

const SUCCESS_METRICS = [
    {
        value: "12 days",
        label: "Average Time to Offer",
        accent: "coral",
    },
    {
        value: "3.5x",
        label: "More Interview Requests",
        accent: "teal",
    },
    {
        value: "94%",
        label: "Candidate Satisfaction",
        accent: "yellow",
    },
    {
        value: "$15k+",
        label: "Average Salary Increase",
        accent: "purple",
    },
];

const BENEFITS = [
    {
        title: "Multiple Recruiters Per Job",
        icon: "fa-users",
        description:
            "Get 3-5 recruiters competing to place you. More visibility, more interviews, better odds.",
    },
    {
        title: "Transparent Pricing",
        icon: "fa-badge-dollar",
        description:
            "Always free for candidates. Companies and recruiters split the placement fee — you keep 100% of your salary.",
    },
    {
        title: "Full Application Visibility",
        icon: "fa-eye",
        description:
            "Track every application in real time. See which recruiters viewed your profile and when companies respond.",
    },
    {
        title: "AI-Powered Matching",
        icon: "fa-sparkles",
        description:
            "Our AI analyzes your skills, experience, and preferences to match you with the best-fit roles and recruiters.",
    },
];

export default function HowItWorksMemphisClient() {
    return (
        <HowItWorksAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="how-hero relative min-h-[60vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-28 h-28 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[8%] w-24 h-24 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] left-[18%] w-16 h-16 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[25%] w-20 h-20 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[35%] right-[35%] w-28 h-12 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] left-[22%] w-12 h-12 rotate-45 bg-coral opacity-0" />
                    <svg
                        className="memphis-shape absolute bottom-[10%] right-[48%] opacity-0 stroke-purple"
                        width="100"
                        height="35"
                        viewBox="0 0 100 35"
                    >
                        <polyline
                            points="0,28 12,8 24,28 36,8 48,28 60,8 72,28 84,8 96,28"
                            fill="none"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                    <svg
                        className="memphis-shape absolute top-[68%] left-[40%] opacity-0 stroke-yellow"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                    >
                        <line
                            x1="20"
                            y1="4"
                            x2="20"
                            y2="36"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <line
                            x1="4"
                            y1="20"
                            x2="36"
                            y2="20"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-white">
                                <i className="fa-duotone fa-regular fa-map"></i>
                                The Process
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 text-white">
                            HERE'S HOW IT{" "}
                            <span className="text-coral">WORKS</span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-8 opacity-0 text-white/70">
                            From profile creation to job placement — the
                            complete step-by-step guide to landing your next
                            role. We've made the process simple, transparent,
                            and candidate-first.
                        </p>

                        <div className="hero-stat inline-flex items-center gap-2 px-4 py-2 border-4 border-purple text-xs font-bold uppercase tracking-wider opacity-0 text-white/60">
                            <i className="fa-duotone fa-regular fa-clock text-purple"></i>
                            <span>From sign-up to offer in 2-4 weeks</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PROCESS STEPS
               ══════════════════════════════════════════════════════════════ */}
            <section className="process-steps py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="process-intro text-center mb-16 opacity-0">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-dark text-white">
                                Six Steps
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Your <span className="text-teal">Journey</span>{" "}
                                Starts Here
                            </h2>
                        </div>

                        {/* Steps */}
                        <div className="space-y-12">
                            {PROCESS_STEPS.map((step, idx) => {
                                const accent = accentAt(idx);
                                const isEven = idx % 2 === 0;

                                return (
                                    <div
                                        key={step.number}
                                        className={`process-step relative opacity-0 ${
                                            isEven ? "text-left" : "text-right"
                                        }`}
                                    >
                                        <div
                                            className={`grid lg:grid-cols-12 gap-8 items-center ${
                                                isEven
                                                    ? ""
                                                    : "lg:grid-flow-dense"
                                            }`}
                                        >
                                            {/* Number Badge */}
                                            <div
                                                className={`lg:col-span-2 flex ${
                                                    isEven
                                                        ? "justify-start"
                                                        : "justify-end"
                                                }`}
                                            >
                                                <div
                                                    className={`step-number w-24 h-24 flex items-center justify-center border-4 border-${accent} bg-white`}
                                                >
                                                    <span className="text-3xl font-black text-dark">
                                                        {step.number}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content Card */}
                                            <div
                                                className={`lg:col-span-10 relative p-8 border-4 border-dark bg-white ${
                                                    isEven
                                                        ? "lg:col-start-3"
                                                        : "lg:col-start-1 lg:row-start-1"
                                                }`}
                                            >
                                                {/* Corner accent */}
                                                <div
                                                    className={`absolute top-0 ${
                                                        isEven
                                                            ? "right-0"
                                                            : "left-0"
                                                    } w-16 h-16 bg-${accent}`}
                                                />

                                                <div className="relative">
                                                    {/* Time badge */}
                                                    <div className="mb-4">
                                                        <span
                                                            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] bg-${accent} text-${accent === "yellow" ? "dark" : "white"}`}
                                                        >
                                                            <i className="fa-duotone fa-regular fa-clock"></i>
                                                            {step.time}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <div className="mb-4">
                                                        <h3
                                                            className={`text-2xl md:text-3xl font-black uppercase tracking-tight text-dark ${isEven ? "text-left" : "lg:text-right"}`}
                                                        >
                                                            <i
                                                                className={`fa-duotone fa-regular ${step.icon} text-${accent} mr-2`}
                                                            ></i>
                                                            {step.title}
                                                        </h3>
                                                        <p
                                                            className={`text-base font-bold uppercase tracking-wide text-dark/40 ${isEven ? "text-left" : "lg:text-right"}`}
                                                        >
                                                            {step.subtitle}
                                                        </p>
                                                    </div>

                                                    {/* Description */}
                                                    <p
                                                        className={`text-base leading-relaxed text-dark/70 mb-6 ${isEven ? "text-left" : "lg:text-right"}`}
                                                    >
                                                        {step.description}
                                                    </p>

                                                    {/* Features Grid */}
                                                    <div
                                                        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isEven ? "text-left" : "lg:text-right"}`}
                                                    >
                                                        {step.features.map(
                                                            (feature, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`flex items-start gap-2 ${isEven ? "" : "lg:flex-row-reverse"}`}
                                                                >
                                                                    <i
                                                                        className={`fa-duotone fa-regular fa-check-circle text-${accent} mt-1 flex-shrink-0`}
                                                                    ></i>
                                                                    <span className="text-sm font-medium text-dark">
                                                                        {
                                                                            feature
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SUCCESS METRICS
               ══════════════════════════════════════════════════════════════ */}
            <section className="success-metrics py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {SUCCESS_METRICS.map((metric, idx) => (
                        <div
                            key={idx}
                            className={`metric-block p-8 md:p-12 text-center opacity-0 bg-${metric.accent} ${metric.accent === "yellow" ? "text-dark" : "text-white"}`}
                        >
                            <div className="metric-value text-4xl md:text-6xl font-black mb-2">
                                {metric.value}
                            </div>
                            <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                                {metric.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS
               ══════════════════════════════════════════════════════════════ */}
            <section className="benefits-section py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="benefits-intro text-center mb-16 opacity-0">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-purple text-white">
                                What Makes Us Different
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                Candidate-First{" "}
                                <span className="text-coral">Platform</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {BENEFITS.map((benefit, idx) => {
                                const accent = accentAt(idx);

                                return (
                                    <div
                                        key={idx}
                                        className={`benefit-card relative p-8 border-4 border-${accent} bg-white opacity-0`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-12 h-12 bg-${accent}`}
                                        />

                                        <div className="relative">
                                            <div
                                                className={`w-16 h-16 flex items-center justify-center bg-${accent} mb-4`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${benefit.icon} text-2xl ${accent === "yellow" ? "text-dark" : "text-white"}`}
                                                ></i>
                                            </div>

                                            <h3 className="text-xl font-black uppercase tracking-tight text-dark mb-3">
                                                {benefit.title}
                                            </h3>

                                            <p className="text-base leading-relaxed text-dark/70">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOOTER CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="how-cta relative py-20 overflow-hidden bg-cream">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-20 h-20 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[20%] left-[12%] w-16 h-16 rotate-45 bg-teal" />
                    <div className="absolute top-[60%] left-[8%] w-12 h-12 rounded-full bg-yellow" />
                    <div className="absolute bottom-[35%] right-[15%] w-14 h-14 rotate-12 bg-purple" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 text-dark">
                            Ready to <span className="text-teal">Start</span>?
                        </h2>
                        <p className="text-lg mb-8 text-dark/60">
                            Create your profile in 5 minutes and start browsing
                            jobs today. No commitments, no fees — just
                            opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/sign-up"
                                className="btn btn-coral btn-lg uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Your Profile
                            </a>
                            <a
                                href="/jobs"
                                className="btn btn-outline-dark btn-lg uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                Browse Jobs First
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </HowItWorksAnimator>
    );
}
