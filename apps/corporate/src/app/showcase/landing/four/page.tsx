"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Unsplash cinematic photos ──────────────────────────────────────────── */
const HERO_IMG =
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format&fit=crop";
const RECRUITER_IMG =
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=960&q=80&auto=format&fit=crop";
const CANDIDATE_IMG =
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=960&q=80&auto=format&fit=crop";
const COMPANY_IMG =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=960&q=80&auto=format&fit=crop";
const ECOSYSTEM_IMG =
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&q=80&auto=format&fit=crop";
const CTA_IMG =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80&auto=format&fit=crop";

/* ─── Testimonials ───────────────────────────────────────────────────────── */
const testimonials = [
    {
        quote: "Splits Network transformed how I run my desk. I went from juggling spreadsheets to closing three placements in my first month.",
        author: "Marcus Chen",
        role: "Independent Recruiter",
    },
    {
        quote: "For the first time, I actually knew where I stood in the hiring process. No ghosting, no guessing. Just real communication.",
        author: "Priya Sharma",
        role: "Software Engineer, placed via Applicant Network",
    },
    {
        quote: "We replaced twelve individual recruiter contracts with one platform. Our cost-per-hire dropped 40% in the first quarter.",
        author: "David Okonkwo",
        role: "VP Talent Acquisition, Series B Startup",
    },
];

/* ─── Metrics ────────────────────────────────────────────────────────────── */
const metrics = [
    { value: "10,000+", label: "Active Listings" },
    { value: "2,000+", label: "Recruiters" },
    { value: "500+", label: "Companies" },
    { value: "95%", label: "Response Rate" },
];

/* ─── Features ───────────────────────────────────────────────────────────── */
const recruiterFeatures = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        desc: "Access curated roles and earn transparent splits on every placement.",
    },
    {
        icon: "fa-duotone fa-regular fa-table-columns",
        title: "Built-In ATS",
        desc: "Track candidates, manage submissions, and monitor your pipeline in one view.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Placement Tracking",
        desc: "Real-time visibility into every stage from submission to start date.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Transparent Earnings",
        desc: "Know exactly what you will earn before you submit a single candidate.",
    },
];

const candidateFeatures = [
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "One-Click Apply",
        desc: "Apply to matched opportunities instantly with your saved profile.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real Communication",
        desc: "Status updates, feedback, and direct recruiter messaging. No black holes.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Live Tracking",
        desc: "See exactly where your application stands at every stage of the process.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Privacy First",
        desc: "Your data stays private until you choose to share it with employers.",
    },
];

const companyFeatures = [
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Recruiter Network",
        desc: "Tap into a vetted network of specialists without individual contracts.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Pipeline Visibility",
        desc: "Full transparency into who is working your roles and what is in the pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "Consistent Terms",
        desc: "Set fees and terms once. They apply to every recruiter automatically.",
    },
    {
        icon: "fa-duotone fa-regular fa-badge-check",
        title: "Pay on Hire",
        desc: "No retainers, no surprises. Pay only when a candidate starts.",
    },
];

export default function LandingFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroImgRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                // Make everything visible without animation
                gsap.set(containerRef.current.querySelectorAll(".cin-reveal"), {
                    opacity: 1,
                    y: 0,
                    x: 0,
                });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ════════════════════════════════════════
            // HERO — cinematic entrance
            // ════════════════════════════════════════
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Parallax on hero image
            gsap.to($1(".cin-hero-img"), {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".cin-hero"),
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            heroTl
                .fromTo(
                    $1(".cin-hero-overlay"),
                    { opacity: 0 },
                    { opacity: 1, duration: 0.8 },
                )
                .fromTo(
                    $1(".cin-hero-kicker"),
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    0.3,
                )
                .fromTo(
                    $1(".cin-hero-headline"),
                    { opacity: 0, y: 80 },
                    { opacity: 1, y: 0, duration: 1.2 },
                    0.4,
                )
                .fromTo(
                    $1(".cin-hero-sub"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    0.8,
                )
                .fromTo(
                    $(".cin-hero-cta"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
                    1.0,
                );

            // ════════════════════════════════════════
            // METRICS BAR — stagger in
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".cin-metric"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".cin-metrics"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // SPLIT PANELS — slide from alternating sides
            // ════════════════════════════════════════
            const panels = $(".cin-split-panel");
            panels.forEach((panel, i) => {
                const img = panel.querySelector(".cin-split-img");
                const content = panel.querySelector(".cin-split-content");
                const fromLeft = i % 2 === 0;

                if (img) {
                    // Parallax on panel images
                    gsap.to(img.querySelector("img"), {
                        yPercent: 15,
                        ease: "none",
                        scrollTrigger: {
                            trigger: panel,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });

                    gsap.fromTo(
                        img,
                        { opacity: 0, x: fromLeft ? -80 : 80 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: panel,
                                start: "top 75%",
                            },
                        },
                    );
                }

                if (content) {
                    gsap.fromTo(
                        content,
                        { opacity: 0, x: fromLeft ? 80 : -80 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: panel,
                                start: "top 75%",
                            },
                        },
                    );

                    // Stagger feature cards inside
                    const cards = content.querySelectorAll(".cin-feature-card");
                    if (cards.length) {
                        gsap.fromTo(
                            cards,
                            { opacity: 0, y: 30 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.5,
                                stagger: 0.08,
                                ease: "power2.out",
                                scrollTrigger: {
                                    trigger: content,
                                    start: "top 70%",
                                },
                            },
                        );
                    }
                }
            });

            // ════════════════════════════════════════
            // TESTIMONIALS — pull-quote fade
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cin-testimonials-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-testimonials"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-quote"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-quotes-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ECOSYSTEM — dramatic reveal
            // ════════════════════════════════════════
            gsap.to($1(".cin-eco-img"), {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".cin-ecosystem"),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.fromTo(
                $1(".cin-eco-content"),
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-ecosystem"),
                        start: "top 60%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-eco-pillar"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".cin-eco-pillars"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CTA — cinematic final
            // ════════════════════════════════════════
            gsap.to($1(".cin-cta-img"), {
                yPercent: 25,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".cin-cta"),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.fromTo(
                $1(".cin-cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-cta"),
                        start: "top 65%",
                    },
                },
            );

            gsap.fromTo(
                $(".cin-cta-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: $1(".cin-cta-cards"),
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="cin-page overflow-hidden">
            {/* ══════════════════════════════════════════════════════════════
                HERO — Full-Bleed Widescreen
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-hero relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background image with parallax */}
                <div className="cin-hero-img absolute inset-0 w-full h-[120%] -top-[10%]">
                    <img
                        src={HERO_IMG}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </div>

                {/* Dark overlay */}
                <div className="cin-hero-overlay absolute inset-0 bg-neutral/80 opacity-0" />

                {/* Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
                    <p className="cin-hero-kicker text-sm uppercase tracking-[0.3em] font-medium text-primary-content/70 mb-6 opacity-0">
                        Employment Networks
                    </p>

                    <h1 className="cin-hero-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8 opacity-0">
                        The Recruiting
                        <br />
                        <span className="text-primary">Revolution</span>
                    </h1>

                    <p className="cin-hero-sub text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12 opacity-0">
                        Two platforms, one connected ecosystem. Recruiters find
                        opportunities. Candidates find advocates. Companies find
                        talent. Everyone wins.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://splits.network/sign-up"
                            className="cin-hero-cta btn btn-primary btn-lg text-base font-semibold border-0 shadow-xl opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie" />
                            For Recruiters
                        </a>
                        <a
                            href="https://applicant.network/sign-up"
                            className="cin-hero-cta btn btn-lg text-base font-semibold bg-white text-neutral hover:bg-white/90 border-0 shadow-xl opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user" />
                            For Candidates
                        </a>
                        <a
                            href="#for-companies"
                            className="cin-hero-cta btn btn-lg text-base font-semibold btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50 opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-building" />
                            For Companies
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
                    <i className="fa-duotone fa-regular fa-chevron-down text-xl" />
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                METRICS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-metrics bg-neutral py-12 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {metrics.map((m, i) => (
                            <div
                                key={i}
                                className="cin-metric text-center opacity-0"
                            >
                                <div className="text-3xl md:text-4xl font-black text-primary mb-1">
                                    {m.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-white/50 font-medium">
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOR RECRUITERS — Split Panel (Image Left, Content Right)
               ══════════════════════════════════════════════════════════════ */}
            <section
                id="for-recruiters"
                className="cin-split-panel grid lg:grid-cols-2 min-h-[80vh]"
            >
                {/* Image side */}
                <div className="cin-split-img relative overflow-hidden bg-neutral opacity-0">
                    <img
                        src={RECRUITER_IMG}
                        alt="Recruiters collaborating"
                        className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-primary/20" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="badge badge-primary badge-lg font-bold shadow-lg">
                            <i className="fa-duotone fa-regular fa-user-tie mr-1" />
                            Splits Network
                        </span>
                    </div>
                </div>

                {/* Content side */}
                <div className="cin-split-content flex items-center bg-base-100 opacity-0">
                    <div className="max-w-xl mx-auto px-8 py-16 lg:px-12">
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                            For Recruiters
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                            Turn your network
                            <br />
                            into revenue
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed mb-10">
                            Join a collaborative marketplace where split-fee
                            recruiting actually works. Stop chasing roles. Let
                            opportunities come to you.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                            {recruiterFeatures.map((f, i) => (
                                <div
                                    key={i}
                                    className="cin-feature-card p-4 bg-base-200 rounded-xl opacity-0"
                                >
                                    <i
                                        className={`${f.icon} text-primary text-lg mb-2 block`}
                                    />
                                    <div className="font-bold text-sm mb-1">
                                        {f.title}
                                    </div>
                                    <p className="text-xs text-base-content/60 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-primary btn-lg font-semibold shadow-lg"
                        >
                            Join Splits Network
                            <i className="fa-duotone fa-regular fa-arrow-right" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOR CANDIDATES — Split Panel (Content Left, Image Right)
               ══════════════════════════════════════════════════════════════ */}
            <section
                id="for-candidates"
                className="cin-split-panel grid lg:grid-cols-2 min-h-[80vh]"
            >
                {/* Content side */}
                <div className="cin-split-content flex items-center bg-base-100 order-2 lg:order-1 opacity-0">
                    <div className="max-w-xl mx-auto px-8 py-16 lg:px-12">
                        <p className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold mb-4">
                            For Job Seekers
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                            Your job search,
                            <br />
                            with backup
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed mb-10">
                            Get matched with expert recruiters who open doors,
                            prep you for interviews, and make sure you never get
                            ghosted again. Always free.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                            {candidateFeatures.map((f, i) => (
                                <div
                                    key={i}
                                    className="cin-feature-card p-4 bg-base-200 rounded-xl opacity-0"
                                >
                                    <i
                                        className={`${f.icon} text-secondary text-lg mb-2 block`}
                                    />
                                    <div className="font-bold text-sm mb-1">
                                        {f.title}
                                    </div>
                                    <p className="text-xs text-base-content/60 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://applicant.network/sign-up"
                            className="btn btn-secondary btn-lg font-semibold shadow-lg"
                        >
                            Create Free Profile
                            <i className="fa-duotone fa-regular fa-arrow-right" />
                        </a>
                    </div>
                </div>

                {/* Image side */}
                <div className="cin-split-img relative overflow-hidden bg-neutral order-1 lg:order-2 opacity-0">
                    <img
                        src={CANDIDATE_IMG}
                        alt="Professional woman confident in her career"
                        className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-secondary/20" />
                    <div className="absolute bottom-6 right-6">
                        <span className="badge badge-secondary badge-lg font-bold shadow-lg">
                            <i className="fa-duotone fa-regular fa-user mr-1" />
                            Applicant Network
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOR COMPANIES — Split Panel (Image Left, Content Right)
               ══════════════════════════════════════════════════════════════ */}
            <section
                id="for-companies"
                className="cin-split-panel grid lg:grid-cols-2 min-h-[80vh]"
            >
                {/* Image side */}
                <div className="cin-split-img relative overflow-hidden bg-neutral opacity-0">
                    <img
                        src={COMPANY_IMG}
                        alt="Modern corporate skyline"
                        className="w-full h-full object-cover min-h-[400px] lg:min-h-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-neutral/30" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="badge badge-accent badge-lg font-bold shadow-lg">
                            <i className="fa-duotone fa-regular fa-building mr-1" />
                            Hiring Made Simple
                        </span>
                    </div>
                </div>

                {/* Content side */}
                <div className="cin-split-content flex items-center bg-base-100 opacity-0">
                    <div className="max-w-xl mx-auto px-8 py-16 lg:px-12">
                        <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4">
                            For Companies
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                            A network of recruiters,
                            <br />
                            one platform
                        </h2>
                        <p className="text-lg text-base-content/60 leading-relaxed mb-10">
                            Stop managing dozens of contracts. Get qualified
                            candidates from vetted recruiters with complete
                            transparency and pay only on hire.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                            {companyFeatures.map((f, i) => (
                                <div
                                    key={i}
                                    className="cin-feature-card p-4 bg-base-200 rounded-xl opacity-0"
                                >
                                    <i
                                        className={`${f.icon} text-accent text-lg mb-2 block`}
                                    />
                                    <div className="font-bold text-sm mb-1">
                                        {f.title}
                                    </div>
                                    <p className="text-xs text-base-content/60 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-accent btn-lg font-semibold shadow-lg"
                        >
                            Post a Role
                            <i className="fa-duotone fa-regular fa-arrow-right" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TESTIMONIALS — Bold Pull-Quotes
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-testimonials bg-neutral text-white py-24 lg:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="cin-testimonials-heading text-center mb-16 opacity-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                            Voices
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black">
                            What they say
                        </h2>
                    </div>

                    <div className="cin-quotes-grid grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="cin-quote opacity-0">
                                <div className="border-l-4 border-coral pl-6 mb-6">
                                    <p className="text-xl md:text-2xl font-bold leading-snug text-white/90 italic">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                </div>
                                <div className="pl-6">
                                    <div className="font-bold text-white">
                                        {t.author}
                                    </div>
                                    <div className="text-sm text-white/50">
                                        {t.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ECOSYSTEM — Cinematic Wide with Overlay
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-ecosystem relative min-h-[80vh] flex items-center overflow-hidden">
                <div className="cin-eco-img absolute inset-0 w-full h-[130%] -top-[15%]">
                    <img
                        src={ECOSYSTEM_IMG}
                        alt="Connected team collaboration"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="absolute inset-0 bg-neutral/85" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center text-white">
                    <div className="cin-eco-content opacity-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                            Connected Ecosystem
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                            One ecosystem.
                            <br />
                            Everyone wins.
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-16">
                            Companies post roles. Recruiters find talent.
                            Candidates get opportunities. All connected through
                            platforms designed to work together.
                        </p>
                    </div>

                    <div className="cin-eco-pillars grid md:grid-cols-3 gap-8">
                        <div className="cin-eco-pillar bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
                                <i className="fa-duotone fa-regular fa-handshake text-primary text-2xl" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                                Transparent Partnerships
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Clear terms, visible pipelines, and honest
                                communication between all parties.
                            </p>
                        </div>
                        <div className="cin-eco-pillar bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0">
                            <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-5">
                                <i className="fa-duotone fa-regular fa-network-wired text-secondary text-2xl" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                                Connected Platforms
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Recruiters, companies, and candidates all on
                                platforms designed to work together.
                            </p>
                        </div>
                        <div className="cin-eco-pillar bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0">
                            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-5">
                                <i className="fa-duotone fa-regular fa-gauge-high text-accent text-2xl" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                                Modern Technology
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Real-time updates, automated workflows, and
                                tools that save everyone time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA — Cinematic Final
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-cta relative min-h-[70vh] flex items-center overflow-hidden">
                <div className="cin-cta-img absolute inset-0 w-full h-[130%] -top-[15%]">
                    <img
                        src={CTA_IMG}
                        alt="Modern workspace"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="absolute inset-0 bg-primary/85" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center text-white">
                    <div className="cin-cta-content opacity-0">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                            Ready to transform
                            <br />
                            how you recruit?
                        </h2>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                            Join the ecosystem that is making recruiting work
                            for everyone.
                        </p>
                    </div>

                    <div className="cin-cta-cards grid md:grid-cols-3 gap-6 mb-12">
                        <div className="cin-cta-card bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm opacity-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-lg" />
                            </div>
                            <h3 className="font-bold mb-2">Recruiters</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Join a collaborative marketplace with curated
                                roles and transparent splits.
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full font-semibold"
                            >
                                Join Network
                            </a>
                        </div>

                        <div className="cin-cta-card bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm opacity-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-user text-lg" />
                            </div>
                            <h3 className="font-bold mb-2">Candidates</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Get matched with expert recruiters. Never get
                                ghosted again. Free forever.
                            </p>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-sm bg-white text-secondary hover:bg-white/90 border-0 w-full font-semibold"
                            >
                                Create Profile
                            </a>
                        </div>

                        <div className="cin-cta-card bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm opacity-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-building text-lg" />
                            </div>
                            <h3 className="font-bold mb-2">Companies</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Access a network of recruiters with full
                                visibility and pay-on-hire.
                            </p>
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-sm bg-white text-accent hover:bg-white/90 border-0 w-full font-semibold"
                            >
                                Post a Role
                            </a>
                        </div>
                    </div>

                    <div className="text-white/40 text-sm">
                        <a
                            href="mailto:hello@employment-networks.com"
                            className="hover:text-white/70 transition-colors inline-flex items-center gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
