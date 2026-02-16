"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Unsplash images (recruiting / professional themes) ─────────────────── */
const img = {
    heroRecruiter:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    heroCandidate:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    handshake:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    teamwork:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    interview:
        "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&q=80",
    candidates:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
    skyline:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
};

/* ─── Data ───────────────────────────────────────────────────────────────── */

const stats = [
    { value: "2,000+", label: "Recruiters" },
    { value: "500+", label: "Companies" },
    { value: "10,000+", label: "Active Roles" },
    { value: "95%", label: "Response Rate" },
];

const splitSteps = [
    {
        num: "01",
        title: "Companies Post Roles",
        body: "Set your terms once. Fees, expectations, and timelines apply to every recruiter consistently.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        num: "02",
        title: "Recruiters Engage",
        body: "Specialized recruiters pick roles that match their niche. No cold outreach, no wasted time.",
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
    },
    {
        num: "03",
        title: "Candidates Get Matched",
        body: "Expert recruiters advocate for candidates. Real communication, real feedback, no ghosting.",
        icon: "fa-duotone fa-regular fa-user-check",
    },
    {
        num: "04",
        title: "Everyone Wins",
        body: "Transparent splits, visible pipelines, and a single connected ecosystem.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
];

const platforms = [
    {
        name: "Splits Network",
        audience: "Recruiters & Companies",
        href: "https://splits.network/sign-up",
        color: "primary",
        features: [
            "Split-fee marketplace",
            "Built-in ATS",
            "Pipeline visibility",
            "Placement tracking",
            "Team collaboration",
            "Pay-on-hire model",
        ],
        icon: "fa-duotone fa-regular fa-network-wired",
    },
    {
        name: "Applicant Network",
        audience: "Job Seekers",
        href: "https://applicant.network/sign-up",
        color: "secondary",
        features: [
            "One-click apply",
            "Recruiter matching",
            "Real-time tracking",
            "Interview prep tools",
            "Status updates",
            "100% free forever",
        ],
        icon: "fa-duotone fa-regular fa-user",
    },
];

const testimonials = [
    {
        quote: "Splits Network changed how I run my desk. I pick roles that fit my niche and the splits are always transparent.",
        name: "Marcus Chen",
        role: "Senior Recruiter",
        initials: "MC",
    },
    {
        quote: "We went from managing 15 recruiter contracts to one platform. Complete visibility into every pipeline.",
        name: "Sarah Okonkwo",
        role: "VP of Talent, TechCorp",
        initials: "SO",
    },
    {
        quote: "For the first time, I actually knew what was happening with my applications. My recruiter kept me in the loop at every stage.",
        name: "David Park",
        role: "Software Engineer",
        initials: "DP",
    },
];

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function LandingOne() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            // ── Hero ────────────────────────────────────────────
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            heroTl
                .fromTo(
                    $1(".hero-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                )
                .fromTo(
                    $(".hero-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".hero-body"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                )
                .fromTo(
                    $(".hero-cta"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                    "-=0.3",
                );

            // Hero image parallax
            gsap.fromTo(
                $1(".hero-img-wrap"),
                { opacity: 0, scale: 1.08 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.4,
                    ease: "power2.out",
                    delay: 0.2,
                },
            );

            gsap.to($1(".hero-img-wrap img"), {
                yPercent: 12,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".hero-section"),
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // ── Stats bar ───────────────────────────────────────
            gsap.fromTo(
                $(".stat-item"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".stats-bar"),
                        start: "top 85%",
                    },
                },
            );

            // ── Problem split-screen ────────────────────────────
            gsap.fromTo(
                $1(".problem-text"),
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".problem-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $1(".problem-img"),
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".problem-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $(".problem-pain"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".problem-section"),
                        start: "top 60%",
                    },
                },
            );

            // ── How-it-works steps ──────────────────────────────
            gsap.fromTo(
                $1(".hiw-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".hiw-section"),
                        start: "top 75%",
                    },
                },
            );

            $(".hiw-step").forEach((step, i) => {
                gsap.fromTo(
                    step,
                    { opacity: 0, y: 50, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: step,
                            start: "top 80%",
                        },
                        delay: i * 0.05,
                    },
                );
            });

            // ── Platforms split ──────────────────────────────────
            gsap.fromTo(
                $1(".platforms-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".platforms-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".platform-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".platforms-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ── Testimonials ────────────────────────────────────
            gsap.fromTo(
                $1(".testimonials-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".testimonials-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".testimonial-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".testimonials-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ── Editorial split (ecosystem) ─────────────────────
            gsap.fromTo(
                $1(".editorial-img"),
                { opacity: 0, scale: 1.05 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".editorial-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $1(".editorial-text"),
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".editorial-section"),
                        start: "top 65%",
                    },
                },
            );

            // Parallax on editorial image
            gsap.to($1(".editorial-img img"), {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".editorial-section"),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // ── CTA ─────────────────────────────────────────────
            gsap.fromTo(
                $1(".final-cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".final-cta"),
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden">
            {/* ═══════════════════════════════════════════════════════
                HERO — Split-screen 60/40 with diagonal clip
               ═══════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                {/* Right image panel — sits behind on mobile, 40% on desktop */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                    style={{
                        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src={img.heroRecruiter}
                        alt="Professional recruiter in modern office"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay for text readability on mobile */}
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel — 60% on desktop */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            Employment Networks
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                Recruiting
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                rebuilt
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                for
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                everyone.
                            </span>
                        </h1>

                        <p className="hero-body text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                            Two platforms. One connected ecosystem. Splits
                            Network for recruiters and companies. Applicant
                            Network for candidates. Transparent, modern, and
                            built to work.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://splits.network/sign-up"
                                className="hero-cta btn btn-primary btn-lg shadow-lg opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Join as Recruiter
                            </a>
                            <a
                                href="https://applicant.network/sign-up"
                                className="hero-cta btn btn-secondary btn-lg shadow-lg opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Find a Job
                            </a>
                            <a
                                href="#how-it-works"
                                className="hero-cta btn btn-ghost btn-lg opacity-0"
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
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-item opacity-0">
                                <div className="text-3xl md:text-4xl font-black tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                    {stat.label}
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
                        <div className="problem-text lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                                The Industry Problem
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Recruiting is broken
                                <br />
                                for everyone.
                            </h2>
                            <p className="text-lg text-base-content/70 leading-relaxed mb-10 max-w-lg">
                                Fragmented tools, opaque fees, and zero
                                communication. The old model fails recruiters,
                                companies, and candidates alike.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-puzzle-piece-simple",
                                        text: "Recruiters juggle disconnected tools and chase cold leads",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-ghost",
                                        text: "Candidates get ghosted with no visibility into their status",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-eye-slash",
                                        text: "Companies manage dozens of contracts with no pipeline insight",
                                    },
                                ].map((pain, i) => (
                                    <div
                                        key={i}
                                        className="problem-pain flex items-start gap-4 opacity-0"
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
                        <div className="problem-img lg:col-span-2 opacity-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.office}
                                    alt="Outdated office environment"
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
                className="hiw-section py-28 bg-neutral text-neutral-content"
            >
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="hiw-heading max-w-3xl mb-20 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            How It Works
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Four steps to a
                            <br />
                            better hire.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
                        {splitSteps.map((step, i) => (
                            <div
                                key={i}
                                className="hiw-step flex gap-6 opacity-0"
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
                PLATFORMS — Two-column editorial comparison
               ═══════════════════════════════════════════════════════ */}
            <section className="platforms-section py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="platforms-heading max-w-3xl mx-auto text-center mb-20 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Our Platforms
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Two platforms.
                            <br />
                            One ecosystem.
                        </h2>
                    </div>

                    <div className="platforms-grid grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {platforms.map((p, i) => (
                            <div
                                key={i}
                                className={`platform-card border-t-4 ${
                                    p.color === "primary"
                                        ? "border-coral"
                                        : "border-secondary"
                                } bg-base-200 p-10 opacity-0`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center ${
                                            p.color === "primary"
                                                ? "bg-primary text-primary-content"
                                                : "bg-secondary text-secondary-content"
                                        }`}
                                    >
                                        <i className={`${p.icon} text-2xl`}></i>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">
                                            {p.name}
                                        </h3>
                                        <p className="text-sm text-base-content/60 uppercase tracking-wider">
                                            {p.audience}
                                        </p>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {p.features.map((feat, j) => (
                                        <li
                                            key={j}
                                            className="flex items-center gap-3 text-base-content/80"
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-check text-sm ${
                                                    p.color === "primary"
                                                        ? "text-primary"
                                                        : "text-secondary"
                                                }`}
                                            ></i>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={p.href}
                                    className={`btn ${
                                        p.color === "primary"
                                            ? "btn-primary"
                                            : "btn-secondary"
                                    } btn-lg w-full`}
                                >
                                    Get Started
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                </a>
                            </div>
                        ))}
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
                        <div className="editorial-img lg:col-span-2 opacity-0">
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
                        <div className="editorial-text lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                The Ecosystem
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Transparent by design.
                            </h2>
                            <p className="text-lg text-base-content/70 leading-relaxed mb-8 max-w-lg">
                                Employment Networks connects companies,
                                recruiters, and candidates through a single,
                                transparent ecosystem. Visible pipelines, clear
                                terms, and real communication at every step.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-6">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-building",
                                        title: "Companies",
                                        body: "Post roles, set terms, review candidates from vetted recruiters.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-user-tie",
                                        title: "Recruiters",
                                        body: "Pick roles, submit candidates, earn transparent splits.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-user",
                                        title: "Candidates",
                                        body: "Apply, get matched, track progress in real time.",
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
                    <div className="testimonials-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            What People Say
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Trusted by
                            <br />
                            the industry.
                        </h2>
                    </div>

                    <div className="testimonials-grid grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className="testimonial-card border-l-4 border-coral bg-base-200 p-8 opacity-0"
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
                    alt="City skyline representing growth"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/70 flex items-center justify-center">
                    <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight px-6">
                        The future of recruiting
                        <br />
                        <span className="text-secondary">starts here.</span>
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FINAL CTA
               ═══════════════════════════════════════════════════════ */}
            <section className="final-cta py-28 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="final-cta-content max-w-4xl mx-auto text-center opacity-0">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                            Ready to transform
                            <br />
                            how you recruit?
                        </h2>
                        <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Join the ecosystem that is making recruiting work
                            for everyone. Get started in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Join Splits Network
                            </a>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Candidate Profile
                            </a>
                        </div>

                        <p className="text-sm opacity-60">
                            Questions?{" "}
                            <a
                                href="mailto:hello@employment-networks.com"
                                className="underline hover:opacity-100 transition-opacity"
                            >
                                hello@employment-networks.com
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
