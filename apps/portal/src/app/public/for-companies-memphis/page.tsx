import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { CompaniesAnimator } from "./companies-animator";

export const metadata: Metadata = {
    title: "For Companies - Splits Network | Your Recruiter Network, On Demand",
    description:
        "Post roles for free. Access a vetted network of specialized recruiters. Track every candidate in real time. Pay only when someone starts. Splits Network makes hiring transparent.",
    openGraph: {
        title: "For Companies - Splits Network | Your Recruiter Network, On Demand",
        description:
            "Post roles for free. Access a vetted network of specialized recruiters. Track every candidate in real time. Pay only when someone starts.",
        type: "website",
    },
    ...buildCanonical("/public/for-companies-memphis"),
};

// ─── Page data ──────────────────────────────────────────────────────────────

const keyStats = [
    { value: "1,200+", label: "Companies Hiring", color: "bg-coral" },
    { value: "14 Days", label: "Avg Time to Hire", color: "bg-teal" },
    { value: "50%", label: "Lower Cost Per Hire", color: "bg-yellow" },
    { value: "2,500+", label: "Active Recruiters", color: "bg-purple" },
];

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-user-slash",
        title: "One Recruiter, One Network",
        text: "Traditional agencies assign a single recruiter to your role. If their network doesn't have the right candidate, you wait. And wait. And wait.",
        color: "border-coral",
        accent: "bg-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        title: "Zero Visibility",
        text: "You post a role. The agency says they're working on it. Weeks pass. No pipeline data. No sourcing updates. Just radio silence until they drop a resume on your desk.",
        color: "border-purple",
        accent: "bg-purple",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Inflated Fees, Hidden Markups",
        text: "Agencies charge 20-30% of first-year salary with no visibility into where that money goes. Overhead, markups, and margin stacking -- you pay for all of it.",
        color: "border-yellow",
        accent: "bg-yellow",
    },
];

const features = [
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Post Roles Free",
        text: "Publish job requirements and fee terms in minutes. Your role goes live to a marketplace of qualified, specialized recruiters. No upfront cost.",
        color: "border-coral",
        accent: "bg-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        title: "Recruiter Marketplace",
        text: "Thousands of independent recruiters compete to fill your role. Specialists in your industry, geography, and skill set. Not one generalist -- a whole network.",
        color: "border-teal",
        accent: "bg-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Real-Time Candidate Tracking",
        text: "See every candidate in your pipeline as they move through stages. No more asking for updates. No more spreadsheets. Full visibility, always.",
        color: "border-purple",
        accent: "bg-purple",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Management",
        text: "Set your fee terms once. Every recruiter who opts in agrees to those terms upfront. No negotiations, no surprises, no disputes after placement.",
        color: "border-yellow",
        accent: "bg-yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Hiring Analytics",
        text: "Track time-to-fill, pipeline velocity, recruiter performance, and cost-per-hire. Data-driven decisions replace gut feelings.",
        color: "border-coral",
        accent: "bg-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Quality Control Built In",
        text: "When multiple recruiters evaluate candidates, bad fits get filtered early. Recruiter ratings and placement history give you confidence before you interview.",
        color: "border-teal",
        accent: "bg-teal",
    },
];

const howItWorks = [
    {
        step: "01",
        title: "Post Your Role",
        text: "Define requirements, set fee terms, and publish. Takes 10 minutes. Your role is visible to qualified recruiters immediately.",
        color: "bg-coral",
    },
    {
        step: "02",
        title: "Recruiters Compete",
        text: "Specialized recruiters opt in and start sourcing. You see who is working your role and track candidate submissions in real time.",
        color: "bg-teal",
    },
    {
        step: "03",
        title: "Hire With Confidence",
        text: "Review pre-vetted candidates, schedule interviews, and make offers. Pay the agreed fee only when your new hire starts.",
        color: "bg-yellow",
    },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ForCompaniesMemphisPage() {
    return (
        <CompaniesAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle */}
                    <svg className="memphis-shape absolute top-[18%] left-[45%] opacity-0" width="50" height="43" viewBox="0 0 50 43">
                        <polygon points="25,0 50,43 0,43" className="fill-yellow" transform="rotate(-10 25 21.5)" />
                    </svg>
                    {/* Dot grid */}
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
                        {/* Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-building"></i>
                            For Companies
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            Your Recruiter{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Network</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                            <br />
                            On Demand
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-white/70 opacity-0">
                            Stop relying on one agency with one recruiter and one network.
                            Splits Network gives you access to thousands of specialized
                            recruiters who compete to fill your roles. Post free. Pay on hire.
                            See everything.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a href="/sign-up"
                                className="hero-cta opacity-0 inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1">
                                Post Your First Role
                            </a>
                            <a href="https://calendly.com/floyd-employment-networks/30min"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hero-cta opacity-0 inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider border-4 border-teal text-teal transition-transform hover:-translate-y-1">
                                Schedule a Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="companies-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${stat.color} ${stat.color === "bg-yellow" ? "text-dark" : "text-white"}`}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PAIN POINTS
               ══════════════════════════════════════════════════════════════ */}
            <section className="pain-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="pain-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                The Problem
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Hiring Is{" "}
                                <span className="text-coral">Broken</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {painPoints.map((pain, index) => (
                                <div key={index}
                                    className={`pain-card relative p-6 md:p-8 border-4 ${pain.color} bg-white opacity-0`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${pain.accent}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${pain.color}`}>
                                        <i className={`${pain.icon} text-2xl text-dark`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {pain.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
                                        {pain.text}
                                    </p>
                                </div>
                            ))}
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
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            Companies deserve to know exactly who is working their roles,
                            what candidates look like, and what they are paying for.
                            Opacity is not a business model. Transparency is.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network
                            </span>
                        </div>
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FEATURES GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="features-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="features-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Platform
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Everything You Need{" "}
                                <span className="text-teal">To Hire</span>
                            </h2>
                        </div>

                        <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div key={index}
                                    className={`feature-card relative p-6 md:p-8 border-4 ${feature.color} bg-white opacity-0`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${feature.accent}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.color}`}>
                                        <i className={`${feature.icon} text-2xl text-dark`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS
               ══════════════════════════════════════════════════════════════ */}
            <section className="how-section py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="how-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Process
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                Three Steps.{" "}
                                <span className="text-yellow">That&apos;s It.</span>
                            </h2>
                        </div>

                        <div className="space-y-0">
                            {howItWorks.map((step, index) => (
                                <div key={index}
                                    className="how-step flex gap-6 md:gap-8 opacity-0"
                                    >
                                    {/* Step number */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-16 md:w-20 py-2 text-center font-black text-lg md:text-xl ${step.color} ${step.color === "bg-yellow" ? "text-dark" : "text-white"}`}>
                                            {step.step}
                                        </div>
                                        {index < howItWorks.length - 1 && (
                                            <div className={`w-1 flex-grow ${step.color} opacity-30`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className={`font-black text-lg md:text-xl uppercase tracking-wide mb-2 ${step.color === "bg-coral" ? "text-coral" : step.color === "bg-teal" ? "text-teal" : "text-yellow"}`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed text-white/65">
                                            {step.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PRICING PREVIEW
               ══════════════════════════════════════════════════════════════ */}
            <section className="pricing-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="pricing-content max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-yellow bg-white opacity-0">
                        <div className="absolute top-0 left-0 w-12 h-12 bg-yellow" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-yellow" />

                        <div className="text-center">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-yellow text-dark">
                                Pricing
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-6">
                                Companies Post{" "}
                                <span className="text-teal">Free</span>
                            </h2>
                            <p className="text-base md:text-lg leading-relaxed text-dark/80 mb-8 max-w-2xl mx-auto">
                                There is no cost to post roles on Splits Network. You set the
                                placement fee upfront. Recruiters opt in to your terms. You
                                only pay when a candidate starts. Transparent, predictable,
                                and aligned with results.
                            </p>

                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                <div className="p-4 border-4 border-coral">
                                    <div className="text-2xl font-black text-coral">$0</div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-dark/60">To Post</div>
                                </div>
                                <div className="p-4 border-4 border-teal">
                                    <div className="text-2xl font-black text-teal">You Set</div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-dark/60">The Fee</div>
                                </div>
                                <div className="p-4 border-4 border-purple">
                                    <div className="text-2xl font-black text-purple">On Hire</div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-dark/60">You Pay</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                COMPARISON
               ══════════════════════════════════════════════════════════════ */}
            <section className="comparison-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Compare
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Traditional Agency vs{" "}
                                <span className="text-purple">Splits Network</span>
                            </h2>
                        </div>

                        <div className="comparison-grid grid md:grid-cols-2 gap-8">
                            {/* Traditional Agency */}
                            <div className="comparison-card p-8 border-4 border-coral bg-white opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-coral">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-xl text-white"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                        Traditional Agency
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "One recruiter assigned to your role",
                                        "20-30% placement fees with hidden markups",
                                        "No visibility into sourcing activity",
                                        "Weeks of silence before candidate submissions",
                                        "Locked into long-term agency contracts",
                                        "Fee disputes after placement are common",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                            <i className="fa-duotone fa-regular fa-xmark mt-0.5 flex-shrink-0 text-coral"></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Splits Network */}
                            <div className="comparison-card p-8 border-4 border-teal bg-white opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-teal">
                                        <i className="fa-duotone fa-regular fa-rocket text-xl text-dark"></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide text-dark">
                                        Splits Network
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Thousands of specialized recruiters compete for your role",
                                        "You set the fee -- transparent, flat, no hidden costs",
                                        "Real-time pipeline visibility from day one",
                                        "First candidates typically within 3-5 days",
                                        "No contracts -- post a role, cancel anytime",
                                        "Terms agreed upfront, payments automated on hire",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-dark/80">
                                            <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 text-teal"></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="companies-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="cta-shape absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral opacity-0" />
                    <div className="cta-shape absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal opacity-0" />
                    <div className="cta-shape absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <svg className="cta-shape absolute bottom-[25%] right-[18%] opacity-0" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" className="stroke-purple" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                            Get Started
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Post Your First{" "}
                            <span className="text-coral">Role</span>{" "}
                            Today
                        </h2>
                        <p className="text-lg mb-10 text-white/70">
                            Join 1,200+ companies who stopped settling for one recruiter
                            and started hiring from an entire network.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
                        {/* Post a Role */}
                        <div className="cta-card p-6 border-4 border-coral text-center bg-white/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-bullhorn text-xl text-white"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Post a Role
                            </h3>
                            <p className="text-xs mb-5 text-white/60">
                                Free to post. Pay only on hire.
                            </p>
                            <a href="/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-coral border-coral text-white">
                                Start Hiring
                            </a>
                        </div>

                        {/* Schedule Demo */}
                        <div className="cta-card p-6 border-4 border-teal text-center bg-white/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-calendar text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                See It In Action
                            </h3>
                            <p className="text-xs mb-5 text-white/60">
                                30-minute walkthrough. No pressure.
                            </p>
                            <a href="https://calendly.com/floyd-employment-networks/30min"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-teal border-teal text-dark">
                                Schedule Demo
                            </a>
                        </div>
                    </div>

                    <div className="text-center opacity-0">
                        <p className="text-sm mb-3 text-white/50">
                            Questions? We are here.
                        </p>
                        <a href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </CompaniesAnimator>
    );
}
