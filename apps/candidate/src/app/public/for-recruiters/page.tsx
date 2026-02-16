import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/lib/seo";
import { ForRecruitersAnimator } from "./for-recruiters-animator";

export const metadata: Metadata = {
    title: "For Recruiters | Candidate Network",
    description:
        "Access high-quality candidates ready to be placed. Transparent fees, fast placements, and verified profiles. Join recruiters earning more through our candidate marketplace.",
    openGraph: {
        title: "For Recruiters | Candidate Network",
        description:
            "Access high-quality candidates ready to be placed. Transparent fees, fast placements, and verified profiles.",
        url: "https://applicant.network/public/for-recruiters-memphis",
    },
    ...buildCanonical("/public/for-recruiters-memphis"),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    { value: "85%", label: "Candidate Response Rate" },
    { value: "7 Days", label: "Average Time to Interview" },
    { value: "12,000+", label: "Verified Profiles" },
    { value: "94%", label: "Placement Success Rate" },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Quality Candidate Pool",
        text: "Every profile is verified. Candidates actively seeking opportunities. No fake profiles or outdated resumes cluttering your pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Transparent Fee Structure",
        text: "Know your earnings upfront. No hidden deductions. Fee percentages visible before you engage. Automated payouts on verified placements.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Fast Placement Process",
        text: "Candidates respond faster when they control their profiles. Real-time availability updates. Direct communication channels built in.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Success Rate Metrics",
        text: "Track which candidates convert to interviews and placements. Data-driven insights to improve your hit rate and earnings.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-check",
        title: "Verified Profiles Only",
        text: "Email verification, work history validation, and skill assessments ensure you're working with real, qualified candidates.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "AI-Powered Matching",
        text: "Our system surfaces candidates that match your active roles. Spend less time searching, more time placing.",
    },
];

const howSteps = [
    {
        number: "01",
        title: "Search the Candidate Database",
        text: "Filter by skills, location, salary requirements, and availability. Advanced search brings the right profiles to the top.",
        icon: "fa-duotone fa-regular fa-magnifying-glass",
    },
    {
        number: "02",
        title: "Connect Directly",
        text: "Message candidates through the platform. No gatekeepers. No waiting. Candidates are notified instantly and respond fast.",
        icon: "fa-duotone fa-regular fa-messages",
    },
    {
        number: "03",
        title: "Place and Earn",
        text: "When placements close, fees are split automatically. Track your pipeline, monitor success rates, and scale your earnings.",
        icon: "fa-duotone fa-regular fa-money-bill-wave",
    },
];

const testimonials = [
    {
        quote: "Candidate quality is night and day compared to job boards. These profiles are real, verified, and actively looking. We filled three roles in two weeks.",
        author: "Sarah Mitchell",
        role: "Independent Recruiter",
    },
    {
        quote: "Transparent fees and fast payouts changed how I operate. No more chasing invoices or wondering what my cut will be. Everything is upfront.",
        author: "Marcus Chen",
        role: "Tech Recruiting Specialist",
    },
    {
        quote: "The AI matching is scary good. It surfaces candidates I would have missed in manual searches. My placement rate doubled in three months.",
        author: "Jennifer Rodriguez",
        role: "Healthcare Recruiter",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForRecruitersMemphisPage() {
    return (
        <ForRecruitersAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[75vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle */}
                    <svg className="memphis-shape absolute top-[18%] left-[45%] opacity-0" width="50" height="43" viewBox="0 0 50 43">
                        <polygon points="25,0 50,43 0,43" className="fill-yellow" transform="rotate(-10 25 21.5)" />
                    </svg>
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[20%] right-[45%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" className="stroke-yellow" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" className="stroke-yellow" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="hero-tag flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-cream">
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                For Recruiters
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                            HERE&apos;S WHY RECRUITERS{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">CHOOSE US</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            Quality candidates. Transparent fees. Fast placements. No gatekeepers
                            between you and the talent you need. Access 12,000+ verified profiles
                            actively seeking opportunities. Know your earnings upfront. Get paid
                            when placements close. This is recruiting done right.
                        </p>

                        <div className="hero-cta opacity-0">
                            <Link href="/sign-up"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-sm transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                Access Candidates Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="recruiters-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => {
                        const colors = [
                            "bg-coral text-cream",
                            "bg-teal text-cream",
                            "bg-yellow text-dark",
                            "bg-purple text-cream",
                        ];
                        return (
                            <div key={index}
                                className={`stat-block p-6 md:p-8 text-center opacity-0 ${colors[index]}`}>
                                <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="benefits-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="benefits-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Competitive Advantages
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Why Recruiters{" "}
                                <span className="text-teal">Win Here</span>
                            </h2>
                        </div>

                        <div className="benefits-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {benefits.map((benefit, index) => {
                                const borderColors = [
                                    "border-coral",
                                    "border-teal",
                                    "border-purple",
                                    "border-yellow",
                                    "border-coral",
                                    "border-teal",
                                ];
                                const accentBg = [
                                    "bg-coral",
                                    "bg-teal",
                                    "bg-purple",
                                    "bg-yellow",
                                    "bg-coral",
                                    "bg-teal",
                                ];
                                const iconColor = [
                                    "text-cream",
                                    "text-cream",
                                    "text-cream",
                                    "text-dark",
                                    "text-cream",
                                    "text-cream",
                                ];
                                return (
                                    <div key={index}
                                        className={`benefit-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${borderColors[index]}`}>
                                        <div className={`absolute top-0 right-0 w-10 h-10 ${accentBg[index]}`} />
                                        <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${borderColors[index]}`}>
                                            <i className={`${benefit.icon} text-2xl ${iconColor[index] === "text-cream" ? borderColors[index].replace("border-", "text-") : "text-dark"}`}></i>
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/75">
                                            {benefit.text}
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
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                            The best candidates aren&apos;t on job boards.
                            They&apos;re here. Verified. Active. Ready to be placed.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Candidate Network
                            </span>
                        </div>
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS
               ══════════════════════════════════════════════════════════════ */}
            <section className="how-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="how-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Process
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Three Steps.{" "}
                                <span className="text-purple">Start Earning.</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {howSteps.map((step, index) => (
                                <div key={index}
                                    className="how-step relative p-8 border-4 border-dark/10 bg-white opacity-0">
                                    <div className="text-6xl font-black text-dark/10 mb-4 leading-none">
                                        {step.number}
                                    </div>
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 bg-yellow">
                                        <i className={`${step.icon} text-xl text-dark`}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-dark">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/65">
                                        {step.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TESTIMONIALS
               ══════════════════════════════════════════════════════════════ */}
            <section className="testimonials-section py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="testimonials-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                Success Stories
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                Recruiters{" "}
                                <span className="text-coral">Tell It Better</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => {
                                const borderColors = ["border-coral", "border-teal", "border-purple"];
                                const accentBg = ["bg-coral", "bg-teal", "bg-purple"];
                                return (
                                    <div key={index}
                                        className={`testimonial-card relative p-6 border-4 bg-dark/50 opacity-0 ${borderColors[index]}`}>
                                        <div className={`absolute bottom-0 left-0 w-10 h-10 ${accentBg[index]}`} />
                                        <div className="mb-4">
                                            <i className={`fa-duotone fa-regular fa-quote-left text-2xl ${borderColors[index].replace("border-", "text-")}`}></i>
                                        </div>
                                        <p className="text-sm leading-relaxed mb-6 text-cream/80">
                                            {testimonial.quote}
                                        </p>
                                        <div className={`pt-4 border-t-[3px] ${borderColors[index]}`}>
                                            <div className="font-black text-sm uppercase text-cream">
                                                {testimonial.author}
                                            </div>
                                            <div className="text-xs uppercase tracking-wider text-cream/50">
                                                {testimonial.role}
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
                PARTNERSHIP BENEFITS
               ══════════════════════════════════════════════════════════════ */}
            <section className="partnership-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="partnership-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                Partnership
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                We&apos;re On{" "}
                                <span className="text-purple">Your Side</span>
                            </h2>
                        </div>

                        <div className="partnership-content p-8 md:p-12 border-4 border-purple opacity-0">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-dark">
                                        <i className="fa-duotone fa-regular fa-handshake text-purple mr-2"></i>
                                        Built for Recruiters
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "No subscription fees to access candidates",
                                            "Unlimited searches and candidate views",
                                            "Direct messaging with no platform interference",
                                            "Export candidate data for your CRM",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-purple"></i>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-dark">
                                        <i className="fa-duotone fa-regular fa-trophy text-purple mr-2"></i>
                                        Your Success = Our Success
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "Dedicated recruiter support team",
                                            "Training resources and best practices",
                                            "Performance analytics and insights",
                                            "Priority access to new features",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                                <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-purple"></i>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="cta-section relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" className="stroke-purple" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-cream">
                            Join Now
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-cream">
                            Start Placing{" "}
                            <span className="text-coral">Quality Candidates</span>{" "}
                            Today
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            12,000+ verified candidates. Transparent fees. Fast placements.
                            Zero subscription costs. This is how recruiting should work.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link href="/sign-up"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-sm text-center transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-user-plus mr-2"></i>
                                Create Recruiter Account
                            </Link>
                            <Link href="/public/contact-memphis"
                                className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-yellow text-yellow text-sm text-center transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-messages mr-2"></i>
                                Talk to Our Team
                            </Link>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { value: "$0", label: "Platform Access Fee", border: "border-coral" },
                            { value: "24/7", label: "Candidate Database Access", border: "border-yellow" },
                            { value: "85%", label: "Candidate Response Rate", border: "border-teal" },
                        ].map((stat, index) => (
                            <div key={index}
                                className={`cta-stat p-6 border-4 text-center opacity-0 ${stat.border}`}>
                                <div className="text-2xl md:text-3xl font-black text-cream mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-[0.12em] text-cream/60">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </ForRecruitersAnimator>
    );
}
