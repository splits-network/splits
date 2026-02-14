"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const stats = [
    { value: "3,200+", label: "Active Recruiters" },
    { value: "87%", label: "Placement Rate" },
    { value: "$42M", label: "Fees Processed" },
    { value: "14 days", label: "Avg. Time to Fill" },
];

const features = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        headline: "Split-Fee Recruiting, Reinvented",
        body: "A transparent marketplace where recruiters collaborate on placements, share candidate pipelines, and split fees with clarity. No back-channel deals, no spreadsheet chaos.",
        pullQuote:
            "We turned a three-month search into a three-week placement by tapping into the network.",
        attribution: "Director of Talent, Series B SaaS",
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
        imageAlt: "Two professionals shaking hands in a modern office",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        headline: "Real-Time Pipeline Visibility",
        body: "Live dashboards replace status-update meetings. Every submission, interview, and offer is tracked in real time, giving hiring managers instant visibility and recruiters proof of progress.",
        pullQuote:
            "I used to spend Friday afternoons building reports. Now the dashboard tells the story for me.",
        attribution: "Senior Recruiter, Enterprise Staffing",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        imageAlt: "Data analytics dashboard on a widescreen monitor",
    },
    {
        icon: "fa-duotone fa-regular fa-brain-circuit",
        headline: "AI-Powered Candidate Matching",
        body: "Our matching engine analyzes skills, experience, and cultural signals to surface the strongest candidates. Recruiters spend less time sourcing and more time closing.",
        pullQuote:
            "The AI found a candidate we would have missed. She is now our VP of Engineering.",
        attribution: "Head of People Ops, Fintech Startup",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
        imageAlt: "Team collaborating around a conference table with laptops",
    },
];

const ecosystemItems = [
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Splits Network",
        description:
            "The recruiter-facing platform where agencies and independents manage jobs, candidates, and split-fee agreements.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Applicant Network",
        description:
            "A modern candidate portal with real-time status updates, direct messaging, and transparent feedback loops.",
    },
    {
        icon: "fa-duotone fa-regular fa-globe",
        title: "Employment Networks",
        description:
            "The parent company connecting both platforms into one integrated hiring ecosystem built on trust.",
    },
];

const closingPoints = [
    {
        icon: "fa-duotone fa-regular fa-rocket-launch",
        title: "Launch in Days",
        text: "Onboard your team, import your jobs, and start receiving qualified candidates within the week.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Enterprise Security",
        text: "SOC 2 compliant infrastructure, encrypted data at rest and in transit, and role-based access controls.",
    },
    {
        icon: "fa-duotone fa-regular fa-headset",
        title: "Dedicated Support",
        text: "A named success manager for every account, plus live chat support during business hours.",
    },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function LandingPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Hero headline + subtitle stagger
            gsap.from("[data-hero-text]", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
            });

            // Hero image parallax on scroll
            gsap.to("[data-hero-image]", {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: "[data-hero-image]",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // Stats counter reveal
            gsap.from("[data-stat]", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-stats]",
                    start: "top 80%",
                },
            });

            // Feature sections - staggered reveal
            document.querySelectorAll("[data-feature]").forEach((el) => {
                gsap.from(el.querySelectorAll("[data-feature-text]"), {
                    x: -40,
                    opacity: 0,
                    duration: 0.9,
                    stagger: 0.12,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 75%",
                    },
                });

                gsap.from(el.querySelector("[data-feature-image]"), {
                    x: 40,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 75%",
                    },
                });

                // Pull quote slide in
                gsap.from(el.querySelector("[data-pull-quote]"), {
                    x: -30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el.querySelector("[data-pull-quote]"),
                        start: "top 85%",
                    },
                });
            });

            // Feature images parallax
            document
                .querySelectorAll("[data-feature-image-inner]")
                .forEach((img) => {
                    gsap.to(img, {
                        yPercent: -8,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img.closest("[data-feature]"),
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                });

            // Ecosystem cards
            gsap.from("[data-ecosystem-card]", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-ecosystem]",
                    start: "top 75%",
                },
            });

            // Closing section
            gsap.from("[data-closing-item]", {
                y: 30,
                opacity: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-closing]",
                    start: "top 80%",
                },
            });

            // CTA section
            gsap.from("[data-cta-content]", {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "[data-cta]",
                    start: "top 80%",
                },
            });

            // Divider lines draw-in
            gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
                gsap.from(line, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 90%",
                    },
                });
            });
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="overflow-hidden">
            {/* ─── Hero ────────────────────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex items-end pb-16 md:pb-24">
                {/* Full-bleed hero image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div data-hero-image className="w-full h-[120%] -mt-[10%]">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
                            alt="Modern office with floor-to-ceiling windows overlooking a city skyline"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Overlay: solid color tint, not a gradient */}
                    <div className="absolute inset-0 bg-neutral opacity-70" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
                    <div className="max-w-3xl">
                        <p
                            data-hero-text
                            className="text-sm uppercase tracking-[0.3em] text-base-300 mb-6 font-medium"
                        >
                            Employment Networks
                        </p>
                        <h1
                            data-hero-text
                            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8"
                        >
                            The Future
                            <br />
                            of Recruiting
                            <br />
                            <span className="text-secondary">Is Shared</span>
                        </h1>
                        <p
                            data-hero-text
                            className="text-lg md:text-xl text-base-300 max-w-xl leading-relaxed mb-10"
                        >
                            A split-fee marketplace where recruiters, companies,
                            and candidates connect through transparency, not
                            transactions.
                        </p>
                        <div data-hero-text className="flex gap-4 flex-wrap">
                            <a
                                href="https://splits.network"
                                className="btn btn-secondary btn-lg text-base font-semibold px-8"
                            >
                                Start Recruiting
                            </a>
                            <a
                                href="#features"
                                className="btn btn-outline btn-lg text-base font-semibold px-8 border-base-300 text-base-300 hover:bg-base-300 hover:text-neutral hover:border-base-300"
                            >
                                Read the Story
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ───────────────────────────────────────────────── */}
            <section data-stats className="bg-base-200 py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                data-stat
                                className="text-center"
                            >
                                <p className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/60 mt-2">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Feature Articles ────────────────────────────────────────── */}
            <section id="features" className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    {/* Section header */}
                    <div className="max-w-2xl mb-20">
                        <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                            The Platform
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content tracking-tight leading-tight">
                            Three pillars of a
                            <br />
                            better hiring process
                        </h2>
                    </div>

                    {features.map((feature, i) => (
                        <article key={feature.headline} data-feature>
                            {/* Divider */}
                            <div
                                data-divider
                                className="h-px bg-base-300 mb-16"
                            />

                            <div
                                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24 ${
                                    i % 2 === 1 ? "lg:[direction:rtl]" : ""
                                }`}
                            >
                                {/* Text column */}
                                <div
                                    className={
                                        i % 2 === 1
                                            ? "lg:order-2 lg:[direction:ltr]"
                                            : ""
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <i
                                            className={`${feature.icon} text-secondary text-xl`}
                                        />
                                        <span
                                            data-feature-text
                                            className="text-xs uppercase tracking-[0.3em] text-base-content/50 font-medium"
                                        >
                                            Feature {String(i + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <h3
                                        data-feature-text
                                        className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-6"
                                    >
                                        {feature.headline}
                                    </h3>
                                    <p
                                        data-feature-text
                                        className="text-lg text-base-content/70 leading-relaxed mb-10"
                                    >
                                        {feature.body}
                                    </p>

                                    {/* Pull Quote */}
                                    <blockquote
                                        data-pull-quote
                                        className="border-l-4 border-secondary pl-6 py-2"
                                    >
                                        <p className="text-xl md:text-2xl italic text-base-content leading-snug mb-3">
                                            &ldquo;{feature.pullQuote}&rdquo;
                                        </p>
                                        <cite className="text-sm text-base-content/50 not-italic uppercase tracking-wider">
                                            {feature.attribution}
                                        </cite>
                                    </blockquote>
                                </div>

                                {/* Image column */}
                                <div
                                    className={
                                        i % 2 === 1
                                            ? "lg:order-1 lg:[direction:ltr]"
                                            : ""
                                    }
                                    data-feature-image
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <div
                                            data-feature-image-inner
                                            className="absolute inset-0 -top-[8%] -bottom-[8%]"
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.imageAlt}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* ─── Ecosystem Section ───────────────────────────────────────── */}
            <section
                data-ecosystem
                className="bg-neutral text-neutral-content py-24 md:py-32"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Left column: text */}
                        <div className="lg:col-span-1">
                            <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                                The Ecosystem
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                                Two platforms.
                                <br />
                                One network.
                            </h2>
                            <p className="text-lg text-neutral-content/70 leading-relaxed">
                                Every product in the Employment Networks family
                                is purpose-built for its audience, yet deeply
                                integrated with the others.
                            </p>
                        </div>

                        {/* Right column: cards */}
                        <div className="lg:col-span-2 space-y-8">
                            {ecosystemItems.map((item) => (
                                <div
                                    key={item.title}
                                    data-ecosystem-card
                                    className="border border-neutral-content/10 p-8"
                                >
                                    <div className="flex items-start gap-5">
                                        <i
                                            className={`${item.icon} text-secondary text-2xl mt-1 shrink-0`}
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-neutral-content/60 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Full-bleed Image Break ──────────────────────────────────── */}
            <section className="relative h-[60vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"
                    alt="Diverse team of professionals collaborating in a bright workspace"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary opacity-20" />
            </section>

            {/* ─── Why Now Section ─────────────────────────────────────────── */}
            <section data-closing className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="max-w-2xl mb-16">
                        <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                            Getting Started
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-base-content tracking-tight leading-tight">
                            Built for teams
                            <br />
                            that move fast
                        </h2>
                    </div>

                    <div
                        data-divider
                        className="h-px bg-base-300 mb-16"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {closingPoints.map((point) => (
                            <div key={point.title} data-closing-item>
                                <i
                                    className={`${point.icon} text-secondary text-2xl mb-5 block`}
                                />
                                <h3 className="text-xl font-bold text-base-content mb-3">
                                    {point.title}
                                </h3>
                                <p className="text-base-content/60 leading-relaxed">
                                    {point.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ───────────────────────────────────────────────── */}
            <section
                data-cta
                className="bg-primary text-primary-content py-24 md:py-32"
            >
                <div
                    data-cta-content
                    className="max-w-7xl mx-auto px-6 md:px-12 text-center"
                >
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                        The network is waiting.
                    </h2>
                    <p className="text-xl text-primary-content/80 max-w-2xl mx-auto leading-relaxed mb-10">
                        Join thousands of recruiters and hiring teams who have
                        already made the shift to transparent, collaborative
                        recruiting.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a
                            href="https://splits.network"
                            className="btn btn-secondary btn-lg text-base font-semibold px-10"
                        >
                            Get Started Free
                        </a>
                        <a
                            href="https://applicant.network"
                            className="btn btn-ghost btn-lg text-base font-semibold px-10 border border-primary-content/30 text-primary-content hover:bg-primary-content/10"
                        >
                            Candidate Portal
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Colophon ────────────────────────────────────────────────── */}
            <section className="bg-base-200 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Applicant Network &middot;
                        Employment Networks
                    </p>
                </div>
            </section>
        </div>
    );
}
