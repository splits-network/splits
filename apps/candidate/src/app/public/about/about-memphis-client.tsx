"use client";

import { AboutAnimator } from "./about-animator";

// Memphis accent cycling (coral → teal → yellow → purple)
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

const KEY_BENEFITS = [
    {
        icon: "fa-hand-holding-heart",
        title: "Zero Cost to You",
        text: "Recruiters pay to access our network. You get expert representation, personalized support, and real opportunities — completely free.",
        color: "coral",
    },
    {
        icon: "fa-chart-network",
        title: "Vetted Recruiter Network",
        text: "Every recruiter on our platform is vetted, rated, and accountable. No more spam. No more ghosting. Just pros who want to place you.",
        color: "teal",
    },
    {
        icon: "fa-eye",
        title: "Full Transparency",
        text: "See who's viewing your profile. Track your applications in real-time. Know exactly where you stand. No black box. No guessing.",
        color: "yellow",
    },
    {
        icon: "fa-shield-check",
        title: "Your Data, Your Control",
        text: "You decide who sees your profile. You decide which roles to pursue. We protect your privacy and never share your info without permission.",
        color: "purple",
    },
];

const DIFFERENTIATORS = [
    {
        title: "Built For Candidates",
        text: "Most platforms optimize for companies or recruiters. We optimize for you. Your profile. Your applications. Your timeline. Your success.",
        icon: "fa-user",
        color: "teal",
    },
    {
        title: "Collaborative Model",
        text: "Recruiters work together to find your perfect fit. When multiple specialists advocate for you, you get better representation and faster offers.",
        icon: "fa-handshake",
        color: "coral",
    },
    {
        title: "Real-Time Updates",
        text: "No more waiting weeks to hear back. Get instant notifications when recruiters view your profile, when applications move forward, when interviews are scheduled.",
        icon: "fa-bolt",
        color: "yellow",
    },
];

const TESTIMONIALS = [
    {
        quote: "I applied to three roles through Applicant Network. All three led to interviews. I accepted an offer two weeks later. This is what recruiting should feel like.",
        name: "Sarah M.",
        title: "Senior Product Manager",
        color: "coral",
    },
    {
        quote: "The transparency is incredible. I could see which recruiters viewed my profile, who submitted me for roles, and exactly where I stood in the process. No black box.",
        name: "Marcus T.",
        title: "Software Engineer",
        color: "teal",
    },
    {
        quote: "Three different recruiters reached out about the same role — but they collaborated instead of competing. I got better prep and a stronger offer as a result.",
        name: "Priya K.",
        title: "Data Scientist",
        color: "purple",
    },
];

const TRUST_BADGES = [
    { icon: "fa-lock", label: "SOC 2 Compliant", color: "teal" },
    { icon: "fa-shield-check", label: "GDPR Protected", color: "coral" },
    { icon: "fa-certificate", label: "Verified Recruiters", color: "yellow" },
    { icon: "fa-heart", label: "Free for Candidates", color: "purple" },
];

export default function AboutMemphisClient() {
    return (
        <AboutAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-hero relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-24 h-24 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[8%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[18%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[28%] right-[30%] w-24 h-10 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[45%] left-[20%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle */}
                    <svg
                        className="memphis-shape absolute top-[18%] left-[42%] opacity-0 -rotate-[10deg]"
                        width="50"
                        height="43"
                        viewBox="0 0 50 43"
                    >
                        <polygon points="25,0 50,43 0,43" className="fill-yellow" />
                    </svg>
                    {/* Zigzag */}
                    <svg
                        className="memphis-shape absolute top-[68%] left-[38%] opacity-0 stroke-purple"
                        width="100"
                        height="30"
                        viewBox="0 0 100 30"
                    >
                        <polyline
                            points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Plus sign */}
                    <svg
                        className="memphis-shape absolute top-[60%] left-[10%] opacity-0 stroke-yellow"
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                    >
                        <line
                            x1="15"
                            y1="3"
                            x2="15"
                            y2="27"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <line
                            x1="3"
                            y1="15"
                            x2="27"
                            y2="15"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                <i className="fa-duotone fa-regular fa-building-user"></i>
                                About Applicant Network
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0 text-white">
                            HERE'S YOUR{" "}
                            <span className="text-coral">ADVANTAGE</span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 opacity-0 text-white/70 max-w-3xl mx-auto">
                            The job search is broken. Recruiters ghost you. Job boards
                            spam you. Companies ignore you. Applicant Network flips the
                            script — you get vetted recruiters working FOR you, complete
                            transparency, and zero cost. This is recruiting done right.
                        </p>

                        <div className="hero-cta opacity-0">
                            <a
                                href="/sign-up"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-coral text-white text-sm font-bold uppercase tracking-[0.2em] border-4 border-coral transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Free Profile
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MISSION & VISION
               ══════════════════════════════════════════════════════════════ */}
            <section className="about-mission py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="mission-section opacity-0">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-purple text-white">
                                Our Mission
                            </span>

                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8 text-dark">
                                Every Candidate Deserves{" "}
                                <span className="text-teal">Expert Representation</span>
                            </h2>

                            <div className="space-y-6 text-lg leading-relaxed text-dark/80">
                                <p>
                                    Job hunting shouldn't feel like shouting into the void.
                                    You shouldn't have to wonder if your resume made it past
                                    the algorithm. You shouldn't be ghosted after investing
                                    hours in interview prep.
                                </p>

                                <p>
                                    Applicant Network was built to fix this. We connect
                                    talented candidates like you with vetted recruiters who
                                    are invested in your success. Recruiters on our platform
                                    are rated, accountable, and incentivized to get you hired
                                    — not just to collect resumes.
                                </p>

                                <p>
                                    We believe transparency should be the default. You
                                    deserve to know who's viewing your profile, which
                                    recruiters are working your applications, and exactly
                                    where you stand in the hiring process. No black boxes. No
                                    mystery. Just clarity.
                                </p>

                                <p className="font-bold text-dark">
                                    And it's completely free for candidates. Forever.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY BENEFITS
               ══════════════════════════════════════════════════════════════ */}
            <section className="benefits-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="benefits-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                Why Choose Us
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                What You{" "}
                                <span className="text-coral">Actually Get</span>
                            </h2>
                        </div>

                        <div className="benefits-grid grid md:grid-cols-2 gap-6">
                            {KEY_BENEFITS.map((benefit, idx) => {
                                const borderClass = `border-${benefit.color}`;
                                const bgClass = `bg-${benefit.color}`;
                                const textClass = `text-${benefit.color}`;

                                return (
                                    <div
                                        key={idx}
                                        className={`benefit-card relative p-8 border-4 ${borderClass} bg-cream opacity-0`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-12 h-12 ${bgClass}`}
                                        />

                                        <div
                                            className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${borderClass}`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${benefit.icon} text-2xl ${textClass}`}
                                            ></i>
                                        </div>

                                        <h3 className="text-xl font-black uppercase tracking-wide mb-3 text-dark">
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
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-yellow opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-yellow">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            Recruiting should work FOR candidates, not AROUND them. We
                            built a platform where transparency isn't optional — it's the
                            entire point.
                        </p>
                        <div
                            className="mt-6 pt-4 border-t-4 border-yellow"
                        >
                            <span className="text-sm font-bold uppercase tracking-wider text-yellow">
                                — Applicant Network Team
                            </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-yellow" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW WE'RE DIFFERENT
               ══════════════════════════════════════════════════════════════ */}
            <section className="diff-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="diff-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Platform Differentiators
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Why We're{" "}
                                <span className="text-teal">Different</span>
                            </h2>
                        </div>

                        <div className="diff-grid grid md:grid-cols-3 gap-6">
                            {DIFFERENTIATORS.map((diff, idx) => {
                                const borderClass = `border-${diff.color}`;
                                const textClass = `text-${diff.color}`;

                                return (
                                    <div
                                        key={idx}
                                        className={`diff-card p-6 border-4 ${borderClass} bg-white opacity-0`}
                                    >
                                        <div
                                            className={`w-12 h-12 flex items-center justify-center mb-4 border-4 ${borderClass}`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${diff.icon} text-xl ${textClass}`}
                                            ></i>
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-wide mb-3 text-dark">
                                            {diff.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {diff.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="stats-bar py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    <div className="stat-block p-8 md:p-12 text-center opacity-0 bg-teal text-dark">
                        <div className="text-4xl md:text-6xl font-black mb-2">
                            100%
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Free for Candidates
                        </div>
                    </div>
                    <div className="stat-block p-8 md:p-12 text-center opacity-0 bg-coral text-white">
                        <div className="text-4xl md:text-6xl font-black mb-2">
                            2.4x
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Faster Placements
                        </div>
                    </div>
                    <div className="stat-block p-8 md:p-12 text-center opacity-0 bg-yellow text-dark">
                        <div className="text-4xl md:text-6xl font-black mb-2">
                            100%
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Vetted Recruiters
                        </div>
                    </div>
                    <div className="stat-block p-8 md:p-12 text-center opacity-0 bg-purple text-white">
                        <div className="text-4xl md:text-6xl font-black mb-2">
                            Real
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Time Transparency
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TESTIMONIALS / SUCCESS STORIES
               ══════════════════════════════════════════════════════════════ */}
            <section className="testimonials-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="testimonials-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Success Stories
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Real Candidates.{" "}
                                <span className="text-purple">Real Results.</span>
                            </h2>
                        </div>

                        <div className="testimonials-grid grid md:grid-cols-3 gap-6">
                            {TESTIMONIALS.map((testimonial, idx) => {
                                const borderClass = `border-${testimonial.color}`;
                                const bgClass = `bg-${testimonial.color}`;

                                return (
                                    <div
                                        key={idx}
                                        className={`testimonial-card relative p-6 border-4 ${borderClass} bg-cream opacity-0`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 left-0 w-10 h-10 ${bgClass}`}
                                        />

                                        <div className="mb-4 pt-2">
                                            <i className="fa-duotone fa-regular fa-quote-left text-2xl text-dark/20"></i>
                                        </div>

                                        <p className="text-sm leading-relaxed mb-6 text-dark/80">
                                            {testimonial.quote}
                                        </p>

                                        <div className="pt-4 border-t-2 border-dark/10">
                                            <p className="font-black text-sm uppercase tracking-wide text-dark">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                                {testimonial.title}
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
                TRUST & TRANSPARENCY
               ══════════════════════════════════════════════════════════════ */}
            <section className="trust-section-wrapper py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="trust-section opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                                Trust &amp; Security
                            </span>

                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8 text-white">
                                Your Data.{" "}
                                <span className="text-coral">Your Control.</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-10 text-white/70">
                                We take your privacy seriously. Your profile is only
                                visible to vetted recruiters you approve. Your data is
                                encrypted and protected. You can pause visibility, export
                                your data, or delete your account at any time — no
                                questions asked.
                            </p>

                            <div className="trust-badges grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                {TRUST_BADGES.map((badge, idx) => {
                                    const textClass = `text-${badge.color}`;
                                    const borderClass = `border-${badge.color}`;

                                    return (
                                        <div
                                            key={idx}
                                            className={`trust-badge p-4 border-4 ${borderClass} bg-white/5 opacity-0`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${badge.icon} text-2xl mb-2 ${textClass}`}
                                            ></i>
                                            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                                                {badge.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FINAL CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="final-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[20%] left-[12%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[50%] left-[6%] w-10 h-10 rounded-full bg-yellow" />
                    <svg
                        className="absolute bottom-[30%] right-[20%] stroke-purple"
                        width="70"
                        height="25"
                        viewBox="0 0 70 25"
                    >
                        <polyline
                            points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center max-w-4xl mx-auto mb-10 opacity-0">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-teal text-dark">
                            Ready to Get Started?
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Your Next Role{" "}
                            <span className="text-teal">Starts Here</span>
                        </h2>
                        <p className="text-lg mb-8 text-white/70">
                            Create your free profile in under 5 minutes. Get matched with
                            vetted recruiters who actually care about placing you. Track
                            your applications in real-time. Land better opportunities,
                            faster.
                        </p>
                    </div>

                    <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                        <a
                            href="/sign-up"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-coral text-white text-sm font-bold uppercase tracking-[0.2em] border-4 border-coral transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Create Free Profile
                        </a>
                        <a
                            href="/public/jobs"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white text-sm font-bold uppercase tracking-[0.2em] border-4 border-white/30 hover:border-white transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase"></i>
                            Browse Open Roles
                        </a>
                    </div>
                </div>
            </section>
        </AboutAnimator>
    );
}
