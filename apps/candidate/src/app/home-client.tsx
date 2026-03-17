"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";
import { AuthenticatedCTAWrapper } from "@/components/authenticated-cta-wrapper";

/* ─── Unsplash images (professional / career themes) ──────────────────────── */
const img = {
    hero: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    teamwork:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    skyline:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
};

/* ─── Data ────────────────────────────────────────────────────────────────── */

const stats = [
    { value: "10,000+", label: "Active Roles" },
    { value: "500+", label: "Companies Hiring" },
    { value: "2,000+", label: "Expert Recruiters" },
    { value: "95%", label: "48hr Response" },
];

const steps = [
    {
        num: "01",
        title: "Create Your Profile",
        body: "Build a profile that showcases your skills and goals. Upload your resume to get started in minutes.",
        icon: "fa-duotone fa-regular fa-user-circle",
    },
    {
        num: "02",
        title: "Browse & Apply",
        body: "Explore curated opportunities from top companies. Apply with one click and get matched with specialized recruiters.",
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
    },
    {
        num: "03",
        title: "Get Expert Support",
        body: "Your recruiter preps you for interviews, negotiates on your behalf, and keeps you updated every step of the way.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        num: "04",
        title: "Land Your Dream Job",
        body: "Accept an offer you're excited about and start your new role with confidence. No ghosting, no guessing.",
        icon: "fa-duotone fa-regular fa-rocket",
    },
];

const features = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Expert Recruiters",
        body: "Matched with specialized recruiters who know your industry and advocate for your success.",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "One-Click Apply",
        body: "Apply to multiple jobs instantly with your saved profile. No more copying and pasting.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Updates",
        body: "Track your application status and get instant notifications. Always know where you stand.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Privacy First",
        body: "Your data is secure and only shared with companies you approve.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Career Insights",
        body: "Access salary data, market trends, and personalized recommendations.",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Interview Prep",
        body: "Get coaching and resources from your recruiter to ace every interview.",
    },
];

const testimonials = [
    {
        quote: "I applied to 200 jobs in three months with nothing. One week on Applicant Network, I had three interviews and an offer.",
        name: "David Park",
        role: "Software Engineer",
        initials: "DP",
    },
    {
        quote: "For the first time, I actually knew what was happening with my applications. My recruiter kept me in the loop at every stage.",
        name: "Sarah Okonkwo",
        role: "Marketing Manager",
        initials: "SO",
    },
    {
        quote: "The recruiter who found me genuinely understood my career goals. It felt like having an agent, not just another job board.",
        name: "Marcus Chen",
        role: "Product Designer",
        initials: "MC",
    },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

interface HomeBaselClientProps {
    faqs: Array<{ question: string; answer: string }>;
}

export default function HomeBaselClient({ faqs }: HomeBaselClientProps) {
    const mainRef = useRef<HTMLElement>(null);

    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="overflow-hidden">
            {/* ═══════════════════════════════════════════════════════
                HERO — Split-screen 60/40 with diagonal clip
               ═══════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                {/* Right image panel — sits behind on mobile, 40% on desktop */}
                <div
                    className="hero-img-wrap scroll-reveal scale-in absolute inset-0 lg:left-[58%]"
                    style={{
                        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src={img.hero}
                        alt="Professional in modern workplace"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay for text readability on mobile */}
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel — 60% on desktop */}
                <div className="relative  container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6">
                            Applicant Network
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word scroll-reveal fade-up inline-block text-base-content lg:text-base-content">
                                Your
                            </span>{" "}
                            <span className="hero-headline-word scroll-reveal fade-up inline-block text-base-content lg:text-base-content">
                                career,
                            </span>{" "}
                            <span className="hero-headline-word scroll-reveal fade-up inline-block text-primary">
                                powered
                            </span>{" "}
                            <span className="hero-headline-word scroll-reveal fade-up inline-block text-base-content lg:text-base-content">
                                by experts.
                            </span>
                        </h1>

                        <p className="hero-body scroll-reveal fade-up text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-10">
                            Browse thousands of roles from top companies. Get
                            matched with specialized recruiters who advocate for
                            you — real communication, real support, real
                            results.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/jobs"
                                className="hero-cta scroll-reveal fade-up btn btn-primary btn-lg shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                Explore Jobs
                            </Link>
                            <Link
                                href="/sign-up"
                                className="hero-cta scroll-reveal fade-up btn btn-secondary btn-lg shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Profile
                            </Link>
                            <a
                                href="#how-it-works"
                                className="hero-cta scroll-reveal fade-up btn btn-ghost btn-lg"
                            >
                                Learn More
                                <i className="fa-duotone fa-regular fa-arrow-down"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                STATS BAR
               ═══════════════════════════════════════════════════════ */}
            <section className="stats-bar bg-primary text-primary-content py-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {stats.map((s, i) => (
                            <div
                                key={i}
                                className="stat-item scroll-reveal fade-up"
                            >
                                <div className="text-3xl md:text-4xl font-black tracking-tight">
                                    {s.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PROBLEM — Split-screen editorial (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section className="problem-section py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Text — 3 of 5 columns (60%) */}
                        <div className="problem-text scroll-reveal slide-from-left lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                                The Problem
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Job searching is
                                <br />
                                broken.
                            </h2>
                            <p className="text-lg text-base-content/70 leading-relaxed mb-10 max-w-lg">
                                Black-hole applications, ghosting recruiters,
                                and zero transparency. The traditional job
                                search fails candidates at every step.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-circle-xmark",
                                        text: "Applications vanish into a black hole — no response, no feedback, just silence",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-ghost",
                                        text: "Recruiters ghost you after phone screens with no explanation",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-eye-slash",
                                        text: "Zero visibility into where your application actually stands",
                                    },
                                ].map((pain, i) => (
                                    <div
                                        key={i}
                                        className="problem-pain scroll-reveal slide-from-left flex items-start gap-4"
                                    >
                                        <div className="w-10 h-10 flex-shrink-0 bg-error/10 flex items-center justify-center">
                                            <i
                                                className={`${pain.icon} text-error`}
                                            ></i>
                                        </div>
                                        <p className="text-base-content/80 leading-relaxed pt-2">
                                            {pain.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image — 2 of 5 columns (40%) */}
                        <div className="problem-img scroll-reveal slide-from-right lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.office}
                                    alt="Outdated hiring process"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-error/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                HOW IT WORKS — Numbered steps editorial
               ═══════════════════════════════════════════════════════ */}
            <section
                id="how-it-works"
                className="hiw-section py-28 bg-base-300 text-base-content"
            >
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="hiw-heading scroll-reveal fade-up max-w-3xl mb-20">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            How It Works
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Four steps to your
                            <br />
                            dream job.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className="hiw-step scroll-reveal fade-up flex gap-6"
                            >
                                <div className="flex-shrink-0">
                                    <span className="text-6xl font-black text-secondary/30 leading-none">
                                        {step.num}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <i
                                            className={`${step.icon} text-xl text-secondary`}
                                        ></i>
                                        <h3 className="text-xl font-bold">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="opacity-70 leading-relaxed">
                                        {step.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FEATURES — Editorial grid with border-left accents
               ═══════════════════════════════════════════════════════ */}
            <section className="features-section py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="features-heading scroll-reveal fade-up max-w-3xl mx-auto text-center mb-20">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Platform Features
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Built for
                            <br />
                            candidates.
                        </h2>
                    </div>

                    <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {features.map((f, i) => {
                            const colors = [
                                "primary",
                                "secondary",
                                "accent",
                            ] as const;
                            const c = colors[i % 3];
                            return (
                                <div
                                    key={i}
                                    className={`feature-card scroll-reveal fade-up border-l-4 border-${c} bg-base-200 p-8`}
                                >
                                    <div
                                        className={`w-12 h-12 bg-${c}/10 flex items-center justify-center mb-4`}
                                    >
                                        <i
                                            className={`${f.icon} text-xl text-${c}`}
                                        ></i>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-base-content/60 leading-relaxed">
                                        {f.body}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                EDITORIAL SPLIT — Ecosystem (40 image / 60 text)
               ═══════════════════════════════════════════════════════ */}
            <section className="editorial-section py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Image — 2 of 5 columns (40%) */}
                        <div className="editorial-img scroll-reveal scale-in lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.teamwork}
                                    alt="Team collaborating around a table"
                                    className="w-full h-[520px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Text — 3 of 5 columns (60%) */}
                        <div className="editorial-text scroll-reveal slide-from-right lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                The Ecosystem
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                You deserve an advocate.
                            </h2>
                            <p className="text-lg text-base-content/70 leading-relaxed mb-8 max-w-lg">
                                Applicant Network connects you with expert
                                recruiters who specialize in your field. They
                                open doors, prep you for interviews, and ensure
                                you never get ghosted again.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-6">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-user-tie",
                                        title: "Dedicated Recruiter",
                                        body: "A real person who knows your goals and advocates on your behalf.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-comments",
                                        title: "Real Communication",
                                        body: "Status updates, feedback, and responses at every stage.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-dollar-sign",
                                        title: "100% Free",
                                        body: "No fees, no hidden costs. Companies pay, you benefit.",
                                    },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-3">
                                            <i
                                                className={`${item.icon} text-xl text-primary`}
                                            ></i>
                                        </div>
                                        <h4 className="font-bold text-lg mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-base-content/60 leading-relaxed">
                                            {item.body}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TESTIMONIALS
               ═══════════════════════════════════════════════════════ */}
            <section className="testimonials-section py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="testimonials-heading scroll-reveal fade-up max-w-3xl mb-16">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Success Stories
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Candidates who
                            <br />
                            found their fit.
                        </h2>
                    </div>

                    <div className="testimonials-grid grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className="testimonial-card scroll-reveal fade-up border-l-4 border-primary bg-base-200 p-8"
                            >
                                <i className="fa-duotone fa-regular fa-quote-left text-3xl text-primary/20 mb-4 block"></i>
                                <p className="text-base-content/80 leading-relaxed mb-6 italic">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">
                                            {t.name}
                                        </div>
                                        <div className="text-xs text-base-content/60">
                                            {t.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FULL-BLEED IMAGE BREAK
               ═══════════════════════════════════════════════════════ */}
            <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img
                    src={img.skyline}
                    alt="City skyline representing opportunity"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/70 flex items-center justify-center">
                    <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight px-6">
                        Your next chapter
                        <br />
                        <span className="text-secondary">starts here.</span>
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FAQ
               ═══════════════════════════════════════════════════════ */}
            <section className="faq-section py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="faq-heading scroll-reveal fade-up text-center mb-16">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Common Questions
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                Frequently asked
                                <br />
                                questions.
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, i) => {
                                const colors = [
                                    "primary",
                                    "secondary",
                                    "accent",
                                    "info",
                                ] as const;
                                const c = colors[i % 4];
                                return (
                                    <details
                                        key={i}
                                        className={`faq-item scroll-reveal fade-up group border-l-4 border-${c} bg-base-200 shadow-sm`}
                                    >
                                        <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-base list-none">
                                            {faq.question}
                                            <span
                                                className={`w-8 h-8 flex items-center justify-center flex-shrink-0 bg-${c} text-${c}-content text-sm font-black transition-transform group-open:rotate-45`}
                                            >
                                                +
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-5 border-t border-base-300">
                                            <p className="text-sm text-base-content/60 leading-relaxed pt-4">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FINAL CTA (Hidden for logged-in users)
               ════════════════════════════════════════════════════════════ */}
            <AuthenticatedCTAWrapper>
                <section className="final-cta py-28 bg-primary text-primary-content">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="final-cta-content scroll-reveal fade-up max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Ready to find
                                <br />
                                your perfect role?
                            </h2>
                            <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Join thousands of candidates who found better
                                opportunities with expert recruiter support. Get
                                started in minutes.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link
                                    href="/sign-up"
                                    className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Create Free Account
                                </Link>
                                <Link
                                    href="/jobs"
                                    className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                                >
                                    <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                    Browse Jobs First
                                </Link>
                            </div>

                            <p className="text-sm opacity-60">
                                Free forever. No credit card required.{" "}
                                <a
                                    href="mailto:hello@applicant.network"
                                    className="underline hover:opacity-100 transition-opacity"
                                >
                                    Questions? Get in touch
                                </a>
                            </p>
                        </div>
                    </div>
                </section>
            </AuthenticatedCTAWrapper>
        </main>
    );
}
